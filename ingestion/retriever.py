from langchain_community.vectorstores import FAISS
from ingestion.service_manager import ServiceManager


class Retriever:
    """
    Lớp Retriever dùng để:
    - Khởi tạo mô hình embedding
    - Load FAISS vector store
    - Truy vấn lấy document liên quan tới câu hỏi
    """

    def __init__(self, embedding_model_name: str, faiss_fetch_k: int = 500):
        self.faiss_fetch_k = faiss_fetch_k
        self.embedding_model = ServiceManager().get_embedding_model(embedding_model_name)

    # def set_retriever(self, path_vector_store: str):
    #     result = FAISS.load_local(path_vector_store, self.embedding_model, allow_dangerous_deserialization=True)
    #     # Xử lý trường hợp FAISS.load_local trả về tuple hoặc object
    #     if isinstance(result, tuple):
    #         self.retriever = result[0]  # Lấy vectorstore từ tuple
    #     else:
    #         self.retriever = result  # Trường hợp trả về trực tiếp vectorstore
    #     return self
    def set_retriever(self, path_vector_store: str):

        import os
        from langchain_community.vectorstores import FAISS

        stores = []

        # ===== INDEX GỐC =====
        if os.path.exists(path_vector_store):
            result = FAISS.load_local(
                path_vector_store,
                self.embedding_model,
                allow_dangerous_deserialization=True
            )
            stores.append(result[0] if isinstance(result, tuple) else result)

        # ===== INDEX HISTORY =====
        history_path = "output"   # ⚠️ thư mục chứa history.index

        if os.path.exists(history_path):
            try:
                result2 = FAISS.load_local(
                    history_path,
                    self.embedding_model,
                    allow_dangerous_deserialization=True
                )
                stores.append(result2[0] if isinstance(result2, tuple) else result2)
            except:
                print("⚠️ history index chưa có hoặc lỗi")

        # ===== MERGE =====
        if not stores:
            raise Exception("Không có vector store nào")

        base = stores[0]

        # for s in stores[1:]:
        #     base.merge_from(s)
        for s in stores[1:]:
            try:
                existing_ids = set(base.docstore._dict.keys())

                new_docs = {}

                for _id, doc in s.docstore._dict.items():
                    if _id not in existing_ids:
                        new_docs[_id] = doc

                base.docstore.add(new_docs)

            except Exception as e:
                print("⚠️ MERGE ERROR:", e)

        self.retriever = base

        print("✅ Tổng vector:", len(self.retriever.docstore._dict))

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
        # docs = self.retriever.similarity_search(query, k=num_doc, fetch_k=fetch_k)
        docs = self.retriever.similarity_search(query, k=10)
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
