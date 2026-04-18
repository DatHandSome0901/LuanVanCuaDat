import os
from ingestion.rag_multi_class_ingest import (
    ChunkProcessor,
    VectorStoreManager,
    FileLoader,
)
from ingestion.service_manager import ServiceManager
from chatbot.utils.llm import LLM


class VectorDataBuilder:
    """
    Lớp xử lý pipeline:
    - Load file hoặc web.
    - Chia nhỏ, tóm tắt, chuẩn hoá chunk.
    - Tạo tóm tắt tổng quan.
    - Lưu vector store (FAISS).
    """

    def __init__(self, llm_name: str, embedding_model_name: str, persist_dir: str):
        self.llm = LLM().get_llm(llm_name)
        self.embedding_model = ServiceManager().get_embedding_model(
            embedding_model_name=embedding_model_name
        )
        self.persist_dir = persist_dir

    def ingest_file(
        self,
        file_path: str,
        chunk_size: int = 2000,
        chunk_overlap: int = 100,
        max_data_chunks=0,
    ):
        """
        Load file, xử lý, tạo overview và lưu vector.

        Args:
            file_path (str): Đường dẫn file.
            chunk_size (int): Kích thước chunk.
            chunk_overlap (int): Số từ chồng lắp.
        """
        docs = FileLoader(file_path).load()
        processor = ChunkProcessor(
            llm_model=self.llm,
            embedding_model=self.embedding_model,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )

        chunks = processor.split_chunks(docs)
        chunks_len = len(chunks)
        number_chunks = 0
        for index, chunk in enumerate(chunks):
            if max_data_chunks != 0:
                if number_chunks > max_data_chunks:
                    break

            print("Data ✅", index, chunks_len)
            processed_chunks = processor.process_chunks(
                [chunk], filename=os.path.basename(file_path)
            )

            # ✅ Thêm OVERVIEW
            overview_doc = processor.summarize_all_chunks(processed_chunks)

            self._save_or_update_vector(overview_doc)

            number_chunks += 1

    def _save_or_update_vector(self, docs):
        """
        Tạo mới hoặc cập nhật vector store.
        """
        vs_manager = VectorStoreManager(
            embedding_model=self.embedding_model, persist_dir=self.persist_dir
        )
        index_file = os.path.join(self.persist_dir, "index.faiss")
        meta_file = os.path.join(self.persist_dir, "index.pkl")

        if os.path.exists(index_file) and os.path.exists(meta_file):
            print("🔄 Vector store đã tồn tại ➜ Update...")
            vs_manager.update_existing(docs)
        else:
            print("✨ Vector store chưa tồn tại ➜ Tạo mới...")
            vs_manager.save_new(docs)
