"""
causal_engine.py
=================
Hai hàm chấm điểm bổ sung cho RAG pipeline:

    1. causal_score(query, doc)  → float [0.0 – 1.0]
       Đánh giá mức độ liên quan nhân-quả giữa query và document.

    2. temporal_score(query, doc) → float [0.0 – 1.0]
       Đánh giá mức độ trùng khớp thời gian (năm, triều đại).

Thiết kế:
    - Thuần Python: chỉ dùng `re`, `math` — không thêm thư viện nặng
    - Nhanh: mỗi hàm chạy < 1ms với văn bản thông thường
    - Dễ mở rộng: thêm từ khóa vào constants là xong
"""

import re
import math
from typing import Optional

# ════════════════════════════════════════════════════════════
# PHẦN 1 — CAUSAL SCORING
# ════════════════════════════════════════════════════════════

# Từ khóa chỉ quan hệ nguyên nhân trong tiếng Việt
CAUSAL_KEYWORDS: list[str] = [
    "vì", "do", "bởi", "bởi vì", "vì vậy", "do đó",
    "dẫn đến", "dẫn tới", "gây ra", "kết quả là",
    "nguyên nhân", "hậu quả", "vì thế", "cho nên",
    "từ đó", "nhờ", "nhờ vào", "xuất phát từ",
]

# Cặp quan hệ nhân-quả (cause_marker, effect_marker)
CAUSAL_PAIRS: list[tuple[str, str]] = [
    ("vì", "nên"),
    ("vì", "dẫn đến"),
    ("do", "dẫn đến"),
    ("bởi vì", "cho nên"),
    ("nhờ", "mà"),
    ("nguyên nhân", "kết quả"),
]

# Từ khóa câu hỏi nhân quả trong query
CAUSAL_QUERY_TRIGGERS: list[str] = [
    "tại sao", "vì sao", "lý do", "nguyên nhân nào",
    "do đâu", "vì lý do gì",
]


def causal_score(query: str, doc: str) -> float:
    """
    Tính điểm mức độ liên quan nhân-quả giữa query và document.

    Thuật toán:
        1. Đếm số CAUSAL_KEYWORDS xuất hiện trong doc → score cơ bản
        2. Tìm cặp cause→effect rõ ràng trong doc → bonus
        3. Nếu query có CAUSAL_QUERY_TRIGGERS → tăng nhân hệ số

    Args:
        query (str): Câu hỏi của người dùng.
        doc   (str): Nội dung tài liệu cần chấm điểm.

    Returns:
        float: Điểm từ 0.0 đến 1.0.

    Examples:
        >>> causal_score("tại sao nhà Trần thắng?",
        ...              "Nhà Trần thắng vì chiến thuật hợp lý dẫn đến chiến thắng.")
        0.78  # (approximate)
    """
    q_lower = query.lower().strip()
    d_lower = doc.lower().strip()

    if not d_lower:
        return 0.0

    # ── BƯỚC 1: Đếm causal keywords trong doc ──────────────
    keyword_hits = sum(1 for kw in CAUSAL_KEYWORDS if kw in d_lower)
    # Normalize: tối đa kỳ vọng ~5 từ là "rất tốt"
    keyword_score = min(keyword_hits / 5.0, 1.0)

    # ── BƯỚC 2: Tìm cặp cause→effect rõ ràng ───────────────
    pair_bonus = 0.0
    for cause_kw, effect_kw in CAUSAL_PAIRS:
        if cause_kw in d_lower and effect_kw in d_lower:
            # Kiểm tra thứ tự: cause phải xuất hiện trước effect
            pos_cause = d_lower.find(cause_kw)
            pos_effect = d_lower.find(effect_kw)
            if pos_cause < pos_effect:
                pair_bonus = 0.3  # bonus cố định khi tìm được cặp
                break

    # ── BƯỚC 3: Boost nếu query là câu hỏi nhân quả ────────
    is_causal_query = any(trigger in q_lower for trigger in CAUSAL_QUERY_TRIGGERS)
    query_multiplier = 1.3 if is_causal_query else 1.0

    # ── BƯỚC 4: Tổng hợp ────────────────────────────────────
    raw_score = (keyword_score * 0.7) + pair_bonus
    final = min(raw_score * query_multiplier, 1.0)

    return round(final, 4)


def _extract_causal_pair(text: str) -> Optional[tuple[str, str]]:
    """
    Trích xuất cặp (cause, effect) đầu tiên tìm thấy trong văn bản.
    Dùng cho mục đích logging / debug luận văn.

    Returns:
        tuple (cause_phrase, effect_phrase) hoặc None nếu không tìm thấy.

    Examples:
        >>> _extract_causal_pair("Nhà Trần thắng vì chiến thuật hợp lý dẫn đến chiến thắng")
        ('chiến thuật hợp lý', 'chiến thắng')
    """
    for cause_kw, effect_kw in CAUSAL_PAIRS:
        pattern = rf"{re.escape(cause_kw)}\s+(.{{5,80}}?)\s+{re.escape(effect_kw)}\s+(.{{5,80}}?)(?:[.!?,]|$)"
        match = re.search(pattern, text.lower())
        if match:
            return match.group(1).strip(), match.group(2).strip()
    return None


# ════════════════════════════════════════════════════════════
# PHẦN 2 — TEMPORAL SCORING
# ════════════════════════════════════════════════════════════

# Regex bắt năm (3-4 chữ số: 938, 1258, 1945...)
YEAR_RE = re.compile(r"\b(\d{3,4})\b")

# Từ khóa liên quan thời gian
TEMPORAL_KEYWORDS: list[str] = [
    "năm", "thế kỷ", "triều", "giai đoạn",
    "đời", "thời", "thời kỳ", "thế kỉ", "thập kỷ",
]

# Ngưỡng khoảng cách năm → điểm
_YEAR_THRESHOLDS = [
    (0,   1.0),   # cùng năm
    (20,  0.85),  # cách nhau ≤ 20 năm
    (50,  0.70),  # cách nhau ≤ 50 năm
    (100, 0.50),  # cách nhau ≤ 100 năm
    (200, 0.30),  # cách nhau ≤ 200 năm
    (500, 0.15),  # cách nhau ≤ 500 năm
]


def _year_proximity_score(years_q: list[int], years_d: list[int]) -> float:
    """
    Tính điểm gần theo thời gian dựa trên danh sách năm.

    Chiến lược: lấy cặp (năm_query, năm_doc) gần nhau nhất → điểm cao nhất.
    """
    if not years_q or not years_d:
        return 0.0

    best = 1.0  # worst case
    for yq in years_q:
        for yd in years_d:
            diff = abs(yq - yd)
            for threshold, score in _YEAR_THRESHOLDS:
                if diff <= threshold:
                    best = min(best, 1.0 - score + score)  # giữ score tốt nhất
                    best = score  # lấy điểm của cặp tốt nhất
                    break
    # Thực tế: chọn điểm cao nhất (cặp gần nhất)
    scores = []
    for yq in years_q:
        for yd in years_d:
            diff = abs(yq - yd)
            s = 0.05  # mặc định rất xa
            for threshold, score in _YEAR_THRESHOLDS:
                if diff <= threshold:
                    s = score
                    break
            scores.append(s)
    return max(scores) if scores else 0.0


def temporal_score(query: str, doc: str) -> float:
    """
    Tính điểm mức độ trùng khớp thời gian giữa query và document.

    Thuật toán:
        1. Trích năm từ query và doc bằng regex
        2. Nếu có năm → tính proximity score dựa trên khoảng cách năm
        3. Nếu không có năm → fallback: đếm temporal keywords

    Args:
        query (str): Câu hỏi của người dùng.
        doc   (str): Nội dung tài liệu cần chấm điểm.

    Returns:
        float: Điểm từ 0.0 đến 1.0.

    Examples:
        >>> temporal_score("Năm 1258 quân Mông Cổ tấn công lần 2?",
        ...                "Cuộc kháng chiến năm 1258 kết thúc thắng lợi.")
        1.0   # cùng năm
        >>> temporal_score("Nhà Trần năm 1285?",
        ...                "Nhà Lý thành lập năm 1009.")
        0.15  # cách nhau 276 năm
    """
    q_lower = query.lower().strip()
    d_lower = doc.lower().strip()

    if not d_lower:
        return 0.0

    # ── BƯỚC 1: Trích năm ──────────────────────────────────
    years_q = [int(y) for y in YEAR_RE.findall(q_lower)]
    years_d = [int(y) for y in YEAR_RE.findall(d_lower)]

    # ── BƯỚC 2: Nếu có năm → proximity score ───────────────
    if years_q and years_d:
        return round(_year_proximity_score(years_q, years_d), 4)

    # ── BƯỚC 3: Fallback — temporal keyword overlap ─────────
    # Nếu không có năm cụ thể, dùng từ khóa
    kw_in_query = sum(1 for kw in TEMPORAL_KEYWORDS if kw in q_lower)
    kw_in_doc   = sum(1 for kw in TEMPORAL_KEYWORDS if kw in d_lower)

    if kw_in_query == 0:
        return 0.1  # query không hỏi về thời gian → thấp

    # Tỷ lệ keyword xuất hiện trong doc (tối đa 0.5 nếu chỉ dùng keyword)
    kw_score = min(kw_in_doc / max(kw_in_query, 1), 1.0) * 0.5
    return round(kw_score, 4)
