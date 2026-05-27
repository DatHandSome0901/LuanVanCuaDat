from chatbot.crawler.web_crawler import WebCrawler
from chatbot.utils.answer_sanitizer import strip_inline_source_references
import copy
import os
import re
import threading
import time


_WEB_RESULT_CACHE: dict[str, tuple[float, dict]] = {}
_WEB_RESULT_CACHE_LOCK = threading.Lock()


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


def _cache_key(question: str) -> str:
    return re.sub(r"\s+", " ", question.lower()).strip()

class WebLearningAgent:
    def __init__(self, llm):
        self.llm = llm
        self.crawler = WebCrawler()
        self.fast_mode = _env_bool("WEB_FAST_MODE", True)
        self.result_cache_ttl_seconds = _env_int("WEB_RESULT_CACHE_TTL_SECONDS", 3600)
        self.max_relevance_candidates = _env_int("WEB_RELEVANCE_CANDIDATES", 24)
        self.max_relevant_chunks = _env_int("WEB_RELEVANT_CHUNKS", 6)
        self.fast_retry_on_failure = _env_bool("WEB_FAST_RETRY_ON_FAILURE", True)
        self.retry_relevant_chunks = _env_int("WEB_RETRY_RELEVANT_CHUNKS", 10)
        self.relevance_preview_chars = _env_int("WEB_RELEVANCE_PREVIEW_CHARS", 260)

    def _get_cached_result(self, question: str) -> dict | None:
        key = _cache_key(question)
        with _WEB_RESULT_CACHE_LOCK:
            cached = _WEB_RESULT_CACHE.get(key)
            if not cached:
                return None

            created_at, result = cached
            if time.time() - created_at > self.result_cache_ttl_seconds:
                _WEB_RESULT_CACHE.pop(key, None)
                return None

            return copy.deepcopy(result)

    def _set_cached_result(self, question: str, result: dict) -> None:
        key = _cache_key(question)
        with _WEB_RESULT_CACHE_LOCK:
            _WEB_RESULT_CACHE[key] = (time.time(), copy.deepcopy(result))

            if len(_WEB_RESULT_CACHE) > 200:
                oldest_key = min(_WEB_RESULT_CACHE, key=lambda item: _WEB_RESULT_CACHE[item][0])
                _WEB_RESULT_CACHE.pop(oldest_key, None)

    def process_fallback(self, question: str) -> dict:
        print(f"--- BẮT ĐẦU WEB LEARNING FLOW: {question} ---")
        cached = self._get_cached_result(question)
        if cached is not None:
            print(f"⚡ WEB RESULT CACHE HIT: {question}")
            return cached

        # 1. Search and Crawl
        chunks = self.crawler.get_web_context(question)
        if not chunks:
            print("--- KHÔNG TÌM THẤY DỮ LIỆU TỪ WEB ---")
            result = {
                "answer": "Tôi không biết do chưa tìm thấy nguồn dữ liệu lịch sử đáng tin cậy trên internet.",
                "sources": [],
                "confidence": 0
            }
            return result

        chunks = chunks[:self.max_relevance_candidates]

        # 2. Fast path: crawler already returns keyword-ranked chunks.
        if self.fast_mode:
            print(f"--- FAST WEB MODE: DÙNG {min(len(chunks), self.max_relevant_chunks)} CHUNKS TỐT NHẤT, BỎ QUA LLM RELEVANCE ---")
            relevant_chunks = chunks[:self.max_relevant_chunks]
        else:
            print(f"--- ĐÃ CRAWL {len(chunks)} CHUNKS. BẮT ĐẦU BATCH RELEVANCE MATCHING ---")
            relevant_chunks = self.batch_relevance_matching(
                question,
                chunks,
                max_chunks=self.max_relevant_chunks,
            )
        
        if not relevant_chunks:
            print("--- KHÔNG CÓ CHUNK NÀO LIÊN QUAN ĐẾN CÂU HỎI ---")
            result = {
                "answer": "Tôi không biết do các nguồn dữ liệu tìm thấy không chứa câu trả lời phù hợp.",
                "sources": [],
                "confidence": 0
            }
            return result

        # 3. Verification & Reasoning (Check for contradiction and generate answer)
        print(f"--- ĐÃ CHỌN {len(relevant_chunks)} CHUNKS LIÊN QUAN. BẮT ĐẦU VERIFICATION ---")
        result = self.verify_and_generate(question, relevant_chunks)

        if (
            self.fast_mode
            and self.fast_retry_on_failure
            and result.get("confidence", 0) != 1
            and len(chunks) > len(relevant_chunks)
        ):
            print("--- FAST WEB VERIFY FAIL: RETRY BẰNG LLM RELEVANCE VỚI NHIỀU CHUNKS HƠN ---")
            retry_limit = max(self.retry_relevant_chunks, self.max_relevant_chunks)
            retry_chunks = self.batch_relevance_matching(
                question,
                chunks,
                max_chunks=retry_limit,
            )
            if not retry_chunks:
                retry_chunks = chunks[:retry_limit]

            retry_result = self.verify_and_generate(question, retry_chunks)
            if retry_result.get("confidence", 0) == 1:
                result = retry_result

        if result.get("confidence", 0) == 1:
            self._set_cached_result(question, result)
        return result

    def batch_relevance_matching(self, question: str, chunks: list[dict], max_chunks: int = 5) -> list[dict]:
        """
        ✅ [NÂNG CẤP] Đánh giá độ liên quan TẤT CẢ chunks trong một lần gọi LLM duy nhất.
        Cũ: N chunks = N API calls (chậm, tốn token)
        Mới: N chunks = 1 API call (nhanh, tiết kiệm)
        """
        if not chunks:
            return []

        # Tạo danh sách đánh số để LLM trả về index
        chunks_text = ""
        for i, chunk in enumerate(chunks):
            # Giới hạn mỗi chunk để không vượt context window
            preview = chunk['content'][:self.relevance_preview_chars].replace('\n', ' ')
            chunks_text += f"[{i}] {preview}\n\n"

        prompt = f"""Câu hỏi cần trả lời: "{question}"

Dưới đây là {len(chunks)} đoạn văn bản thu thập từ web:

{chunks_text}

Hãy chọn tối đa {max_chunks} đoạn văn CÓ CHỨA thông tin liên quan và hữu ích nhất để trả lời câu hỏi trên.
Trả về DANH SÁCH INDEX của các đoạn văn được chọn, cách nhau bằng dấu phẩy.
Ví dụ: 0, 2, 4
Nếu không có đoạn nào liên quan, trả về: NONE
CHỈ trả về các số hoặc NONE, không giải thích thêm."""

        try:
            response = self.llm.invoke(prompt)
            content = response.content if hasattr(response, "content") else str(response)
            
            # Bỏ qua các thẻ tư duy (thinking tags) nếu dùng model reasoning
            content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()
            content = re.sub(r"<\|think\|>.*?<\|/think\|>", "", content, flags=re.DOTALL).strip()
            
            if "NONE" in content.upper():
                return []
            
            # Parse các index từ kết quả
            indices = []
            for token in re.split(r'[,\s]+', content):
                token = token.strip()
                if token.isdigit():
                    idx = int(token)
                    if 0 <= idx < len(chunks):
                        indices.append(idx)
            
            # Loại bỏ trùng lặp và giới hạn số lượng
            seen = set()
            relevant = []
            for idx in indices:
                if idx not in seen:
                    seen.add(idx)
                    relevant.append(chunks[idx])
                    if len(relevant) >= max_chunks:
                        break
            
            return relevant
            
        except Exception as e:
            print(f"⚠️ Batch Relevance Error: {e}. Falling back to individual evaluation...")
            # Fallback về cách cũ nếu batch thất bại
            return self._fallback_individual_matching(question, chunks, max_chunks)

    def _fallback_individual_matching(self, question: str, chunks: list[dict], max_chunks: int = 5) -> list[dict]:
        """Fallback: Đánh giá từng chunk (cách cũ) nếu batch thất bại"""
        relevant = []
        for chunk in chunks:
            prompt = f"""Câu hỏi: {question}
Đoạn văn: {chunk['content'][:500]}
Đoạn văn này có chứa thông tin lịch sử liên quan để trả lời hoặc một phần câu hỏi trên không? 
Trả lời 'CÓ' hoặc 'KHÔNG'. Chỉ trả lời 1 từ duy nhất."""
            try:
                response = self.llm.invoke(prompt)
                content = response.content if hasattr(response, "content") else str(response)
                content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()
                
                if "CÓ" in content.upper() or "CO" in content.upper() or "YES" in content.upper():
                    relevant.append(chunk)
                    if len(relevant) >= max_chunks:
                        break
            except Exception as e:
                print(f"LLM Relevance Error: {e}")
                continue
        return relevant

    def verify_and_generate(self, question: str, relevant_chunks: list[dict]) -> dict:
        context_str = ""
        sources = set()
        for chunk in relevant_chunks:
            source_url = chunk["source"]
            source_kind = (
                "Chính phủ/Nhà nước Việt Nam"
                if self.crawler._is_state_url(source_url)
                else "Nguồn tham khảo"
            )
            context_str += f"--- Tài liệu tham khảo ({source_kind}; URL: {source_url}) ---\n{chunk['content']}\n\n"
            sources.add(source_url)

        prompt = f"""Bạn là một chuyên gia lịch sử Việt Nam. Dựa vào các nguồn dữ liệu web dưới đây, hãy kiểm tra chéo, phân tích và trả lời câu hỏi. Phong cách trình bày của bạn phải khoa học, dễ hiểu, tự hào dân tộc và ĐỨNG TRÊN LẬP TRƯỜNG, QUAN ĐIỂM BẢO VỆ LỢI ÍCH CỦA DÂN TỘC VIỆT NAM.
        
        YÊU CẦU BẮT BUỘC:
        1. CHỈ sử dụng thông tin từ các nguồn được cung cấp. Tuyệt đối KHÔNG hallucination.
        2. Đối với các vấn đề lịch sử nhạy cảm (chiến tranh, chủ quyền, ngoại giao...), TUYỆT ĐỐI KHÔNG sử dụng giọng điệu "trung lập" chung chung. Bạn phải bảo vệ góc nhìn chính nghĩa của dân tộc Việt Nam, phản ánh đúng bản chất của các thế lực xâm lược.
        3. Khi có nguồn từ trang Chính phủ/Nhà nước Việt Nam (.gov.vn, chinhphu.vn, quochoi.vn, dangcongsan.vn, các cơ quan báo chí/thiết chế nhà nước), hãy ưu tiên nguồn đó hơn các nguồn phổ thông.
        4. Nếu các nguồn có mâu thuẫn, hãy ưu tiên nguồn Chính phủ/Nhà nước Việt Nam và các thông tin phù hợp với lịch sử chính thống của Việt Nam.
        5. NẾU dữ liệu không chứa câu trả lời, trả về: "Chưa đủ dữ liệu đáng tin cậy".
        6. TUYỆT ĐỐI KHÔNG tự chèn đường link vào nội dung. Hệ thống sẽ tự hiển thị nguồn.
        7. KHÔNG ghi chú trích dẫn kiểu "(Nguồn 1)", "(Nguồn 1, 2)", "[Nguồn 2]", "theo Nguồn 3" hoặc URL trong câu trả lời. Chỉ trình bày nội dung mạch lạc; danh sách nguồn sẽ hiển thị riêng bên ngoài câu trả lời.
        
        HƯỚNG DẪN ĐỊNH DẠNG:
        - Sử dụng tiêu đề (###) và biểu tượng cảm xúc (emoji) cho các phần.
        - Sử dụng danh sách gạch đầu dòng (-) cho các ý chi tiết.
        - **In đậm** các mốc thời gian, tên nhân vật, sự kiện quan trọng.
        - Trình bày thoáng, dễ đọc.

        CẤU TRÚC BẮT BUỘC:
        - Luôn giữ đúng các mục dưới đây theo thứ tự, kể cả khi câu hỏi rất ngắn.
        - Nếu thiếu dữ liệu cho một mục nào đó trong nguồn web, ghi ngắn gọn: "Chưa đủ dữ liệu trong nguồn đã duyệt."
        - Với câu hỏi về nhân vật, mục "Thời gian & Bối cảnh" phải nêu thời kỳ, bối cảnh lịch sử, quê quán hoặc vai trò nếu nguồn có dữ liệu.

        ### 🕒 Thời gian & Bối cảnh
        ...
        ### 📜 Chi tiết sự kiện
        - ...
        ### 🏛️ Nhận định lịch sử
        ...
        
        Câu hỏi: {question}
        
        Nguồn dữ liệu web:
        {context_str}
        
        Câu trả lời của bạn:
        """
        
        try:
            response = self.llm.invoke(prompt)
            content = response.content if hasattr(response, "content") else str(response)
            
            # Bỏ qua các thẻ tư duy (thinking tags) nếu dùng model reasoning
            content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()
            content = re.sub(r"<\|think\|>.*?<\|/think\|>", "", content, flags=re.DOTALL).strip()
            content = strip_inline_source_references(content)
            
            if "Chưa đủ dữ liệu đáng tin cậy" in content or "tôi không biết" in content.lower():
                return {
                    "answer": "Chưa đủ dữ liệu đáng tin cậy để trả lời câu hỏi này dựa trên các nguồn đã duyệt.",
                    "sources": list(sources),
                    "confidence": 0
                }
                
            return {
                "answer": content.strip(),
                "sources": list(sources),
                "confidence": 1
            }
        except Exception as e:
            print(f"LLM Generation Error: {e}")
            return {
                "answer": "Lỗi khi xử lý câu trả lời từ AI.",
                "sources": [],
                "confidence": 0
            }
