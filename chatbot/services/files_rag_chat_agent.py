
from typer.cli import state

from chatbot.utils.question_normalizer import normalize_question
from chatbot.utils.answer_sanitizer import strip_inline_source_references
from ingestion.retriever import Retriever
from chatbot.utils.document_grader import DocumentGrader
from chatbot.utils.answer_generator import AnswerGenerator
# ── Adaptive RAG imports (thêm mới) ───────────────────────
from chatbot.services.query_classifier import classify_query
from chatbot.services.adaptive_retriever import AdaptiveRetriever

from langgraph.graph import END, StateGraph, START
from chatbot.utils.graph_state import GraphState
from typing import Dict, Any
import os
import re
from concurrent.futures import ThreadPoolExecutor
from time import perf_counter


def _env_int(name: str, default: int, minimum: int = 1) -> int:
    try:
        return max(minimum, int(os.environ.get(name, str(default))))
    except (TypeError, ValueError):
        return default


def _env_bool(name: str, default: bool) -> bool:
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() not in {"0", "false", "no", "off"}


def _normalize_for_fast_match(text: str) -> str:
    import unicodedata

    text = (text or "").replace("Đ", "D").replace("đ", "d")
    text = unicodedata.normalize("NFD", text.lower())
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _looks_like_followup_question(text: str) -> bool:
    normalized = _normalize_for_fast_match(text)
    patterns = [
        r"\b(ong|ba|nguoi|vi|nhan vat|su kien|tran|trieu dai)\s+(nay|do|ay)\b",
        r"\b(cua|ve)\s+(ong|ba|nguoi|vi|nhan vat|su kien|tran|trieu dai)\s+(nay|do|ay)\b",
        r"\b(tiep theo|sau do|luc do|thoi diem do|nhu vay)\b",
    ]
    return any(re.search(pattern, normalized) for pattern in patterns)


def _query_tokens(text: str) -> set[str]:
    stopwords = {
        "ai", "la", "gi", "nao", "o", "ve", "cua", "va", "cho", "toi",
        "hay", "noi", "biet", "duoc", "nhung", "cac", "mot", "co", "khong",
        "thi", "ma", "nay", "do", "ay", "trong", "ngoai", "voi",
    }
    return {
        token
        for token in _normalize_for_fast_match(text).split()
        if len(token) >= 2 and token not in stopwords
    }


def _log_rag_timing(event: str, started_at: float, **fields) -> None:
    elapsed = perf_counter() - started_at
    parts = [f"[RAG_TIMING] event={event}", f"elapsed_s={elapsed:.2f}"]
    for key, value in fields.items():
        if value is not None:
            parts.append(f"{key}={value}")
    print(" ".join(parts))


class FilesChatAgent:

    def __init__(self, llm_model, path_vector_store, embedding_model_name=None, allowed_files=["*"]) -> None:
        self.allowed_files = allowed_files
        self.path_vector_store = path_vector_store
        self.embedding_model_name = embedding_model_name or os.environ.get("EMBEDDING_MODEL_NAME", "openai")

        self.llm = llm_model
        self.document_grader = DocumentGrader(self.llm)
        self.answer_generator = AnswerGenerator(self.llm)
        self.fast_mode = _env_bool("RAG_FAST_MODE", True)
        self.use_llm_contextualizer = _env_bool("RAG_LLM_CONTEXTUALIZER", False)
        self.use_llm_intent_classifier = _env_bool("RAG_LLM_INTENT_CLASSIFIER", False)
        self.use_llm_document_grader = _env_bool("RAG_LLM_DOCUMENT_GRADER", False)
        self.use_hallucination_check = _env_bool("RAG_HALLUCINATION_CHECK", False)
        self.max_context_docs = _env_int("RAG_MAX_CONTEXT_DOCS", 5)
        self.fast_grade_min_docs = _env_int("RAG_FAST_GRADE_MIN_DOCS", 0, minimum=0)
        self.approved_docs_k = _env_int("RAG_APPROVED_DOCS_K", 3)
        self.vector_docs_k = _env_int("RAG_VECTOR_DOCS_K", 8)
        self.search_approved_indexes = _env_bool("RAG_SEARCH_APPROVED_INDEXES", True)
        self.search_vertex_index = _env_bool("RAG_SEARCH_VERTEX_INDEX", True)
        self.search_openai_legacy_index = _env_bool("RAG_SEARCH_OPENAI_LEGACY_INDEX", False)
        
        from chatbot.utils.historical_expander import HistoricalExpander
        self.expander = HistoricalExpander(self.llm)
   

    def handle_no_answer(self, state: GraphState) -> Dict[str, Any]:

        from app.models.base_db import UserDB

        
        question = normalize_question(state["question"]).lower().strip()

        print("=== NO DOC → LLM + SAVE DB ===")

        db = UserDB()

        # 🔥 1. CHECK pending
        pending = db.get_pending_by_question(question)

        # ✅ [FIX] Chỉ hiển thị "chưa duyệt" nếu thực sự chưa được duyệt
        # Nếu đã approved=1, bỏ qua — kiến thức đã có trong FAISS rồi
        if pending and pending.get("approved") == 0:
            print("⚠️ CÂU CHƯA DUYỆT")

            answer = strip_inline_source_references(pending.get("answer", ""))

            db.close()

            return {
                    "generation": (
                        "👉 Xin lỗi, hệ thống chưa có dữ liệu.\n"
                        "(Dưới đây là câu trả lời tham khảo):\n\n"
                        + answer
                    )
                }
        elif pending and pending.get("approved") == 1:
            print("✅ Pending knowledge is approved — FAISS should have it. Proceeding to web fallback.")
        # 🔥 2. KIỂM TRA XEM CÓ NÊN TÌM WEB KHÔNG (Chỉ tìm nếu là Lịch sử VN)
        intent = state.get("intent", "factual")
        if intent == "chitchat":
            user_name = state.get("user_name") or "bạn"
            chat_history_raw = state.get("chat_history", [])
            formatted_history = self.answer_generator.format_history(chat_history_raw)
            
            chitchat_prompt = f"""Bạn là Sử Gia Lạc Việt, một chatbot thông thái chuyên sâu về Lịch sử Việt Nam.
Người dùng hiện tại tên là: {user_name}

Yêu cầu quan trọng:
1. Hãy xưng hô thân mật phù hợp và chào hỏi đúng tên của người dùng là "{user_name}".
2. Nếu người dùng hỏi bạn có biết họ là ai hay không, hoặc hỏi "Tôi là ai?", bạn PHẢI trả lời rõ tên của họ là "{user_name}". (Ví dụ: "Tôi biết chứ, bạn là {user_name}!").
3. Hãy phản hồi câu nói xã giao, lời chào hoặc câu hỏi thông thường của người dùng một cách tự nhiên, lịch sự và thân thiện bằng tiếng Việt.
4. Hãy luôn hướng người dùng hỏi về các chủ đề liên quan đến Lịch sử Việt Nam nếu họ muốn tìm hiểu.

Lịch sử trò chuyện:
{formatted_history}

Người dùng nói: {state["question"]}
Sử Gia Lạc Việt trả lời:"""
            
            try:
                response = self.llm.invoke(chitchat_prompt)
                generation = response.content if hasattr(response, "content") else str(response)
                generation = re.sub(r"<think>.*?</think>", "", generation, flags=re.DOTALL).strip()
            except Exception as e:
                print(f"⚠️ Chitchat LLM call failed: {e}")
                generation = f"Xin chào {user_name}! Tôi là Sử Gia Lạc Việt. Tôi có thể giúp gì cho bạn về Lịch sử Việt Nam?"
                
            db.close()
            return {
                "generation": generation,
                "documents": []
            }

        if intent == "unrelated":
            db.close()
            return {
                "generation": "Xin lỗi, tôi là Sử Gia Lạc Việt - chatbot chuyên sâu về Lịch sử Việt Nam. Tôi không thể hỗ trợ các thông tin ngoài lĩnh vực này.",
                "documents": []
            }

        if state.get("defer_web_fallback"):
            db.close()
            return {
                "generation": "WEB_FALLBACK_DEFERRED",
                "documents": [],
                "web_fallback_required": True,
                "intent": intent,
                "scores": state.get("scores", {}),
            }

        # 🔥 3. CHƯA CÓ → GỌI WEB LEARNING FLOW (Chỉ dành cho kiến thức Lịch sử bị thiếu)
        from chatbot.services.web_learning_agent import WebLearningAgent
        
        web_agent = WebLearningAgent(self.llm)
        result = web_agent.process_fallback(question)
        
        generation = strip_inline_source_references(result["answer"])
        confidence = result.get("confidence", 0)
        
        if confidence == 1:
            # Nếu tin cậy (qua ải Verification), lưu vào DB chờ Admin duyệt
            db.save_pending_knowledge(question, generation)
            db.close()
            
            # Gắn thêm nguồn vào list documents thay vì append text
            web_docs = []
            if result.get("sources"):
                from langchain_core.documents import Document
                print(f"DEBUG: Found {len(result['sources'])} web sources")
                for src in result["sources"]:
                    web_docs.append(Document(
                        page_content="Nguồn thông tin từ Internet",
                        metadata={"source": src, "file_name": src, "is_web": True}
                    ))
            else:
                print("DEBUG: No web sources found in result")
                
            return {
                "generation": (
                    "👉 Hệ thống đang tự học từ Web. (Dưới đây là câu trả lời tham khảo chờ kiểm duyệt):\n\n"
                    + generation
                ),
                "documents": web_docs
            }
        else:
            # Không tự tin -> Trả về không biết, KHÔNG lưu DB
            db.close()
            return {
                "generation": generation,
                "documents": [] # Xóa sạch trích dẫn vì đây là câu trả lời không biết/web
            }

  
    def generate(self, state: GraphState) -> Dict[str, Any]:
        started_at = perf_counter()

        question = state["question"]
        documents = state["documents"]

        # 🔥 0. KIỂM TRA PENDING CACHE (Nếu documents có chứa kiến thức đang chờ duyệt)
        is_pending = any(doc.metadata.get("is_pending") for doc in documents)
        if is_pending:
            # Tìm document pending
            pending_doc = next(d for d in documents if d.metadata.get("is_pending"))
            return {
                "generation": (
                    "👉 Xin lỗi, hệ thống chưa có dữ liệu chính thống.\n"
                    "(Dưới đây là câu trả lời tham khảo hệ thống đang tự học):\n\n"
                    + strip_inline_source_references(pending_doc.page_content)
                ),
                "documents": [pending_doc] # Chỉ hiển thị nguồn Web đang học
            }

        # 🔥 1. KHÔNG CÓ DOC → FALLBACK
        if not documents:
            _log_rag_timing("generate_no_docs", started_at)
            return self.handle_no_answer(state)

        # 🔥 2. TẠO CONTEXT
        # context = "\n\n".join(
        #     getattr(doc, "page_content", str(doc)) for doc in documents
        # )

        context_list = []

        for doc in documents:
            source_name = doc.metadata.get("file_name") or doc.metadata.get("source") or "Unknown Source"
            page_num = doc.metadata.get("page")
            page_str = f" (Page {page_num})" if page_num is not None else ""
            
            content = doc.metadata.get("answer") if "answer" in doc.metadata else doc.page_content
            if len(content) > 3000:
                content = content[:3000] + "..."
            context_list.append(f"[{source_name}{page_str}]: {content}")
        
        context = "\n\n".join(context_list)

        # 🔥 3. GỌI LLM (với Conversation Memory)
        chat_history_raw = state.get("chat_history", [])
        formatted_history = self.answer_generator.format_history(chat_history_raw)

        response = self.answer_generator.get_chain().invoke({
            "question": question,
            "context": context,
            "chat_history": formatted_history,  # ✅ Truyền lịch sử hội thoại
        })

        generation = response if isinstance(response, str) else (response.content if hasattr(response, "content") else str(response))
        generation = re.sub(r"<tool_call>.*?<tool_call>", "", generation, flags=re.DOTALL).strip()
        generation = strip_inline_source_references(generation)
        clean_gen = generation.lower().strip()

        # Kiểm tra xem có phải câu trả lời từ chối không
        refusal_keywords = [
            "không có dữ liệu", "khong co du lieu", "khong_co_du_lieu",
            "chưa đủ dữ liệu đáng tin cậy", "không tìm thấy câu trả lời",
            "không có thông tin", "không tìm thấy", "không được đề cập",
            "không thể trả lời", "tôi là chatbot lịch sử việt nam, tôi chỉ hỗ trợ các câu hỏi liên quan đến lịch sử việt nam"
        ]
        
        if any(x in clean_gen for x in refusal_keywords):
            print("⚠️ REFUSAL DETECTED → FALLBACK TO WEB")
            res = self.handle_no_answer(state)
            return res

        # --- 4. ANTI-HALLUCINATION GUARDRAIL ---
        if self.use_hallucination_check:
            print("--- CHECKING HALLUCINATION ---")
            hallucination_prompt = f"""Bạn là một Giám khảo (Grader) khắt khe. Nhiệm vụ của bạn là kiểm tra xem câu trả lời của AI có bịa đặt (hallucinate) hay chứa thông tin lịch sử nào KHÔNG có trong tài liệu được cung cấp hay không.

Tài liệu được cung cấp:
{context}

Câu trả lời của AI:
{generation}

Yêu cầu:
Nếu AI đưa ra các mốc thời gian, tên nhân vật, hoặc sự kiện quan trọng KHÔNG hề có trong Tài liệu được cung cấp -> Trả lời 'yes' (Có bịa đặt).
Nếu tất cả thông tin quan trọng đều được hỗ trợ bởi Tài liệu -> Trả lời 'no' (Không bịa đặt).

Chỉ trả lời bằng 1 từ 'yes' hoặc 'no', không giải thích."""
            try:
                from langchain_core.messages import HumanMessage
                h_res = self.llm.invoke([HumanMessage(content=hallucination_prompt)])
                h_content = h_res.content if hasattr(h_res, "content") else str(h_res)
                h_content = re.sub(r"<think>.*?</think>", "", h_content, flags=re.DOTALL).strip().lower()
                
                if "yes" in h_content:
                    print("🚨 HALLUCINATION DETECTED! Bắt buộc AI loại bỏ câu trả lời và chuyển sang Web Fallback.")
                    # Nếu bịa đặt, ép nó chạy Web fallback để tìm thông tin chính xác hơn
                    return self.handle_no_answer(state)
            except Exception as e:
                print(f"⚠️ Hallucination check error: {e}")
        else:
            print("--- SKIP HALLUCINATION LLM CHECK: fast guardrail uses strict answer prompt ---")

        # Cập nhật lại state với raw_question (câu đã contextualize) để trả về đúng context
        _log_rag_timing(
            "generate_completed",
            started_at,
            docs=len(documents),
            answer_chars=len(generation or ""),
        )
        return {
            "generation": generation,
            "documents": documents,
            "question": state["question"] # Giữ nguyên gốc cho state nếu cần, hoặc trả về câu đã dịch tùy hệ thống
        }
    # =================================
    # RETRIEVE + ADAPTIVE SCORING
    # =================================
    def retrieve(self, state: GraphState) -> Dict[str, Any]:
        started_at = perf_counter()
        raw_question = state["question"].strip()
        chat_history = state.get("chat_history", [])
        
        # --- 0. DỊCH CÂU HỎI THEO NGỮ CẢNH (COREFERENCE RESOLUTION) ---
        if (
            chat_history
            and len(chat_history) > 0
            and self.use_llm_contextualizer
            and _looks_like_followup_question(raw_question)
        ):
            print("--- CONTEXTUALIZING QUERY ---")
            history_str = "\n".join([f"{msg.get('role', 'user')}: {msg.get('content', '')}" for msg in chat_history[-4:]])
            prompt = f"""Dựa trên lịch sử trò chuyện và câu hỏi mới nhất của người dùng, hãy viết lại câu hỏi mới nhất thành một câu hỏi độc lập, đầy đủ chủ ngữ vị ngữ và ngữ cảnh (ví dụ thay thế 'ông ấy', 'trận đó', 'sự kiện này' bằng tên thật tương ứng trong lịch sử).
Lịch sử trò chuyện:
{history_str}

Câu hỏi hiện tại: {raw_question}

LƯU Ý: CHỈ trả về câu hỏi đã được viết lại, KHÔNG giải thích, KHÔNG trả lời. Nếu câu hỏi đã rõ ràng, hãy trả lại nguyên gốc."""
            try:
                from langchain_core.messages import HumanMessage
                res = self.llm.invoke([HumanMessage(content=prompt)])
                content = res.content if hasattr(res, "content") else str(res)
                content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()
                if content and len(content) > 2:
                    raw_question = content
                    print(f"👉 Contextualized Query: {raw_question}")
            except Exception as e:
                print(f"⚠️ Contextualization error: {e}")
        elif chat_history and len(chat_history) > 0:
            print("--- SKIP LLM CONTEXTUALIZER: question already looks standalone ---")

        raw_question = raw_question.lower()
        print(f"--- RETRIEVING for: {raw_question} ---")

        # 1. KIỂM TRA TRONG DANH SÁCH CHỜ DUYỆT (PENDING CACHE)
        # ✅ [FIX] Chỉ dùng pending cache nếu CHƯA được duyệt (approved=0)
        # Nếu đã approved=1, bỏ qua và để FAISS tìm kiếm bình thường
        from app.models.base_db import UserDB
        db = UserDB()
        pending = db.get_pending_by_question(raw_question)
        db.close()
        
        if pending and pending.get("approved") == 0:
            print(f"💡 FOUND IN PENDING KNOWLEDGE (unapproved): Returning cached web answer.")
            from langchain_core.documents import Document
            result = {
                "documents": [Document(
                    page_content=pending["answer"],
                    metadata={
                        "source": "Internet (Kiến thức đang học)",
                        "is_pending": True,
                        "question": pending["question"]
                    }
                )],
                "question": raw_question,
                "intent": "factual",
                "scores": {"semantic": 1.0}
            }
            _log_rag_timing("retrieve_completed", started_at, docs=1, intent="factual", source="pending")
            return result
        elif pending and pending.get("approved") == 1:
            print(f"✅ Knowledge already approved — letting FAISS retrieve instead.")

        # 2. PHÂN LOẠI CÂU HỎI (INTENT)
        intent = classify_query(raw_question, self.llm)
        print(f"[INTENT] {intent} → query: {raw_question[:60]!r}")

        if intent == "chitchat":
            result = {
                "documents": [],
                "question":  raw_question,
                "intent":    "chitchat",
                "scores":    {},
            }
            _log_rag_timing("retrieve_completed", started_at, docs=0, intent=intent)
            return result

        if intent == "unrelated":
            result = {
                "documents": [],
                "question":  raw_question,
                "intent":    "unrelated",
                "scores":    {},
            }
            _log_rag_timing("retrieve_completed", started_at, docs=0, intent=intent)
            return result

        # Chuẩn hóa câu hỏi để ném vào FAISS tìm kiếm
        question = normalize_question(raw_question)

        # ===== YEAR FILTER (giữ nguyên từ pipeline cũ) =====
        years = re.findall(r"\b(1[0-9]{3}|20[0-9]{2})\b", question)
        year_filter = int(years[0]) if years else None

        if year_filter:
            print(f"--- YEAR: {year_filter} ---")

        # ===== DYNASTY FILTER (giữ nguyên) =====
        dynasty_map = {
            "văn lang":    (-700, -258),
            "âu lạc":      (-257, -179),
            "bắc thuộc":   (-179, 938),
            "ngô":         (939, 965),
            "đinh":        (968, 980),
            "tiền lê":     (980, 1009),
            "lý":          (1009, 1225),
            "trần":        (1225, 1400),
            "hồ":          (1400, 1407),
            "minh thuộc":  (1407, 1427),
            "hậu lê":      (1428, 1789),
            "nam bắc triều":(1533, 1592),
            "trịnh nguyễn":(1627, 1775),
            "tây sơn":     (1771, 1802),
            "nguyễn":      (1802, 1945),
            "pháp thuộc":  (1858, 1945),
        }

        range_filter = None
        dynasty_key  = None

        def is_dynasty_mention(text: str, key: str) -> bool:
            period_keywords = {
                "văn lang", "âu lạc", "bắc thuộc", "minh thuộc", "hậu lê",
                "nam bắc triều", "trịnh nguyễn", "pháp thuộc",
            }
            if key in period_keywords:
                return re.search(rf"\b{re.escape(key)}\b", text) is not None

            dynasty_patterns = [
                rf"\bnhà\s+{re.escape(key)}\b",
                rf"\btriều\s+{re.escape(key)}\b",
                rf"\btriều\s+đại\s+{re.escape(key)}\b",
                rf"\bthời\s+{re.escape(key)}\b",
                rf"\b{re.escape(key)}\s+triều\b",
            ]
            return any(re.search(pattern, text) for pattern in dynasty_patterns)

        for key, (start, end) in dynasty_map.items():
            if is_dynasty_mention(question, key):
                range_filter = (start, end)
                dynasty_key  = key
                print(f"--- DYNASTY: {key} ({start}-{end}) ---")
                break

        # ===== LOAD MULTI-RETRIEVER (HYBRID BRAIN) =====
        import os
        all_pool = []
        
        # Xử lý đường dẫn linh hoạt: lấy folder cha nếu đang ở trong folder con (vertex/openai)
        base_path = self.path_vector_store
        if base_path.endswith("vertex") or base_path.endswith("openai"):
            base_path = os.path.dirname(base_path)

        # 3. NHÁNH EXTRA (Kiến thức đã duyệt) - Tìm ở cả gốc và thư mục con
        extra_paths = [
            "output",
            os.path.join("output", self.embedding_model_name),
        ]
        
        if self.search_approved_indexes:
            for e_path in dict.fromkeys(extra_paths):
                if os.path.exists(e_path) and os.path.exists(os.path.join(e_path, "index.faiss")):
                    try:
                        retriever_e = Retriever(embedding_model_name=self.embedding_model_name).set_retriever(path_vector_store=e_path)
                        docs_e = retriever_e.get_documents(query=question, num_doc=self.approved_docs_k)
                        if docs_e:
                            print(f"--- [BRAIN APPROVED] Found {len(docs_e)} docs from {e_path}")
                            all_pool.extend(docs_e)
                    except Exception as e:
                        print(f"⚠️ Approved knowledge search error at {e_path}: {e}")

        # 1. NHÁNH VERTEX (PDFs + Approved Knowledge)
        path_vertex = os.path.join(base_path, "vertex")
        if self.search_vertex_index and os.path.exists(path_vertex):
            try:
                retriever_v = Retriever(embedding_model_name="vertex").set_retriever(path_vector_store=path_vertex)
                docs_v = retriever_v.get_documents(query=question, num_doc=self.vector_docs_k)
                all_pool.extend(docs_v)
            except Exception as e:
                print(f"⚠️ Vertex search error: {e}")

        # 2. NHÁNH OPENAI (100k+ vectors cũ)
        path_openai = os.path.join(base_path, "openai")
        if self.search_openai_legacy_index and os.path.exists(path_openai):
            try:
                retriever_o = Retriever(embedding_model_name="openai").set_retriever(path_vector_store=path_openai)
                docs_o = retriever_o.get_documents(query=question, num_doc=self.vector_docs_k)
                all_pool.extend(docs_o)
            except Exception as e:
                print(f"⚠️ OpenAI search error: {e}")
        elif os.path.exists(path_openai):
            print("--- SKIP OPENAI LEGACY INDEX: RAG_SEARCH_OPENAI_LEGACY_INDEX=0 ---")

        pool = all_pool
        print(f"TOTAL POOL for rerank: {len(pool)}")

        # ===== FALLBACK =====
        if not pool:
            print("❌ KHÔNG CÓ DOCUMENT")
            result = {
                "documents": [],
                "question":  raw_question,
                "intent":    intent,
                "scores":    {},
            }
            _log_rag_timing("retrieve_completed", started_at, docs=0, intent=intent)
            return result

        # ===== ADAPTIVE RE-RANKING =====
        # Gọi AdaptiveRetriever để tái xếp hạng theo (semantic + temporal + causal)
        ar = AdaptiveRetriever()
        reranked_docs, score_summary = ar.rerank(
            query=question,
            docs=pool,
            intent=intent,
        )

        # ===== UU TIEN PDF (PDF Priority) =====
        # Sap xep lai: Day cac document tu PDF (co metadata 'page' hoac duoi .pdf) len tren cung
        def is_pdf(doc):
            source = doc.metadata.get("file_name") or doc.metadata.get("source") or ""
            has_page = doc.metadata.get("page") is not None or doc.metadata.get("page_number") is not None
            return source.lower().endswith('.pdf') or has_page

        reranked_docs.sort(key=lambda d: 0 if is_pdf(d) else 1)

        # ===== DEBUG LOG =====
        print("===== FINAL DOCUMENTS AFTER RERANK (PDF PRIORITIZED) =====")
        print("Total:", len(reranked_docs))
        for d in reranked_docs[:5]:
            source = d.metadata.get("file_name") or d.metadata.get("source") or "unknown"
            print(f"- {source} (is_pdf: {is_pdf(d)})")
        
        result = {
            "documents": reranked_docs,
            "question":  raw_question,
            "intent":    intent,
            "scores":    score_summary,
        }
        _log_rag_timing("retrieve_completed", started_at, docs=len(reranked_docs), pool=len(pool), intent=intent)
        return result

    # =================================
    # DECISION
    # =================================
    def decide_to_generate(self, state: GraphState) -> str:

        if not state["documents"]:
            print("--- NO DOCUMENT ---")
            return "no_document"

        return "generate"

    # =================================
    # GRADE DOCUMENT
    def grade_documents(self, state: GraphState) -> Dict[str, Any]:
        """Sử dụng LLM để chấm điểm tài liệu và loại bỏ rác"""
        started_at = perf_counter()
        question = state["question"]
        documents = state["documents"]
        
        print(f"--- GRADING {len(documents)} DOCUMENTS ---")
        
        relevant_docs = []

        def learned_question_matches(query: str, learned_question: str | None) -> bool:
            if not learned_question:
                return True

            stopwords = {
                "ai", "la", "là", "gi", "gì", "nao", "nào", "o", "ở",
                "ve", "về", "cua", "của", "va", "và", "cho", "biet", "biết",
                "hay", "hãy", "duoc", "được", "duoi", "dưới", "tay",
            }
            q_norm = normalize_question(query).lower().strip()
            learned_norm = normalize_question(learned_question).lower().strip()

            if learned_norm in q_norm or q_norm in learned_norm:
                return True

            q_tokens = set(re.findall(r"\w+", q_norm)) - stopwords
            learned_tokens = set(re.findall(r"\w+", learned_norm)) - stopwords
            if not q_tokens or not learned_tokens:
                return False

            overlap = q_tokens & learned_tokens
            required_overlap = min(2, len(q_tokens), len(learned_tokens))
            return len(overlap) >= required_overlap

        def fast_doc_matches(query: str, doc) -> bool:
            if doc.metadata.get("is_pending"):
                return True

            query_terms = _query_tokens(query)
            if not query_terms:
                return True

            content = doc.metadata.get("answer") if "answer" in doc.metadata else doc.page_content
            text_terms = _query_tokens(str(content)[:2500])
            overlap = query_terms & text_terms
            
            # Keep all tokens of length >= 2 (since _query_tokens already filters < 2, this keeps everything)
            important_overlap = {t for t in overlap if len(t) >= 2}
            
            # Cap required_overlap by query terms size to support short queries like "Lê Lợi"
            required_overlap = min(len(query_terms), max(2, len(query_terms) // 2))

            if len(important_overlap) >= required_overlap:
                return True

            return False

        if not self.use_llm_document_grader:
            for doc in documents:
                doc_source = doc.metadata.get("source", "")
                doc_type = doc.metadata.get("type", "")
                
                # Check if it's learned knowledge (approved qa, auto-learned, or chat history)
                is_learned = (doc_source in ("auto_learned_from_user_like", "history")) or (doc_type == "qa")
                
                if is_learned:
                    learned_q = doc.metadata.get("question")
                    if learned_question_matches(question, learned_q):
                        relevant_docs.append(doc)
                    else:
                        label = "qa" if doc_type == "qa" else ("auto-learned" if doc_source == "auto_learned_from_user_like" else "history")
                        print(f"   [FAST FILTERED] Topic mismatch {label} knowledge: {learned_q or 'unknown'}")
                    continue

                if fast_doc_matches(question, doc):
                    relevant_docs.append(doc)
                else:
                    source = doc.metadata.get("file_name") or doc.metadata.get("source") or "unknown"
                    print(f"   [FAST FILTERED] Low keyword overlap: {source}")

                if len(relevant_docs) >= self.max_context_docs:
                    break

            if len(relevant_docs) < self.fast_grade_min_docs:
                for doc in documents:
                    if doc not in relevant_docs:
                        relevant_docs.append(doc)
                    if len(relevant_docs) >= self.fast_grade_min_docs:
                        break

            print(f"--- FAST GRADING KEPT {len(relevant_docs)} DOCS ---")
            _log_rag_timing("grade_completed", started_at, docs_in=len(documents), docs_out=len(relevant_docs), mode="fast")
            return {
                "documents": relevant_docs,
                "question": question
            }
        
        # Sử dụng ThreadPoolExecutor để chạy song song cho nhanh
        with ThreadPoolExecutor(max_workers=5) as executor:
            # Map doc -> grading
            results = list(executor.map(lambda d: (d, self.document_grader.chain.invoke({"question": question, "document": d.page_content})), documents))
            
        for doc, grade in results:
            # 🔥 Ưu tiên 1: Nếu là kiến thức đang chờ duyệt (cache), giữ lại luôn
            if doc.metadata.get("is_pending"):
                relevant_docs.append(doc)
                continue
                
            # 🔥 Ưu tiên 2: Kiến thức đã học/history/QA vẫn phải cùng chủ đề câu hỏi hiện tại.
            doc_source = doc.metadata.get("source", "")
            doc_type = doc.metadata.get("type", "")
            if doc_source in ("auto_learned_from_user_like", "history") or doc_type == "qa":
                learned_q = doc.metadata.get("question")
                label = "qa" if doc_type == "qa" else ("auto-learned" if doc_source == "auto_learned_from_user_like" else "history")
                if not learned_question_matches(question, learned_q):
                    print(f"   [FILTERED] Topic mismatch {label} knowledge: {learned_q or 'unknown'}")
                elif "yes" in str(grade).lower():
                    print(f"   [TRUSTED] Relevant {label} knowledge: {doc.metadata.get('question')}")
                    relevant_docs.append(doc)
                else:
                    print(f"   [FILTERED] Irrelevant {label} knowledge: {learned_q or 'unknown'}")
                continue

            # Nếu grade trả về "yes" (hoặc chứa "yes") thì giữ lại
            if "yes" in str(grade).lower():
                relevant_docs.append(doc)
            else:
                source = doc.metadata.get("file_name") or doc.metadata.get("source") or "unknown"
                print(f"   [FILTERED] Irrelevant source: {source}")

        _log_rag_timing("grade_completed", started_at, docs_in=len(documents), docs_out=len(relevant_docs), mode="llm")
        return {
            "documents": relevant_docs,
            "question": question
        }

    # =================================
    # WORKFLOW
    # =================================
    def get_workflow(self):

        workflow = StateGraph(GraphState)

        workflow.add_node("retrieve", self.retrieve)
        workflow.add_node("grade_documents", self.grade_documents)
        workflow.add_node("generate", self.generate)
        workflow.add_node("handle_no_answer", self.handle_no_answer)

        workflow.add_edge(START, "retrieve")
        workflow.add_edge("retrieve", "grade_documents")

        workflow.add_conditional_edges(
            "grade_documents",
            self.decide_to_generate,
            {
                "no_document": "handle_no_answer",
                "generate": "generate",
            },
        )

        workflow.add_edge("generate", END)
        workflow.add_edge("handle_no_answer", END)

        return workflow
