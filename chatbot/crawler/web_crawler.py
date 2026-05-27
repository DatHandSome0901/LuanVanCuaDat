import trafilatura
from bs4 import BeautifulSoup
from ddgs import DDGS
from concurrent.futures import ThreadPoolExecutor, as_completed
import copy
import os
import re
import threading
import time
import unicodedata
import urllib.request
from urllib.parse import quote, urlsplit, urlunsplit


_WEB_CONTEXT_CACHE: dict[str, tuple[float, list[dict]]] = {}
_WEB_CONTEXT_CACHE_LOCK = threading.Lock()


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


def _normalize_for_match(text: str) -> str:
    text = text.replace("\u0110", "D").replace("\u0111", "d")
    text = unicodedata.normalize("NFD", text.lower())
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _safe_url(url: str) -> str:
    parts = urlsplit(url)
    netloc = parts.netloc.encode("idna").decode("ascii")
    path = quote(parts.path, safe="/:%")
    query = quote(parts.query, safe="=&?/:+%,")
    fragment = quote(parts.fragment, safe="")
    return urlunsplit((parts.scheme, netloc, path, query, fragment))


def _url_host(url: str) -> str:
    try:
        host = urlsplit(url).netloc.lower()
    except Exception:
        return ""
    host = host.split("@")[-1].split(":")[0]
    if host.startswith("www."):
        host = host[4:]
    return host


def _host_matches(host: str, domain: str) -> bool:
    domain = domain.lower().lstrip(".")
    return host == domain or host.endswith("." + domain)


def _title_case_words(text: str) -> str:
    words = []
    for word in re.findall(r"\w+", text, flags=re.UNICODE):
        words.append(word[:1].upper() + word[1:])
    return " ".join(words)

class WebCrawler:
    def __init__(self):
        self.vn_government_domains = [
            ".gov.vn",
            "chinhphu.vn",
            "baochinhphu.vn",
            "quochoi.vn",
            "dangcongsan.vn",
        ]
        self.vn_state_domains = [
            "vietnam.vn",
            "baotanglichsu.vn",
            "qdnd.vn",
            "nhandan.vn",
            "vnanet.vn",
            "vietnamplus.vn",
        ]
        self.trusted_domains = [
            "baotanglichsu.vn",
            "qdnd.vn",
            "vietnam.vn",
            "chinhphu.vn",
            "baochinhphu.vn",
            "quochoi.vn",
            "dangcongsan.vn",
            "nhandan.vn",
            "vietnamplus.vn",
            "wikipedia.org",
        ]
        self.allow_non_government_fallback = _env_bool("WEB_ALLOW_NON_GOV_FALLBACK", True)
        self.max_results = _env_int("WEB_MAX_RESULTS", 5)
        self.max_workers = _env_int("WEB_MAX_WORKERS", 5)
        self.fetch_timeout = _env_int("WEB_FETCH_TIMEOUT_SECONDS", 6)
        self.max_download_bytes = _env_int("WEB_MAX_DOWNLOAD_BYTES", 2_000_000)
        self.cache_ttl_seconds = _env_int("WEB_CONTEXT_CACHE_TTL_SECONDS", 3600)
        self.max_raw_text_chars = _env_int("WEB_MAX_RAW_TEXT_CHARS", 90000)
        self.max_chunks_per_source = _env_int("WEB_MAX_CHUNKS_PER_SOURCE", 8)
        self.max_total_chunks = _env_int("WEB_MAX_TOTAL_CHUNKS", 40)
        self.chunk_size = _env_int("WEB_CHUNK_SIZE", 900)
        self.chunk_overlap = min(
            _env_int("WEB_CHUNK_OVERLAP", 80, minimum=0),
            max(0, self.chunk_size // 2),
        )
        self.use_simple_chunker = _env_bool("WEB_SIMPLE_CHUNKER", True)
        self.text_splitter = None
        if not self.use_simple_chunker:
            from langchain_text_splitters import RecursiveCharacterTextSplitter
            self.text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=self.chunk_size,
                chunk_overlap=self.chunk_overlap,
                separators=["\n\n", "\n", ". ", "? ", "! ", " ", ""]
            )

    def _is_government_url(self, url: str) -> bool:
        host = _url_host(url)
        if not host:
            return False
        return any(_host_matches(host, domain) for domain in self.vn_government_domains)

    def _is_state_url(self, url: str) -> bool:
        host = _url_host(url)
        if not host:
            return False
        return self._is_government_url(url) or any(
            _host_matches(host, domain)
            for domain in self.vn_state_domains
        )

    def _source_priority_score(self, url: str) -> int:
        if self._is_government_url(url):
            return 450
        if self._is_state_url(url):
            return 300

        host = _url_host(url)
        if any(_host_matches(host, domain) for domain in self.trusted_domains):
            return 100
        return 0

    def _cache_key(self, query: str) -> str:
        return _normalize_for_match(query)

    def _get_cached_context(self, query: str) -> list[dict] | None:
        key = self._cache_key(query)
        with _WEB_CONTEXT_CACHE_LOCK:
            cached = _WEB_CONTEXT_CACHE.get(key)
            if not cached:
                return None

            created_at, chunks = cached
            if time.time() - created_at > self.cache_ttl_seconds:
                _WEB_CONTEXT_CACHE.pop(key, None)
                return None

            return copy.deepcopy(chunks)

    def _set_cached_context(self, query: str, chunks: list[dict]) -> None:
        key = self._cache_key(query)
        with _WEB_CONTEXT_CACHE_LOCK:
            _WEB_CONTEXT_CACHE[key] = (time.time(), copy.deepcopy(chunks))

            if len(_WEB_CONTEXT_CACHE) > 200:
                oldest_key = min(_WEB_CONTEXT_CACHE, key=lambda item: _WEB_CONTEXT_CACHE[item][0])
                _WEB_CONTEXT_CACHE.pop(oldest_key, None)

    def _query_terms(self, query: str) -> list[str]:
        normalized = _normalize_for_match(query)
        stopwords = {
            "la", "gi", "ai", "o", "nam", "nao", "the", "nao", "co",
            "khong", "hay", "noi", "ve", "cua", "cho", "toi",
            "mot", "nhung", "cac", "sau", "truoc", "trong", "duoc",
        }
        terms = []
        for word in normalized.split():
            if len(word) >= 2 and word not in stopwords and word not in terms:
                terms.append(word)
        return terms

    def _important_query_phrases(self, query: str) -> list[str]:
        stopwords = {
            "la", "gi", "ai", "o", "nam", "nao", "the", "co", "khong",
            "hay", "noi", "ve", "cua", "cho", "toi", "mot", "nhung",
            "cac", "sau", "truoc", "trong", "duoc", "ten", "that",
            "sinh", "mat", "chet", "duoi", "tay", "dau",
        }
        tokens = re.findall(r"\w+", query or "", flags=re.UNICODE)
        important = [
            token for token in tokens
            if len(token) >= 2 and _normalize_for_match(token) not in stopwords
        ]

        if len(important) < 2:
            return []

        return [" ".join(important[:min(6, len(important))])]

    def _direct_wikipedia_results(self, query: str) -> list[dict]:
        results = []
        
        # [FIX] Tránh tạo link Wikipedia bừa bãi và gây lỗi 404 cho các câu hỏi dài.
        # Chỉ tạo link trực tiếp nếu truy vấn là một từ khóa ngắn (<= 6 từ).
        if len(query.split()) > 6:
            return results
            
        seen = set()

        for phrase in self._important_query_phrases(query):
            title_candidate = _title_case_words(phrase)
            y_variant = title_candidate.replace("M\u1ecb", "M\u1ef5").replace("m\u1ecb", "M\u1ef5")
            candidates = [y_variant] if y_variant != title_candidate else [title_candidate]

            for title in candidates:
                if not title:
                    continue
                url = "https://vi.wikipedia.org/wiki/" + quote(title.replace(" ", "_"))
                if url in seen:
                    continue
                seen.add(url)
                results.append({
                    "url": url,
                    "title": title,
                    "body": "",
                    "_direct": True,
                })
                if len(results) >= 3:
                    return results

        return results

    def _score_chunk(self, content: str, query_terms: list[str]) -> int:
        if not query_terms:
            return 0

        normalized = _normalize_for_match(content)
        score = 0
        matched_terms = 0
        for term in query_terms:
            count = normalized.count(term)
            if count:
                matched_terms += 1
                score += count * (3 if len(term) > 3 else 1)

        score += matched_terms * 20
        if matched_terms == len(query_terms):
            score += 40

        phrase = " ".join(query_terms)
        if len(query_terms) >= 2 and phrase in normalized:
            score += 80

        if "ten" in query_terms and re.search(r"\bten\s+(khai\s+sinh|that|goi|khi)\b", normalized):
            score += 140
        if "sinh" in query_terms and re.search(r"\b(sinh|ngay\s+sinh|nam\s+sinh)\b", normalized):
            score += 80
        if "mat" in query_terms and re.search(r"\b(mat|qua\s+doi|tu\s+tran)\b", normalized):
            score += 80
        if "chet" in query_terms and re.search(r"\b(chet|chem|giet|tu\s+sat)\b", normalized):
            score += 80
        return score

    def _split_text(self, text: str) -> list[str]:
        if self.text_splitter is not None:
            return self.text_splitter.split_text(text)

        text = re.sub(r"\s+", " ", text).strip()
        if not text:
            return []

        chunks = []
        start = 0
        text_len = len(text)

        while start < text_len:
            end = min(start + self.chunk_size, text_len)
            if end < text_len:
                split_points = [
                    text.rfind(". ", start, end),
                    text.rfind("? ", start, end),
                    text.rfind("! ", start, end),
                    text.rfind("; ", start, end),
                ]
                split_at = max(split_points)
                if split_at > start + self.chunk_size // 2:
                    end = split_at + 1

            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)

            if end >= text_len:
                break

            start = max(end - self.chunk_overlap, start + 1)

        return chunks

    def search_trusted_results(
        self,
        query: str,
        max_results: int | None = None,
        include_direct: bool = True,
    ) -> list[dict]:
        max_results = max_results or self.max_results
        gov_query = " OR ".join([
            "site:.gov.vn",
            "site:chinhphu.vn",
            "site:baochinhphu.vn",
            "site:quochoi.vn",
            "site:dangcongsan.vn",
        ])
        state_query = " OR ".join([
            "site:vietnam.vn",
            "site:baotanglichsu.vn",
            "site:qdnd.vn",
            "site:nhandan.vn",
            "site:vietnamplus.vn",
        ])
        trusted_query = " OR ".join([f"site:{domain}" for domain in self.trusted_domains])
        search_queries = [
            f"{query} {gov_query}",
            f"{query} {state_query}",
        ]

        if self.allow_non_government_fallback:
            search_queries.extend([
                f"{query} {trusted_query}",
                f"{query} site:.vn",
                query,
            ])
        
        results_out = []
        seen_urls = set()

        try:
            with DDGS() as ddgs:
                for search_query in search_queries:
                    if len(results_out) >= max_results:
                        break

                    try:
                        # Thêm tham số region='vn-vi' để tối ưu kết quả tiếng Việt/Việt Nam
                        results = ddgs.text(search_query, region='vn-vi', max_results=max_results)
                    except Exception:
                        continue

                    for r in results:
                        href = r.get("href")
                        if href and href not in seen_urls:
                            seen_urls.add(href)
                            results_out.append({
                                "url": href,
                                "title": r.get("title") or "",
                                "body": r.get("body") or r.get("snippet") or "",
                            })
                            if len(results_out) >= max_results:
                                break
        except Exception as e:
            print(f"DDGS Error: {e}")

        if include_direct and self.allow_non_government_fallback and len(results_out) < max_results:
            for result in self._direct_wikipedia_results(query):
                href = result.get("url")
                if href and href not in seen_urls:
                    seen_urls.add(href)
                    results_out.append(result)
                    if len(results_out) >= max_results:
                        break
            
        return results_out

    def search_trusted_domains(self, query: str, max_results: int | None = None) -> list[str]:
        return [result["url"] for result in self.search_trusted_results(query, max_results)]

    def snippet_to_chunk(self, result: dict, query_terms: list[str]) -> dict | None:
        title = (result.get("title") or "").strip()
        body = (result.get("body") or "").strip()
        if result.get("_direct") and not body:
            return None

        content = ". ".join(part for part in [title, body] if part)
        content = re.sub(r"\s+", " ", content).strip()
        url = result.get("url")

        if not content or not url:
            return None

        return {
            "content": content,
            "source": url,
            "_score": self._score_chunk(content, query_terms) + self._source_priority_score(url) + 25,
            "_kind": "search_snippet",
        }

    def _chunks_from_search_results(self, search_results: list[dict], query_terms: list[str]) -> list[dict]:
        all_chunks = []
        urls = [result["url"] for result in search_results]

        for result in search_results:
            snippet_chunk = self.snippet_to_chunk(result, query_terms)
            if snippet_chunk:
                all_chunks.append(snippet_chunk)

        def crawl_and_chunk(url: str) -> list[dict]:
            text = self.crawl_url(url)
            return self.chunk_text(text, url, query_terms)

        max_workers = min(len(urls), self.max_workers)
        if max_workers > 0:
            with ThreadPoolExecutor(max_workers=max_workers) as executor:
                futures = [executor.submit(crawl_and_chunk, url) for url in urls]
                for future in as_completed(futures):
                    try:
                        all_chunks.extend(future.result())
                    except Exception as e:
                        print(f"Web crawl worker error: {e}")

        all_chunks.sort(key=lambda item: item.get("_score", 0), reverse=True)
        all_chunks = all_chunks[:self.max_total_chunks]
        for chunk in all_chunks:
            chunk.pop("_score", None)

        return all_chunks

    def crawl_url(self, url: str) -> str:
        try:
            req = urllib.request.Request(_safe_url(url), headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=self.fetch_timeout) as response:
                html_bytes = response.read(self.max_download_bytes)

            html = html_bytes.decode("utf-8", errors="ignore")
            text = trafilatura.extract(html)
            if text:
                return text[:self.max_raw_text_chars]

            soup = BeautifulSoup(html, "html.parser")
            
            # Remove scripts and styles
            for script in soup(["script", "style", "header", "footer", "nav"]):
                script.decompose()
                
            text = soup.get_text(separator=' ')
            # Clean up whitespace
            text = re.sub(r'\s+', ' ', text).strip()
            return text[:self.max_raw_text_chars]
        except Exception as e:
            print(f"Error crawling {url}: {e}")
            return ""

    def chunk_text(self, text: str, source_url: str, query_terms: list[str] | None = None) -> list[dict]:
        if not text:
            return []
            
        chunks = self._split_text(text)
        result = []
        for chunk in chunks:
            score = self._score_chunk(chunk, query_terms or [])
            result.append({
                "content": chunk,
                "source": source_url,
                "_score": score + self._source_priority_score(source_url),
            })

        result.sort(key=lambda item: item.get("_score", 0), reverse=True)
        return result[:self.max_chunks_per_source]

    def get_web_context(self, query: str) -> list[dict]:
        cached = self._get_cached_context(query)
        if cached is not None:
            print(f"⚡ WEB CONTEXT CACHE HIT: {query}")
            return cached

        query_terms = self._query_terms(query)

        search_results = self.search_trusted_results(query, include_direct=False)
        if not search_results:
            if not self.allow_non_government_fallback:
                return []

            direct_results = self._direct_wikipedia_results(query)
            if not direct_results:
                return []

            direct_chunks = self._chunks_from_search_results(direct_results, query_terms)
            if direct_chunks:
                self._set_cached_context(query, direct_chunks)
            return direct_chunks

        all_chunks = self._chunks_from_search_results(search_results, query_terms)
        self._set_cached_context(query, all_chunks)
        return all_chunks

if __name__ == "__main__":
    crawler = WebCrawler()
    res = crawler.get_web_context("Trận Bạch Đằng năm 938")
    print(f"Found {len(res)} chunks.")
    if res:
        print(res[0])
