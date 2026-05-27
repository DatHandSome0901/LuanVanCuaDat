from langchain_community.vectorstores import FAISS
from ingestion.service_manager import ServiceManager
import os

# ===== MODULE-LEVEL CACHE =====
# Cache FAISS index để không load lại 330MB mỗi request
_faiss_cache = {}
_faiss_merged_paths = {}

def clear_faiss_cache():
    """Xóa bộ nhớ đệm FAISS để buộc load lại từ đĩa"""
    global _faiss_cache, _faiss_merged_paths
    _faiss_cache = {}
    _faiss_merged_paths = {}
    print("🧹 FAISS Cache cleared! System will reload index on next request.")


class Retriever:
    """
    Lớp Retriever dùng để:
    - Khởi tạo mô hình embedding
    - Load FAISS vector store
    - Truy vấn lấy document liên quan tới câu hỏi
    """

    def __init__(self, embedding_model_name: str, faiss_fetch_k: int = 500):
        self.faiss_fetch_k = faiss_fetch_k
        self.embedding_model_name = embedding_model_name
        self.embedding_model = ServiceManager().get_embedding_model(embedding_model_name)

    def _load_faiss(self, path: str):
        """Load FAISS index với caching"""
        normalized_path = os.path.abspath(path)
        cache_key = f"{normalized_path}::{self.embedding_model_name}"
        if cache_key in _faiss_cache:
            print(f"⚡ CACHE HIT: {path}")
            return _faiss_cache[cache_key]

        print(f"LOADING FAISS: {path}")
        result = FAISS.load_local(
            path,
            self.embedding_model,
            allow_dangerous_deserialization=True
        )
        store = result[0] if isinstance(result, tuple) else result
        _faiss_cache[cache_key] = store
        return store

    def _cache_key(self, path: str) -> str:
        return f"{os.path.abspath(path)}::{self.embedding_model_name}"

    def set_retriever(self, path_vector_store: str):

        stores = []
        loaded_paths = set()

        # ===== INDEX GỐC =====
        if os.path.exists(path_vector_store):
            base_abs_path = os.path.abspath(path_vector_store)
            loaded_paths.add(base_abs_path)
            stores.append((base_abs_path, self._load_faiss(path_vector_store)))

        # ===== INDEX HISTORY (EXTRA) =====
        # Lấy từ output/vertex hoặc output/openai tùy theo model
        sub_folder = "vertex" if self.embedding_model_name == "vertex" else "openai"
        history_path = os.path.join("output", sub_folder)

        history_abs_path = os.path.abspath(history_path)
        if (
            history_abs_path not in loaded_paths
            and os.path.exists(history_path)
            and os.path.exists(os.path.join(history_path, "index.faiss"))
        ):
            try:
                print(f"LOADING EXTRA HISTORY: {history_path}")
                loaded_paths.add(history_abs_path)
                stores.append((history_abs_path, self._load_faiss(history_path)))
            except Exception as e:
                print(f"⚠️ extra history index lỗi: {e}")

        # ===== MERGE =====
        if not stores:
            raise Exception("Không có vector store nào")

        base_path, base = stores[0]
        base_cache_key = f"{base_path}::{self.embedding_model_name}"
        merged_paths = _faiss_merged_paths.setdefault(base_cache_key, set())

        # 🔥 FIX: Dùng merge_from() thay vì chỉ add docstore
        for store_path, s in stores[1:]:
            if store_path in merged_paths:
                print(f"SKIP MERGED index: {store_path}")
                continue

            try:
                base.merge_from(s)
                merged_paths.add(store_path)
                print(f"MERGED index")
            except Exception as e:
                print(f"MERGE ERROR (skip): {e}")

        self.retriever = base

        print("Tong vector:", len(self.retriever.docstore._dict))

        return self

    def get_all_docs(self, path_vector_store):
        result = FAISS.load_local(path_vector_store, self.embedding_model, allow_dangerous_deserialization=True)
        # Xử lý trường hợp FAISS.load_local trả về tuple hoặc object
        if isinstance(result, tuple):
            faiss_store = result[0]  # Lấy vectorstore từ tuple
        else:
            faiss_store = result  # Trường hợp trả về trực tiếp vectorstore
        all_docs = list(faiss_store.docstore._dict.values())
        return all_docs

    def get_as_retriever(self):
        faiss_retriever = self.retriever.as_retriever()
        return faiss_retriever

    def get_documents(self, query: str, num_doc: int = 3, fetch_k: int = 20):
        """
        Tìm kiếm văn bản liên quan tới câu hỏi
        """
        # 🔥 FIX: Dùng num_doc thay vì hardcode k=10
        docs = self.retriever.similarity_search(query, k=num_doc)
        return docs

    def get_documents_by_files(self, query: str, allowed_files: list = ["*"], num_doc: int = 3, num_doc_search: int = 50) -> list:
        """
        Tìm kiếm tài liệu liên quan tới query,
        nếu allowed_files = ['*'] thì không lọc theo file,
        còn lại chỉ lấy tài liệu thuộc allowed_files.

        Args:
            query (str): Câu hỏi tìm kiếm.
            allowed_files (list, optional): Danh sách file cho phép, mặc định ['*'] (lấy tất cả).
            num_doc (int): Số tài liệu trả về tối đa.
            num_doc_search (int): Số tài liệu lấy từ FAISS để lọc.

        Returns:
            list: Danh sách tài liệu phù hợp.
        """
        if not query:
            return []

        try:
            docs_and_scores = self.retriever.similarity_search_with_score(query, k=num_doc_search, fetch_k=self.faiss_fetch_k)
        except Exception as e:
            print(f"[get_documents_by_files] Error: {e}")
            return []

        if allowed_files == ["*"]:
            filtered_docs = [doc for doc, _ in docs_and_scores][:num_doc]
        else:
            filtered_docs = [doc for doc, _ in docs_and_scores if doc.metadata.get("source") in allowed_files][:num_doc]

        return filtered_docs
