import os
import re
import sys
import time
import hashlib
import argparse
import urllib.request
import urllib.parse
from bs4 import BeautifulSoup
from ddgs import DDGS
import trafilatura
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Add current workspace to path to resolve imports correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.models.base_db import UserDB
from ingestion.service_manager import ServiceManager
from ingestion.rag_multi_class_ingest import VectorStoreManager

# 1. Official seed domains
SEED_DOMAINS = [
    "baotanglichsu.vn",
    "baotanglichsuquocgia.vn",
    "viensuhoc.vass.gov.vn",
    "vass.gov.vn",
    "btlsqsvn.mod.gov.vn",
    "tulieuvankien.dangcongsan.vn",
    "dangcongsan.vn",
    "hochiminh.vn",
    "vietnamtourism.gov.vn",
    "bvhttdl.gov.vn",
    "baochinhphu.vn",
    "chinhphu.vn",
    "moet.gov.vn"
]

# 2. Historical topics and keyword queries
HISTORICAL_TOPICS = [
    "Tiền sử - Văn Lang - Âu Lạc",
    "Bắc thuộc và đấu tranh giành độc lập",
    "Ngô - Đinh - Tiền Lê",
    "Lý - Trần - Hồ",
    "Lê sơ - Mạc - Lê Trung Hưng",
    "Tây Sơn",
    "Nhà Nguyễn",
    "Pháp thuộc",
    "Cách mạng Việt Nam",
    "Kháng chiến chống Pháp",
    "Kháng chiến chống Mỹ",
    "Sau 1975 - Đổi mới",
    "Nhân vật lịch sử",
    "Trận đánh / chiến dịch",
    "Di tích / địa danh lịch sử",
    "Văn kiện / tư liệu / hiện vật"
]

TOPIC_KEYWORDS = {
    "Tiền sử - Văn Lang - Âu Lạc": ["thời tiền sử", "Văn Lang Âu Lạc", "Hùng Vương", "An Dương Vương", "Cổ Loa"],
    "Bắc thuộc và đấu tranh giành độc lập": ["thời Bắc thuộc", "Hai Bà Trưng", "Bà Triệu", "Lý Nam Đế", "Ngô Quyền Bạch Đằng"],
    "Ngô - Đinh - Tiền Lê": ["nhà Ngô", "Đinh Bộ Lĩnh", "Hoa Lư", "Lê Hoàn Tiền Lê"],
    "Lý - Trần - Hồ": ["nhà Lý Thăng Long", "Lý Thường Kiệt", "nhà Trần chống Nguyên Mông", "Trần Hưng Đạo", "Hồ Quý Ly"],
    "Lê sơ - Mạc - Lê Trung Hưng": ["nhà Lê sơ Lê Lợi", "Bình Ngô đại cáo", "nhà Mạc", "Lê Trung Hưng", "Trịnh Nguyễn"],
    "Tây Sơn": ["Tây Sơn Nguyễn Huệ", "Quang Trung đại phá quân Thanh", "Ngọc Hồi Đống Đa"],
    "Nhà Nguyễn": ["nhà Nguyễn Nguyễn Ánh", "Gia Long", "vua Minh Mạng", "triều Nguyễn Huế"],
    "Pháp thuộc": ["thời Pháp thuộc", "phong trào Cần Vương", "khởi nghĩa Yên Bái"],
    "Cách mạng Việt Nam": ["Đảng Cộng sản Việt Nam", "Cách mạng tháng Tám", "Tuyên ngôn Độc lập 1945", "Hồ Chí Minh"],
    "Kháng chiến chống Pháp": ["kháng chiến chống Pháp 1946 1954", "chiến dịch Biên giới", "Điện Biên Phủ"],
    "Kháng chiến chống Mỹ": ["kháng chiến chống Mỹ", "đường Trường Sơn", "Mậu Thân 1968", "chiến dịch Hồ Chí Minh 1975"],
    "Sau 1975 - Đổi mới": ["sau năm 1975 chiến tranh biên giới", "thời kỳ Đổi mới", "Đại hội VI"],
    "Nhân vật lịch sử": ["nhân vật lịch sử Việt Nam", "anh hùng dân tộc Việt Nam"],
    "Trận đánh / chiến dịch": ["trận đánh lịch sử Việt Nam", "chiến dịch quân sự Việt Nam"],
    "Di tích / địa danh lịch sử": ["di tích lịch sử Việt Nam", "địa danh lịch sử Việt Nam"],
    "Văn kiện / tư liệu / hiện vật": ["văn kiện lịch sử Việt Nam", "tư liệu lịch sử", "hiện vật lịch sử"]
}

# Core historical words list to ensure the crawled content is history-related
CORE_HISTORICAL_KEYWORDS = [
    "lịch sử", "lich su", "vương", "vuong", "vua", "triều đại", "trieu dai",
    "khởi nghĩa", "khoi nghia", "chiến dịch", "chien dich", "trận đánh", "tran danh",
    "bảo tàng", "bao tang", "sử học", "su hoc", "viện sử", "vien su", "tư liệu", "tu lieu",
    "văn kiện", "van kien", "hiện vật", "hien vat", "anh hùng", "anh hung", "nhân vật", "nhan vat",
    "độc lập", "doc lap", "kháng chiến", "khang chien", "quân", "quan", "tướng", "tuong"
]

def normalize_text(text: str) -> str:
    text = (text or "").replace("Đ", "D").replace("đ", "d")
    import unicodedata
    text = unicodedata.normalize("NFD", text.lower())
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    return re.sub(r"\s+", " ", text).strip()

def contains_core_history_keywords(text: str) -> bool:
    norm_text = normalize_text(text)
    # Remove common phrases that trigger false positives on historical keywords
    phrase_exclusions = [
        "lien quan", "hang ngay", "vua moi", "vua qua", "vua roi", "lien ket"
    ]
    for phrase in phrase_exclusions:
        norm_text = norm_text.replace(phrase, "")
        
    for kw in CORE_HISTORICAL_KEYWORDS:
        pattern = rf"\b{re.escape(kw)}\b"
        if re.search(pattern, norm_text):
            return True
    return False

def is_noise_document(url: str, text: str) -> bool:
    # Check url for noise patterns
    url_lower = url.lower()
    noise_url_patterns = [
        r"/luat-", r"/nghi-dinh-", r"/thong-tu-", r"/quyet-dinh-", r"/tuyen-dung",
        r"/bieu-mau", r"/thu-tuc-", r"/bau-cu", r"/phieu-bau", r"/cu-tri"
    ]
    if any(re.search(pat, url_lower) for pat in noise_url_patterns):
        return True

    # Check content text for noise patterns
    norm_text = normalize_text(text)
    noise_content_keywords = [
        "luật số", "nghị định", "thông tư số", "bầu cử", "phiếu bầu", "cử tri",
        "biểu mẫu", "tuyển dụng", "thủ tục hành chính", "nơi nhận", "kính gửi",
        "hiệu lực thi hành", "thông báo tuyển dụng"
    ]
    if any(kw in norm_text for kw in noise_content_keywords):
        return True

    return False

def extract_domain(url: str) -> str:
    try:
        host = urllib.parse.urlsplit(url).netloc.lower()
        if host.startswith("www."):
            host = host[4:]
        return host
    except Exception:
        return ""

def determine_source_type(domain: str) -> str:
    if domain in ["baotanglichsu.vn", "baotanglichsuquocgia.vn", "btlsqsvn.mod.gov.vn"]:
        return "museum"
    if domain in ["viensuhoc.vass.gov.vn", "vass.gov.vn"]:
        return "institute"
    if domain in ["tulieuvankien.dangcongsan.vn", "dangcongsan.vn", "hochiminh.vn"]:
        return "party_document"
    if domain in ["vietnamtourism.gov.vn"]:
        return "tourism"
    if domain in ["chinhphu.vn", "baochinhphu.vn", "bvhttdl.gov.vn"]:
        return "government"
    if domain in ["moet.gov.vn"]:
        return "education"
    if domain.endswith(".gov.vn"):
        return "government"
    return "general_history"

def determine_historical_period(topic: str, text: str) -> str:
    # Rule-based period classification based on content keywords
    norm_text = normalize_text(text)
    
    if any(w in norm_text for w in ["hung vuong", "an duong vuong", "van lang", "au lac", "co loa"]):
        return "Hùng Vương & An Dương Vương"
    if any(w in norm_text for w in ["hai ba trung", "ba trieu", "ly nam de", "phung hung", "ngo quyen bach dang"]):
        return "Bắc Thuộc & Khởi Nghĩa"
    if any(w in norm_text for w in ["dinh bo linh", "hoa lu", "le hoan", "tien le"]):
        return "Đinh - Tiền Lê"
    if any(w in norm_text for w in ["nha ly", "ly thai to", "ly thuong kiet", "nam quoc son ha"]):
        return "Nhà Lý"
    if any(w in norm_text for w in ["nha tran", "tran hung dao", "tran quoc tuan", "bach dang 1288", "ho quy ly"]):
        return "Nhà Trần - Hồ"
    if any(w in norm_text for w in ["le loi", "nguyen trai", "le so", "nha mac", "trinh nguyen"]):
        return "Hậu Lê - Mạc"
    if any(w in norm_text for w in ["tay son", "nguyen hue", "quang trung", "ngoc hoi dong da"]):
        return "Tây Sơn"
    if any(w in norm_text for w in ["nha nguyen", "gia long", "minh mang", "hue"]):
        return "Nhà Nguyễn"
    if any(w in norm_text for w in ["phap thuoc", "can vuong", "khoi nghia yen bai"]):
        return "Pháp thuộc"
    if any(w in norm_text for w in ["dien bien phu", "chong phap", "1954"]):
        return "Kháng chiến chống Pháp"
    if any(w in norm_text for w in ["chong my", "duong truong son", "1975"]):
        return "Kháng chiến chống Mỹ"
    if any(w in norm_text for w in ["sau 1975", "doi moi", "chien tranh bien gioi"]):
        return "Sau 1975 - Đổi mới"

    # Fallback to mapping topic name
    if "Tiền sử" in topic:
        return "Hùng Vương & An Dương Vương"
    if "Bắc thuộc" in topic:
        return "Bắc Thuộc & Khởi Nghĩa"
    if "Ngô" in topic:
        return "Đinh - Tiền Lê"
    if "Lý" in topic:
        return "Nhà Lý"
    if "Trần" in topic:
        return "Nhà Trần - Hồ"
    if "Lê" in topic:
        return "Hậu Lê - Mạc"
    if "Tây Sơn" in topic:
        return "Tây Sơn"
    if "Nguyễn" in topic:
        return "Nhà Nguyễn"
    if "Pháp thuộc" in topic:
        return "Pháp thuộc"
    if "chống Pháp" in topic:
        return "Kháng chiến chống Pháp"
    if "chống Mỹ" in topic:
        return "Kháng chiến chống Mỹ"
    if "Sau 1975" in topic:
        return "Sau 1975 - Đổi mới"
        
    return "Khác"

def extract_entities_and_events(text: str) -> tuple[str, str]:
    # Rule-based matching of prominent figures and events
    norm_text = normalize_text(text)
    
    figures = []
    events = []
    
    # Famous figures mapping
    figures_map = {
        "Hai Bà Trưng": ["hai ba trung", "trung trac", "trung nhi"],
        "An Dương Vương": ["an duong vuong", "thuc phan"],
        "Đinh Bộ Lĩnh": ["dinh bo linh", "dinh tien hoang"],
        "Lê Hoàn": ["le hoan", "le dai hanh"],
        "Lý Thái Tổ": ["ly thai to", "ly cong uan"],
        "Lý Thường Kiệt": ["ly thuong kiet"],
        "Trần Hưng Đạo": ["tran hung dao", "tran quoc tuan", "hung dao vuong"],
        "Hồ Quý Ly": ["ho quy ly"],
        "Lê Lợi": ["le loi", "le thai to"],
        "Nguyễn Trãi": ["nguyen trai"],
        "Quang Trung": ["quang trung", "nguyen hue"],
        "Gia Long": ["gia long", "nguyen anh"],
        "Minh Mạng": ["minh mang"],
        "Hồ Chí Minh": ["ho chi minh", "bac ho", "nguyen ai quoc"],
        "Võ Nguyên Giáp": ["vo nguyen giap"]
    }
    
    # Famous events mapping
    events_map = {
        "Khởi nghĩa Hai Bà Trưng": ["khoi nghia hai ba trung"],
        "Trận Bạch Đằng năm 938": ["bach dang nam 938", "tran bach dang nam 938"],
        "Chiến tranh chống Nguyên Mông": ["chong nguyen mong", "khang chien chong nguyen mong"],
        "Trận Bạch Đằng năm 1288": ["bach dang nam 1288", "tran bach dang nam 1288"],
        "Khởi nghĩa Lam Sơn": ["khoi nghia lam son"],
        "Trận Ngọc Hồi Đống Đa": ["ngoc hoi dong da", "dai pha quan thanh"],
        "Trận Rạch Gầm Xoài Mút": ["rach gam xoai mut"],
        "Cách mạng tháng Tám": ["cach mang thang tam"],
        "Chiến dịch Điện Biên Phủ": ["dien bien phu", "chien dich dien bien phu"],
        "Chiến dịch Hồ Chí Minh": ["chien dich ho chi minh"]
    }
    
    for fig, synonyms in figures_map.items():
        if any(syn in norm_text for syn in synonyms):
            figures.append(fig)
            
    for ev, synonyms in events_map.items():
        if any(syn in norm_text for syn in synonyms):
            events.append(ev)
            
    return ", ".join(figures) if figures else "None", ", ".join(events) if events else "None"

def fetch_page_html(url: str, timeout: int = 8) -> dict | None:
    try:
        # URL safety encoding
        parts = urllib.parse.urlsplit(url)
        netloc = parts.netloc.encode("idna").decode("ascii")
        path = urllib.parse.quote(parts.path, safe="/:%")
        query = urllib.parse.quote(parts.query, safe="=&?/:+%,")
        fragment = urllib.parse.quote(parts.fragment, safe="")
        safe_url = urllib.parse.urlunsplit((parts.scheme, netloc, path, query, fragment))

        req = urllib.request.Request(safe_url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        })
        with urllib.request.urlopen(req, timeout=timeout) as response:
            html_bytes = response.read(2_000_000) # Max 2MB
        
        html = html_bytes.decode("utf-8", errors="ignore")
        soup = BeautifulSoup(html, "html.parser")
        
        title = ""
        if soup.title and soup.title.string:
            title = soup.title.string.strip()
        else:
            h1 = soup.find("h1")
            if h1:
                title = h1.get_text().strip()
                
        text = trafilatura.extract(html)
        if not text:
            # Fallback to BeautifulSoup cleaning
            for tag in soup(["script", "style", "header", "footer", "nav", "aside", "form"]):
                tag.decompose()
            text = soup.get_text(separator=' ')
            
        text = re.sub(r'\s+', ' ', text).strip()
        return {
            "title": title or "Không có tiêu đề",
            "content": text
        }
    except Exception as e:
        print(f"   [CRAWL ERROR] Failed to fetch {url}: {e}")
        return None

def sync_global_vector_store(embedding_model_name: str) -> bool:
    print(f"\n🔄 Running vector synchronization for global history index (Model: {embedding_model_name})...")
    db = UserDB()
    items = db.get_global_history_items()
    db.close()
    
    if not items:
        print("⚠️ No active global history items found in database. Skipping FAISS sync.")
        return False
        
    print(f"👉 Loaded {len(items)} history documents from database.")
    
    # Map items to LangChain documents
    documents = []
    for item in items:
        meta = {
            "source": item["url"],
            "file_name": item["title"],
            "url": item["url"],
            "domain": item["domain"],
            "topic": item["topic"],
            "period": item["period"],
            "entity_person": item["entity_person"],
            "event": item["event"],
            "source_type": item["source_type"],
            "is_global_history": True
        }
        documents.append(Document(page_content=item["raw_content"], metadata=meta))
        
    # Split documents into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1500,
        chunk_overlap=150,
        separators=["\n\n", "\n", ". ", "? ", "! ", " ", ""]
    )
    chunks = text_splitter.split_documents(documents)
    print(f"👉 Split {len(documents)} documents into {len(chunks)} chunks.")
    
    # Set target vector directory
    global_dir = os.path.join("utils", "data_vector_new", "global_history", embedding_model_name)
    if not os.path.exists(global_dir):
        os.makedirs(global_dir, exist_ok=True)
        
    # Get active embedding model
    embedding_model = ServiceManager().get_embedding_model(embedding_model_name)
    
    # Save vector store using VectorStoreManager
    vs_manager = VectorStoreManager(embedding_model=embedding_model, persist_dir=global_dir)
    vs_manager.save_new(chunks)
    
    print(f"✅ Global history FAISS index successfully synchronized at {global_dir}")
    return True

def crawl_seed_history(topic_to_crawl: str = None, domain_to_crawl: str = None, limit_per_query: int = 3, max_pages: int = 100) -> int:
    db = UserDB()
    crawled_count = 0
    
    # Determine topics to crawl
    topics = [topic_to_crawl] if topic_to_crawl else HISTORICAL_TOPICS
    domains = [domain_to_crawl] if domain_to_crawl else SEED_DOMAINS
    
    print("=== STARTING SEED-BASED CRAWLER ===")
    print(f"Topics: {topics}")
    print(f"Domains: {domains}")
    print(f"Limits: limit_per_query={limit_per_query}, max_pages={max_pages}")
    print("===================================\n")
    
    for topic in topics:
        if crawled_count >= max_pages:
            break
            
        print(f"\n📂 Crawling topic: '{topic}'")
        keywords = TOPIC_KEYWORDS.get(topic, [topic])
        
        for kw in keywords:
            if crawled_count >= max_pages:
                break
                
            for dom in domains:
                if crawled_count >= max_pages:
                    break
                    
                query = f"{kw} site:{dom}"
                print(f"🔎 Querying DuckDuckGo: '{query}'")
                
                try:
                    with DDGS() as ddgs:
                        # Request results per query
                        results = ddgs.text(query, region='vn-vi', max_results=limit_per_query)
                        if not results:
                            print("   No search results.")
                            continue
                            
                        for r in results:
                            url = r.get("href")
                            if not url:
                                continue
                                
                            # 1. URL uniqueness check
                            if db.is_url_crawled(url):
                                print(f"   [SKIP] URL already crawled: {url}")
                                continue
                                
                            print(f"   📥 Fetching: {url}")
                            # Introduce a small delay to respect rate limits
                            time.sleep(1)
                            
                            page = fetch_page_html(url)
                            if not page:
                                # Save failed audit log to DB
                                db.save_global_history_item(
                                    title="Fetch Failed",
                                    url=url,
                                    domain=extract_domain(url),
                                    topic=topic,
                                    period="None",
                                    entity_person="None",
                                    event="None",
                                    source_type=determine_source_type(extract_domain(url)),
                                    raw_content="",
                                    content_hash="",
                                    status="failed",
                                    error_message="Fetch returned empty content or timeout"
                                )
                                continue
                                
                            title = page["title"]
                            content = page["content"]
                            
                            # 2. Skip too short pages
                            if len(content) < 150:
                                print(f"   [SKIP] Content too short ({len(content)} chars): {url}")
                                db.save_global_history_item(
                                    title=title, url=url, domain=extract_domain(url),
                                    topic=topic, period="None", entity_person="None", event="None",
                                    source_type=determine_source_type(extract_domain(url)),
                                    raw_content=content, content_hash="", status="failed",
                                    error_message="Content length less than 150 characters"
                                )
                                continue
                                
                            # 3. Content hash check (uniqueness check)
                            content_hash = hashlib.md5(content.encode("utf-8")).hexdigest()
                            if db.is_content_hash_exists(content_hash):
                                print(f"   [SKIP] Duplicate content hash found: {url}")
                                continue
                                
                            # 4. History keyword filter check
                            if not contains_core_history_keywords(content):
                                print(f"   [SKIP] Lacks core historical keywords: {url}")
                                db.save_global_history_item(
                                    title=title, url=url, domain=extract_domain(url),
                                    topic=topic, period="None", entity_person="None", event="None",
                                    source_type=determine_source_type(extract_domain(url)),
                                    raw_content=content, content_hash=content_hash, status="failed",
                                    error_message="Does not contain core historical keywords"
                                )
                                continue
                                
                            # 5. Noise and administrative filter check
                            if is_noise_document(url, content):
                                print(f"   [SKIP] Noise/Administrative document matched: {url}")
                                db.save_global_history_item(
                                    title=title, url=url, domain=extract_domain(url),
                                    topic=topic, period="None", entity_person="None", event="None",
                                    source_type=determine_source_type(extract_domain(url)),
                                    raw_content=content, content_hash=content_hash, status="failed",
                                    error_message="Identified as noise/administrative document"
                                )
                                continue
                                
                            # Extract metadata fields
                            domain = extract_domain(url)
                            source_type = determine_source_type(domain)
                            period = determine_historical_period(topic, content)
                            entities, events = extract_entities_and_events(content)
                            
                            # Save successfully crawled item
                            db.save_global_history_item(
                                title=title,
                                url=url,
                                domain=domain,
                                topic=topic,
                                period=period,
                                entity_person=entities,
                                event=events,
                                source_type=source_type,
                                raw_content=content,
                                content_hash=content_hash,
                                status="active",
                                error_message=None
                            )
                            crawled_count += 1
                            print(f"   ✅ SUCCESSFUL CRAWL ({crawled_count}): '{title}'")
                            
                except Exception as e:
                    print(f"   [ERROR] Query failed: {e}")
                    
    db.close()
    return crawled_count

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed-based Vietnam History Crawler & Vector Synchronizer")
    parser.add_argument("--topic", type=str, help="Specific topic to crawl")
    parser.add_argument("--domain", type=str, help="Specific seed domain to crawl")
    parser.add_argument("--limit", type=int, default=3, help="Max URLs per search query")
    parser.add_argument("--max-pages", type=int, default=100, help="Max total pages to crawl")
    parser.add_argument("--sync", action="store_true", help="Sync FAISS vector index from SQLite database global_history_items")
    parser.add_argument("--run-all", action="store_true", help="Crawl all topics and sync FAISS")
    
    args = parser.parse_args()
    
    embedding_model_name = os.environ.get("EMBEDDING_MODEL_NAME", "vertex")
    
    if args.run_all:
        crawled = crawl_seed_history(limit_per_query=args.limit, max_pages=args.max_pages)
        print(f"\nDone! Crawled {crawled} new pages.")
        sync_global_vector_store(embedding_model_name)
    elif args.sync:
        sync_global_vector_store(embedding_model_name)
    elif args.topic or args.domain:
        crawled = crawl_seed_history(
            topic_to_crawl=args.topic,
            domain_to_crawl=args.domain,
            limit_per_query=args.limit,
            max_pages=args.max_pages
        )
        print(f"\nDone! Crawled {crawled} new pages.")
        # Auto-sync vector store if we crawled new pages
        if crawled > 0:
            sync_global_vector_store(embedding_model_name)
    else:
        parser.print_help()
