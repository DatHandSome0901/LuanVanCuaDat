# Kỹ thuật chuyên sâu: Hệ thống Chatbot & AI Engine

Tài liệu này dành cho lập trình viên muốn nắm rõ luồng xử lý (Internal Logic) của Chatbot Engine.

## 1. Kiến trúc LangGraph Workflow
Hệ thống không chạy LLM đơn lẻ mà thông qua một State Machine (LangGraph). Mỗi node là một hàm Python nhận vào `State` và trả về `State` đã cập nhật.

### Sơ đồ xử lý chi tiết:
```text
[BẮT ĐẦU] 
    ↓
[Node: route_question] ──────────┐
    ↓ (Phân loại)                │
    ├─→ "web_search" ──┐         │ (Dùng cho câu hỏi chung)
    │                  ↓         │
    └─→ "vectorstore" ─┴─→ [Node: retrieve] (Lấy tài liệu RAG)
                                 ↓
                           [Node: grade_documents] (Lọc tài liệu rác)
                                 ↓
                           [Node: generate] (Sinh câu trả lời)
                                 ↓
                           [KẾT THÚC & TÍNH PHÍ]
```

## 2. Chi tiết các Node xử lý (Code Snippets)

### A. Question Router: Phân loại thông minh
Sử dụng Pydantic để ép kiểu đầu ra của LLM, giúp backend dễ dàng rẽ nhánh logic.
```python
# chatbot/utils/question_router.py
class RouteQuery(BaseModel):
    datasource: Literal["vectorstore", "web_search"]

# Logic định tuyến
def route_question(state: GraphState):
    question = state["question"]
    # LLM sẽ trả về object RouteQuery
    source = question_router.invoke({"question": question})
    return source.datasource # Trả về "vectorstore" hoặc "web_search"
```

### B. Document Grader: Chống Hallucination (Ảo giác)
Hệ thống kiểm tra từng tài liệu lấy được từ VectorDB. Nếu tài liệu không chứa thông tin cần thiết, nó sẽ bị loại bỏ trước khi gửi cho LLM sinh câu trả lời.
```python
# chatbot/utils/document_grader.py
def grade_documents(state: GraphState):
    documents = state["documents"]
    filtered_docs = []
    for d in documents:
        # LLM đánh giá: "yes" là phù hợp, "no" là không liên quan
        score = retrieval_grader.invoke({"question": question, "document": d.page_content})
        if score.binary_score == "yes":
            filtered_docs.append(d)
    return {"documents": filtered_docs}
```

## 3. Cơ chế Tính phí Token (Billing Process)
Đây là phần quan trọng nhất để duy trì dự án. Token được tính **sau khi kết thúc workflow**.

### Bước 1: Đếm Token bằng Tiktoken
Chúng tôi sử dụng thư viện `tiktoken` của OpenAI để đếm chính xác số lượng dữ liệu bot phản hồi.
```python
# chatbot/utils/token_counter.py
import tiktoken

def count_tokens(text: str, model="gpt-4o-mini"):
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))
```

### Bước 2: Trừ Token trong Database
Sử dụng logic `change_token_balance` hỗ trợ số thực (float/REAL) trong SQLite.
```python
# app/models/base_db.py
def change_token_balance(self, user_id, amount, description, tx_type):
    # tx_type: 'out' là trừ tiền, 'in' là nạp tiền
    delta = -float(amount) if tx_type == 'out' else float(amount)
    self.cursor.execute(
        "UPDATE users SET token_balance = token_balance + ? WHERE id = ?",
        (delta, user_id)
    )
    # Ghi log lịch sử để đối soát
    self.cursor.execute(
        "INSERT INTO token_history (user_id, type, amount, description) VALUES (?, ?, ?, ?)",
        (user_id, tx_type, float(amount), description)
    )
```

## 4. Cấu hình RAG (Vector Store)
Hệ thống sử dụng **FAISS** hoặc **ChromaDB** tùy cấu hình.
- **Vị trí**: `utils/data/data_vector/`
- **Embedding**: Dùng `text-embedding-3-small` hoặc Gemini Embedding.
- **Cách cập nhật**: Sau khi thêm file mới vào `utils/data/`, lập trình viên cần chạy script rebuild index để chatbot cập nhật kiến thức mới.

## 5. API Response Format
Mọi API chat đều tuân thủ cấu trúc sau để Frontend có thể hiển thị Progress và Billing:
```json
{
  "answer": "Nam mô A Di Đà Phật, đây là câu trả lời...",
  "tokens_charged": 150.5,
  "user_token_balance": 849.5,
  "sources": ["nguon_goc_phat_phap.pdf", "lich_su_chua.txt"]
}
```

---
*Ghi chú: Lập trình viên nên kiểm tra file `chatbot/services/files_rag_chat_agent.py` để xem cách các Node được kết nối bằng `.add_node()` và `.add_edge()`.*
