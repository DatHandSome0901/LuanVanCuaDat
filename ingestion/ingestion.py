import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader, PyMuPDFLoader, Docx2txtLoader
from ingestion.service_manager import ServiceManager
from langchain_community.vectorstores import FAISS


class Ingestion:
    SUPPORTED_EXTENSIONS = {"txt", "pdf", "docx"}  # Các định dạng tệp được hỗ trợ

    def __init__(self, embedding_model_name: str):
        self.chunk_size = 2000
        self.chunk_overlap = 200
        self.embedding_model = ServiceManager().get_embedding_model(embedding_model_name)

    def ingestion_folder(self, path_input_folder: str, path_vector_store: str):
        all_docs = []
        for root, dirs, files in os.walk(path_input_folder):
            for file in files:
                ext = file.lower().split(".")[-1]
                if ext in ["txt", "pdf", "docx"]:
                    file_path = os.path.join(root, file)
                    docs = self.process_file(file_path, ext)
                    all_docs.extend(docs)

        if os.path.exists(path_vector_store):
            result = FAISS.load_local(path_vector_store, self.embedding_model, allow_dangerous_deserialization=True)
            # Xử lý trường hợp FAISS.load_local trả về tuple hoặc object
            if isinstance(result, tuple):
                vectorstore = result[0]  # Lấy vectorstore từ tuple
            else:
                vectorstore = result  # Trường hợp trả về trực tiếp vectorstore
            vectorstore.add_documents(all_docs)
        else:
            vectorstore = FAISS.from_documents(all_docs, self.embedding_model)

        vectorstore.save_local(path_vector_store)

    def process_file(self, path_file, ext):
        if ext == "txt":
            loader = TextLoader(path_file, encoding="utf8")
        elif ext == "pdf":
            loader = PyMuPDFLoader(path_file)
        elif ext == "docx":
            loader = Docx2txtLoader(path_file)
        else:
            raise ValueError(f"Unsupported file extension: {ext}")

        text_splitter = RecursiveCharacterTextSplitter(
            separators=["\n\n", "\n", " ", ".", ",", "\u200b", "\uff0c", "\u3001", "\uff0e", "\u3002", ""],
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
        )

        docs = loader.load_and_split(text_splitter=text_splitter)

        for idx in range(len(docs)):
            docs[idx].metadata["file_name"] = os.path.basename(path_file)
            docs[idx].metadata["chunk_size"] = self.chunk_size

        return docs

    def ingestion_file(self, path_input_file: str, path_vector_store: str) -> bool:
        """
        Nhập một tệp đơn vào kho vector.

        Args:
            path_input_file (str): Đường dẫn đến tệp cần nhập.
            path_vector_store (str): Đường dẫn để lưu/tải kho vector.

        Returns:
            bool: True nếu nhập thành công, False nếu có lỗi.

        Raises:
            ValueError: Nếu định dạng tệp không được hỗ trợ.
        """
        if not os.path.isfile(path_input_file):
            raise ValueError(f"Đường dẫn đầu vào không phải là tệp: {path_input_file}")

        ext = path_input_file.lower().split(".")[-1]
        if ext not in self.SUPPORTED_EXTENSIONS:
            raise ValueError(f"Định dạng tệp không được hỗ trợ: {ext}")

        docs = self.process_file(path_input_file, ext)

        if os.path.exists(path_vector_store):
            result = FAISS.load_local(path_vector_store, self.embedding_model, allow_dangerous_deserialization=True)
            # Xử lý trường hợp FAISS.load_local trả về tuple hoặc object
            if isinstance(result, tuple):
                vectorstore = result[0]  # Lấy vectorstore từ tuple
            else:
                vectorstore = result  # Trường hợp trả về trực tiếp vectorstore
            vectorstore.add_documents(docs)
        else:
            vectorstore = FAISS.from_documents(docs, self.embedding_model)

        vectorstore.save_local(path_vector_store)

        return True
