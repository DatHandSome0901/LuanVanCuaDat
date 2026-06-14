"""
entity_detector.py
==================
Phát hiện entity chính, phân loại intent chi tiết, và rewrite follow-up.

Tất cả logic là rule-based (không gọi LLM) để tiết kiệm quota.

Public API:
    detect_main_entity(text)         → (entity_key, entity_info) | (None, None)
    detect_detailed_intent(text)     → DetailedIntent literal string
    is_followup_request(text)        → bool
    rewrite_followup_with_entity(question, last_entity_display) → str
    filter_docs_by_entity(docs, entity_key, strict) → list[Document]
    filter_sources_by_entity(sources, entity_key)   → list[SourceInfo-like]
"""

from __future__ import annotations

import re
import unicodedata
from typing import Literal

from chatbot.utils.viet_history_entities import (
    detect_entity_from_text,
    is_source_relevant_to_entity,
    VIET_HISTORY_ENTITIES,
    _norm,
)

def detect_main_entity(text: str) -> tuple[str, dict] | tuple[None, None]:
    """
    Phát hiện entity chính từ văn bản sử dụng hàm detect_entity_from_text.
    """
    return detect_entity_from_text(text)

# ── INTENT TYPES ─────────────────────────────────────────────────────────────


DetailedIntent = Literal[
    "factual_question",       # hỏi sự thật thông thường
    "definition_question",    # hỏi là ai / là gì
    "temporal_question",      # hỏi năm nào / khi nào
    "cause_question",         # hỏi nguyên nhân / vì sao
    "result_question",        # hỏi kết quả / ý nghĩa
    "event_question",         # hỏi trận đánh / sự kiện
    "comparison_question",    # hỏi so sánh
    "confirmation_question",  # hỏi đúng không / phải không
    "hypothesis_statement",   # đặt giả thuyết
    "follow_up_request",      # chi tiết hơn / rồi sao nữa / tiếp
    "chitchat",
    "unrelated",
]

# ── PATTERN TABLES ────────────────────────────────────────────────────────────

_FOLLOWUP_PATTERNS = [
    r"\bchi tiet hon\b", r"\bchi tiết hơn\b",
    r"\bnoi ro hon\b",   r"\bnói rõ hơn\b",
    r"\bgiai thich them\b", r"\bgiải thích thêm\b",
    r"\btiep tuc\b",     r"\btiếp tục\b",
    r"\broi sao nua\b",  r"\brồi sao nữa\b",
    r"\bva sao nua\b",   r"\bvà sao nữa\b",
    r"\bsau do\b",       r"\bsau đó\b",
    r"\bthem thong tin\b", r"\bthêm thông tin\b",
    r"\bke tiep\b",      r"\bkể tiếp\b",
    r"\bcon gi nua\b",   r"\bcòn gì nữa\b",
    r"\bvay thoi\b",     r"\bvậy thôi\b",
    r"\btiep di\b",      r"\btiếp đi\b",
    # Short causal/manner follow-ups (no standalone entity → must be about prev topic)
    r"^tai sao[?!.]*$",  r"^tại sao[?!.]*$",
    r"^vi sao[?!.]*$",   r"^vì sao[?!.]*$",
    r"^nhu the nao[?!.]*$", r"^như thế nào[?!.]*$",
    r"^ra sao[?!.]*$",
    r"^sao vay[?!.]*$",  r"^sao vậy[?!.]*$",
    r"^con nua[?!.]*$",  r"^còn nữa[?!.]*$",
]

_DETAILED_INTENT_RULES: list[tuple[str, DetailedIntent]] = [
    # hypothesis — phải check trước confirmation
    (r"\bchưa\s+(?:chết|mất|hi sinh|hẹp)\b", "hypothesis_statement"),
    (r"\bkhong\s+(?:chet|mat|hy sinh)\b",     "hypothesis_statement"),
    (r"\bgiả thuyết\b|gia thuyet",             "hypothesis_statement"),
    (r"\bnếu như\b|neu nhu",                   "hypothesis_statement"),
    (r"\btheo tôi thì\b|theo toi thi",         "hypothesis_statement"),
    (r"\bvẫn còn sống\b|van con song",         "hypothesis_statement"),

    # confirmation — đúng không / phải không
    (r"\b(?:đúng|dung)\s+(?:không|khong)\b",  "confirmation_question"),
    (r"\b(?:phải|phai)\s+(?:không|khong)\b",  "confirmation_question"),
    (r"\bcó phải\b|co phai",                   "confirmation_question"),
    (r"\bthật không\b|that khong",             "confirmation_question"),

    # temporal
    (r"\bnam nao\b|\bnăm nào\b|\bkhi nao\b|\bkhi nào\b", "temporal_question"),
    (r"\bthoi gian nao\b|\bthời gian nào\b",  "temporal_question"),
    (r"\bthe ky\b|\bthế kỷ\b|\bbao gio\b|\bbao giờ\b",    "temporal_question"),

    # definition
    (r"\b(?:la|là)\s+(?:ai|gi|gì)\b",         "definition_question"),
    (r"\bai\s+(?:la|là)\b",                    "definition_question"),
    (r"\bla gi\b|\blà gì\b",                   "definition_question"),

    # cause
    (r"\btai sao\b|\btại sao\b|\bvi sao\b|\bvì sao\b", "cause_question"),
    (r"\bly do\b|\blý do\b|\bnguyen nhan\b|\bnguyên nhân\b", "cause_question"),
    (r"\bdo dau\b|\bdo đâu\b",                 "cause_question"),

    # result
    (r"\bket qua\b|\bkết quả\b|\by nghia\b|\bý nghĩa\b", "result_question"),
    (r"\btac dong\b|\btác động\b|\bhau qua\b|\bhậu quả\b", "result_question"),

    # event
    (r"\btran danh\b|\btrận đánh\b|\bchien dich\b|\bchiến dịch\b", "event_question"),
    (r"\bkhoi nghia\b|\bkhởi nghĩa\b",         "event_question"),

    # comparison
    (r"\bso sanh\b|\bso sánh\b|\bkhac nhau\b|\bkhác nhau\b", "comparison_question"),
    (r"\bgiong nhau\b|\bgiống nhau\b|\bphân biệt\b|\bphan biet\b", "comparison_question"),
]

_CHITCHAT_NORMS = {
    "chao", "xin chao", "chao ban", "hello", "hi", "halo", "hey",
    "bye", "tam biet", "cam on", "thanks", "thank you",
    "ban la ai", "bot la ai", "ai day", "khoe khong",
    "biet toi la ai khong", "toi la ai",
}

_UNRELATED_KEYWORDS = [
    "bitcoin", "crypto", "chung khoan", "co phieu", "tai chinh",
    "lap trinh", "code", "python", "javascript", "java", "nodejs",
    "toan hoc", "vat ly", "hoa hoc", "sinh hoc",
    "thoi tiet", "du bao thoi tiet", "gia vang", "ty gia",
    "elon musk", "donald trump", "bill gates", "iphone", "samsung",
    "facebook", "tiktok", "youtube", "instagram", "twitter",
]


# ── DETECT DETAILED INTENT ────────────────────────────────────────────────────

def detect_detailed_intent(text: str) -> DetailedIntent:
    """
    Phân loại intent chi tiết từ câu hỏi, thuần rule-based.
    Priority: hypothesis > confirmation > temporal > definition > cause > result > event > comparison > follow_up > factual
    """
    norm_text = _norm(text)

    # chitchat
    clean = re.sub(r"[^\w\s]", "", norm_text).strip()
    if clean in _CHITCHAT_NORMS:
        return "chitchat"

    # unrelated
    if any(kw in norm_text for kw in _UNRELATED_KEYWORDS):
        return "unrelated"

    # follow-up check
    if is_followup_request(text):
        return "follow_up_request"

    # Các intent theo pattern table
    for pattern, intent in _DETAILED_INTENT_RULES:
        if re.search(pattern, norm_text):
            return intent

    return "factual_question"


# ── FOLLOW-UP DETECTION ───────────────────────────────────────────────────────

def is_followup_request(text: str) -> bool:
    """
    Kiểm tra xem câu có phải là follow-up ngắn không có entity mới.

    True nếu:
    - Khớp với pattern follow-up rõ ràng
    - VÀ câu rất ngắn (≤ 5 từ)
    - VÀ không phát hiện entity mới
    """
    norm_text = _norm(text)

    # Kiểm tra pattern follow-up
    has_pattern = any(re.search(pat, norm_text) for pat in _FOLLOWUP_PATTERNS)
    if not has_pattern:
        return False

    # Nếu câu quá dài thì không phải follow-up đơn thuần
    words = norm_text.split()
    if len(words) > 8:
        return False

    # Nếu phát hiện entity mới trong câu → không phải follow-up
    entity_key, _ = detect_entity_from_text(text)
    if entity_key:
        return False

    return True


# ── FOLLOW-UP REWRITE ─────────────────────────────────────────────────────────

def rewrite_followup_with_entity(question: str, last_entity_display: str | None) -> str:
    """
    Rewrite câu follow-up ngắn bằng cách thêm entity context.

    Ví dụ:
        "chi tiết hơn" + "Hai Bà Trưng" → "Chi tiết hơn về Hai Bà Trưng"
        "vì sao"       + "Trần Hưng Đạo" → "Vì sao Trần Hưng Đạo thắng quân Nguyên Mông?"

    Không rewrite nếu:
    - Không có last_entity_display
    - Câu đã chứa entity
    """
    if not last_entity_display:
        return question

    if not is_followup_request(question):
        return question

    # Strip punctuation
    q_clean = question.strip(" ?!.,")

    # Map một số pattern → template câu mới
    norm_q = _norm(q_clean)

    rewrite_map = [
        (r"\bchi tiet hon\b|\bchi tiết hơn\b",
         f"Chi tiết hơn về {last_entity_display}"),
        (r"\bnoi ro hon\b|\bnói rõ hơn\b",
         f"Nói rõ hơn về {last_entity_display}"),
        (r"\bgiai thich them\b|\bgiải thích thêm\b",
         f"Giải thích thêm về {last_entity_display}"),
        (r"\broi sao nua\b|\brồi sao nữa\b|\bva sao nua\b|\bvà sao nữa\b",
         f"Rồi sao nữa về {last_entity_display}?"),
        (r"\btiep tuc\b|\btiếp tục\b|\btiep di\b|\btiếp đi\b",
         f"Tiếp tục về {last_entity_display}"),
        (r"\bke tiep\b|\bkể tiếp\b",
         f"Kể tiếp về {last_entity_display}"),
        (r"\bthem thong tin\b|\bthêm thông tin\b",
         f"Thêm thông tin về {last_entity_display}"),
        (r"\bcon gi nua\b|\bcòn gì nữa\b",
         f"Còn gì nữa về {last_entity_display}?"),
        (r"^tai sao[?!.]*$|^tại sao[?!.]*$",
         f"Tại sao Hai Bà Trưng thất bại?" if last_entity_display == "Hai Bà Trưng"
         else f"Tại sao {last_entity_display}?"),
        (r"^vi sao[?!.]*$|^vì sao[?!.]*$",
         f"Vì sao {last_entity_display}?"),
        (r"^nhu the nao[?!.]*$|^như thế nào[?!.]*$",
         f"{last_entity_display} như thế nào?"),
        (r"^ra sao[?!.]*$",
         f"{last_entity_display} ra sao?"),
        (r"^sao vay[?!.]*$|^sao vậy[?!.]*$",
         f"Sao {last_entity_display} lại như vậy?"),
        (r"^con nua[?!.]*$|^còn nữa[?!.]*$",
         f"Còn thông tin gì nữa về {last_entity_display}?"),
        (r"\bsau do\b|\bsau đó\b",
         f"Sau đó {last_entity_display} như thế nào?"),
    ]

    for pattern, template in rewrite_map:
        if re.search(pattern, norm_q):
            rewritten = template
            print(f"[FOLLOWUP REWRITE] '{question}' → '{rewritten}'")
            return rewritten

    # Generic fallback
    rewritten = f"{q_clean} (liên quan đến {last_entity_display})"
    print(f"[FOLLOWUP REWRITE] '{question}' → '{rewritten}'")
    return rewritten


# ── ENTITY-AWARE DOCUMENT FILTER ─────────────────────────────────────────────

def filter_docs_by_entity(docs: list, entity_key: str | None,
                           strict: bool = False) -> list:
    """
    Lọc danh sách documents theo entity chính.

    Args:
        docs        : list[Document]
        entity_key  : key trong VIET_HISTORY_ENTITIES, hoặc None (bỏ qua filter)
        strict      : True → loại bỏ doc không liên quan
                      False → giữ lại nhưng di chuyển xuống cuối (soft filter)

    Returns:
        list[Document] đã lọc / sắp xếp lại
    """
    if not entity_key or entity_key not in VIET_HISTORY_ENTITIES:
        return docs  # Không có entity → giữ nguyên

    from chatbot.utils.viet_history_entities import entity_score_for_doc

    entity_info = VIET_HISTORY_ENTITIES[entity_key]
    related: list = []
    unrelated: list = []

    for doc in docs:
        # User RAG luôn ưu tiên — không filter
        if doc.metadata.get("is_user_rag"):
            related.append(doc)
            continue

        text = ""
        if hasattr(doc, "metadata"):
            text += str(doc.metadata.get("answer", ""))
            text += " " + str(doc.metadata.get("file_name", ""))
            text += " " + str(doc.metadata.get("source", ""))
        if hasattr(doc, "page_content"):
            text += " " + doc.page_content

        score = entity_score_for_doc(text, entity_key)

        if score >= 0:
            related.append(doc)
        else:
            if strict:
                print(f"   [ENTITY FILTER STRICT] Removed off-topic doc: "
                      f"{doc.metadata.get('file_name') or doc.metadata.get('source', 'unknown')[:60]}")
            else:
                unrelated.append(doc)

    if strict:
        return related
    else:
        # Soft: liên quan lên đầu, không liên quan xuống sau
        return related + unrelated

def filter_docs_by_entity_strict(docs: list, entity_key: str | None) -> list:
    """
    Strictly filter document chunks by entity relevance.
    Uses is_source_relevant_to_entity on each chunk.
    """
    if not entity_key:
        return docs
        
    from chatbot.utils.viet_history_entities import is_source_relevant_to_entity
    import os
    from urllib.parse import urlparse, unquote

    filtered = []
    for doc in docs:
        if doc.metadata.get("is_web") or doc.metadata.get("is_pending"):
            filtered.append(doc)
            continue
            
        url = doc.metadata.get("url")
        source_val = doc.metadata.get("source") or ""
        file_name_val = doc.metadata.get("file_name") or ""
        
        is_web = doc.metadata.get("is_web", False)
        if str(source_val).startswith("http://") or str(source_val).startswith("https://"):
            is_web = True
            url = url or str(source_val)
        if str(url).startswith("http://") or str(url).startswith("https://"):
            is_web = True
            
        if is_web:
            fname = file_name_val or source_val or url
        else:
            fname = file_name_val or source_val or doc.metadata.get("filename") or ""
            
        if not fname:
            fname = "Tài liệu lưu trữ hệ thống"
            
        s_str = str(url) if is_web else str(source_val or fname)
        
        if not is_web and s_str == "history":
            approved_q = doc.metadata.get("question")
            if approved_q:
                fname = f"Kiến thức: {approved_q}"
                if len(fname) > 60:
                    fname = fname[:57] + "..."
            else:
                fname = "Kiến thức hệ thống đã duyệt"
        elif is_web:
            if fname.startswith("http://") or fname.startswith("https://"):
                fname = urlparse(fname).netloc or fname
        else:
            fname = os.path.basename(fname.rstrip("/"))
            fname = unquote(fname).replace("_", " ")
            
        base_name = os.path.splitext(fname)[0].replace("_ocred", "")
        content_preview = doc.metadata.get("answer") if "answer" in doc.metadata else doc.page_content
        content_preview = (content_preview or "")[:300]
        
        if is_source_relevant_to_entity(base_name, content_preview, entity_key):
            filtered.append(doc)
            
    return filtered


# ── SOURCE FILTER ─────────────────────────────────────────────────────────────

def filter_sources_by_entity(sources: list, entity_key: str | None) -> list:
    """
    Lọc source list (SourceInfo-like dicts hoặc objects) theo entity.
    Chỉ giữ nguồn có liên quan đến entity.
    Nếu entity là None → giữ nguyên tất cả.
    Nếu sau khi lọc không còn gì → trả về list rỗng (caller tự xử lý).
    """
    if not entity_key:
        return sources

    kept = []
    for src in sources:
        # Support cả dict và object (SourceInfo pydantic)
        if isinstance(src, dict):
            is_web = src.get("is_web", False)
            is_pending = src.get("is_pending", False)
            title = src.get("filename", "") or src.get("fname", "")
            content = src.get("content", "")[:300]
        else:
            is_web = getattr(src, "is_web", False)
            is_pending = getattr(src, "is_pending", False) or "kiến thức đang học" in str(getattr(src, "filename", "")).lower()
            title = getattr(src, "filename", "") or ""
            content = getattr(src, "content", "")[:300]

        if is_web or is_pending:
            kept.append(src)
            continue

        if is_source_relevant_to_entity(title, content, entity_key):
            kept.append(src)
        else:
            print(f"   [SOURCE FILTER] Removed off-topic source: '{title[:70]}'")

    return kept


# ── EXTRACT LAST ENTITY FROM CHAT HISTORY ─────────────────────────────────────

def extract_last_entity_from_history(chat_history: list[dict]) -> tuple[str, str] | tuple[None, None]:
    """
    Quét ngược chat_history để tìm entity gần nhất được đề cập.

    Returns:
        (entity_key, display_name) hoặc (None, None)
    """
    for msg in reversed(chat_history or []):
        content = msg.get("content", "")
        if not content:
            continue
        entity_key, entity_info = detect_entity_from_text(content)
        if entity_key and entity_info:
            return entity_key, entity_info["display"]

    return None, None
