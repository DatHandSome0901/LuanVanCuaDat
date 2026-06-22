"""
Router Chatbot API Endpoint

Endpoint này sử dụng FilesChatAgent để:
1. Truy xuất tài liệu (Retrieval)
2. Chấm điểm và lọc tài liệu (Filtering)
3. Sinh câu trả lời (Generation)
4. Tính phí token output và trừ số dư người dùng
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from transformers import generation
from app.security.security import get_current_user
from chatbot.services.files_rag_chat_agent import FilesChatAgent
from chatbot.utils.llm import LLM
from chatbot.utils.token_counter import TokenCounter
from chatbot.utils.answer_sanitizer import strip_inline_source_references
from app.models.base_db import UserDB
from ingestion.retriever import Retriever
from chatbot.services.auto_learning_agent import AutoLearningAgent
from vietnam_history_language_agent import VietnamHistoryLanguageAgent
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from time import perf_counter
from typing import Any
import os
import re
import threading
import unicodedata
import uuid

router = APIRouter(tags=["Chatbot"])
vietnam_history_language_agent = VietnamHistoryLanguageAgent()
from chatbot.services.translation_agent import TranslationAgent
from app.config import settings


# ===============================
# REQUEST / RESPONSE
# ===============================

class ChatRequest(BaseModel):
    question: str
    conversation_id: int | None = None
    async_web_fallback: bool = True
    language_instruction: str | None = None  # e.g. "Please respond entirely in English."
    # ── Adaptive RAG debug flag (thêm mới) ─────────────────
    # Khi debug=True: trả thêm intent + scores trong response
    # Khi debug=False (mặc định): response giữ nguyên như cũ
    debug: bool = False

class SourceInfo(BaseModel):
    filename: str
    content: str
    page: int | str | None = None
    is_web: bool = False
    url: str | None = None

class ChatResponse(BaseModel):
    answer: str
    message_id: int | None = None
    tokens_charged: float = 0.0
    user_token_balance: float
    sources: list[SourceInfo] = []
    related_questions: list[str] = []  # ✅ [MỚI] Câu hỏi gợi ý
    conversation_id: int | None = None
    status: str = "completed"
    job_id: str | None = None
    progress: int | None = None
    # ── Debug fields (None khi debug=False) ─────────────────────────
    intent: str | None = None
    scores: dict | None = None
    trace_log: dict | None = None


class ChatJobStatus(BaseModel):
    job_id: str
    status: str
    progress: int = 0
    message: str = ""
    result: ChatResponse | None = None
    error: str | None = None


# ===============================
# CREATE NEW CHAT
# ===============================

@router.post("/new_chat")
async def new_chat(current_user: dict = Depends(get_current_user)):

    db = UserDB()

    conversation_id = db.create_conversation(current_user["id"])

    db.close()

    return {"conversation_id": conversation_id}


# ===============================
# SIDEBAR CHATS
# ===============================

@router.get("/conversations")
async def get_conversations(current_user: dict = Depends(get_current_user)):

    db = UserDB()

    conversations = db.get_conversations(current_user["id"])

    db.close()

    return conversations


# ===============================
# LOAD CHAT MESSAGES
# ===============================

@router.get("/messages/{conversation_id}")
async def get_messages(conversation_id: int):

    db = UserDB()

    messages = db.get_messages(conversation_id)

    db.close()

    return messages


class UpdateConversationRequest(BaseModel):
    title: str | None = None
    note: str | None = None
    is_pinned: bool | None = None


# ===============================
# DELETE CHAT
# ===============================

@router.delete("/conversation/{conversation_id}")
async def delete_chat(conversation_id: int):

    db = UserDB()

    db.delete_conversation(conversation_id)

    db.close()

    return {"status": "deleted"}


# ===============================
# UPDATE CHAT (TITLE / NOTE / PIN)
# ===============================

@router.put("/conversation/{conversation_id}")
async def update_conversation(
    conversation_id: int,
    request: UpdateConversationRequest,
    current_user: dict = Depends(get_current_user)
):

    db = UserDB()

    db.update_conversation(
        conversation_id,
        title=request.title,
        note=request.note,
        is_pinned=request.is_pinned
    )

    db.close()

    return {"status": "updated"}


# ===============================
# RATE MESSAGE
# ===============================

class RateRequest(BaseModel):
    rating: int # 1 for like, -1 for dislike, 0 for neutral

@router.post("/message/{message_id}/rate")
async def rate_message(
    message_id: int,
    request: RateRequest,
    current_user: dict = Depends(get_current_user)
):
    db = UserDB()
    db.rate_message(message_id, request.rating)
    
    # 🔥 AUTO-LEARNING LOGIC: Chỉ áp dụng cho câu lấy từ WEB (Internet)
    if request.rating == 1:
        context = db.get_message_context(message_id)
        
        if context and context["question"]:
            from chatbot.utils.question_normalizer import normalize_question
            q_norm = normalize_question(context["question"]).lower().strip()
            
            # ✅ [NÂNG CẤP] ANTI-SPAM: Kiểm tra user đã like câu hỏi này chưa
            user_id = current_user.get("id") or current_user.get("user_id")
            if user_id and db.has_user_liked_question(user_id, q_norm):
                print(f"🚫 ANTI-SPAM: User {user_id} đã like câu hỏi này rồi. Bỏ qua.")
                db.close()
                return {"status": "success", "note": "already_liked"}
            
            # Đánh dấu user đã like (chỉ tính 1 lần)
            if user_id:
                db.mark_user_liked_question(user_id, q_norm)
            
            pending = db.get_pending_by_question(context["question"])
            
            if pending:
                # Lấy likes_count từ bảng pending (đã được cộng dồn theo câu hỏi)
                likes_count = pending.get("likes_count", 0) + 1  # +1 vì lượt like hiện tại vừa được lưu

                print(f"👍 GLOBAL LIKE detected for question. Total likes: {likes_count}")
                
                # ✅ [NÂNG CẤP] Kiểm tra đã được duyệt rồi thì không kích hoạt lại
                if pending.get("approved") == 1:
                    print(f"✅ Knowledge already approved. Skipping agent activation.")
                elif likes_count >= 5:
                    print(f"🚀 THRESHOLD REACHED (5 GLOBAL Likes)! Activating Auto-Learning Agent...")
                    
                    llm_name = db.get_setting("llm_name", os.environ.get("LLM_NAME", "openai"))
                    llm = LLM().get_llm(llm_name)
                    agent = AutoLearningAgent(llm)
                    
                    agent.analyze_and_ingest(context["question"], context["answer"], force_ingest=True)
                else:
                    print(f"⏳ Waiting for more likes... ({likes_count}/5)")

    db.close()
    return {"status": "success", "likes_count": likes_count if 'likes_count' in dir() else None}


CHAT_WEB_JOB_WORKERS = int(os.environ.get("CHAT_WEB_JOB_WORKERS", "2"))
CHAT_WEB_JOB_POLL_MESSAGE = "Đang tra cứu web và kiểm chứng nguồn..."
CHAT_WEB_FAST_RETURN = os.environ.get("CHAT_WEB_FAST_RETURN", "1").strip().lower() not in {"0", "false", "no", "off"}
CHAT_FAST_RETURN = os.environ.get("CHAT_FAST_RETURN", "1").strip().lower() not in {"0", "false", "no", "off"}
CHAT_RELATED_QUESTIONS = os.environ.get("CHAT_RELATED_QUESTIONS", "1").strip().lower() not in {"0", "false", "no", "off"}
CHAT_RELATED_QUESTIONS_USE_LLM = os.environ.get("CHAT_RELATED_QUESTIONS_USE_LLM", "1").strip().lower() not in {"0", "false", "no", "off"}
_chat_job_executor = ThreadPoolExecutor(max_workers=CHAT_WEB_JOB_WORKERS)
_chat_jobs: dict[str, dict[str, Any]] = {}
_chat_jobs_lock = threading.Lock()


def _now_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"


def _elapsed_ms(started_at: float | None) -> float | None:
    if started_at is None:
        return None
    return (perf_counter() - started_at) * 1000


def _short_log_value(value: Any, max_len: int = 140) -> str:
    if value is None:
        return "None"

    text = re.sub(r"\s+", " ", str(value)).strip()
    if len(text) > max_len:
        text = text[: max_len - 3].rstrip() + "..."

    if not text:
        return '""'
    if re.search(r"\s", text):
        return f'"{text}"'
    return text


def _log_chat_timing(event: str, started_at: float | None = None, **fields):
    parts = [f"[CHAT_TIMING] event={event}", f"at={_now_iso()}"]
    elapsed = _elapsed_ms(started_at)
    if elapsed is not None:
        parts.append(f"elapsed_s={elapsed / 1000:.2f}")
        parts.append(f"elapsed_ms={elapsed:.0f}")

    for key, value in fields.items():
        if value is not None:
            parts.append(f"{key}={_short_log_value(value)}")

    print(" ".join(parts), flush=True)


def _set_chat_job(job_id: str, **updates):
    with _chat_jobs_lock:
        job = _chat_jobs.get(job_id)
        if not job:
            return
        job.update(updates)
        job["updated_at"] = _now_iso()


def _get_chat_job(job_id: str) -> dict[str, Any] | None:
    with _chat_jobs_lock:
        job = _chat_jobs.get(job_id)
        return dict(job) if job else None


def _mark_chat_job_delivery_logged(job_id: str) -> bool:
    with _chat_jobs_lock:
        job = _chat_jobs.get(job_id)
        if not job or job.get("_delivery_logged"):
            return False
        job["_delivery_logged"] = True
        job["updated_at"] = _now_iso()
        return True


def _cleanup_chat_jobs(max_jobs: int = 200):
    with _chat_jobs_lock:
        if len(_chat_jobs) <= max_jobs:
            return
        removable = [
            (job_id, job.get("updated_at", ""))
            for job_id, job in _chat_jobs.items()
            if job.get("status") in ("completed", "failed")
        ]
        removable.sort(key=lambda item: item[1])
        for job_id, _ in removable[: max(0, len(_chat_jobs) - max_jobs)]:
            _chat_jobs.pop(job_id, None)


def _build_chat_runtime():
    db = UserDB()
    llm_name = db.get_setting("llm_name", os.environ.get("LLM_NAME", "openai"))
    db.close()

    base_vector_path = os.environ.get("PATH_VECTOR_STORE")
    path_vector_store = base_vector_path
    if base_vector_path:
        model_specific_path = os.path.join(base_vector_path, llm_name)
        if os.path.exists(model_specific_path):
            path_vector_store = model_specific_path

    llm = LLM().get_llm(llm_name)

    embedding_model_name = os.environ.get("EMBEDDING_MODEL_NAME", "openai")
    if llm_name == "openai":
        embedding_model_name = "openai"
    elif llm_name in ["vertex", "gemini"]:
        embedding_model_name = "vertex"

    return llm_name, llm, path_vector_store, embedding_model_name


def _build_chat_history(user_db: UserDB, conversation_id: int) -> list[dict[str, str]]:
    history_msgs = user_db.get_messages(conversation_id)
    recent = history_msgs[-6:] if len(history_msgs) > 6 else history_msgs
    return [
        {"role": m["role"], "content": m["content"]}
        for m in recent
        if m.get("role") in ("user", "assistant")
    ]


def _normalize_context_text(text: str) -> str:
    text = (text or "").replace("Đ", "D").replace("đ", "d")
    text = unicodedata.normalize("NFD", text.lower())
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    return re.sub(r"\s+", " ", text).strip()


def _looks_like_context_follow_up(question: str) -> bool:
    normalized = _normalize_context_text(question)
    patterns = [
        r"\bcua\s+(ong|ba)(\s+ay)?\b",
        r"\b(ong|ba)(\s+ay)?\s+(ten|sinh|mat|chet|que|la|lam|co|da|o|bao|nam)\b",
        r"\b(nguoi|vi|nhan vat|trieu dai|su kien|noi)\s+(nay|do|ay)\b",
        r"\b(tu do|sau do|luc do|thoi diem do)\b",
    ]
    return any(re.search(pattern, normalized) for pattern in patterns)


def _clean_context_subject(subject: str) -> str | None:
    subject = re.sub(r"[*_`#>\[\]{}()]", " ", subject or "")
    subject = re.sub(r"^\s*(?:về|ve|cho tôi biết về|hay nói về|hãy nói về|nói về)\s+", "", subject, flags=re.IGNORECASE)
    subject = re.sub(r"\s+", " ", subject).strip(" ,.;:!?-")

    if not subject or len(subject) < 2 or len(subject) > 80:
        return None

    bad_subjects = {
        "ai", "gì", "gi", "ông", "bà", "người đó", "người này",
        "lịch sử việt nam", "lich su viet nam",
    }
    if _normalize_context_text(subject) in bad_subjects:
        return None

    if subject.islower():
        return subject.title()
    return subject


def _standalone_subject_from_text(text: str) -> str | None:
    normalized = _normalize_context_text(text)
    if not normalized or _looks_like_context_follow_up(text):
        return None

    reject_patterns = [
        r"\b(ai|gi|nao|tai sao|vi sao|nhu the nao|bao nhieu)\b",
        r"\b(vai tro|y nghia|nguyen nhan|dien bien|ket qua|noi dung)\b",
        r"\b(la|sinh|mat|chet|ten|que|o dau|khi nao)\b",
    ]
    if any(re.search(pattern, normalized) for pattern in reject_patterns):
        return None

    tokens = re.findall(r"\w+", text or "", flags=re.UNICODE)
    if not (1 <= len(tokens) <= 6):
        return None

    return _clean_context_subject(text)


def _extract_subject_from_user_message(content: str) -> str | None:
    text = re.sub(r"\s+", " ", content or "").strip()
    if not text:
        return None

    patterns = [
        r"^(?P<subject>.+?)\s+(?:là|la)\s+(?:ai|gì|gi)\s*\??$",
        r"^(?P<subject>.+?)\s+(?:sinh|mất|mat|chết|chet|quê|que|tên|ten)\b",
        r"^(?:cho tôi biết về|hãy nói về|hay nói về|nói về|ve)\s+(?P<subject>.+?)\s*\??$",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            subject = _clean_context_subject(match.group("subject"))
            if subject:
                return subject

    subject = _standalone_subject_from_text(text)
    if subject:
        return subject

    return None


def _extract_subject_from_assistant_message(content: str) -> str | None:
    text = re.sub(r"[*_`#>\[\]{}]", " ", content or "")
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return None

    patterns = [
        r"\b(?P<subject>[A-ZÀ-ỸĐ][A-Za-zÀ-ỹĐđ'’.\-\s]{2,60}?)\s+(?:là|sinh|mất|có tên|tên thật)\b",
        r"\*\*(?P<subject>[^*]{2,60})\*\*\s+(?:là|sinh|mất|có tên|tên thật)\b",
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            subject = _clean_context_subject(match.group("subject"))
            if subject:
                return subject

    return None


def _last_conversation_subject(chat_history: list[dict[str, str]]) -> str | None:
    for msg in reversed(chat_history or []):
        if msg.get("role") == "user":
            subject = _extract_subject_from_user_message(msg.get("content", ""))
            if subject:
                return subject

    for msg in reversed(chat_history or []):
        if msg.get("role") == "assistant":
            subject = _extract_subject_from_assistant_message(msg.get("content", ""))
            if subject:
                return subject

    return None


def _resolve_contextual_question(question: str, chat_history: list[dict[str, str]]) -> str:
    if not _looks_like_context_follow_up(question):
        return question

    subject = _last_conversation_subject(chat_history)
    if not subject:
        return question

    resolved = question
    replacements = [
        (r"(?<!\w)của\s+ông(?:\s+ấy)?(?!\w)", f"của {subject}"),
        (r"(?<!\w)cua\s+ong(?:\s+ay)?(?!\w)", f"của {subject}"),
        (r"(?<!\w)của\s+bà(?:\s+ấy)?(?!\w)", f"của {subject}"),
        (r"(?<!\w)cua\s+ba(?:\s+ay)?(?!\w)", f"của {subject}"),
        (r"(?<!\w)ông(?:\s+ấy)?(?!\w)", subject),
        (r"(?<!\w)ong(?:\s+ay)?(?!\w)", subject),
        (r"(?<!\w)bà(?:\s+ấy)?(?!\w)", subject),
        (r"(?<!\w)ba(?:\s+ay)?(?!\w)", subject),
        (r"(?<!\w)(người|vị|nhân vật)\s+(này|đó|ấy)(?!\w)", subject),
        (r"(?<!\w)(nguoi|vi|nhan vat)\s+(nay|do|ay)(?!\w)", subject),
        (r"(?<!\w)(triều đại|sự kiện|nơi)\s+(này|đó|ấy)(?!\w)", subject),
        (r"(?<!\w)(trieu dai|su kien|noi)\s+(nay|do|ay)(?!\w)", subject),
    ]

    for pattern, value in replacements:
        resolved = re.sub(pattern, value, resolved, flags=re.IGNORECASE)

    resolved = re.sub(r"\s+", " ", resolved).strip()
    if resolved != question:
        print(f"[CONTEXT] Resolved follow-up: {question!r} -> {resolved!r}")
    return resolved


def _make_related_question_standalone(related_question: str, base_question: str) -> str:
    subject = (
        _extract_subject_from_user_message(base_question)
        or _standalone_subject_from_text(base_question)
    )
    if not subject:
        return related_question

    return _resolve_contextual_question(
        related_question,
        [{"role": "user", "content": subject}],
    )


def _topic_for_related_questions(question: str) -> str | None:
    subject = (
        _extract_subject_from_user_message(question)
        or _standalone_subject_from_text(question)
    )
    if subject:
        return subject

    text = re.sub(r"\s+", " ", question or "").strip(" ,.;:!?-")
    if not text:
        return None

    split_match = re.search(r"\s+(?:là|la)\s+", text, flags=re.IGNORECASE)
    if split_match:
        subject = _clean_context_subject(text[:split_match.start()])
        if subject:
            return subject

    text = re.sub(
        r"^\s*(?:vì sao|vi sao|tại sao|tai sao|hãy|hay|cho tôi biết|trình bày|phan tich|phân tích)\s+",
        "",
        text,
        flags=re.IGNORECASE,
    )
    return _clean_context_subject(text)


def _generate_fast_related_questions(question: str) -> list[str]:
    subject = _topic_for_related_questions(question)
    if not subject:
        return []

    templates = [
        "Bối cảnh lịch sử của {subject} là gì?",
    ]
    return [template.format(subject=subject) for template in templates]


def _to_academic_web_title(url: str, title: str) -> str:
    import re
    from urllib.parse import urlparse
    parsed = urlparse(url)
    netloc = parsed.netloc.lower()
    
    # Strip www.
    if netloc.startswith("www."):
        netloc = netloc[4:]
        
    # Clean title
    clean_title = (title or "").strip()
    # Strip some noise prefixes from title
    clean_title = re.sub(r"^(Cổng thông tin điện tử|Trang thông tin điện tử|Báo điện tử|Kiến Thức:|Kiến thức:)\s*", "", clean_title, flags=re.IGNORECASE).strip()
    
    # Check if clean_title is just the netloc or similar
    if clean_title.lower() == netloc or clean_title.lower() == f"www.{netloc}" or clean_title.startswith("http"):
        clean_title = ""
        
    # Map domain to publisher names
    publisher = ""
    if "baotanglichsu.vn" in netloc or "baotanglichsuquocgia.vn" in netloc:
        publisher = "Bảo tàng Lịch sử Quốc gia"
    elif "viensuhoc.vass.gov.vn" in netloc:
        publisher = "Viện Sử học Việt Nam"
    elif "vass.gov.vn" in netloc:
        publisher = "Viện Hàn lâm Khoa học xã hội Việt Nam"
    elif "btlsqsvn.mod.gov.vn" in netloc:
        publisher = "Bảo tàng Lịch sử Quân sự Việt Nam"
    elif "tulieuvankien.dangcongsan.vn" in netloc or "dangcongsan.vn" in netloc:
        publisher = "Báo điện tử Đảng Cộng sản Việt Nam"
    elif "hochiminh.vn" in netloc:
        publisher = "Trang tin điện tử Hồ Chí Minh"
    elif "vietnamtourism.gov.vn" in netloc:
        publisher = "Tổng cục Du lịch Việt Nam"
    elif "chinhphu.vn" in netloc or "baochinhphu.vn" in netloc:
        publisher = "Cổng Thông tin Điện tử Chính phủ"
    elif "moet.gov.vn" in netloc:
        publisher = "Bộ Giáo dục và Đào tạo Việt Nam"
    elif "bvhttdl.gov.vn" in netloc:
        publisher = "Bộ Văn hóa, Thể thao và Du lịch"
    elif netloc.endswith(".gov.vn"):
        publisher = "Cổng thông tin điện tử Nhà nước"
    else:
        # Format domain name nicely, e.g. vnexpress.net -> Vnexpress.net
        publisher = f"Trang điện tử {netloc.capitalize()}"

    if publisher and clean_title:
        norm_pub = re.sub(r"\s+", "", publisher.lower())
        norm_title = re.sub(r"\s+", "", clean_title.lower())
        if norm_pub in norm_title or norm_title in norm_pub:
            return publisher if len(publisher) > len(clean_title) else clean_title
        return f"{publisher} - {clean_title}"
    return clean_title or publisher or url


def _to_academic_title(fname: str) -> str:
    import unicodedata
    import re

    # 1. Normalize unicode to NFC
    fname = unicodedata.normalize("NFC", fname)
    
    # Intercept specific known names / patterns
    fname_lower = fname.lower()
    if fname_lower.startswith("kiến thức:") or fname_lower.startswith("kiến thức hệ thống"):
        if fname_lower == "kiến thức hệ thống đã duyệt":
            return fname
        q_part = fname.split(":", 1)[-1].strip() if ":" in fname else fname
        if q_part.lower().startswith("kiến thức hệ thống -"):
            q_part = re.sub(r"(?i)^kiến thức hệ thống\s*-\s*", "", q_part).strip()
        return f"Kiến thức hệ thống - {q_part}"

    if fname_lower == "unknown" or fname_lower == "tài liệu lưu trữ hệ thống":
        return "Tài liệu lưu trữ hệ thống"

    if fname_lower == "global history" or fname_lower == "tư liệu lịch sử hệ thống":
        return "Tư liệu lịch sử hệ thống"

    if fname_lower == "ghi chú cá nhân":
        return "Ghi chú cá nhân"
    
    # 2. Strip extensions
    name, ext = os.path.splitext(fname)
    name = name.strip()
    
    # 3. Strip trailing junk suffixes (case-insensitive)
    junk_patterns = [
        r"\b_text\b", r"\btext\b", r"\b_ocred\b", r"\bocred\b",
        r"\b-da-nen\b", r"\bda-nen\b", r"\b_da_nen\b", r"\bda_nen\b",
        r"\(\d+\)", r"\b\d+-\d+-da-nen\b"
    ]
    for pat in junk_patterns:
        name = re.sub(pat, "", name, flags=re.IGNORECASE)
    
    # Check page ranges FIRST (before replacing hyphens with spaces)
    name_stripped = name.strip()
    m_range = re.match(r"^(\d+)-(\d+)$", name_stripped)
    if m_range:
        start_p, end_p = m_range.group(1), m_range.group(2)
        return f"Tài liệu Chuyên khảo Lịch sử (Trang {int(start_p)}-{int(end_p)})"
        
    # Replace hyphens and underscores with spaces for clean parsing
    name = name.replace("_", " ").replace("-", " ")
    name = re.sub(r"\s+", " ", name).strip()
    name_lower = name.lower()

    # Pre-checks for specific files first (to prevent general rules matching them wrong)
    if "vie1bb87tse1bbad" in name_lower or "vietsutoanthu" in name_lower:
        return "Việt Sử Toàn Thư (Phạm Văn Sơn)"
    if "viet su tan bien" in name_lower or "việt sử tân biên" in name_lower:
        return "Việt Sử Tân Biên (Phạm Văn Sơn)"
    if "toan tap" in name_lower or "toàn tập" in name_lower:
        if "dai cuong" in name_lower or "đại cương" in name_lower:
            return "Đại cương Lịch sử Việt Nam toàn tập (Khởi thủy - 2000)"
        return "Lịch sử Việt Nam toàn tập"

    # Check "Đại cương Lịch sử Việt Nam"
    if "dai cuong" in name_lower or "đại cương" in name_lower:
        m = re.search(r"tập\s*(\d+)", name_lower)
        if not m:
            m = re.search(r"tap\s*(\d+)", name_lower)
        if not m:
            m = re.search(r"-\s*(\d+)", name_lower)
        if m:
            return f"Đại cương Lịch sử Việt Nam (Tập {m.group(1)})"
        return "Đại cương Lịch sử Việt Nam"

    # Check "Lịch sử Việt Nam tập ..."
    m = re.search(r"Lịch sử Việt Nam tập (\d+)\s*(.*)", name, re.IGNORECASE)
    if m:
        tap = int(m.group(1))
        details = m.group(2).strip(" -_")
        # Strip author and year like "-Cao Duy Mến-2013" or "-2017"
        details = re.sub(r"\b[A-Za-zÀ-ỹ\s]+ \d{4}$", "", details)
        details = re.sub(r"\b\d{4}$", "", details)
        details = details.strip(" -_")
        if details:
            return f"Lịch sử Việt Nam (Tập {tap} - {details})"
        else:
            return f"Lịch sử Việt Nam (Tập {tap})"
            
    # Check "Lich-su-Viet-Nam-tap-..."
    m = re.search(r"Lich\s*su\s*Viet\s*Nam\s*tap\s*(\d+)", name, re.IGNORECASE)
    if m:
        tap = int(m.group(1))
        # Map known period boundaries if it's a known volume
        periods = {
            1: "Từ khởi thủy đến thế kỷ X",
            2: "Từ thế kỷ X đến thế kỷ XIV",
            3: "Từ thế kỷ XV đến thế kỷ XVI",
            4: "Từ thế kỷ XVII đến thế kỷ XVIII",
            5: "Từ năm 1802 đến năm 1858",
            6: "Từ năm 1858 đến năm 1896",
            7: "Từ năm 1897 đến năm 1918",
            8: "Từ năm 1919 đến năm 1930",
            9: "Từ năm 1930 đến năm 1945",
            10: "Từ năm 1945 đến năm 1950",
            11: "Từ năm 1951 đến năm 1954",
            12: "Từ năm 1954 đến năm 1965",
            13: "Từ năm 1965 đến năm 1975",
            14: "Từ năm 1975 đến năm 1986",
            15: "Từ năm 1986 đến năm 2000",
        }
        period = periods.get(tap)
        if period:
            return f"Lịch sử Việt Nam (Tập {tap} - {period})"
        return f"Lịch sử Việt Nam (Tập {tap})"
        
    # Check other specific patterns
    if "10trandanhnoitieng" in name_lower or "10 trận đánh" in name_lower:
        return "10 trận đánh nổi tiếng trong lịch sử Việt Nam (Đặng Việt Thủy)"
        
    if "lythuongkiet" in name_lower or "lý thường kiệt" in name_lower:
        if "hoangxuanhan" in name_lower or "hoàng xuân hãn" in name_lower:
            return "Lý Thường Kiệt (GS. Hoàng Xuân Hãn, 1950)"
        return "Lý Thường Kiệt - Lịch sử ngoại giao thời Lý"
        
    if "viet nam su luoc" in name_lower or "việt nam sử lược" in name_lower:
        return "Việt Nam Sử Lược (Trần Trọng Kim)"

    if "vietnam thoi phap do ho" in name_lower or "việt nam thời pháp đô hộ" in name_lower:
        return "Việt Nam thời Pháp đô hộ (Nguyễn Thế Anh)"

    if "dai viet su ky tt" in name_lower or "đại việt sử ký" in name_lower:
        m = re.search(r"p(\d+)", name, re.IGNORECASE)
        if m:
            part = m.group(1)
            return f"Đại Việt Sử Ký Toàn Thư (Phần {part})"
        return "Đại Việt Sử Ký Toàn Thư"

    if "sukydainamviet" in name_lower or "sự ký đại nam việt" in name_lower:
        return "Sự ký Đại Nam Việt (Bản dịch)"

    if "giao trinh lich su dang" in name_lower or "giáo trình lịch sử đảng" in name_lower:
        return "Giáo trình Lịch sử Đảng Cộng sản Việt Nam"
    if "gt-lich-su-dang" in name_lower or "gt lich su dang" in name_lower:
        return "Giáo trình Lịch sử Đảng Cộng sản Việt Nam (Ban Tuyên giáo TW)"

    if "ha noi nhu toi hieu" in name_lower or "hà nội như tôi hiểu" in name_lower:
        return "Hà Nội như tôi hiểu (GS. Trần Quốc Vượng)"

    if "quandannamky" in name_lower or "quân dân nam kỳ" in name_lower:
        return "Quân dân Nam Kỳ kháng Pháp (Nguyen Duy Oanh)"

    if "nam tien cua dan toc" in name_lower or "nam tiến của dân tộc" in name_lower:
        return "Lịch sử Nam tiến của dân tộc ta"

    if "tho+va+su+viet" in name_lower or "thơ và sử việt" in name_lower:
        return "Thơ và Sử Việt - Nhà Lý"
    if "cac-trieu-dai" in name_lower or "các triều đại" in name_lower:
        return "Các triều đại Việt Nam"
    if "nuoc-viet-bang-tranh" in name_lower or "nước việt bằng tranh" in name_lower:
        return "Nước Việt bằng tranh"
    if "tom-luoc-lich-su" in name_lower or "tóm lược lịch sử" in name_lower:
        return "Tóm lược Lịch sử Việt Nam qua các thời đại"
    if "ls co dai vn" in name_lower or "lịch sử cổ đại việt nam" in name_lower:
        return "Lịch sử cổ đại Việt Nam"
    if "ctv141" in name_lower:
        return "Tài liệu Chuyên đề Lịch sử (CTv141)"
    if "cvv250" in name_lower:
        return "Tài liệu Chuyên đề Lịch sử (CVv250)"

    # Specific long text mappings
    if "lịch sử việt nam từ nguồn gốc" in name_lower:
        return "Lịch sử Việt Nam (Từ nguồn gốc đến thế kỷ X - PGS.TS Nguyễn Cảnh Minh)"
    if "lịch sử việt nam (1858 - 1945)" in name_lower or "lịch sử việt nam (1858-1945)" in name_lower:
        return "Lịch sử Việt Nam (1858 - 1945 - PGS.TS Nguyễn Đình Lễ)"

    # Default fallback: Clean and capitalize words
    if "." in name and not any(ch.isspace() for ch in name):
        return name
    return name.title()


def _build_sources(documents: list) -> list[SourceInfo]:
    temp_sources = []
    print(f"DEBUG: Processing {len(documents)} documents for sources")
    for doc in documents:
        # Determine if it's a web page
        url = doc.metadata.get("url")
        source_val = doc.metadata.get("source") or ""
        file_name_val = doc.metadata.get("file_name") or ""
        
        is_web = doc.metadata.get("is_web", False)
        if str(source_val).startswith("http://") or str(source_val).startswith("https://"):
            is_web = True
            url = url or str(source_val)
        if str(url).startswith("http://") or str(url).startswith("https://"):
            is_web = True
            
        page = doc.metadata.get("page") if doc.metadata.get("page") is not None else doc.metadata.get("page_number")

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
                from urllib.parse import urlparse
                fname = urlparse(fname).netloc or fname
        else:
            fname = os.path.basename(fname.rstrip("/"))
            from urllib.parse import unquote
            fname = unquote(fname).replace("_", " ")

        temp_sources.append({
            "fname": fname,
            "content": doc.page_content,
            "page": page,
            "is_pdf": not is_web and (fname.lower().endswith(".pdf") or page is not None),
            "is_web": is_web,
            "url": url if is_web else None,
        })

    final_source_dict = {}
    for item in temp_sources:
        base_name = os.path.splitext(item["fname"])[0].replace("_ocred", "")
        if base_name not in final_source_dict:
            final_source_dict[base_name] = item
        elif not final_source_dict[base_name].get("is_pdf") and item.get("is_pdf"):
            final_source_dict[base_name] = item

    sources = []
    for item in final_source_dict.values():
        fname = item["fname"]
        is_web = item.get("is_web", False)
        if is_web:
            academic_name = _to_academic_web_title(item.get("url") or "", fname)
        else:
            academic_name = _to_academic_title(fname)
            
        page_info = f" (Trang {int(item['page']) + 1})" if item["page"] is not None else ""
        sources.append(SourceInfo(
            filename=academic_name,
            content=f"### Tài liệu: {academic_name}\n\n**[Đoạn trích]{page_info}**\n{item['content']}",
            page=item["page"],
            is_web=is_web,
            url=item.get("url"),
        ))
    return sources



def _generate_related_questions(llm, question: str, answer: str = "") -> list[str]:
    if not CHAT_RELATED_QUESTIONS:
        return []

    try:
        from chatbot.services.query_classifier import classify_query
        intent = classify_query(question, llm)
        if intent in ("chitchat", "unrelated"):
            print(f"ℹ️ Bỏ qua câu hỏi gợi ý vì intent là: {intent}")
            return []
    except Exception as ex:
        print(f"⚠️ Lỗi khi phân loại câu hỏi để tạo gợi ý: {ex}")

    if not CHAT_RELATED_QUESTIONS_USE_LLM:
        return _generate_fast_related_questions(question)

    try:
        import re as _re
        clean_answer = answer or ""
        clean_answer = _re.sub(r"<think>.*?</think>", "", clean_answer, flags=_re.DOTALL).strip()
        if len(clean_answer) > 1000:
            clean_answer = clean_answer[:1000] + "..."

        if clean_answer:
            rq_prompt = f"""Dựa trên câu hỏi của người dùng và câu trả lời đã được hệ thống cung cấp dưới đây, hãy đề xuất 3 câu hỏi gợi ý tiếp theo (follow-up questions) ngắn gọn, tự nhiên và liên quan trực tiếp đến các chi tiết trong câu trả lời.
            
Câu hỏi của người dùng:
"{question}"

Câu trả lời của hệ thống:
"{clean_answer}"

Yêu cầu đối với các câu hỏi gợi ý:
1. Phải khai thác sâu hơn hoặc mở rộng các chi tiết, nhân vật, sự kiện cụ thể có trong câu trả lời.
2. Các câu hỏi phải tự đủ nghĩa (độc lập), nhắc lại rõ tên nhân vật/sự kiện/địa danh. Tuyệt đối không dùng các đại từ mơ hồ như "ông ấy", "bà ấy", "người đó", "sự kiện đó", "ở đây".
3. Trả về đúng 3 câu hỏi gợi ý khác nhau, mỗi câu một dòng, không đánh số thứ tự, không kèm ký tự đặc biệt hay giải thích gì thêm."""
        else:
            rq_prompt = f"""Dựa vào câu hỏi "{question}" về lịch sử Việt Nam, hãy đưa ra đúng 3 câu hỏi liên quan ngắn gọn mà người dùng có thể muốn hỏi tiếp theo.
Mỗi câu phải tự đủ nghĩa, nhắc lại rõ tên nhân vật/sự kiện nếu có. Không dùng đại từ mơ hồ như "ông ấy", "bà ấy", "người đó", "sự kiện đó".
Trả về đúng 3 câu hỏi, mỗi câu một dòng, không đánh số, không giải thích thêm."""

        rq_response = llm.invoke(rq_prompt)
        rq_content = rq_response.content if hasattr(rq_response, "content") else str(rq_response)
        rq_content = _re.sub(r"<think>.*?</think>", "", rq_content, flags=_re.DOTALL).strip()
        lines = [line.strip() for line in rq_content.split("\n") if line.strip()]
        
        valid_questions = []
        for line in lines:
            # Clean list markers
            line = _re.sub(r"^[0-9]+[\.\-\s\)]+", "", line).strip()
            line = line.strip('"\'*-\t ')
            if line and len(line) > 5:
                if not line.endswith('?'):
                    line += '?'
                valid_questions.append(line)

        if valid_questions:
            return valid_questions[:3]
        raise Exception("LLM generated no valid questions")
    except Exception as e:
        print(f"Related questions LLM generation error: {e}")
        return _generate_fast_related_questions(question)



def _apply_vietnam_history_language_policy(question: str, answer: str) -> str:
    result = vietnam_history_language_agent.process(
        userQuestion=question,
        rawAnswer=answer,
    )
    if result.isVietnamHistoryTopic and result.appliedRules:
        print(
            "[VietnamHistoryLanguageAgent] Applied rules:",
            ", ".join(result.appliedRules),
        )
    return result.finalAnswer


def _auto_title_conversation(user_db: UserDB, llm, conversation_id: int, question: str):
    messages = user_db.get_messages(conversation_id)
    if len(messages) > 2:
        return

    title_prompt = f"""
    Tạo tiêu đề ngắn 3-5 từ cho câu hỏi sau.
    Chỉ trả về tiêu đề.

    Câu hỏi: {question}
    """

    title = llm.invoke(title_prompt).content.strip()
    user_db.cursor.execute(
        "UPDATE conversations SET title=? WHERE id=?",
        (title, conversation_id)
    )
    user_db.conn.commit()


def _quick_title_conversation(user_db: UserDB, conversation_id: int, question: str):
    messages = user_db.get_messages(conversation_id)
    if len(messages) > 2:
        return

    title = " ".join(question.strip().split())
    if len(title) > 60:
        title = title[:57].rstrip() + "..."
    if not title:
        title = "Cuộc trò chuyện mới"

    user_db.cursor.execute(
        "UPDATE conversations SET title=? WHERE id=?",
        (title, conversation_id)
    )
    user_db.conn.commit()


def _enqueue_chat_job(request: ChatRequest, current_user: dict, conversation_id: int) -> str:
    _cleanup_chat_jobs()
    job_id = str(uuid.uuid4())
    queued_at_perf = perf_counter()
    payload = request.model_dump()
    payload["conversation_id"] = conversation_id
    payload["async_web_fallback"] = False

    with _chat_jobs_lock:
        _chat_jobs[job_id] = {
            "job_id": job_id,
            "user_id": current_user.get("id") or current_user.get("user_id"),
            "status": "queued",
            "progress": 0,
            "message": "Đang chờ xử lý...",
            "result": None,
            "error": None,
            "created_at": _now_iso(),
            "updated_at": _now_iso(),
            "_queued_at_perf": queued_at_perf,
            "_delivery_logged": False,
        }

    _chat_job_executor.submit(_run_chat_job, job_id, payload, dict(current_user))
    _log_chat_timing(
        "web_job_queued",
        job_id=job_id,
        user_id=current_user.get("id") or current_user.get("user_id"),
        conversation_id=conversation_id,
        question=payload.get("question"),
    )
    return job_id


def _run_chat_job(job_id: str, payload: dict[str, Any], current_user: dict):
    job_started_at = perf_counter()
    job_snapshot = _get_chat_job(job_id) or {}
    queued_at_perf = job_snapshot.get("_queued_at_perf")
    _log_chat_timing(
        "web_job_started",
        queued_at_perf,
        job_id=job_id,
        user_id=current_user.get("id") or current_user.get("user_id"),
        conversation_id=payload.get("conversation_id"),
        question=payload.get("question"),
    )
    _set_chat_job(
        job_id,
        status="running",
        progress=10,
        message=CHAT_WEB_JOB_POLL_MESSAGE,
    )
    try:
        request = ChatRequest(**payload)
        response = _process_web_fallback_job(request, current_user)
        _set_chat_job(
            job_id,
            status="completed",
            progress=100,
            message="Hoàn thành.",
            result=response.model_dump(),
            error=None,
        )
        total_ms = _elapsed_ms(queued_at_perf)
        _log_chat_timing(
            "web_job_completed",
            job_started_at,
            total_elapsed_s=f"{total_ms / 1000:.2f}" if total_ms is not None else None,
            total_elapsed_ms=f"{total_ms:.0f}" if total_ms is not None else None,
            job_id=job_id,
            user_id=current_user.get("id") or current_user.get("user_id"),
            conversation_id=response.conversation_id,
            answer_chars=len(response.answer or ""),
            sources=len(response.sources or []),
        )
    except HTTPException as e:
        _set_chat_job(
            job_id,
            status="failed",
            progress=100,
            message="Thất bại.",
            error=str(e.detail),
        )
        total_ms = _elapsed_ms(queued_at_perf)
        _log_chat_timing(
            "web_job_failed",
            job_started_at,
            total_elapsed_s=f"{total_ms / 1000:.2f}" if total_ms is not None else None,
            total_elapsed_ms=f"{total_ms:.0f}" if total_ms is not None else None,
            job_id=job_id,
            status_code=e.status_code,
            error=e.detail,
        )
    except Exception as e:
        import traceback
        print("CHAT JOB ERROR")
        traceback.print_exc()
        _set_chat_job(
            job_id,
            status="failed",
            progress=100,
            message="Thất bại.",
            error=str(e),
        )
        total_ms = _elapsed_ms(queued_at_perf)
        _log_chat_timing(
            "web_job_failed",
            job_started_at,
            total_elapsed_s=f"{total_ms / 1000:.2f}" if total_ms is not None else None,
            total_elapsed_ms=f"{total_ms:.0f}" if total_ms is not None else None,
            job_id=job_id,
            error=str(e),
        )


def _process_web_fallback_job(request: ChatRequest, current_user: dict) -> ChatResponse:
    from time import perf_counter as _perf_counter
    request_started_at_local = _perf_counter()
    from chatbot.services.web_learning_agent import WebLearningAgent
    from chatbot.utils.question_normalizer import normalize_question
    from langchain_core.documents import Document

    token_counter = TokenCounter()
    user_db = None

    try:
        email = current_user.get("email")
        user = token_counter.user_db.get_by_email(email)

        if not user or user.get("token_balance", 0) <= 0:
            raise HTTPException(status_code=402, detail="Số dư token không đủ.")

        _, llm, _, _ = _build_chat_runtime()
        user_db = UserDB()

        conversation_id = request.conversation_id
        if not conversation_id:
            conversation_id = user_db.create_conversation(current_user["id"])

        question = normalize_question(request.question).lower().strip()
        pending = user_db.get_pending_by_question(question)

        if pending and pending.get("approved") == 0:
            pending_answer = strip_inline_source_references(pending.get("answer", ""))
            generation = (
                "👉 Xin lỗi, hệ thống chưa có dữ liệu.\n"
                "(Dưới đây là câu trả lời tham khảo):\n\n"
                + pending_answer
            )
            documents = [
                Document(
                    page_content=pending_answer,
                    metadata={
                        "source": "Internet (Kiến thức đang học)",
                        "is_pending": True,
                        "question": pending.get("question"),
                    },
                )
            ]
        else:
            web_agent = WebLearningAgent(llm)
            web_result = web_agent.process_fallback(question)
            raw_answer = strip_inline_source_references(web_result.get("answer", ""))
            confidence = web_result.get("confidence", 0)

            documents = []
            for src in web_result.get("sources", []):
                documents.append(Document(
                    page_content="Nguồn thông tin từ Internet",
                    metadata={"source": src, "file_name": src, "is_web": True},
                ))

            if confidence == 1:
                raw_answer = _apply_vietnam_history_language_policy(request.question, raw_answer)
                user_db.save_pending_knowledge(question, raw_answer)
                generation = (
                    "👉 Hệ thống đang tự học từ Web. "
                    "(Dưới đây là câu trả lời tham khảo chờ kiểm duyệt):\n\n"
                    + raw_answer
                )
            else:
                generation = raw_answer

        generation = _apply_vietnam_history_language_policy(request.question, generation)
        generation = strip_inline_source_references(generation)
        
        # Translate web fallback response to English if required
        from chatbot.services.translation_agent import TranslationAgent
        translation_agent = TranslationAgent(llm_model=llm)
        query_lang = translation_agent.detect_language(request.question)
        is_english = (query_lang == "en")
            
        if is_english:
            print(f"[TRANSLATION] Translating web fallback response to English...")
            generation = translation_agent.translate_answer_to_en(generation)
            print(f"[TRANSLATION] Translated web fallback: '{generation[:60]}...'")

        sources = _build_sources(documents)
        
        # Lọc các nguồn không liên quan đến entity chính trước khi lưu và trả về
        from chatbot.utils.entity_detector import detect_main_entity, filter_sources_by_entity
        entity_key, _ = detect_main_entity(question)
        if entity_key:
            sources = filter_sources_by_entity(sources, entity_key)

        if is_english:
            sources = translation_agent.translate_sources_to_en(sources)
        ai_msg_id = user_db.save_message(
            conversation_id,
            "assistant",
            generation,
            [s.model_dump() for s in sources],
        )

        if CHAT_WEB_FAST_RETURN:
            _quick_title_conversation(user_db, conversation_id, request.question)
        else:
            _auto_title_conversation(user_db, llm, conversation_id, request.question)

        tokens_in = token_counter.count_tokens(request.question)
        tokens_out = token_counter.count_tokens(generation)
        cost = token_counter.calculate_cost(tokens_in + tokens_out)

        q_brief = (request.question[:30] + "...") if len(request.question) > 30 else request.question
        new_balance = token_counter.deduct_tokens(
            email=email,
            tokens=cost,
            description=f"Hỏi đáp: {q_brief}",
        )

        if new_balance is None:
            latest_user = user_db.get_by_email(email)
            new_balance = latest_user.get("token_balance", 0.0) if latest_user else 0.0

        elapsed_ms = (_perf_counter() - request_started_at_local) * 1000
        is_pending = (pending and pending.get("approved") == 0)
        confidence = 1 if is_pending else (web_result.get("confidence", 0) if 'web_result' in locals() else 0)
        web_sources = [doc.metadata.get("source") for doc in documents if doc.metadata.get("is_web")]

        trace_log = {
            "step_times": {
                "total_elapsed_ms": elapsed_ms,
                "cache_lookup_ms": 15.0,
                "rag_pipeline_ms": 100.0,
                "web_fallback_ms": elapsed_ms - 115.0
            },
            "metadata": {
                "llm_name": settings.LLM_NAME if hasattr(settings, "LLM_NAME") else "openai",
                "embedding_model_name": "unknown",
            },
            "context_normalization": {
                "raw_question": request.question,
                "query_language": query_lang,
                "resolved_question": question,
                "translation_applied": is_english
            },
            "semantic_cache": {
                "hit": False,
                "similarity": 0.0
            },
            "pipeline_execution_status": {
                "semantic_cache_hit": False,
                "user_rag_retrieved": False,
                "global_history_retrieved": False,
                "web_fallback_triggered": True,
                "web_verification_reliable": confidence == 1,
                "auto_learning_saved": confidence == 1
            },
            "langgraph_workflow": {
                "intent_detected": "factual",
                "suitable_documents_available": False
            },
            "web_fallback": {
                "triggered": True,
                "crawled_urls": web_sources,
                "confidence_score": confidence,
                "web_data_reliable": confidence == 1,
                "is_pending_knowledge": is_pending
            }
        }
        user_db.save_chat_log(user["id"], request.question, generation, cost, trace_log=trace_log)
        related_questions = _generate_related_questions(llm, request.question, generation)
        if is_english:
            related_questions = translation_agent.translate_related_questions_to_en(related_questions)

        return ChatResponse(
            answer=generation,
            message_id=ai_msg_id,
            tokens_charged=float(cost),
            user_token_balance=float(new_balance),
            sources=sources,
            related_questions=related_questions,
            conversation_id=conversation_id,
            status="completed",
            trace_log=trace_log,
        )
    finally:
        if user_db:
            user_db.close()
        token_counter.close()


def _process_chat_request(
    request: ChatRequest,
    current_user: dict,
    *,
    save_user_message: bool,
    defer_web_fallback: bool,
    allow_queue: bool,
) -> ChatResponse:
    from time import perf_counter as _perf_counter
    request_started_at_local = _perf_counter()
    token_counter = TokenCounter()
    user_db = None

    try:
        email = current_user.get("email")
        user = token_counter.user_db.get_by_email(email)

        if not user or user.get("token_balance", 0) <= 0:
            raise HTTPException(status_code=402, detail="Số dư token không đủ.")

        _, llm, path_vector_store, embedding_model_name = _build_chat_runtime()

        agent = FilesChatAgent(
            llm_model=llm,
            path_vector_store=path_vector_store,
            embedding_model_name=embedding_model_name,
            allowed_files=["*"],
        )

        pipeline = agent.get_workflow().compile()
        user_db = UserDB()

        conversation_id = request.conversation_id
        if not conversation_id:
            conversation_id = user_db.create_conversation(current_user["id"])

        chat_history = _build_chat_history(user_db, conversation_id)
        
        # ===== BILINGUAL TRANSLATION INTERCEPT =====
        translation_agent = TranslationAgent(llm_model=llm)
        query_lang = translation_agent.detect_language(request.question)
        is_english = (query_lang == "en")

        # Determine UI language
        ui_is_english = False
        if request.language_instruction and "English" in request.language_instruction:
            ui_is_english = True

        # Check for mismatch
        mismatch_apology = None
        if ui_is_english and query_lang == "vi":
            mismatch_apology = "Xin lỗi, bạn đang ở giao diện tiếng Anh. Vui lòng nhập câu hỏi bằng tiếng Anh hoặc đổi giao diện sang tiếng Việt."
        elif not ui_is_english and query_lang == "en":
            mismatch_apology = "Sorry, you are currently using the Vietnamese interface. Please ask your question in Vietnamese or switch the interface to English."

        if mismatch_apology:
            if save_user_message:
                user_db.save_message(conversation_id, "user", request.question)
            
            ai_msg_id = user_db.save_message(
                conversation_id,
                "assistant",
                mismatch_apology,
                [],
            )
            
            latest_user = user_db.get_by_email(email)
            balance = latest_user.get("token_balance", 0.0) if latest_user else user.get("token_balance", 0.0)
            
            return ChatResponse(
                answer=mismatch_apology,
                message_id=ai_msg_id,
                tokens_charged=0.0,
                user_token_balance=float(balance),
                sources=[],
                related_questions=[],
                conversation_id=conversation_id,
                status="completed",
            )

        if is_english:
            print(f"[TRANSLATION] English user query detected: '{request.question}'")
            translated_question = translation_agent.translate_query_to_vi(request.question, chat_history, is_english=is_english)
            retrieval_question = translated_question
        else:
            retrieval_question = _resolve_contextual_question(request.question, chat_history)

        # ===== CHECK USER PERSONAL RAG =====
        has_user_rag = False
        user_id = current_user.get("id") or current_user.get("user_id")
        if user_id:
            try:
                user_rag_items = user_db.get_user_rag_items(user_id)
                has_user_rag = len(user_rag_items) > 0
            except Exception as e:
                print(f"⚠️ Error checking user RAG items: {e}")

        # ===== SEMANTIC CACHE LOOKUP =====
        from chatbot.services.semantic_cache import SemanticCacheManager
        cache_manager = SemanticCacheManager()
        
        tenant_id = os.environ.get("DEFAULT_TENANT_ID", "default")
        kb_id = os.environ.get("DEFAULT_KB_ID", "default")
        
        # If the user has personal RAG items, we only look up in their private cache entries (strict_user_id=True)
        # Otherwise, we look up in the shared cache (user_id=None, strict_user_id=False)
        lookup_user_id = user_id if has_user_rag else None
        strict_lookup = has_user_rag
        
        cached_hit = cache_manager.lookup(
            question=retrieval_question,
            embedding_model_name=embedding_model_name,
            tenant_id=tenant_id,
            knowledge_base_id=kb_id,
            user_id=lookup_user_id,
            strict_user_id=strict_lookup
        )
        
        if cached_hit:
            q_safe = retrieval_question.encode('ascii', 'replace').decode('ascii')
            print(f"[HIT] [Semantic Cache Hit] Fast-returning cached RAG answer for '{q_safe}'")
            cached_answer = cached_hit["answer"]
            
            cached_sources_raw = cached_hit["sources"]
            
            # Reconstruct SourceInfo list
            sources = []
            for s in cached_sources_raw:
                sources.append(SourceInfo(
                    filename=s.get("filename", ""),
                    content=s.get("content", ""),
                    page=s.get("page"),
                    is_web=s.get("is_web", False),
                    url=s.get("url")
                ))

            # Translate cached answer and sources to English if required
            if is_english:
                cached_answer = translation_agent.translate_answer_to_en(cached_answer)
                sources = translation_agent.translate_sources_to_en(sources)
                print(f"[TRANSLATION] Translated cached answer and sources to English")

            # Save the user message to history
            if save_user_message:
                user_db.save_message(conversation_id, "user", request.question)
                
            # Save assistant message
            ai_msg_id = user_db.save_message(
                conversation_id,
                "assistant",
                cached_answer,
                [s.model_dump() for s in sources],
            )
            
            if CHAT_FAST_RETURN:
                _quick_title_conversation(user_db, conversation_id, request.question)
            else:
                _auto_title_conversation(user_db, llm, conversation_id, request.question)
            
            # Calculate and deduct tokens
            tokens_in = token_counter.count_tokens(request.question)
            tokens_out = token_counter.count_tokens(cached_answer)
            cost = token_counter.calculate_cost(tokens_in + tokens_out)
            
            q_brief = (request.question[:30] + "...") if len(request.question) > 30 else request.question
            new_balance = token_counter.deduct_tokens(
                email=email,
                tokens=cost,
                description=f"Hỏi đáp (cached): {q_brief}",
            )
            if new_balance is None:
                latest_user = user_db.get_by_email(email)
                new_balance = latest_user.get("token_balance", 0.0) if latest_user else 0.0
                
            elapsed_ms = (_perf_counter() - request_started_at_local) * 1000
            trace_log = {
                "step_times": {
                    "total_elapsed_ms": elapsed_ms,
                    "cache_lookup_ms": elapsed_ms,
                    "rag_pipeline_ms": 0.0
                },
                "metadata": {
                    "llm_name": settings.LLM_NAME if hasattr(settings, "LLM_NAME") else "openai",
                    "embedding_model_name": embedding_model_name,
                },
                "context_normalization": {
                    "raw_question": request.question,
                    "query_language": query_lang,
                    "resolved_question": retrieval_question,
                    "translation_applied": is_english
                },
                "semantic_cache": {
                    "hit": True,
                    "similarity": cached_hit["similarity"]
                },
                "pipeline_execution_status": {
                    "semantic_cache_hit": True,
                    "user_rag_retrieved": False,
                    "global_history_retrieved": False,
                    "web_fallback_triggered": False,
                    "web_verification_reliable": False,
                    "auto_learning_saved": False
                },
                "langgraph_workflow": None,
                "web_fallback": None
            }
            user_db.save_chat_log(user["id"], request.question, cached_answer, cost, trace_log=trace_log)
            related_questions = _generate_related_questions(llm, retrieval_question, cached_answer)
            if is_english:
                related_questions = translation_agent.translate_related_questions_to_en(related_questions)
            
            return ChatResponse(
                answer=cached_answer,
                message_id=ai_msg_id,
                tokens_charged=float(cost),
                user_token_balance=float(new_balance),
                sources=sources,
                related_questions=related_questions,
                conversation_id=conversation_id,
                status="completed",
                intent="factual",
                scores={"semantic_cache_hit": cached_hit["similarity"]} if request.debug else None,
                trace_log=trace_log,
            )

        user_name = None
        if user:
            user_name = user.get("full_name") or user.get("username")
        if not user_name:
            user_name = current_user.get("username") or "bạn"

        if save_user_message:
            user_db.save_message(conversation_id, "user", request.question)

        result = pipeline.invoke({
            "question": retrieval_question,
            "debug": request.debug,
            "chat_history": chat_history,
            "defer_web_fallback": defer_web_fallback,
            "user_name": user_name,
            "user_id": current_user["id"],
        })

        generation = result.get("generation", "_null_")
        documents = result.get("documents", [])
        rag_intent = result.get("intent", "factual")
        rag_scores = result.get("scores", {})

        if result.get("web_fallback_required") and allow_queue:
            job_request = request.model_copy(update={"question": retrieval_question})
            job_id = _enqueue_chat_job(job_request, current_user, conversation_id)
            latest_user = token_counter.user_db.get_by_email(email)
            balance = latest_user.get("token_balance", 0.0) if latest_user else user.get("token_balance", 0.0)
            return ChatResponse(
                answer="Đang tra cứu thêm từ web, mình sẽ cập nhật câu trả lời khi xử lý xong.",
                tokens_charged=0.0,
                user_token_balance=float(balance),
                sources=[],
                related_questions=[],
                conversation_id=conversation_id,
                status="queued",
                job_id=job_id,
                progress=0,
                intent=rag_intent if request.debug else None,
                scores=rag_scores if request.debug else None,
            )

        generation = _apply_vietnam_history_language_policy(retrieval_question, generation)
        generation = strip_inline_source_references(generation)
        # Detect entity_key for off-topic citation filtering
        entity_key = result.get("main_entity")
        if not entity_key:
            from chatbot.utils.entity_detector import detect_main_entity
            entity_key, _ = detect_main_entity(retrieval_question)

        from chatbot.utils.answer_sanitizer import remap_citations
        generation = remap_citations(generation, documents, entity_key=entity_key)
        
        # Save copies of the original Vietnamese generation and sources for caching
        vietnamese_generation = generation
        from chatbot.utils.entity_detector import filter_docs_by_entity_strict
        filtered_docs = filter_docs_by_entity_strict(documents, entity_key)
        sources = _build_sources(filtered_docs)
        vietnamese_sources = sources

        
        # Translate live generated answer and sources to English if required
        if is_english and generation != "_null_":
            print(f"[TRANSLATION] Translating generation and sources to English...")
            generation = translation_agent.translate_answer_to_en(generation)
            sources = translation_agent.translate_sources_to_en(sources)
            print(f"[TRANSLATION] Translated generation: '{generation[:60]}...'")

        # ===== SAVE TO SEMANTIC CACHE =====
        is_rag_or_kb = (
            len(documents) > 0
            and not any(doc.metadata.get("is_pending") for doc in documents)
            and not any(doc.metadata.get("is_web") for doc in documents)
            and "tự học từ Web" not in vietnamese_generation
            and "chờ kiểm duyệt" not in vietnamese_generation
            and "chưa có dữ liệu" not in vietnamese_generation
        )
        
        if is_rag_or_kb:
            try:
                ttl_seconds = int(os.environ.get("SEMANTIC_CACHE_TTL", "0"))
                # If this generation used any document from User RAG, save with user's ID so it remains private
                has_user_rag_doc = any(doc.metadata.get("is_user_rag", False) for doc in documents)
                save_user_id = user_id if has_user_rag_doc else None
                cache_manager.save(
                    question=retrieval_question,
                    answer=vietnamese_generation,
                    sources=[s.model_dump() for s in vietnamese_sources],
                    embedding_model_name=embedding_model_name,
                    tenant_id=tenant_id,
                    knowledge_base_id=kb_id,
                    user_id=save_user_id,
                    ttl_seconds=ttl_seconds if ttl_seconds > 0 else None
                )
            except Exception as e:
                print(f"⚠️ Error saving to semantic cache: {e}")

        ai_msg_id = user_db.save_message(
            conversation_id,
            "assistant",
            generation,
            [s.model_dump() for s in sources],
        )

        if CHAT_FAST_RETURN:
            _quick_title_conversation(user_db, conversation_id, request.question)
        else:
            _auto_title_conversation(user_db, llm, conversation_id, request.question)

        tokens_in = token_counter.count_tokens(request.question)
        tokens_out = token_counter.count_tokens(generation)
        total_tokens = tokens_in + tokens_out
        cost = token_counter.calculate_cost(total_tokens)

        q_brief = (request.question[:30] + "...") if len(request.question) > 30 else request.question
        new_balance = token_counter.deduct_tokens(
            email=email,
            tokens=cost,
            description=f"Hỏi đáp: {q_brief}",
        )

        if new_balance is None:
            latest_user = user_db.get_by_email(email)
            new_balance = latest_user.get("token_balance", 0.0) if latest_user else 0.0

        elapsed_ms = (_perf_counter() - request_started_at_local) * 1000
        trace_log = {
            "step_times": {
                "total_elapsed_ms": elapsed_ms,
                "cache_lookup_ms": 15.0,
                "rag_pipeline_ms": elapsed_ms - 15.0
            },
            "metadata": {
                "llm_name": settings.LLM_NAME if hasattr(settings, "LLM_NAME") else "openai",
                "embedding_model_name": embedding_model_name,
            },
            "context_normalization": {
                "raw_question": request.question,
                "query_language": query_lang,
                "resolved_question": retrieval_question,
                "translation_applied": is_english
            },
            "semantic_cache": {
                "hit": False,
                "similarity": 0.0
            },
            "pipeline_execution_status": {
                "semantic_cache_hit": False,
                "user_rag_retrieved": any(doc.metadata.get("is_user_rag", False) for doc in documents),
                "global_history_retrieved": any(doc.metadata.get("is_global_history", False) for doc in documents),
                "web_fallback_triggered": False,
                "web_verification_reliable": False,
                "auto_learning_saved": False
            },
            "langgraph_workflow": {
                "intent_detected": rag_intent,
                "detailed_intent": result.get("detailed_intent"),
                "entity_detected": result.get("main_entity"),
                "entity_display": result.get("main_entity_display"),
                "retrieved_documents": [
                    {
                        "content": doc.page_content,
                        "source": doc.metadata.get("source") or doc.metadata.get("file_name") or "Unknown",
                        "score": doc.metadata.get("score") or doc.metadata.get("relevance_score") or 0.0,
                        "page": doc.metadata.get("page"),
                        "is_user_rag": doc.metadata.get("is_user_rag", False),
                        "is_global_history": doc.metadata.get("is_global_history", False),
                        "is_pending": doc.metadata.get("is_pending", False)
                    }
                    for doc in documents
                ],
                "suitable_documents_available": len(documents) > 0 and not any(doc.metadata.get("is_pending") for doc in documents)
            },
            "web_fallback": None
        }
        user_db.save_chat_log(user["id"], request.question, generation, cost, trace_log=trace_log)

        related_questions = _generate_related_questions(llm, retrieval_question, generation)
        if is_english:
            related_questions = translation_agent.translate_related_questions_to_en(related_questions)

        return ChatResponse(
            answer=generation,
            message_id=ai_msg_id,
            tokens_charged=float(cost),
            user_token_balance=float(new_balance),
            sources=sources,
            related_questions=related_questions,
            conversation_id=conversation_id,
            status="completed",
            intent=rag_intent if request.debug else None,
            scores=rag_scores if request.debug else None,
            trace_log=trace_log,
        )
    finally:
        if user_db:
            user_db.close()
        token_counter.close()


@router.post("/chat", response_model=ChatResponse)
async def chat_with_router(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    request_started_at = perf_counter()
    user_id = current_user.get("id") or current_user.get("user_id")
    _log_chat_timing(
        "chat_request_received",
        user_id=user_id,
        conversation_id=request.conversation_id,
        async_web_fallback=request.async_web_fallback,
        question=request.question,
    )
    try:
        response = _process_chat_request(
            request,
            current_user,
            save_user_message=True,
            defer_web_fallback=request.async_web_fallback,
            allow_queue=request.async_web_fallback,
        )
        _log_chat_timing(
            "chat_response_ready",
            request_started_at,
            user_id=user_id,
            status=response.status,
            conversation_id=response.conversation_id,
            job_id=response.job_id,
            answer_chars=len(response.answer or ""),
            sources=len(response.sources or []),
        )
        return response
    except HTTPException as e:
        _log_chat_timing(
            "chat_response_failed",
            request_started_at,
            user_id=user_id,
            status_code=e.status_code,
            error=e.detail,
        )
        raise
    except Exception as e:
        import traceback
        print("PIPELINE ERROR")
        traceback.print_exc()
        _log_chat_timing(
            "chat_response_failed",
            request_started_at,
            user_id=user_id,
            error=str(e),
        )
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chat/jobs/{job_id}", response_model=ChatJobStatus)
async def get_chat_job_status(
    job_id: str,
    current_user: dict = Depends(get_current_user)
):
    job = _get_chat_job(job_id)
    user_id = current_user.get("id") or current_user.get("user_id")

    if not job or job.get("user_id") != user_id:
        raise HTTPException(status_code=404, detail="Job không tồn tại.")

    result = ChatResponse(**job["result"]) if job.get("result") else None
    if job.get("status") in ("completed", "failed") and _mark_chat_job_delivery_logged(job_id):
        _log_chat_timing(
            "web_job_result_returned_to_frontend",
            job.get("_queued_at_perf"),
            job_id=job_id,
            user_id=user_id,
            status=job.get("status"),
            conversation_id=result.conversation_id if result else None,
            answer_chars=len(result.answer or "") if result else None,
            sources=len(result.sources or []) if result else None,
            error=job.get("error"),
        )
    return ChatJobStatus(
        job_id=job_id,
        status=job.get("status", "unknown"),
        progress=int(job.get("progress", 0)),
        message=job.get("message", ""),
        result=result,
        error=job.get("error"),
    )


# ===============================
# STREAMING CHAT
# ===============================

def stream_answer(agent, question):

    for chunk in agent.stream(question):

        yield chunk


@router.post("/chat_stream")
async def chat_stream(request: ChatRequest):

    db = UserDB()
    llm_name = db.get_setting("llm_name", os.environ.get("LLM_NAME", "openai"))
    db.close()

    base_vector_path = os.environ.get("PATH_VECTOR_STORE")
    path_vector_store = base_vector_path
    if base_vector_path:
        model_specific_path = os.path.join(base_vector_path, llm_name)
        if os.path.exists(model_specific_path):
            path_vector_store = model_specific_path

    # llm = LLM().get_llm(llm_name)
    llm = LLM().get_llm(llm_name)   # ✅

    # DYNAMIC EMBEDDING logic
    embedding_model_name = os.environ.get("EMBEDDING_MODEL_NAME", "openai")
    if llm_name == "openai":
        embedding_model_name = "openai"
    elif llm_name in ["vertex", "gemini"]:
        embedding_model_name = "vertex"

    agent = FilesChatAgent(
        llm_model=llm,
        path_vector_store=path_vector_store,
        embedding_model_name=embedding_model_name,
        allowed_files=["*"]
    )

    return StreamingResponse(
        stream_answer(agent, request.question),
        media_type="text/event-stream"
    )


# ===============================
# OLD HISTORY (BACKUP)
# ===============================

@router.get("/history")
async def get_chat_history(current_user: dict = Depends(get_current_user)):

    user_db = UserDB()

    logs = user_db.get_user_chat_logs(current_user["id"])

    user_db.close()

    history = []

    for log in logs:

        history.append({
            "id": f"q-{log['id']}",
            "role": "user",
            "content": log["question"],
            "timestamp": log["created_at"]
        })

        history.append({
            "id": f"a-{log['id']}",
            "role": "assistant",
            "content": log["answer"],
            "timestamp": log["created_at"],
            "tokens_charged": log["tokens_charged"]
        })

    return {"history": history}


@router.delete("/history")
async def delete_chat_history(current_user: dict = Depends(get_current_user)):

    user_db = UserDB()

    user_db.delete_user_chat_logs(current_user["id"])

    user_db.close()

    return {"message": "Đã xóa lịch sử chat thành công"}


# ===============================
# SITE CONFIG
# ===============================

@router.get("/config")
async def get_site_config():

    db = UserDB()

    logo_url = db.get_setting("logo_url", "")

    site_title = db.get_setting("site_title", "Chatbot Phật Giáo")

    db.close()

    return {
        "logo_url": logo_url,
        "site_title": site_title
    }

# ===============================
# SOURCE CONTENT & FORMATTING
# ===============================

@router.get("/source/{filename}")
async def get_source_content(filename: str, current_user: dict = Depends(get_current_user)):
    db = UserDB()
    llm_name = db.get_setting("llm_name", os.environ.get("LLM_NAME", "openai"))
    db.close()
    
    base_vector_path = os.environ.get("PATH_VECTOR_STORE")
    path_vector_store = base_vector_path
    if base_vector_path:
        model_specific_path = os.path.join(base_vector_path, llm_name)
        if os.path.exists(model_specific_path):
            path_vector_store = model_specific_path

    embedding_model_name = os.environ.get("EMBEDDING_MODEL_NAME", "openai")
    if llm_name == "openai":
        embedding_model_name = "openai"
    elif llm_name in ["vertex", "gemini"]:
        embedding_model_name = "vertex"

    try:
        retriever_instance = Retriever(
            embedding_model_name=embedding_model_name
        ).set_retriever(
            path_vector_store=path_vector_store
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    all_docs = list(retriever_instance.retriever.docstore._dict.values())
    
    matching_docs = []
    for doc in all_docs:
        source = doc.metadata.get("source") or doc.metadata.get("filename")
        if source and os.path.basename(source) == filename:
            matching_docs.append(doc)
            
    if not matching_docs:
        raise HTTPException(status_code=404, detail="Source not found in vector store.")
        
    content = f"### Tài liệu: {filename}\n\n"
    for i, doc in enumerate(matching_docs):
        content += f"**[Đoạn {i+1}]**\n{doc.page_content}\n\n"
        
    return {"filename": filename, "content": content.strip()}


class FormatRequest(BaseModel):
    text: str

@router.post("/source/format")
async def format_source_content(request: FormatRequest, current_user: dict = Depends(get_current_user)):
    db = UserDB()
    llm_name = db.get_setting("llm_name", os.environ.get("LLM_NAME", "openai"))
    db.close()
    
    llm = LLM().get_llm(llm_name)
    prompt = f"""Bạn là một chuyên gia biên tập văn bản.
Dưới đây là nội dung văn bản được trích xuất từ tài liệu (có thể bị lỗi xuống dòng, dính chữ, hoặc định dạng xấu do OCR/PDF extract).
Nhiệm vụ của bạn là:
1. Sửa lại lỗi chính tả hoặc nối các câu bị đứt gãy do lỗi extract.
2. Trình bày lại cho đẹp mắt, dễ đọc (sử dụng Markdown: in đậm, gạch đầu dòng, chia đoạn hợp lý).
Tuyệt đối KHÔNG thay đổi ý nghĩa gốc, KHÔNG tự bịa thêm thông tin ngoài lề. Chỉ biên tập lại văn bản này.

NỘI DUNG GỐC:
{request.text}

NỘI DUNG ĐÃ BIÊN TẬP:"""

    try:
        response = llm.invoke(prompt)
        content = response.content if hasattr(response, "content") else str(response)
        # Strip thinking tags if using reasoning models
        import re
        content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()
        content = re.sub(r"<\|think\|>.*?<\|/think\|>", "", content, flags=re.DOTALL).strip()
        
        return {"formatted_text": content.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM formatting error: {str(e)}")


# ===============================
# TRUE STREAMING CHAT (ChatGPT-style SSE)
# ===============================

async def _generate_chat_stream(request: ChatRequest, current_user: dict):
    """
    Generator async phát SSE:
      - data: <json_token>   — từng token LLM sinh ra
      - data: [DONE] <json>  — metadata cuối (sources, tokens, message_id, related_questions)
      - data: [ERROR] <json> — nếu có lỗi
    """
    from time import perf_counter as _perf_counter
    request_started_at_local = _perf_counter()
    import json as _json
    import asyncio
    from concurrent.futures import ThreadPoolExecutor as _TPE

    token_counter = TokenCounter()
    user_db = None
    _executor = _TPE(max_workers=1)

    try:
        email = current_user.get("email")
        user = token_counter.user_db.get_by_email(email)

        if not user or user.get("token_balance", 0) <= 0:
            yield f"data: [ERROR] {_json.dumps({'error': 'Số dư token không đủ.'})}\n\n"
            return

        llm_name, llm, path_vector_store, embedding_model_name = _build_chat_runtime()

        agent = FilesChatAgent(
            llm_model=llm,
            path_vector_store=path_vector_store,
            embedding_model_name=embedding_model_name,
            allowed_files=["*"],
        )

        user_db = UserDB()

        conversation_id = request.conversation_id
        if not conversation_id:
            conversation_id = user_db.create_conversation(current_user["id"])

        chat_history = _build_chat_history(user_db, conversation_id)
        
        # ===== BILINGUAL TRANSLATION INTERCEPT =====
        translation_agent = TranslationAgent(llm_model=llm)
        query_lang = translation_agent.detect_language(request.question)
        is_english = (query_lang == "en")

        # Determine UI language
        ui_is_english = False
        if request.language_instruction and "English" in request.language_instruction:
            ui_is_english = True

        # Check for mismatch
        mismatch_apology = None
        if ui_is_english and query_lang == "vi":
            mismatch_apology = "Xin lỗi, bạn đang ở giao diện tiếng Anh. Vui lòng nhập câu hỏi bằng tiếng Anh hoặc đổi giao diện sang tiếng Việt."
        elif not ui_is_english and query_lang == "en":
            mismatch_apology = "Sorry, you are currently using the Vietnamese interface. Please ask your question in Vietnamese or switch the interface to English."

        if mismatch_apology:
            user_db.save_message(conversation_id, "user", request.question)
            
            CHUNK = 6
            for i in range(0, len(mismatch_apology), CHUNK):
                token = mismatch_apology[i:i + CHUNK]
                yield f"data: {_json.dumps(token)}\n\n"
                await asyncio.sleep(0.012)
                
            ai_msg_id = user_db.save_message(
                conversation_id, "assistant", mismatch_apology, []
            )
            
            latest_user = token_counter.user_db.get_by_email(email)
            balance = latest_user.get("token_balance", 0.0) if latest_user else user.get("token_balance", 0.0)
            
            done_payload = _json.dumps({
                "message_id": ai_msg_id,
                "tokens_charged": 0.0,
                "user_token_balance": float(balance),
                "sources": [],
                "related_questions": [],
                "conversation_id": conversation_id,
            })
            yield f"data: [DONE] {done_payload}\n\n"
            return

        if is_english:
            print(f"[TRANSLATION] English user query detected: '{request.question}'")
            translated_question = translation_agent.translate_query_to_vi(request.question, chat_history, is_english=is_english)
            retrieval_question = translated_question
        else:
            retrieval_question = _resolve_contextual_question(request.question, chat_history)

        # ===== CHECK USER PERSONAL RAG =====
        has_user_rag = False
        user_id = current_user.get("id") or current_user.get("user_id")
        if user_id:
            try:
                user_rag_items = user_db.get_user_rag_items(user_id)
                has_user_rag = len(user_rag_items) > 0
            except Exception as e:
                print(f"⚠️ Error checking user RAG items: {e}")

        # ===== SEMANTIC CACHE CHECK =====
        from chatbot.services.semantic_cache import SemanticCacheManager
        cache_manager = SemanticCacheManager()
        tenant_id = os.environ.get("DEFAULT_TENANT_ID", "default")
        kb_id = os.environ.get("DEFAULT_KB_ID", "default")

        # If the user has personal RAG items, we only look up in their private cache entries (strict_user_id=True)
        # Otherwise, we look up in the shared cache (user_id=None, strict_user_id=False)
        lookup_user_id = user_id if has_user_rag else None
        strict_lookup = has_user_rag

        cached_hit = cache_manager.lookup(
            question=retrieval_question,
            embedding_model_name=embedding_model_name,
            tenant_id=tenant_id,
            knowledge_base_id=kb_id,
            user_id=lookup_user_id,
            strict_user_id=strict_lookup
        )

        if cached_hit:
            # Cache hit: stream cached answer in chunks
            cached_answer = cached_hit["answer"]
            
            cached_sources_raw = cached_hit["sources"]
            sources = [
                SourceInfo(
                    filename=s.get("filename", ""),
                    content=s.get("content", ""),
                    page=s.get("page"),
                    is_web=s.get("is_web", False),
                    url=s.get("url"),
                )
                for s in cached_sources_raw
            ]

            # Translate if English
            if is_english:
                cached_answer = translation_agent.translate_answer_to_en(cached_answer)
                sources = translation_agent.translate_sources_to_en(sources)
                print(f"[TRANSLATION] Translated cached stream response and sources to English")

            user_db.save_message(conversation_id, "user", request.question)

            CHUNK = 6
            for i in range(0, len(cached_answer), CHUNK):
                token = cached_answer[i:i + CHUNK]
                yield f"data: {_json.dumps(token)}\n\n"
                await asyncio.sleep(0.012)

            ai_msg_id = user_db.save_message(
                conversation_id, "assistant", cached_answer,
                [s.model_dump() for s in sources],
            )
            if CHAT_FAST_RETURN:
                _quick_title_conversation(user_db, conversation_id, request.question)
            else:
                _auto_title_conversation(user_db, llm, conversation_id, request.question)

            tokens_in = token_counter.count_tokens(request.question)
            tokens_out = token_counter.count_tokens(cached_answer)
            cost = token_counter.calculate_cost(tokens_in + tokens_out)
            q_brief = (request.question[:30] + "...") if len(request.question) > 30 else request.question
            new_balance = token_counter.deduct_tokens(email=email, tokens=cost, description=f"Hỏi đáp (cached): {q_brief}")
            if new_balance is None:
                latest_user = user_db.get_by_email(email)
                new_balance = latest_user.get("token_balance", 0.0) if latest_user else 0.0
            
            elapsed_ms = (_perf_counter() - request_started_at_local) * 1000
            trace_log = {
                "step_times": {
                    "total_elapsed_ms": elapsed_ms,
                    "cache_lookup_ms": elapsed_ms
                },
                "metadata": {
                    "llm_name": settings.LLM_NAME if hasattr(settings, "LLM_NAME") else "openai",
                    "embedding_model_name": embedding_model_name,
                },
                "context_normalization": {
                    "raw_question": request.question,
                    "query_language": query_lang,
                    "resolved_question": retrieval_question,
                    "translation_applied": is_english
                },
                "semantic_cache": {
                    "hit": True,
                    "similarity": cached_hit.get("similarity", 1.0) if isinstance(cached_hit, dict) else 1.0,
                    "cached_answer": cached_answer,
                    "cached_sources": [s.model_dump() for s in sources]
                },
                "langgraph_workflow": None,
                "web_fallback": None
            }
            user_db.save_chat_log(user["id"], request.question, cached_answer, cost, trace_log=trace_log)

            def _gen_rq_cached():
                rq = _generate_related_questions(llm, retrieval_question, cached_answer)
                if is_english:
                    rq = translation_agent.translate_related_questions_to_en(rq)
                return rq
            related_questions = await asyncio.get_event_loop().run_in_executor(_executor, _gen_rq_cached)

            done_payload = _json.dumps({
                "message_id": ai_msg_id,
                "tokens_charged": float(cost),
                "user_token_balance": float(new_balance),
                "sources": [s.model_dump() for s in sources],
                "related_questions": related_questions,
                "conversation_id": conversation_id,
                "answer": cached_answer,
            })
            yield f"data: [DONE] {done_payload}\n\n"
            return

        # ===== RAG PIPELINE (retrieve + grade) in thread =====
        user_name = user.get("full_name") or user.get("username") or current_user.get("username") or "bạn"
        user_db.save_message(conversation_id, "user", request.question)

        loop = asyncio.get_event_loop()

        def _run_rag_pipeline():
            pipeline = agent.get_workflow().compile()
            return pipeline.invoke({
                "question": retrieval_question,
                "debug": request.debug,
                "chat_history": chat_history,
                "defer_web_fallback": True,
                "user_name": user_name,
                "user_id": current_user["id"],
            })

        result = await loop.run_in_executor(_executor, _run_rag_pipeline)

        documents = result.get("documents", [])
        raw_generation = result.get("generation", "")
        web_fallback_required = result.get("web_fallback_required", False)

        # If web fallback is needed, enqueue job and return placeholder
        if web_fallback_required:
            placeholder = "Đang tra cứu thêm từ web, mình sẽ cập nhật câu trả lời khi xử lý xong."
            yield f"data: {_json.dumps(placeholder)}\n\n"
            job_request = request.model_copy(update={"question": retrieval_question})
            job_id = _enqueue_chat_job(job_request, current_user, conversation_id)
            latest_user = token_counter.user_db.get_by_email(email)
            balance = latest_user.get("token_balance", 0.0) if latest_user else user.get("token_balance", 0.0)
            done_payload = _json.dumps({
                "message_id": None,
                "tokens_charged": 0.0,
                "user_token_balance": float(balance),
                "sources": [],
                "related_questions": [],
                "conversation_id": conversation_id,
                "job_id": job_id,
                "status": "queued",
            })
            yield f"data: [DONE] {done_payload}\n\n"
            return

        # If pipeline produced a pre-generated response (chitchat, unrelated, pending, etc.)
        if raw_generation and raw_generation not in ("", "_null_", "WEB_FALLBACK_DEFERRED"):
            import re as _re2
            generation_text = _re2.sub(r"<think>.*?</think>", "", raw_generation, flags=_re2.DOTALL).strip()
            generation_text = _apply_vietnam_history_language_policy(retrieval_question, generation_text)
            generation_text = strip_inline_source_references(generation_text)
            # Detect entity_key for off-topic citation filtering
            entity_key = result.get("main_entity")
            if not entity_key:
                from chatbot.utils.entity_detector import detect_main_entity
                entity_key, _ = detect_main_entity(retrieval_question)

            from chatbot.utils.answer_sanitizer import remap_citations
            generation_text = remap_citations(generation_text, documents, entity_key=entity_key)

            # Translate pre-generated stream response to English if required
            if is_english:
                generation_text = translation_agent.translate_answer_to_en(generation_text)
                print(f"[TRANSLATION] Translated pre-generated stream response to English: '{generation_text[:60]}...'")

            CHUNK = 6
            for i in range(0, len(generation_text), CHUNK):
                token = generation_text[i:i + CHUNK]
                yield f"data: {_json.dumps(token)}\n\n"
                await asyncio.sleep(0.012)

            from chatbot.utils.entity_detector import filter_docs_by_entity_strict
            filtered_docs = filter_docs_by_entity_strict(documents, entity_key)
            sources = _build_sources(filtered_docs)

            if is_english:
                sources = translation_agent.translate_sources_to_en(sources)
            ai_msg_id = user_db.save_message(
                conversation_id, "assistant", generation_text,
                [s.model_dump() for s in sources],
            )
            if CHAT_FAST_RETURN:
                _quick_title_conversation(user_db, conversation_id, request.question)
            else:
                _auto_title_conversation(user_db, llm, conversation_id, request.question)

            tokens_in = token_counter.count_tokens(request.question)
            tokens_out = token_counter.count_tokens(generation_text)
            cost = token_counter.calculate_cost(tokens_in + tokens_out)
            q_brief = (request.question[:30] + "...") if len(request.question) > 30 else request.question
            new_balance = token_counter.deduct_tokens(email=email, tokens=cost, description=f"Hỏi đáp: {q_brief}")
            if new_balance is None:
                latest_user = user_db.get_by_email(email)
                new_balance = latest_user.get("token_balance", 0.0) if latest_user else 0.0
            
            elapsed_ms = (_perf_counter() - request_started_at_local) * 1000
            trace_log = {
                "step_times": {
                    "total_elapsed_ms": elapsed_ms,
                    "cache_lookup_ms": 15.0,
                    "rag_pipeline_ms": elapsed_ms - 15.0
                },
                "metadata": {
                    "llm_name": settings.LLM_NAME if hasattr(settings, "LLM_NAME") else "openai",
                    "embedding_model_name": embedding_model_name,
                },
                "context_normalization": {
                    "raw_question": request.question,
                    "query_language": query_lang,
                    "resolved_question": retrieval_question,
                    "translation_applied": is_english
                },
                "semantic_cache": {
                    "hit": False,
                    "similarity": 0.0
                },
                "langgraph_workflow": {
                    "intent_detected": result.get("intent", "factual"),
                    "detailed_intent": result.get("detailed_intent"),
                    "entity_detected": result.get("main_entity"),
                    "entity_display": result.get("main_entity_display"),
                    "retrieved_documents": [
                        {
                            "content": doc.page_content,
                            "source": doc.metadata.get("source") or doc.metadata.get("file_name") or "Unknown",
                            "score": doc.metadata.get("score") or doc.metadata.get("relevance_score") or 0.0,
                            "page": doc.metadata.get("page"),
                            "is_user_rag": doc.metadata.get("is_user_rag", False),
                            "is_global_history": doc.metadata.get("is_global_history", False),
                            "is_pending": doc.metadata.get("is_pending", False)
                        }
                        for doc in documents
                    ],
                    "suitable_documents_available": len(documents) > 0 and not any(doc.metadata.get("is_pending") for doc in documents)
                },
                "web_fallback": None
            }
            user_db.save_chat_log(user["id"], request.question, generation_text, cost, trace_log=trace_log)

            def _rq1():
                rq = _generate_related_questions(llm, retrieval_question, generation_text)
                if is_english:
                    rq = translation_agent.translate_related_questions_to_en(rq)
                return rq
            related_questions = await loop.run_in_executor(_executor, _rq1)

            done_payload = _json.dumps({
                "message_id": ai_msg_id,
                "tokens_charged": float(cost),
                "user_token_balance": float(new_balance),
                "sources": [s.model_dump() for s in sources],
                "related_questions": related_questions,
                "conversation_id": conversation_id,
                "answer": generation_text,
            })
            yield f"data: [DONE] {done_payload}\n\n"
            return

        # ===== TRUE LLM STREAMING =====
        from chatbot.utils.answer_generator import AnswerGenerator
        import re as _re3

        answer_gen = AnswerGenerator(llm)
        formatted_history = answer_gen.format_history(chat_history)

        context_list = []
        for idx, doc in enumerate(documents, start=1):
            source_name = doc.metadata.get("file_name") or doc.metadata.get("source") or "Unknown"
            page_num = doc.metadata.get("page")
            page_str = f" (Page {page_num})" if page_num is not None else ""
            
            content = doc.metadata.get("answer") if "answer" in doc.metadata else doc.page_content
            if len(content) > 3000:
                content = content[:3000] + "..."
            
            if doc.metadata.get("is_user_rag"):
                context_list.append(f"Tài liệu [{idx}] - [TRI THỨC RIÊNG CỦA NGƯỜI DÙNG]: {content}")
            elif doc.metadata.get("is_global_history"):
                context_list.append(f"Tài liệu [{idx}] - [TƯ LIỆU LỊCH SỬ CHÍNH THỐNG] ({source_name}): {content}")
            else:
                context_list.append(f"Tài liệu [{idx}] - [TÀI LIỆU HỆ THỐNG] ({source_name}{page_str}): {content}")
        context = "\n\n".join(context_list)

        full_generation = ""
        in_think_block = False

        def _get_stream_iter():
            chain = answer_gen.get_chain()
            return chain.stream({
                "question": retrieval_question,
                "context": context,
                "chat_history": formatted_history,
            })

        stream_iter = await loop.run_in_executor(_executor, _get_stream_iter)

        for token_text in stream_iter:
            full_generation += token_text

            if not is_english:
                # Skip <think>...</think> blocks for reasoning models
                if "<think>" in full_generation and not in_think_block:
                    in_think_block = True

                if in_think_block:
                    if "</think>" in full_generation:
                        after_think = full_generation.split("</think>", 1)[-1]
                        in_think_block = False
                        if after_think:
                            yield f"data: {_json.dumps(after_think)}\n\n"
                            await asyncio.sleep(0)
                    continue

                if token_text:
                    yield f"data: {_json.dumps(token_text)}\n\n"
                    await asyncio.sleep(0)

        # Post-process full answer
        full_generation = _re3.sub(r"<think>.*?</think>", "", full_generation, flags=_re3.DOTALL).strip()
        full_generation = _apply_vietnam_history_language_policy(retrieval_question, full_generation)
        full_generation = strip_inline_source_references(full_generation)
        # Detect entity_key for off-topic citation filtering
        entity_key = result.get("main_entity")
        if not entity_key:
            from chatbot.utils.entity_detector import detect_main_entity
            entity_key, _ = detect_main_entity(retrieval_question)

        from chatbot.utils.answer_sanitizer import remap_citations
        full_generation = remap_citations(full_generation, documents, entity_key=entity_key)

        # Save copies of the original Vietnamese generation and sources for caching
        vietnamese_generation = full_generation
        from chatbot.utils.entity_detector import filter_docs_by_entity_strict
        filtered_docs = filter_docs_by_entity_strict(documents, entity_key)
        sources = _build_sources(filtered_docs)
        vietnamese_sources = sources

        # Translate to English if required
        if is_english:
            print(f"[TRANSLATION] Translating stream response and sources to English...")
            full_generation = translation_agent.translate_answer_to_en(full_generation)
            sources = translation_agent.translate_sources_to_en(sources)
            print(f"[TRANSLATION] Translated stream response: '{full_generation[:60]}...'")
            
            # Stream the translated English answer to the user in chunks
            CHUNK = 6
            for i in range(0, len(full_generation), CHUNK):
                token = full_generation[i:i + CHUNK]
                yield f"data: {_json.dumps(token)}\n\n"
                await asyncio.sleep(0.012)

        # Save to semantic cache
        is_rag_or_kb = (
            len(documents) > 0
            and not any(doc.metadata.get("is_pending") for doc in documents)
            and not any(doc.metadata.get("is_web") for doc in documents)
            and "tự học từ Web" not in vietnamese_generation
            and "chờ kiểm duyệt" not in vietnamese_generation
            and "chưa có dữ liệu" not in vietnamese_generation
        )
        if is_rag_or_kb:
            try:
                ttl_seconds = int(os.environ.get("SEMANTIC_CACHE_TTL", "0"))
                # If this generation used any document from User RAG, save with user's ID so it remains private
                has_user_rag_doc = any(doc.metadata.get("is_user_rag", False) for doc in documents)
                save_user_id = user_id if has_user_rag_doc else None
                cache_manager.save(
                    question=retrieval_question,
                    answer=vietnamese_generation,
                    sources=[s.model_dump() for s in vietnamese_sources],
                    embedding_model_name=embedding_model_name,
                    tenant_id=tenant_id,
                    knowledge_base_id=kb_id,
                    user_id=save_user_id,
                    ttl_seconds=ttl_seconds if ttl_seconds > 0 else None,
                )
            except Exception as cache_e:
                print(f"⚠️ Error saving to semantic cache: {cache_e}")

        ai_msg_id = user_db.save_message(
            conversation_id, "assistant", full_generation,
            [s.model_dump() for s in sources],
        )

        if CHAT_FAST_RETURN:
            _quick_title_conversation(user_db, conversation_id, request.question)
        else:
            _auto_title_conversation(user_db, llm, conversation_id, request.question)

        tokens_in = token_counter.count_tokens(request.question)
        tokens_out = token_counter.count_tokens(full_generation)
        cost = token_counter.calculate_cost(tokens_in + tokens_out)
        q_brief = (request.question[:30] + "...") if len(request.question) > 30 else request.question
        new_balance = token_counter.deduct_tokens(email=email, tokens=cost, description=f"Hỏi đáp: {q_brief}")
        if new_balance is None:
            latest_user = user_db.get_by_email(email)
            new_balance = latest_user.get("token_balance", 0.0) if latest_user else 0.0
        
        elapsed_ms = (_perf_counter() - request_started_at_local) * 1000
        trace_log = {
            "step_times": {
                "total_elapsed_ms": elapsed_ms,
                "cache_lookup_ms": 15.0,
                "rag_pipeline_ms": elapsed_ms - 15.0
            },
            "metadata": {
                "llm_name": settings.LLM_NAME if hasattr(settings, "LLM_NAME") else "openai",
                "embedding_model_name": embedding_model_name,
            },
            "context_normalization": {
                "raw_question": request.question,
                "query_language": query_lang,
                "resolved_question": retrieval_question,
                "translation_applied": is_english
            },
            "semantic_cache": {
                "hit": False,
                "similarity": 0.0
            },
            "langgraph_workflow": {
                "intent_detected": result.get("intent", "factual"),
                "detailed_intent": result.get("detailed_intent"),
                "entity_detected": result.get("main_entity"),
                "entity_display": result.get("main_entity_display"),
                "retrieved_documents": [
                    {
                        "content": doc.page_content,
                        "source": doc.metadata.get("source") or doc.metadata.get("file_name") or "Unknown",
                        "score": doc.metadata.get("score") or doc.metadata.get("relevance_score") or 0.0,
                        "page": doc.metadata.get("page"),
                        "is_user_rag": doc.metadata.get("is_user_rag", False),
                        "is_global_history": doc.metadata.get("is_global_history", False),
                        "is_pending": doc.metadata.get("is_pending", False)
                    }
                    for doc in documents
                ],
                "suitable_documents_available": len(documents) > 0 and not any(doc.metadata.get("is_pending") for doc in documents)
            },
            "web_fallback": None
        }
        user_db.save_chat_log(user["id"], request.question, full_generation, cost, trace_log=trace_log)

        def _rq2():
            rq = _generate_related_questions(llm, retrieval_question, full_generation)
            if is_english:
                rq = translation_agent.translate_related_questions_to_en(rq)
            return rq
        related_questions = await loop.run_in_executor(_executor, _rq2)

        done_payload = _json.dumps({
            "message_id": ai_msg_id,
            "tokens_charged": float(cost),
            "user_token_balance": float(new_balance),
            "sources": [s.model_dump() for s in sources],
            "related_questions": related_questions,
            "conversation_id": conversation_id,
            "answer": full_generation,
        })
        yield f"data: [DONE] {done_payload}\n\n"

    except HTTPException as http_e:
        import json as _json2
        yield f"data: [ERROR] {_json2.dumps({'error': str(http_e.detail)})}\n\n"
    except Exception as gen_e:
        import json as _json3
        import traceback
        traceback.print_exc()
        yield f"data: [ERROR] {_json3.dumps({'error': str(gen_e)})}\n\n"
    finally:
        if user_db:
            user_db.close()
        token_counter.close()
        _executor.shutdown(wait=False)


@router.post("/chat/stream")
async def chat_stream_v2(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    ChatGPT-style SSE streaming endpoint.
    Phát từng token ngay khi LLM sinh ra.
    Event format:  data: <json_string>\\n\\n
    Cuối stream:   data: [DONE] <json_metadata>\\n\\n
    """
    return StreamingResponse(
        _generate_chat_stream(request, current_user),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
