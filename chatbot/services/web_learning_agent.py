from chatbot.crawler.web_crawler import WebCrawler
from chatbot.utils.answer_sanitizer import strip_inline_source_references
import copy
import os
import re
import threading
import time
import unicodedata
from chatbot.utils.viet_history_entities import VIET_HISTORY_ENTITIES

def _normalize_text(text: str) -> str:
    text = (text or "").replace("Đ", "D").replace("đ", "d")
    text = unicodedata.normalize("NFD", text.lower())
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = re.sub(r"[^a-z0-9\s]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()

def _generate_rule_based_queries(question: str) -> list[str]:
    normalized = _normalize_text(question)
    matched_entity_key = None
    for key, info in VIET_HISTORY_ENTITIES.items():
        # Check aliases
        for alias in info["aliases"]:
            norm_alias = _normalize_text(alias)
            if norm_alias in normalized:
                matched_entity_key = key
                break
        if matched_entity_key:
            break

    if not matched_entity_key:
        return []

    entity_info = VIET_HISTORY_ENTITIES[matched_entity_key]
    entity_name = entity_info["display"]
    queries = []
    death_keywords = ["chet", "mat", "hy sinh", "tuan tiet", "qua doi", "lam chung", "tu tran"]
    if any(kw in normalized for kw in death_keywords):
        queries.append(f"{entity_name} mất năm nào")
        queries.append(f"{entity_name} hy sinh")
        queries.append(f"{entity_name} site:baotanglichsu.vn")
        queries.append(f"{entity_name} site:viensuhoc.vass.gov.vn")
        queries.append(f"{entity_name} site:btlsqsvn.mod.gov.vn")
    else:
        queries.append(f"{entity_name}")
        queries.append(f"{entity_name} site:baotanglichsu.vn")
        queries.append(f"{entity_name} site:viensuhoc.vass.gov.vn")
    return queries

def _get_rule_based_keywords(question: str) -> list[str]:
    normalized = _normalize_text(question)
    matched_key = None
    for key, info in VIET_HISTORY_ENTITIES.items():
        for alias in info["aliases"]:
            norm_alias = _normalize_text(alias)
            if norm_alias in normalized:
                matched_key = key
                break
        if matched_key:
            break

    if matched_key:
        info = VIET_HISTORY_ENTITIES[matched_key]
        aliases = [a.lower() for a in info["aliases"]]
        related = [r.lower() for r in info.get("related_keywords", [])]
        return aliases + related
    return []



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

    def _get_core_keywords(self, question: str) -> list[str]:
        # Try rule-based first
        keywords = _get_rule_based_keywords(question)
        if keywords:
            print(f"[KEYWORDS] Rule-based core keywords found: {keywords}")
            return keywords
            
        # Fallback to LLM
        print("[KEYWORDS] Rule-based failed. Falling back to LLM...")
        filter_prompt = f"""Dựa vào câu hỏi của người dùng: "{question}"
Hãy liệt kê 5-10 từ khóa cốt lõi (tên nhân vật, sự kiện, địa danh, mốc thời gian hoặc hành động liên quan trực tiếp như: mất, hy sinh, sinh, trận đánh,...) bắt buộc phải xuất hiện ít nhất một từ trong tài liệu tham khảo để câu hỏi có thể được trả lời đúng.
Trả về các từ khóa cách nhau bằng dấu phẩy.
Ví dụ câu hỏi: "Hai Bà Trưng chết rồi đúng không"
Trả về: Hai Bà Trưng, Trưng Trắc, Trưng Nhị, Mã Viện, năm 43, hy sinh, mất, tuẫn tiết

Trả về đúng danh sách từ khóa, không giải thích gì thêm."""
        try:
            response = self.llm.invoke(filter_prompt)
            keywords_str = response.content if hasattr(response, "content") else str(response)
            keywords_str = re.sub(r"<think>.*?</think>", "", keywords_str, flags=re.DOTALL).strip()
            keywords = [k.strip().lower() for k in keywords_str.split(",") if k.strip()]
            return keywords
        except Exception as e:
            print(f"Error getting keywords from LLM: {e}")
            return [w for w in question.lower().split() if len(w) > 2]

    def filter_irrelevant_chunks(self, chunks: list[dict], core_keywords: list[str]) -> list[dict]:
        # 1. Identify URL and text spam patterns (laws, elections, administration)
        administrative_patterns = [
            r"nghi-dinh", r"thong-tu", r"luat-", r"van-ban-phap-luat",
            r"bau-cu", r"bieu-mau", r"hanh-chinh", r"tuyen-dung", r"quyet-dinh",
            r"van-ban-quy-pham", r"luat\d+", r"phap-lenh", r"nghi-quyet"
        ]
        content_spam_patterns = [
            r"Hiệu lực thi hành", r"Nghị định này", r"Bộ luật này", r"Luật số\b",
            r"\bĐiều \d+\.", r"Ủy ban bầu cử", r"quyết định số\b", r"văn bản pháp luật",
            r"phiếu bầu", r"cử tri", r"biểu mẫu", r"thủ tục hành chính", r"luật hiện hành",
            r"luật số \d+", r"luật năm \d+", r"bầu cử đại biểu"
        ]
        
        filtered = []
        for chunk in chunks:
            url = chunk.get("source", "").lower()
            content = chunk.get("content", "")
            
            # Filter based on URL pattern
            if any(re.search(pat, url) for pat in administrative_patterns):
                continue
                
            # Filter based on content pattern
            if any(re.search(pat, content, re.IGNORECASE) for pat in content_spam_patterns):
                continue
                
            filtered.append(chunk)
            
        if not core_keywords:
            return filtered
            
        # Check if chunk contains at least one core keyword/alias
        final_filtered = []
        for chunk in filtered:
            norm_content = _normalize_text(chunk["content"])
            has_keyword = False
            for kw in core_keywords:
                norm_kw = _normalize_text(kw)
                if len(norm_kw) < 4:
                    pattern = rf"\b{re.escape(norm_kw)}\b"
                    if re.search(pattern, norm_content):
                        has_keyword = True
                        break
                else:
                    if norm_kw in norm_content:
                        has_keyword = True
                        break
            if has_keyword:
                final_filtered.append(chunk)
                
        print(f"[FILTER] Chunks count: raw={len(chunks)}, after spam filter={len(filtered)}, after keyword filter={len(final_filtered)}")
        return final_filtered

    def process_fallback(self, question: str) -> dict:
        print(f"--- BẮT ĐẦU WEB LEARNING FLOW: {question} ---")
        cached = self._get_cached_result(question)
        if cached is not None:
            print(f"⚡ WEB RESULT CACHE HIT: {question}")
            return cached

        # 1. Generate search queries (rule-based first)
        queries = _generate_rule_based_queries(question)
        if not queries:
            print("[QUERY REWRITE] Rule-based rewrite failed. Falling back to LLM...")
            # LLM rewrite fallback
            rewrite_prompt = f"""Bạn là một chuyên gia lịch sử Việt Nam. Hãy phân tích câu hỏi của người dùng và tạo ra đúng 3 truy vấn tìm kiếm ngắn gọn, hiệu quả nhất bằng tiếng Việt để tìm tài liệu lịch sử chính thống về nhân vật hoặc sự kiện này.
Mỗi truy vấn tìm kiếm cần nhắm đến sự thật lịch sử hoặc thêm các từ khóa hữu ích (ví dụ: "mất năm nào", "hy sinh", "tiểu sử", "bối cảnh", "sự nghiệp").
Ví dụ câu hỏi: "Hai Bà Trưng chết rồi đúng không"
Truy vấn gợi ý:
Hai Bà Trưng mất năm nào
Hai Bà Trưng hy sinh năm 43
Hai Bà Trưng cuộc khởi nghĩa Mã Viện

Câu hỏi người dùng: "{question}"

YÊU CẦU:
- Chỉ trả về đúng 3 truy vấn khác nhau, mỗi truy vấn một dòng.
- Không đánh số thứ tự, không kèm giải thích hay ký tự đặc biệt."""
            try:
                response = self.llm.invoke(rewrite_prompt)
                content = response.content if hasattr(response, "content") else str(response)
                content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()
                queries = [q.strip() for q in content.split("\n") if q.strip()]
                queries = [q.lstrip("1234567890.-* ") for q in queries][:3]
            except Exception as e:
                print(f"Error rewriting query via LLM: {e}")
                queries = [question]
        else:
            print(f"[QUERY REWRITE] Generated rule-based queries: {queries}")
            
        # Search & Crawl for all queries
        raw_chunks = []
        seen_contents = set()
        for q in queries:
            c_list = self.crawler.get_web_context(q)
            for c in c_list:
                norm_c = re.sub(r"\s+", " ", c["content"].lower()).strip()
                if norm_c not in seen_contents:
                    seen_contents.add(norm_c)
                    raw_chunks.append(c)
                    
        # Apply spam and keyword filter
        core_keywords = self._get_core_keywords(question)
        chunks = self.filter_irrelevant_chunks(raw_chunks, core_keywords)
        
        if not chunks:
            print("--- KHÔNG TÌM THẤY DỮ LIỆU TỪ WEB SAU KHI LỌC ---")
            result = {
                "answer": "Tôi không biết do chưa tìm thấy nguồn dữ liệu lịch sử đáng tin cậy trên internet.",
                "sources": [],
                "confidence": 0
            }
            return result

        chunks = chunks[:self.max_relevance_candidates]

        # Determine if we should bypass fast mode:
        # 1. If it's a short question (<= 12 words) and looks like it's about history.
        # 2. Or if the top chunks do not contain any of the core keywords.
        bypass_fast_mode = False
        if len(question.split()) <= 12:
            print("--- SHORT QUESTION DETECTED: BYPASSING FAST MODE TO RUN RELEVANCE MATCHING ---")
            bypass_fast_mode = True
        else:
            # Check if top chunks contain keywords
            top_chunks_text = " ".join([c["content"].lower() for c in chunks[:3]])
            if core_keywords and not any(k in top_chunks_text for k in core_keywords):
                print("--- KEYWORDS NOT FOUND IN TOP CHUNKS: BYPASSING FAST MODE ---")
                bypass_fast_mode = True
                
        is_fast_run = self.fast_mode and not bypass_fast_mode

        # 2. Relevance assessment
        if is_fast_run:
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
            is_fast_run
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
        sources_ordered = []
        for chunk in relevant_chunks:
            u = chunk["source"]
            if u not in sources_ordered:
                sources_ordered.append(u)

        context_str = ""
        for chunk in relevant_chunks:
            source_url = chunk["source"]
            source_idx = sources_ordered.index(source_url) + 1
            source_kind = (
                "Chính phủ/Nhà nước Việt Nam"
                if self.crawler._is_state_url(source_url)
                else "Nguồn tham khảo"
            )
            context_str += f"Tài liệu [{source_idx}] (Nguồn: {source_kind}; URL: {source_url}):\n{chunk['content']}\n\n"

        prompt = f"""Bạn là một chatbot chuyên gia về lịch sử Việt Nam (biệt danh Sử Gia Lạc Việt). Phong cách của bạn là một nhà phân tích lịch sử khách quan, yêu nước nhưng không tuyên truyền cứng nhắc, tôn kính các anh hùng dân tộc, đồng thời luôn cởi mở, tôn trọng các góc nhìn khoa học và thảo luận đa chiều với người dùng.
        
        YÊU CẦU BẮT BUỘC:
        1. CHỈ sử dụng thông tin từ các nguồn được cung cấp. Tuyệt đối KHÔNG tự bịa đặt thông tin.
        2. Hãy luôn phản hồi cởi mở và tiếp nối lập luận dựa trên góc nhìn hoặc giả thuyết của người dùng (kể cả khi người dùng không đồng tình hoặc đưa ra ý kiến trái chiều). Không tự vệ, phòng thủ hay cố gắng phủ nhận thô bạo ý kiến của người dùng.
        3. Phân định rõ ràng giữa:
           - Sự thật lịch sử thực tế (được sử liệu ghi nhận và chứng minh rõ ràng).
           - Diễn giải lịch sử hợp lý (suy luận logic dựa trên bối cảnh nhưng có thể có nhiều quan điểm).
           - Giả thuyết/suy đoán chưa chắc chắn.
        4. Khi có nguồn từ trang Chính phủ/Nhà nước Việt Nam (.gov.vn, chinhphu.vn, quochoi.vn, dangcongsan.vn, các cơ quan báo chí/thiết chế nhà nước), hãy ưu tiên nguồn đó hơn các nguồn phổ thông.
        5. NẾU dữ liệu không chứa câu trả lời và bạn không thể suy luận logic được, trả về: "Chưa đủ dữ liệu đáng tin cậy". Tuy nhiên, đối với câu hỏi giải thích/giả thuyết, hãy dùng lập luận logic dựa trên bối cảnh để thảo luận tự nhiên như ChatGPT, không trả lời máy móc là chưa đủ dữ liệu.
        6. TUYỆT ĐỐI KHÔNG tự chèn đường link URL vào nội dung.
        7. **BẮT BUỘC TRÍCH DẪN INLINE KIỂU BÁO KHOA HỌC**: Khi lấy thông tin từ "Tài liệu [i]", bạn PHẢI đánh dấu trích dẫn tương ứng là `[i]` (ví dụ `[1]`, `[2]`, `[1][3]`) ở cuối câu hoặc đoạn văn sử dụng ý đó. Không được tự ý chèn tên file dài dòng hay đường link đầy đủ vào thân bài trả lời.
        
        HƯỚNG DẪN ĐỊNH DẠNG:
        - Sử dụng tiêu đề (###) và biểu tượng cảm xúc (emoji) cho các phần khi trả lời phân tích chi tiết.
        - Sử dụng danh sách gạch đầu dòng (-) cho các ý chi tiết.
        - **In đậm** các mốc thời gian, tên nhân vật, sự kiện quan trọng.
        - Trình bày thoáng, dễ đọc.

        NGUYÊN TẮC TRẢ LỜI:
        - Luôn trả lời đúng trọng tâm câu hỏi. Nếu câu hỏi ngắn hoặc hỏi xác nhận đúng/sai, hãy trả lời ngắn gọn trước trong 1-3 câu. Chỉ chia mục dài khi người dùng yêu cầu phân tích chi tiết.
        - Nếu dữ liệu nguồn có câu trả lời, hãy trả lời trực tiếp. Không được trả về ‘Chưa đủ dữ liệu đáng tin cậy’ chỉ vì nguồn không đủ dài hoặc không đủ nhiều mục.
        - NẾU CÂU HỎI LÀ GIẢ THUYẾT/BỐI CẢNH RIÊNG của người dùng (ví dụ: đặt giả thuyết khác biệt so với lịch sử chính thống): Hãy áp dụng logic đối chiếu mềm dẻo (soft-comparison). Hãy ghi nhận hoặc nhắc đến bối cảnh giả thuyết đó trước, sau đó đối chiếu rõ ràng với lịch sử chính thống Việt Nam. Tránh phủ nhận thô bạo. Ví dụ: "Theo giả thuyết của bạn thì..., tuy nhiên theo lịch sử chính thống Việt Nam..." hoặc "Nếu xét theo góc nhìn..., còn theo các tài liệu chính sử..."
        - Nếu câu hỏi là dạng xác nhận như ‘... đúng không?’, hãy trả lời theo dạng:
          * Có/Đúng, theo sử liệu ghi nhận...
          * Không/Chưa chính xác, theo sử liệu ghi nhận...
          * Có nhiều dị bản, nhưng các nguồn thường ghi nhận...
          Sau đó giải thích ngắn gọn.
        
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
                    "sources": list(sources_ordered),
                    "confidence": 0
                }
                
            return {
                "answer": content.strip(),
                "sources": list(sources_ordered),
                "confidence": 1
            }
        except Exception as e:
            print(f"LLM Generation Error: {e}")
            return {
                "answer": "Lỗi khi xử lý câu trả lời từ AI.",
                "sources": [],
                "confidence": 0
            }
