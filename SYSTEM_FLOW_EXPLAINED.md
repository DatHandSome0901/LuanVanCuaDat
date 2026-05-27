# SYSTEM FLOW EXPLAINED — Chatbot Lịch Sử Việt Nam (TALRAG)

---

## 1. TỔNG QUAN PIPELINE (End-to-End)

```
User (Browser/App)
  → ChatView.tsx        [React Frontend]
  → POST /api/v1/chat   [FastAPI Backend]
  → FilesChatAgent      [LangGraph RAG Engine]
    → retrieve()         Node 1
    → grade_documents()  Node 2
    → generate()         Node 3a  ─┐
    → handle_no_answer() Node 3b  ─┘
  → ChatResponse        [JSON trả về Frontend]
  → DB saves            [SQLite]
```

---

## 2. BƯỚC 1 — FRONTEND GỬI REQUEST

**File**: `frontend/components/ChatView.tsx`  
**Function**: `handleSend()`  
**Input**: string câu hỏi từ textarea  
**Output**: HTTP POST tới `/api/v1/chat`

```json
{
  "question": "Tại sao nhà Trần thắng quân Mông Cổ?",
  "conversation_id": 42,
  "debug": false
}
```

Header: `Authorization: Bearer <JWT_TOKEN>`

---

## 3. BƯỚC 2 — FASTAPI NHẬN VÀ ĐIỀU PHỐI

**File**: `app/routers/chatbot.py`  
**Function**: `chat_with_router(request, current_user)`  
**Input**: `ChatRequest`, JWT user  
**Output**: `ChatResponse`

Các bước nội bộ:
1. `token_counter.user_db.get_by_email(email)` → kiểm tra `token_balance > 0`
2. `db.get_setting("llm_name")` → lấy model (openai/vertex/gemini)
3. Khởi tạo `LLM().get_llm(llm_name)` và `FilesChatAgent(...)`
4. `user_db.get_messages(conversation_id)[-6:]` → lấy chat history
5. `pipeline.invoke({question, chat_history, debug})` → gọi RAG
6. Lưu messages vào DB, tính token cost, sinh related_questions
7. Return `ChatResponse`

---

## 4. BƯỚC 3 — LANGGRAPH WORKFLOW

**File**: `chatbot/services/files_rag_chat_agent.py`  
**Class**: `FilesChatAgent`  
**Function**: `get_workflow()` → `StateGraph(GraphState).compile()`

### Graph State (TypedDict)

```python
class GraphState(TypedDict, total=False):
    question: str        # câu hỏi gốc
    generation: str      # câu trả lời LLM
    documents: list      # tài liệu đã lọc
    chat_history: list   # [{role, content}, ...]
    intent: str          # causal|temporal|comparison|factual|unrelated
    scores: dict         # {semantic, temporal, causal}
    debug: bool
```

### Graph Edges

```
START → retrieve → grade_documents
grade_documents → [decide_to_generate] → generate (nếu có docs)
                                       → handle_no_answer (nếu không có docs)
generate → END
handle_no_answer → END
```

---

## 5. NODE 1: retrieve()

**File**: `files_rag_chat_agent.py`  
**Input**: `state["question"]` (raw)  
**Output**: `{documents, question, intent, scores}`

### Bước xử lý chi tiết:

**5.1 Check pending cache**
```python
pending = db.get_pending_by_question(raw_question)
if pending and pending["approved"] == 0:
    return {documents: [Document(pending_answer, is_pending=True)]}
```

**5.2 Intent classification**
```python
intent = classify_query(raw_question, self.llm)
# → "unrelated" thì trả documents=[] ngay
```

**5.3 Normalize câu hỏi**
```python
question = normalize_question(raw_question)
# loại stopwords: "tại sao", "hãy cho biết", "là gì", ...
```

**5.4 Year & Dynasty filter**
```python
years = re.findall(r"\b(1[0-9]{3}|20[0-9]{2})\b", question)
# Dynasty map: "nhà trần" → (1225, 1400)
```

**5.5 Multi-brain FAISS search (3 paths)**
```python
# Path 1: Approved knowledge
for e_path in ["output/", "output/vertex/", "output/openai/"]:
    retriever_e = Retriever(embedding).set_retriever(e_path)
    docs_e = retriever_e.get_documents(question, num_doc=5)
    all_pool.extend(docs_e)

# Path 2: Vertex (PDFs)
retriever_v = Retriever("vertex").set_retriever("output/vertex/")
docs_v = retriever_v.get_documents(question, num_doc=15)

# Path 3: OpenAI (100k+ legacy)
retriever_o = Retriever("openai").set_retriever("output/openai/")
docs_o = retriever_o.get_documents(question, num_doc=15)
```

**5.6 Adaptive reranking**
```python
ar = AdaptiveRetriever()
reranked_docs, score_summary = ar.rerank(question, pool, intent)
```

**5.7 PDF priority**
```python
reranked_docs.sort(key=lambda d: 0 if is_pdf(d) else 1)
```

---

## 6. NODE 2: grade_documents()

**File**: `files_rag_chat_agent.py`  
**Input**: `state["documents"]`, `state["question"]`  
**Output**: `{documents: relevant_only, question}`

```python
with ThreadPoolExecutor(max_workers=5) as executor:
    results = list(executor.map(
        lambda d: (d, grader.chain.invoke({
            "question": question,
            "document": d.page_content
        })),
        documents
    ))

for doc, grade in results:
    if doc.metadata.get("is_pending"): keep  # pending cache
    if doc.metadata.get("source") == "auto_learned_from_user_like": keep  # trusted
    if "yes" in str(grade).lower(): keep      # LLM approved
```

**Prompt** (GRADE_DOCUMENT_PROMPT):  
"Đánh giá tài liệu có liên quan đến câu hỏi không? CHỈ trả lời yes hoặc no."

---

## 7. NODE 3a: generate()

**File**: `files_rag_chat_agent.py`  
**Input**: `state["question"]`, `state["documents"]`, `state["chat_history"]`  
**Output**: `{generation, documents}`

```python
# Build context với source label
for doc in documents:
    source_name = doc.metadata.get("file_name") or doc.metadata.get("source")
    page_str = f" (Page {page})" if page else ""
    context_list.append(f"[{source_name}{page_str}]: {content}")
context = "\n\n".join(context_list)

# Format history
formatted_history = answer_generator.format_history(chat_history)
# [{role:user,content:...}] → [HumanMessage(...), AIMessage(...)]

# LLM call
response = answer_generator.get_chain().invoke({
    "question": question,
    "context": context,
    "chat_history": formatted_history
})
```

**AnswerGenerator chain**:
```
ChatPromptTemplate(system_prompt, MessagesPlaceholder, human_msg)
  | LLM
  | StrOutputParser
```

**System prompt** (GENERATE_ANSWER_PROMPT):  
"Chỉ dùng context được cung cấp. Không hallucination. Nếu không có dữ liệu → trả 'không có dữ liệu'."

**Refusal detection**:
```python
refusal_keywords = ["không có dữ liệu", "không tìm thấy", "không thể trả lời", ...]
if any(kw in generation.lower() for kw in refusal_keywords):
    return handle_no_answer(state)  # fallback to web
```

---

## 8. NODE 3b: handle_no_answer()

**File**: `files_rag_chat_agent.py`  
**Input**: `state["question"]`, `state["intent"]`  
**Output**: `{generation, documents}`

```python
# 1. Check pending cache một lần nữa
pending = db.get_pending_by_question(question)
if pending and pending["approved"] == 0:
    return {generation: "Câu trả lời tham khảo:\n" + pending["answer"]}

# 2. Unrelated → từ chối
if intent == "unrelated":
    return {generation: "Tôi chỉ hỗ trợ câu hỏi Lịch sử Việt Nam."}

# 3. Web fallback
web_agent = WebLearningAgent(self.llm)
result = web_agent.process_fallback(question)

if result["confidence"] == 1:
    db.save_pending_knowledge(question, result["answer"])
    return {generation: "Đang tự học từ Web:\n" + result["answer"],
            documents: web_docs}
else:
    return {generation: result["answer"], documents: []}
```

---

## 9. ADAPTIVE RETRIEVER — THUẬT TOÁN

**File**: `chatbot/services/adaptive_retriever.py`  
**Class**: `AdaptiveRetriever`  
**Function**: `rerank(query, docs, intent) → (ranked_docs, score_summary)`

### Công thức:
```
final_score(d) = α(I) × f_sem(rank_d)
              + β(I) × f_temp(Q, d)
              + γ(I) × f_caus(Q, d)
```

### Trọng số theo intent:
| Intent     | α    | β    | γ    | top_k |
|------------|------|------|------|-------|
| factual    | 0.70 | 0.20 | 0.10 | 10    |
| causal     | 0.40 | 0.10 | 0.50 | 10    |
| temporal   | 0.40 | 0.50 | 0.10 | 10    |
| comparison | 0.60 | 0.20 | 0.20 | 15    |

### Semantic score (rank-based decay):
```python
sem = max(1.0 - rank * (0.5 / max(N-1, 1)), 0.5)
# rank=0 → 1.0, rank=last → 0.5
```

### Approved knowledge boost:
```python
if doc.metadata.get("source") == "history":
    final += 0.2
final = min(final, 1.0)
```

### Score summary (top-3 average → debug response):
```python
summary = {
    "semantic": mean(top3.semantic),
    "temporal": mean(top3.temporal),
    "causal":   mean(top3.causal)
}
```

---

## 10. CAUSAL ENGINE

**File**: `chatbot/services/causal_engine.py`

### causal_score(query, doc) → float
```
Step 1: keyword_hits = count(CAUSAL_KEYWORDS in doc)
        keyword_score = min(hits / 5.0, 1.0)

Step 2: pair_bonus = 0.3 nếu tìm thấy cặp cause→effect
        (vị trí cause trước effect trong văn bản)

Step 3: multiplier = 1.3 nếu query chứa "tại sao/vì sao/nguyên nhân"

final = min((keyword_score × 0.7 + pair_bonus) × multiplier, 1.0)
```

### temporal_score(query, doc) → float
```
Step 1: Trích năm bằng regex \b(\d{3,4})\b

Step 2: Nếu có năm → proximity_score(|year_q - year_d|):
  diff=0   → 1.00
  diff≤20  → 0.85
  diff≤50  → 0.70
  diff≤100 → 0.50
  diff≤200 → 0.30
  diff≤500 → 0.15
  else     → 0.05

Step 3: Không có năm → keyword overlap × 0.5
```

---

## 11. WEB LEARNING AGENT

**File**: `chatbot/services/web_learning_agent.py`  
**Class**: `WebLearningAgent`

### process_fallback(question) → dict
```
Step 1: WebCrawler.get_web_context(question)
        → DuckDuckGo search → scrape URLs (Trafilatura + BS4)
        → List[{content: str, source: URL}]

Step 2: batch_relevance_matching(question, chunks, max=5)
        Prompt (1 LLM call):
          "Chọn tối đa 5 đoạn liên quan nhất. Trả về INDEX: 0,2,4"
        Parse → relevant_chunks

Step 3: verify_and_generate(question, relevant_chunks)
        context = join(chunks with source URLs)
        Prompt: "Kiểm tra chéo nguồn. No hallucination."
        → {answer, sources, confidence: 0|1}
        confidence=0 nếu "Chưa đủ dữ liệu đáng tin cậy"

Return: {answer, sources, confidence}
```

---

## 12. AUTO LEARNING AGENT

**File**: `chatbot/services/auto_learning_agent.py`  
**Class**: `AutoLearningAgent`  
**Trigger**: `likes_count >= 5` trong `/message/{id}/rate`

### analyze_and_ingest(question, answer, force_ingest)
```
Step 1: Kiểm tra trùng → skip nếu approved=1

Step 2: AI Verification (nếu !force_ingest)
        LLM → JSON {should_save, reason, refined_content}

Step 3: chunk_text(refined, max_chars=1500)
        → cắt tại \n để giữ ngữ nghĩa

Step 4: Build Document list với metadata:
        {source: "auto_learned_from_user_like",
         question, type: "approved_knowledge",
         chunk_index, total_chunks, ingested_at}

Step 5: FAISS ingest → save_local("output/")

Step 6: clear_faiss_cache() → reload ngay

Step 7: UPDATE pending_knowledge SET approved=1
```

---

## 13. SEQUENCE DIAGRAM CHI TIẾT

```
User      ChatView     chatbot.py    LangGraph        FAISS    LLM     SQLite
 │            │             │             │              │        │         │
 │─question──►│             │             │              │        │         │
 │            │─POST /chat─►│             │              │        │         │
 │            │             │─check token─────────────────────────────►[users]
 │            │             │─get hist────────────────────────────────►[msgs]
 │            │             │─invoke(q,hist)─►│           │        │         │
 │            │             │                 │           │        │         │
 │            │             │           [retrieve]        │        │         │
 │            │             │                 │─check cache─────────────►[pending]
 │            │             │                 │─classify──────────►│         │
 │            │             │                 │─normalize           │         │
 │            │             │                 │─FAISS search───────►│         │
 │            │             │                 │─rerank(α,β,γ)       │         │
 │            │             │                 │─PDF sort            │         │
 │            │             │                 │           │        │         │
 │            │             │           [grade_docs]      │        │         │
 │            │             │                 │─parallel grade─────►│         │
 │            │             │                 │─filter yes/no       │         │
 │            │             │                 │           │        │         │
 │            │             │           [generate]        │        │         │
 │            │             │                 │─build context       │         │
 │            │             │                 │─LLM call──────────►│         │
 │            │             │                 │◄─answer────────────│         │
 │            │             │◄─{gen,docs,scores}─│       │         │         │
 │            │             │─save msgs───────────────────────────────────►[msgs]
 │            │             │─deduct token────────────────────────────────►[users]
 │            │             │─related_q LLM──────────────────────►│         │
 │            │◄─ChatResponse│             │             │        │         │
 │◄─render────│             │             │             │        │         │
```

**Fallback (no docs):**
```
LangGraph      WebLearningAgent   DuckDuckGo   Trafilatura   LLM     SQLite
    │                │                │              │          │         │
    │─fallback──────►│                │              │          │         │
    │                │─search────────►│              │          │         │
    │                │◄─URLs──────────│              │          │         │
    │                │─scrape────────────────────────►          │         │
    │                │◄─chunks────────────────────────          │         │
    │                │─batch_match (1 call)──────────────────►  │         │
    │                │◄─indices───────────────────────────────  │         │
    │                │─verify_and_generate───────────────────►  │         │
    │                │◄─{answer, confidence=1}────────────────  │         │
    │◄─result────────│                │              │          │         │
    │─save_pending────────────────────────────────────────────────────►[pending]
```

---

## 14. THUẬT TOÁN TALRAG — HỌC THUẬT

### Formal Definition

Cho câu hỏi Q, corpus D, TALRAG tối ưu:

```
Answer* = argmax_A P(A|Q,D)
        = argmax_A Σ_{d∈top_k(Q,D)} P(A|Q,d) × Score_TALRAG(Q,d)

Score_TALRAG(Q,d) = α(I) × f_sem(Q,d)
                  + β(I) × f_temp(Q,d)
                  + γ(I) × f_caus(Q,d)

I = IntentClassifier(Q) ∈ {causal, temporal, comparison, factual, unrelated}
```

### Semantic Approximation từ FAISS rank:
```
f_sem(d_i) = 1.0 - i × δ,  δ = 0.5/(N-1),  i = FAISS rank
```

### Temporal Proximity:
```
f_temp(Q,d) = max_{(y_q,y_d)} Prox(|y_q - y_d|)

Prox(Δ) = 1.00 (Δ=0), 0.85 (Δ≤20), 0.70 (Δ≤50),
           0.50 (Δ≤100), 0.30 (Δ≤200), 0.15 (Δ≤500), 0.05 (else)
```

### Causal Score:
```
f_caus(Q,d) = min[(KD(d)×0.7 + PB(d)) × QM(Q), 1.0]

KD(d) = |CAUSAL_KW ∩ d| / 5
PB(d) = 0.3  if ∃ cause→effect pair
QM(Q) = 1.3  if Q ∈ causal_triggers
```

### Self-Learning:
```
K(t+1) = K(t) ∪ {chunk(AutoVerify(q,a))} if Likes(q) ≥ θ=5
```

---

## 15. ĐIỂM MỚI ĐỂ PUBLISH PAPER

### C1: Intent-Adaptive Retrieval Weighting
- **Tuyên bố**: Điều chỉnh trọng số (α,β,γ) theo intent câu hỏi
- **Baseline**: Standard RAG chỉ dùng cosine similarity
- **Metric**: MRR@10, NDCG@10 trên bộ câu hỏi lịch sử VN

### C2: Domain Temporal Scoring (không cần LLM)
- **Tuyên bố**: f_temp() rule-based O(1), không tốn token
- **Ý nghĩa**: Phù hợp domain lịch sử (năm tháng quan trọng)

### C3: Batch Web Relevance Matching
- **Tuyên bố**: N chunks = 1 LLM call (thay vì N calls)
- **Cải thiện**: Giảm 80–90% API cost và latency web fallback

### C4: 3-Tier Self-Learning Loop
- **Tier 1**: Web crawl → pending DB
- **Tier 2**: Admin approve → FAISS
- **Tier 3**: 5 likes → auto-ingest (không cần admin)
- **Đóng góp**: Kết hợp Human-in-the-Loop + Crowdsourced validation

### C5: Dual-Embedding Hybrid Retrieval
- **Tuyên bố**: Parallel query 2 FAISS index (OpenAI + VertexAI embeddings)
- **Lý do**: Giảm missed recall khi dùng nhiều nguồn tài liệu khác nhau

### Đề xuất tên paper:
> *"TALRAG: Temporal-Adaptive Multi-Score RAG for Vietnamese Historical QA with Self-Learning Feedback Loop"*

**Venue**: EMNLP, ACL Findings, COLING, VLSP Workshop

---

*Generated: 2026-05-13*
