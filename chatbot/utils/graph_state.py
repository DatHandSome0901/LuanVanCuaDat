from typing import List, Optional
from typing_extensions import TypedDict


class GraphState(TypedDict, total=False):
    """
    Đại diện cho trạng thái của workflow (Adaptive RAG pipeline).

    Pipeline: question → retrieve → grade → generate

    Attributes:
        question (str)      : Câu hỏi người dùng (bắt buộc).
        generation (str)    : Kết quả sinh ra từ LLM.
        documents (list)    : Tài liệu đã được re-rank và lọc.
        chat_history (list) : Lịch sử hội thoại (conversation memory).

        --- Adaptive RAG fields (thêm mới) ---
        intent (str)        : Loại câu hỏi: "causal"|"temporal"|"comparison"|"factual".
        scores (dict)       : Điểm trung bình top-3 docs: {semantic, temporal, causal}.
        debug (bool)        : Bật/tắt trả debug scores ra response (mặc định False).
    """

    # ── Core fields (luôn có) ──────────────────────────────
    question: str
    generation: str
    documents: list

    # ── Conversation Memory ────────────────────────────────
    chat_history: list   # [{"role": "user"|"assistant", "content": "..."}]

    # ── Adaptive RAG extension (optional, total=False) ─────
    intent: str          # "causal" | "temporal" | "comparison" | "factual"
    scores: dict         # {"semantic": float, "temporal": float, "causal": float}
    debug: bool          # True → trả scores ra ChatResponse
    defer_web_fallback: bool
    web_fallback_required: bool
    user_name: str
