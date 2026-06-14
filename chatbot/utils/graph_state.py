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

        --- Adaptive RAG fields ---
        intent (str)        : Loại câu hỏi: "causal"|"temporal"|"comparison"|"factual".
        scores (dict)       : Điểm trung bình top-3 docs: {semantic, temporal, causal}.
        debug (bool)        : Bật/tắt trả debug scores ra response (mặc định False).

        --- Entity-aware fields (mới) ---
        main_entity (str)         : Entity key được detect từ câu hỏi (vd: "hai_ba_trung").
        main_entity_display (str) : Tên hiển thị của entity (vd: "Hai Bà Trưng").
        detailed_intent (str)     : Intent chi tiết hơn: "temporal_question", "confirmation_question",
                                    "hypothesis_statement", "follow_up_request", etc.
        last_main_entity (str)    : Entity key từ turn trước (để resolve follow-up).
        last_main_entity_display (str): Tên hiển thị entity từ turn trước.

        --- User context ---
        user_id (int)       : ID người dùng hiện tại (để load User RAG).
        user_name (str)     : Tên người dùng (cho chitchat).
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

    # ── Entity-aware tracking (mới) ────────────────────────
    main_entity: str                # key trong VIET_HISTORY_ENTITIES
    main_entity_display: str        # tên hiển thị có dấu
    detailed_intent: str            # intent chi tiết (temporal_question, hypothesis_statement, ...)
    last_main_entity: str           # entity từ turn trước
    last_main_entity_display: str   # tên hiển thị entity từ turn trước

    # ── User context ───────────────────────────────────────
    user_id: int
    user_name: str
