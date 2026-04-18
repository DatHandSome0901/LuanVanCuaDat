import os
import datetime
from typing import List
from langdetect import detect, LangDetectException
from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    Docx2txtLoader,
    UnstructuredFileLoader,
)
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.schema import Document


class FileLoader:
    """Lớp đọc file văn bản."""

    def __init__(self, file_path: str):
        self.file_path = file_path

    def load(self):
        ext = self.file_path.lower().split(".")[-1]
        if ext == "pdf":
            loader = PyPDFLoader(self.file_path)
        elif ext == "txt":
            loader = TextLoader(self.file_path, encoding="utf-8")
        elif ext == "docx":
            loader = Docx2txtLoader(self.file_path)
        else:
            loader = UnstructuredFileLoader(self.file_path)
        docs = loader.load()
        print(f"✅ [FileLoader] Loaded {len(docs)} pages.")
        return docs


class ChunkProcessor:
    """Lớp xử lý: chia nhỏ, tóm tắt, heading, TỔNG QUAN."""

    def __init__(self, llm_model, embedding_model, chunk_size=2000, chunk_overlap=10):
        self.llm = llm_model
        self.embedding_model = embedding_model
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def get_separators(self, source_type="file"):
        if source_type == "web":
            return ["# ", "- ", "\n\n", "\n", ". ", "? ", "! ", "; ", ", ", " ", ""]
        return ["\n\n", "\n", ". ", "? ", "! ", "; ", ", ", " ", ""]

    def split_chunks(self, docs, source_type="file"):
        splitter = RecursiveCharacterTextSplitter(
            separators=self.get_separators(source_type),
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
        )
        chunks = splitter.split_documents(docs)
        print(f"✅ [ChunkProcessor] Split {len(docs)} docs into {len(chunks)} chunks.")
        return chunks

    def safe_detect(self, text):
        if not text.strip():
            return "unknown"
        try:
            return detect(text.strip())
        except LangDetectException:
            return "unknown"

    def process_chunks(self, chunks, filename: str = None, url: str = None) -> List:
        now = datetime.datetime.utcnow().isoformat()
        source = url if url else filename if filename else "unknown"

        processed_chunks = []
        for idx, chunk in enumerate(chunks):
            chunk.metadata.update(
                {
                    "source": source,
                    "chunk_index": idx,
                    "created_at": now,
                    "page_number": chunk.metadata.get("page"),
                }
            )

            processed_chunks.append(chunk)
            print(f"✅ [ChunkProcessor] Chunk {idx + 1}/{len(chunks)} processed.")

        return processed_chunks


class VectorStoreManager:
    """Lớp quản lý lưu và update FAISS."""

    def __init__(self, embedding_model, persist_dir="./faiss_index"):
        self.embedding_model = embedding_model
        self.persist_dir = persist_dir
        self.vectorstore = None

    def save_new(self, docs):
        docs = [doc for doc in docs if doc.page_content.strip()]
        self.vectorstore = FAISS.from_documents(docs, self.embedding_model)
        self.vectorstore.save_local(self.persist_dir)
        print(f"✅ [VectorStoreManager] Saved NEW FAISS at {self.persist_dir}")

    def update_existing(self, docs):
        docs = [doc for doc in docs if doc.page_content.strip()]
        result = FAISS.load_local(
            self.persist_dir, self.embedding_model, allow_dangerous_deserialization=True
        )
        # Xử lý trường hợp FAISS.load_local trả về tuple hoặc object
        if isinstance(result, tuple):
            self.vectorstore = result[0]  # Lấy vectorstore từ tuple
        else:
            self.vectorstore = result  # Trường hợp trả về trực tiếp vectorstore
        self.vectorstore.add_documents(docs)
        self.vectorstore.save_local(self.persist_dir)
        print(f"✅ [VectorStoreManager] Updated EXISTING FAISS at {self.persist_dir}")
