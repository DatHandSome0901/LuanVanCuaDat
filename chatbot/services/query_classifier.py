"""
query_classifier.py
====================
Phân loại câu hỏi người dùng thành 4 loại intent:
    - causal     : câu hỏi về nguyên nhân / lý do
    - temporal   : câu hỏi về thời gian / năm / triều đại
    - comparison : câu hỏi so sánh
    - factual    : mặc định (ai, cái gì, như thế nào...)

Thiết kế:
    - Thuần regex + keyword matching → O(1), không cần LLM
    - Ưu tiên causal > comparison > temporal > factual
    - Dễ mở rộng: chỉ cần thêm vào PATTERNS
"""

import re
from typing import Literal

# ─────────────────────────────────────────────
# HẰNG SỐ
# ─────────────────────────────────────────────

# Ưu tiên từ trên xuống: causal > comparison > temporal > factual
PATTERNS: dict[str, list[str]] = {
    "causal": [
        "tại sao", "vì sao", "lý do", "nguyên nhân",
        "do đâu", "vì lý do", "do nguyên nhân",
        "dẫn đến", "gây ra", "kết quả của", "hậu quả",
    ],
    "comparison": [
        "so sánh", "khác nhau", "giống nhau",
        "điểm khác", "phân biệt", "khác biệt",
        "so với", "hơn", "kém hơn",
    ],
    "temporal": [
        "khi nào", "bao giờ", "năm nào", "thời gian nào",
        "thế kỷ nào", "giai đoạn nào", "triều đại nào",
        "trước hay sau", "thời điểm",
    ],
    "unrelated": [
        "elon musk", "bitcoin", "crypto", "thời tiết", "giá vàng", 
        "lập trình", "code", "python", "javascript", "toán học",
        "tỷ giá", "chứng khoán", "donald trump", "bill gates",
        "iphone", "samsung", "facebook", "tiktok", "youtube"
    ]
}

# Intent type hint
IntentType = Literal["causal", "temporal", "comparison", "factual", "unrelated", "chitchat"]


# ─────────────────────────────────────────────
# CHỨC NĂNG CHÍNH
# ─────────────────────────────────────────────

def classify_query(q: str, llm=None) -> IntentType:
    """
    Phân loại câu hỏi thành 6 loại intent (Causal, Temporal, Comparison, Factual, Unrelated, Chitchat).
    Sử dụng từ khóa trước, nếu không rõ thì dùng LLM để phân loại (nếu có cung cấp).
    """
    normalized = q.lower().strip()

    # 1. Thử phân loại nhanh bằng từ khóa chính xác cho chitchat
    clean_q = re.sub(r'[^\w\s]', '', normalized).strip()
    import unicodedata
    plain_q = (clean_q or "").replace("Đ", "D").replace("đ", "d")
    plain_q = unicodedata.normalize("NFD", plain_q)
    plain_q = "".join(ch for ch in plain_q if unicodedata.category(ch) != "Mn")
    plain_q = re.sub(r"\s+", " ", plain_q).strip()

    chitchat_phrases = {
        "chao", "xin chao", "chao ban", "chao ad", "chao bot", "chao nha", 
        "he lo", "helo", "hello", "hi", "halo", "hi ad", "hi bot", 
        "bye", "bye bye", "tampiet", "tam biet", "cam on", "cam on ban", 
        "cam on ad", "cam on bot", "thanks", "thank you", "thank", 
        "ban la ai", "ban ten gi", "bot la ai", "ai day", "chao thien su", 
        "thien su oi", "thien su", "giup toi voi", "biet toi la ai khong", 
        "toi la ai", "ban co biet toi la ai khong"
    }
    
    if plain_q in chitchat_phrases:
        return "chitchat"

    # 2. Thử phân loại nhanh bằng từ khóa
    for intent, keywords in PATTERNS.items():
        for kw in keywords:
            if kw in normalized:
                return intent  # type: ignore[return-value]

    # 3. Nếu có LLM, dùng LLM để kiểm tra chính xác
    if llm:
        try:
            prompt = f"""Bạn là một chuyên gia phân loại câu hỏi cho hệ thống chatbot Lịch sử Việt Nam.
Hãy phân loại câu hỏi sau đây của người dùng vào đúng 1 trong 3 nhóm:

1. "chitchat": Lời chào hỏi (xin chào, hello, chào bạn...), lời cảm ơn/tạm biệt, câu hỏi xã giao thông thường không chứa nội dung lịch sử (bạn là ai, khỏe không, bạn tên gì, bạn làm được gì...).
2. "unrelated": Câu hỏi về các lĩnh vực khác hoàn toàn không liên quan đến Lịch sử Việt Nam (lập trình máy tính, toán học, vật lý, thời tiết hiện tại, tin tức chính trị thế giới hiện đại, bitcoin, giá vàng hôm nay...).
3. "historical": Câu hỏi tra cứu, tìm hiểu hoặc thảo luận về nhân vật, sự kiện, triều đại, trận đánh hoặc văn hóa Lịch sử Việt Nam.

Câu hỏi của người dùng: "{q}"

Trả về duy nhất một từ khóa tiếng Anh viết thường: "chitchat", "unrelated" hoặc "historical".
"""
            res = llm.invoke(prompt)
            res_text = res.content if hasattr(res, "content") else str(res)
            res_text = re.sub(r"<think>.*?</think>", "", res_text, flags=re.DOTALL).strip().lower()
            
            if "chitchat" in res_text:
                return "chitchat"
            elif "unrelated" in res_text:
                return "unrelated"
        except Exception as e:
            print(f"⚠️ LLM intent classification error: {e}")

    return "factual"


def get_weights(intent: IntentType) -> dict[str, float | int]:
    """
    Trả về bộ trọng số (alpha, beta, gamma) và top_k theo intent.

    Công thức tính điểm cuối:
        final_score = alpha * semantic + beta * temporal + gamma * causal

    | Intent     | alpha | beta | gamma | top_k |
    |------------|-------|------|-------|-------|
    | factual    | 0.70  | 0.20 | 0.10  |  10   |
    | causal     | 0.40  | 0.10 | 0.50  |  10   |
    | temporal   | 0.40  | 0.50 | 0.10  |  10   |
    | comparison | 0.60  | 0.20 | 0.20  |  15   |
    | unrelated  | 0.00  | 0.00 | 0.00  |   0   |
    | chitchat   | 0.00  | 0.00 | 0.00  |   0   |

    Args:
        intent (IntentType): Loại câu hỏi.

    Returns:
        dict: {"alpha": float, "beta": float, "gamma": float, "top_k": int}
    """
    WEIGHT_TABLE: dict[str, dict[str, float | int]] = {
        "factual":    {"alpha": 0.70, "beta": 0.20, "gamma": 0.10, "top_k": 10},
        "causal":     {"alpha": 0.40, "beta": 0.10, "gamma": 0.50, "top_k": 10},
        "temporal":   {"alpha": 0.40, "beta": 0.50, "gamma": 0.10, "top_k": 10},
        "comparison": {"alpha": 0.60, "beta": 0.20, "gamma": 0.20, "top_k": 15},
        "unrelated":  {"alpha": 0.00, "beta": 0.00, "gamma": 0.00, "top_k": 0},
        "chitchat":   {"alpha": 0.00, "beta": 0.00, "gamma": 0.00, "top_k": 0},
    }
    return WEIGHT_TABLE.get(intent, WEIGHT_TABLE["factual"])
