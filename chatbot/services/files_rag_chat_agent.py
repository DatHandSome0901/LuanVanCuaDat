
from typer.cli import state

from chatbot.utils.question_normalizer import normalize_question
from chatbot.utils.answer_sanitizer import strip_inline_source_references
from ingestion.retriever import Retriever
from chatbot.utils.document_grader import DocumentGrader
from chatbot.utils.answer_generator import AnswerGenerator
# ── Adaptive RAG imports ───────────────────────────────────
from chatbot.services.query_classifier import classify_query
from chatbot.services.adaptive_retriever import AdaptiveRetriever
# ── Entity-aware imports ────────────────────────────────────
from chatbot.utils.entity_detector import (
    detect_main_entity,
    detect_detailed_intent,
    is_followup_request,
    rewrite_followup_with_entity,
    filter_docs_by_entity,
    extract_last_entity_from_history,
)

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


def _classify_history_query_type(q: str, chat_history: list = None, llm=None) -> str:
    normalized = q.lower().strip()
    
    def _has_phrase(text: str, phrase: str) -> bool:
        pattern = rf"(?:^|\s|[.,!?;]){re.escape(phrase)}(?:$|\s|[.,!?;])"
        return re.search(pattern, text) is not None
        
    # 1. user_challenge keywords
    user_challenge_keywords = [
        "theo tôi", "theo toi", "tôi thấy", "toi thay", "mình thấy", "minh thay",
        "bạn sai", "ban sai", "không đúng", "khong dung", "chưa đúng", "chua dung",
        "ý tôi là", "y toi la", "nhưng", "nhung", "nếu vậy", "neu vay", "vậy nếu", "vay neu",
        "phản bác", "phan bac", "tranh luận", "tranh luan", "có thể là", "co the la",
        "theo hướng này", "theo huong nay", "tôi nghĩ", "toi nghi", "chưa chắc", "chua chac",
        "không hẳn", "khong han"
    ]
    
    # 2. hypothetical_history keywords
    hypothetical_keywords = [
        "nếu", "neu", "giả sử", "gia su", "nếu như", "neu nhu",
        "trong trường hợp", "trong truong hop", "giả định rằng", "gia dinh rang",
        "điều gì xảy ra nếu", "dieu gi xay ra neu", "what if", "theo bạn nghĩ nếu", "theo ban nghi neu",
        "thì sao", "thi sao", "kịch bản", "kich ban", "giả thuyết", "gia thuyet", "giả định", "gia dinh"
    ]
    
    # 3. false_historical_claim keywords
    false_claim_keywords = [
        "không tồn tại", "khong ton tai", "chưa từng", "chua tung", "không hề", "khong he",
        "không có thật", "khong co that", "bịa", "bia", "không xảy ra", "khong xay ra",
        "không phải là", "khong phai la"
    ]
    
    # 4. opinion_analysis keywords
    opinion_keywords = [
        "quan trọng nhất", "quan trong nhat", "lớn nhất", "lon nhat", "sai lầm", "sai lam",
        "vai trò", "vai tro", "ảnh hưởng", "anh huong", "tốt nhất", "tot nhat", "tệ nhất", "te nhat",
        "đánh giá", "danh gia", "nhận định", "nhan dinh", "so sánh", "so sanh", "so với", "so voi",
        "theo bạn", "theo ban", "theo nghĩ", "theo nghi", "nghĩ sao", "nghi sao",
        "nghĩ thế nào", "nghi the nao"
    ]

    # 1. user_challenge (if follow-up)
    if chat_history and len(chat_history) > 0:
        if any(_has_phrase(normalized, kw) for kw in user_challenge_keywords):
            return "user_challenge"
            
    # 2. hypothetical_history
    if any(_has_phrase(normalized, kw) for kw in hypothetical_keywords):
        return "hypothetical_history"
        
    # 3. false_historical_claim
    if any(_has_phrase(normalized, kw) for kw in false_claim_keywords):
        return "false_historical_claim"
        
    # 4. opinion_analysis
    if any(_has_phrase(normalized, kw) for kw in opinion_keywords):
        return "opinion_analysis"
        
    return "factual_history"


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
        has_user_rag = any(doc.metadata.get("is_user_rag") for doc in documents)
        has_global_history = any(doc.metadata.get("is_global_history") for doc in documents)

        for idx, doc in enumerate(documents, start=1):
            source_name = doc.metadata.get("file_name") or doc.metadata.get("source") or "Unknown Source"
            page_num = doc.metadata.get("page")
            page_str = f" (Page {page_num})" if page_num is not None else ""
            
            content = doc.metadata.get("answer") if "answer" in doc.metadata else doc.page_content
            if len(content) > 3000:
                content = content[:3000] + "..."
            
            if doc.metadata.get("is_user_rag"):
                context_list.append(f"Tài liệu [{idx}] - [TRI THỨC/GHI CHÚ RIÊNG CỦA NGƯỜI DÙNG]: {content}")
            elif doc.metadata.get("is_global_history"):
                context_list.append(f"Tài liệu [{idx}] - [TƯ LIỆU LỊCH SỬ CHÍNH THỐNG] ({source_name}): {content}")
            else:
                context_list.append(f"Tài liệu [{idx}] - [TÀI LIỆU HỆ THỐNG] ({source_name}{page_str}): {content}")
        
        context = "\n\n".join(context_list)

        # Phân loại câu hỏi sử dụng classifier tối ưu hóa
        chat_history_raw = state.get("chat_history", [])
        q_type = _classify_history_query_type(state["question"], chat_history_raw, self.llm)
        print(f"[HISTORICAL CLASS] {q_type} for question: {state['question'][:60]!r}")

        instructions = ""
        # If user RAG is present, append comparison instruction to user question
        if has_user_rag:
            instructions += (
                "\n\n*(LƯU Ý QUAN TRỌNG: Bạn hãy đối chiếu và ưu tiên các thông tin trong [TRI THỨC/GHI CHÚ RIÊNG CỦA NGƯỜI DÙNG] "
                "để trả lời theo đúng bối cảnh cá nhân của người dùng. Khi có sự khác biệt giữa quan điểm riêng này "
                "và tư liệu lịch sử chính thống, hãy so sánh một cách mềm mại và tế nhị, ví dụ: 'Theo lịch sử chính thống thì..., "
                "còn trong giả thuyết/bối cảnh bạn đã lưu thì...').*"
            )
            
        if q_type == "factual_history":
            instructions += (
                "\n\n*YÊU CẦU TRẢ LỜI CÂU HỎI SỰ THẬT LỊCH SỬ (FACTUAL HISTORY):\n"
                "1. Trả lời chính xác sự thật lịch sử trực tiếp, rõ ràng, dựa trên các tài liệu RAG chính thống.\n"
                "2. Bắt buộc trích dẫn nguồn (inline citation [i]) cho các thông tin thực tế được nêu ra.\n"
                "3. Ưu tiên cao nhất sự chính xác về mặt lịch sử và tránh suy diễn, dài dòng không cần thiết.*"
            )
        elif q_type == "hypothetical_history":
            instructions += (
                "\n\n*YÊU CẦU TRẢ LỜI CÂU HỎI GIẢ THUYẾT/GIẢ ĐỊNH (HYPOTHETICAL/COUNTERFACTUAL HISTORY):\n"
                "1. Tuyệt đối KHÔNG bác bỏ hay từ chối câu hỏi. Không nói câu hỏi là sai lịch sử hay vô lý. Hãy cùng phân tích các giả định một cách cởi mở, logic và tôn trọng người dùng.\n"
                "2. Bạn BẮT BUỘC phải tuyên bố rõ ràng ở phần đầu câu trả lời rằng đây là một giả thuyết lịch sử, không phải sự kiện được sử liệu xác nhận (ví dụ: 'Đây là một giả thuyết lịch sử, không phải sự kiện được sử liệu xác nhận.').\n"
                "3. Trình bày câu trả lời theo cấu trúc sau:\n"
                "   - Bước 1: Nêu tuyên bố đây là giả thuyết lịch sử.\n"
                "   - Bước 2: Tóm tắt ngắn gọn sự thật lịch sử thực tế về nhân vật/sự kiện được đề cập.\n"
                "   - Bước 3: Đưa ra thông báo: \"Phần giả thuyết dưới đây là suy luận dựa trên bối cảnh lịch sử hiện có.\"\n"
                "   - Bước 4: Phân tích 2 đến 4 khả năng (kịch bản) có thể xảy ra một cách logic và hợp lý dựa trên bối cảnh lịch sử lúc đó.\n"
                "   - Bước 5: Nêu các điểm chưa chắc chắn, rủi ro, và đưa ra kết luận khách quan, cân bằng.\n"
                "4. Sử dụng giọng điệu suy luận khách quan: \"Có thể...\", \"Một khả năng là...\", \"Khó khẳng định chắc chắn...\", \"Dựa trên bối cảnh lúc đó...\", \"Phần này là suy luận dựa trên bối cảnh, không phải kết luận chắc chắn từ sử liệu.\".\n"
                "5. Tuyệt đối KHÔNG sử dụng các từ bác bỏ thô bạo như: \"không phù hợp với lịch sử chính thống\", \"không có cơ sở trong lịch sử\", \"điều này không đúng với lịch sử dân tộc\" (trừ khi người dùng đang phủ nhận thực tế đã được công nhận).\n"
                "6. CHỈ trích dẫn nguồn khi nói về phần sự thật lịch sử đã ghi nhận ở Bước 2. Phần suy luận giả thuyết không trích dẫn tùy tiện nếu tài liệu không nói về giả thuyết đó. Nếu không có nguồn trực tiếp đủ liên quan, ghi rõ: 'Hiện không có nguồn trực tiếp đủ liên quan trong dữ liệu được truy xuất; phần phân tích dưới đây là suy luận dựa trên bối cảnh lịch sử.'*"
            )
        elif q_type == "user_challenge":
            instructions += (
                "\n\n*YÊU CẦU TRẢ LỜI CÂU HỎI KHI NGƯỜI DÙNG PHẢN BÁC/TRANH LUẬN (USER CHALLENGE):\n"
                "1. Tuyệt đối KHÔNG tỏ thái độ tự vệ, phòng thủ hay chỉ lặp lại câu trả lời cũ. Không dùng nguồn tài liệu để ép buộc người dùng phải nghe theo.\n"
                "2. Thừa nhận và tôn trọng luận điểm của người dùng. Hãy tiếp nối phân tích dựa trên hướng suy luận của người dùng như một bài tập tư duy lịch sử.\n"
                "3. Trình bày câu trả lời theo cấu trúc sau:\n"
                "   - Bước 1: Ghi nhận ý kiến người dùng bằng cách mở đầu lịch sự, ví dụ: 'Bạn nói có lý ở góc độ...' hoặc 'Mình hiểu hướng bạn đang đặt ra là...'\n"
                "   - Bước 2: Định hình lại vấn đề: 'Nếu đi theo hướng đó, vấn đề không chỉ là sử liệu ghi gì, mà là giả thuyết đó có khả thi không.'\n"
                "   - Bước 3: Phân tích 2 đến 4 điểm ủng hộ hoặc làm rõ tính hợp lý trong lập luận của người dùng (ví dụ: 'Nếu giả sử điều bạn nói đúng, thì...', 'Theo hướng bạn đang đặt ra...', 'Ta thử xét kịch bản này...').\n"
                "   - Bước 4: Nêu rõ 1 đến 3 điểm hạn chế, rủi ro hoặc phản điểm từ góc độ lịch sử thực tế lúc đó.\n"
                "   - Bước 5: Đưa ra kết luận khách quan, đa chiều và cởi mở, không mang tính phân định thắng thua.\n"
                "4. Phân định rõ ràng giữa: Sự thật lịch sử đã được chứng minh, diễn giải lịch sử hợp lý, và suy diễn chưa chắc chắn.*"
            )
        elif q_type == "false_historical_claim":
            instructions += (
                "\n\n*YÊU CẦU ĐỐI VỚI KHẲNG ĐỊNH SAI LỆCH SỰ THẬT LỊCH SỬ (FALSE HISTORICAL CLAIM):\n"
                "1. Bạn phải đính chính một cách lịch sự, ôn hòa và tôn trọng người dùng. Tuyệt đối không tấn công hay chỉ trích người dùng.\n"
                "2. Sử dụng chứng cứ từ các nguồn tư liệu lịch sử chính thống có trong Ngữ cảnh (RAG) để giải thích rõ sự thật lịch sử được ghi chép lại là gì.\n"
                "3. Giọng điệu khách quan, mang tính chia sẻ kiến thức giáo dục khoa học, giải thích rõ ràng những gì sử liệu chỉ ra.*"
            )
        elif q_type == "opinion_analysis":
            instructions += (
                "\n\n*YÊU CẦU TRẢ LỜI CÂU HỎI NHẬN ĐỊNH, ĐÁNH GIÁ (OPINION ANALYSIS):\n"
                "1. Tuyên bố rõ đây là một câu hỏi mang tính nhận định, diễn giải lịch sử và kết quả phụ thuộc vào tiêu chí đánh giá.\n"
                "2. Trình bày nhiều quan điểm, cách giải thích hợp lý khác nhau từ các góc độ lịch sử.\n"
                "3. Giải thích các tiêu chí so sánh/đánh giá một cách rõ ràng.\n"
                "4. Sử dụng nguồn tài liệu trong ngữ cảnh làm thông tin nền hỗ trợ phân tích, không khẳng định một quan điểm chủ quan nào là chân lý duy nhất.*"
            )

        instructions += (
            "\n\n*QUY TẮC CHUNG VỀ TRÍCH DẪN & CHẤT LƯỢNG NGUỒN:\n"
            "- Chỉ trích dẫn các tài liệu thực sự liên quan trực tiếp đến nhân vật, sự kiện, triều đại hoặc bối cảnh lịch sử được đề cập trong câu hỏi.\n"
            "- Tuyệt đối KHÔNG trích dẫn các nguồn tài liệu thuộc thời kỳ khác hoặc các cuộc kháng chiến không liên quan chỉ để tăng số lượng trích dẫn (ví dụ: Trả lời về Hai Bà Trưng thì không được trích dẫn tư liệu về Chiến tranh chống Mỹ hay Điện Biên Phủ).*"
        )

        instructions += (
            "\n\n*YÊU CẦU TRÌNH BÀY CHUNG:\n"
            "1. Luôn trả lời ngắn gọn, trực diện, bám sát câu hỏi và intent của người dùng.\n"
            "2. Tránh kể lan man dài dòng không cần thiết.*"
        )
        question = question + instructions

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
            "không thể trả lời", "tôi là chatbot lịch sử việt nam, tôi chỉ hỗ trợ các câu hỏi liên quan đến lịch sử việt nam",
            "không được tìm thấy", "chưa tìm thấy", "chưa được tìm thấy",
            "không thấy", "chưa được đề cập", "chưa đề cập", "không có trong các tài liệu"
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
        q_mode = _classify_history_query_type(raw_question, chat_history, self.llm)
        is_followup = is_followup_request(raw_question)
        
        if q_mode in ("user_challenge", "hypothetical_history", "false_historical_claim", "opinion_analysis") or is_followup:
            intent = "factual"
            print(f"[INTENT OVERRIDE] {q_mode} (followup: {is_followup}) → intent forced to 'factual' to prevent early exit")
        else:
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

        # 3. ENTITY DETECTION + FOLLOW-UP REWRITE
        # ─────────────────────────────────────────
        from chatbot.utils.viet_history_entities import detect_entity_from_text, VIET_HISTORY_ENTITIES
        entity_key, entity_info = detect_entity_from_text(raw_question)

        # Nếu không detect được entity trực tiếp → lấy từ history hoặc state
        last_entity_key_hist, last_entity_display_hist = extract_last_entity_from_history(chat_history)
        if not entity_key:
            entity_key = state.get("last_main_entity") or last_entity_key_hist or None

        entity_display = None
        if entity_info:
            entity_display = entity_info["display"]
        elif entity_key and entity_key in VIET_HISTORY_ENTITIES:
            entity_display = VIET_HISTORY_ENTITIES[entity_key]["display"]
        elif state.get("last_main_entity_display"):
            entity_display = state.get("last_main_entity_display")
        else:
            entity_display = last_entity_display_hist

        # Rewrite follow-up nếu cần (không có entity mới, câu ngắn)
        if is_followup_request(raw_question) and entity_display:
            raw_question = rewrite_followup_with_entity(raw_question, entity_display)
            print(f"[FOLLOWUP REWRITTEN] new question: {raw_question!r}")
        elif entity_key:
            print(f"[ENTITY] Detected: {entity_key} | Display: {entity_display}")

        # Detailed intent
        detailed_intent = detect_detailed_intent(raw_question)
        print(f"[DETAILED INTENT] {detailed_intent}")

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

        # 0. SEARCH USER RAG FAISS (similarity search top-k=5)
        user_id = state.get("user_id")
        if user_id:
            user_rag_path = os.path.join("utils", "data_vector_new", f"user_rag_{user_id}", self.embedding_model_name)
            if os.path.exists(user_rag_path) and os.path.exists(os.path.join(user_rag_path, "index.faiss")):
                try:
                    user_retriever = Retriever(embedding_model_name=self.embedding_model_name)
                    user_faiss = user_retriever._load_faiss(user_rag_path)
                    raw_user_docs = user_faiss.similarity_search(question, k=5)
                    user_docs = []
                    for idx, doc in enumerate(raw_user_docs):
                        doc.metadata["is_user_rag"] = True
                        doc.metadata["source"] = "Ghi chú cá nhân"
                        doc.metadata["original_rank"] = idx
                        user_docs.append(doc)
                    if user_docs:
                        print(f"--- [USER RAG] Found {len(user_docs)} docs for user_id={user_id}")
                        all_pool.extend(user_docs)
                except Exception as e:
                    print(f"⚠️ [USER RAG] Search error for user_id={user_id}: {e}")

        # 0.5. SEARCH GLOBAL HISTORY FAISS (similarity search top-k=8)
        base_path = self.path_vector_store
        if base_path.endswith("vertex") or base_path.endswith("openai"):
            base_path = os.path.dirname(base_path)
            
        global_hist_path = os.path.join(base_path, "global_history", self.embedding_model_name)
        if os.path.exists(global_hist_path) and os.path.exists(os.path.join(global_hist_path, "index.faiss")):
            try:
                global_hist_retriever = Retriever(embedding_model_name=self.embedding_model_name)
                global_hist_faiss = global_hist_retriever._load_faiss(global_hist_path)
                raw_global_docs = global_hist_faiss.similarity_search(question, k=8)
                global_docs = []
                for idx, doc in enumerate(raw_global_docs):
                    doc.metadata["is_global_history"] = True
                    if "source" not in doc.metadata:
                        doc.metadata["source"] = doc.metadata.get("file_name") or "Global History"
                    doc.metadata["original_rank"] = idx
                    global_docs.append(doc)
                if global_docs:
                    print(f"--- [GLOBAL HISTORY RAG] Found {len(global_docs)} docs")
                    all_pool.extend(global_docs)
            except Exception as e:
                print(f"⚠️ [GLOBAL HISTORY RAG] Search warning: {e}")
        else:
            print(f"⚠️ [GLOBAL HISTORY RAG] Index not found at {global_hist_path}. Skipping.")
        
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
                            for idx, doc in enumerate(docs_e):
                                doc.metadata["original_rank"] = idx
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
                for idx, doc in enumerate(docs_v):
                    doc.metadata["original_rank"] = idx
                all_pool.extend(docs_v)
            except Exception as e:
                print(f"⚠️ Vertex search error: {e}")

        # 2. NHÁNH OPENAI (100k+ vectors cũ)
        path_openai = os.path.join(base_path, "openai")
        if self.search_openai_legacy_index and os.path.exists(path_openai):
            try:
                retriever_o = Retriever(embedding_model_name="openai").set_retriever(path_vector_store=path_openai)
                docs_o = retriever_o.get_documents(query=question, num_doc=self.vector_docs_k)
                for idx, doc in enumerate(docs_o):
                    doc.metadata["original_rank"] = idx
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

        # ===== ADAPTIVE RE-RANKING (with entity-aware scoring) =====
        ar = AdaptiveRetriever()
        reranked_docs, score_summary = ar.rerank(
            query=question,
            docs=pool,
            intent=intent,
            entity_key=entity_key,   # ← entity-aware bonus/penalty
        )

        # ===== PRIORITY SORTING: User RAG > Global History RAG > Base/PDF RAG =====
        def get_priority_score(doc):
            if doc.metadata.get("is_user_rag"):
                return 0
            if doc.metadata.get("is_global_history"):
                return 1
            source = doc.metadata.get("file_name") or doc.metadata.get("source") or ""
            has_page = doc.metadata.get("page") is not None or doc.metadata.get("page_number") is not None
            if source.lower().endswith('.pdf') or has_page:
                return 2
            return 3

        reranked_docs.sort(key=get_priority_score)

        # ===== ENTITY-AWARE DOC FILTER =====
        # Soft filter: nếu có entity rõ ràng, đẩy doc lạc chủ đề xuống cuối
        if entity_key:
            reranked_docs = filter_docs_by_entity(reranked_docs, entity_key, strict=False)

        # ===== DEBUG LOG =====
        print("===== FINAL DOCUMENTS AFTER RERANK (PRIORITY ORDER) =====")
        print("Total:", len(reranked_docs))
        for d in reranked_docs[:5]:
            source = d.metadata.get("file_name") or d.metadata.get("source") or "unknown"
            is_user = d.metadata.get("is_user_rag", False)
            is_global = d.metadata.get("is_global_history", False)
            print(f"- {source} (user: {is_user}, global: {is_global})")

        result = {
            "documents": reranked_docs,
            "question":  raw_question,
            "intent":    intent,
            "scores":    score_summary,
            # Entity tracking — propagate qua generate + handle_no_answer
            "main_entity":              entity_key or "",
            "main_entity_display":      entity_display or "",
            "detailed_intent":          detailed_intent,
            "last_main_entity":         entity_key or state.get("last_main_entity", ""),
            "last_main_entity_display": entity_display or state.get("last_main_entity_display", ""),
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

        entity_key = state.get("main_entity")

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

        def doc_matches_either(query: str, doc, ent_key: str | None) -> bool:
            if fast_doc_matches(query, doc):
                return True
            if ent_key:
                try:
                    from chatbot.utils.viet_history_entities import entity_score_for_doc
                    content = doc.metadata.get("answer") if "answer" in doc.metadata else doc.page_content
                    meta_text = (
                        str(doc.metadata.get("file_name", "")) + " " +
                        str(doc.metadata.get("source", ""))
                    )
                    score = entity_score_for_doc(meta_text + " " + str(content), ent_key)
                    if score > 0:
                        print(f"   [ENTITY KEEP] Kept '{doc.metadata.get('file_name') or doc.metadata.get('source')}' because relevant to entity '{ent_key}' (score={score})")
                        return True
                except Exception as ex:
                    print(f"⚠️ Error checking entity relevance in grading: {ex}")
            return False

        if not self.use_llm_document_grader:
            for doc in documents:
                if doc.metadata.get("is_user_rag"):
                    if doc_matches_either(question, doc, entity_key):
                        relevant_docs.append(doc)
                    else:
                        print(f"   [FAST FILTERED] Off-topic user note: {doc.metadata.get('source')}")
                    continue
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

                if doc_matches_either(question, doc, entity_key):
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
            elif entity_key:
                try:
                    from chatbot.utils.viet_history_entities import entity_score_for_doc
                    content = doc.metadata.get("answer") if "answer" in doc.metadata else doc.page_content
                    meta_text = (
                        str(doc.metadata.get("file_name", "")) + " " +
                        str(doc.metadata.get("source", ""))
                    )
                    score = entity_score_for_doc(meta_text + " " + str(content), entity_key)
                    if score > 0:
                        print(f"   [ENTITY KEEP (LLM)] Kept '{doc.metadata.get('file_name') or doc.metadata.get('source')}' because relevant to entity '{entity_key}' (score={score})")
                        relevant_docs.append(doc)
                    else:
                        source = doc.metadata.get("file_name") or doc.metadata.get("source") or "unknown"
                        print(f"   [FILTERED] Irrelevant source: {source}")
                except Exception as ex:
                    print(f"⚠️ Error checking entity relevance in LLM grading: {ex}")
                    source = doc.metadata.get("file_name") or doc.metadata.get("source") or "unknown"
                    print(f"   [FILTERED] Irrelevant source: {source}")
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
