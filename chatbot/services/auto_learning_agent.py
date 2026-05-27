
import os
import json
import re
from datetime import datetime
from langchain_core.documents import Document
from ingestion.ingestion import Ingestion
from app.models.base_db import UserDB

# ===============================
# CHUNKING HELPER
# ===============================
def chunk_text(text: str, max_chars: int = 1500) -> list[str]:
    """
    Chia văn bản dài thành các chunk nhỏ hơn để vector hóa tốt hơn.
    Cắt tại dấu xuống dòng để giữ ngữ nghĩa.
    """
    if len(text) <= max_chars:
        return [text]
    
    chunks = []
    paragraphs = text.split('\n')
    current_chunk = ""
    
    for para in paragraphs:
        if len(current_chunk) + len(para) + 1 > max_chars and current_chunk:
            chunks.append(current_chunk.strip())
            current_chunk = para
        else:
            current_chunk += "\n" + para if current_chunk else para
    
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
    
    return chunks if chunks else [text[:max_chars]]


class AutoLearningAgent:
    def __init__(self, llm):
        self.llm = llm
        
        # Dùng context manager pattern thay vì giữ DB mở lâu
        self._get_config()

    def _get_config(self):
        """Lấy cấu hình từ DB và đóng ngay"""
        db = UserDB()
        try:
            llm_name = db.get_setting("llm_name", os.environ.get("LLM_NAME", "openai"))
        finally:
            db.close()
            
        if "vertex" in llm_name.lower():
            self.embedding_model_name = "vertex"
        else:
            self.embedding_model_name = os.environ.get("EMBEDDING_MODEL_NAME", "openai")
            
        self.path_vector_store = os.environ.get("PATH_VECTOR_STORE", "output")

    def analyze_and_ingest(self, question: str, answer: str, force_ingest: bool = False):
        """
        Phân tích xem nội dung có đáng để lưu vào bộ nhớ vĩnh viễn không,
        sau đó nạp vào FAISS.
        Nếu force_ingest=True, bỏ qua bước thẩm định của AI.
        """
        print(f"--- AUTO LEARNING AGENT: Analyzing knowledge for '{question[:50]}...' (Force: {force_ingest}) ---")
        
        # ✅ [NÂNG CẤP 1] Kiểm tra trùng lặp trước khi làm bất kỳ điều gì
        db = UserDB()
        try:
            from chatbot.utils.question_normalizer import normalize_question
            q_norm = normalize_question(question).lower().strip()
            existing = db.get_pending_by_question(question)
            
            if existing and existing.get("approved") == 1:
                print(f"⏭️ SKIP: Knowledge for '{q_norm[:40]}...' already ingested. Preventing duplicate.")
                return False
        finally:
            db.close()

        if force_ingest:
            # Bỏ qua AI Verification, nạp thẳng
            result = {
                "should_save": True,
                "reason": "Threshold reached (5 Likes). Forced ingestion.",
                "refined_content": answer
            }
        else:
            # 1. AI Verification: Kiểm tra xem đây có phải kiến thức lịch sử giá trị không
            verify_prompt = f"""
        Bạn là một giám định viên kiến thức lịch sử. 
        Người dùng đã Like câu trả lời sau. Hãy quyết định xem nó có đáng được lưu vào sách sử của hệ thống không.
        
        Câu hỏi: {question}
        Câu trả lời: {answer}
        
        Trả về JSON:
        {{
          "should_save": true/false,
          "reason": "lý do ngắn gọn",
          "refined_content": "Nội dung đã được biên tập lại để lưu trữ (bỏ các câu chào hỏi, chỉ giữ lại kiến thức)"
        }}
        """
            try:
                response = self.llm.invoke(verify_prompt)
                content = response.content if hasattr(response, "content") else str(response)
                
                # Bỏ qua các thẻ tư duy (thinking tags) nếu dùng model reasoning
                content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()
                
                # Parse JSON
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if not json_match:
                    return False
                    
                result = json.loads(json_match.group(0))
            except Exception as e:
                print(f"❌ AI Verification Error: {e}")
                return False
        
        if not result.get("should_save"):
            print(f"⏩ AI skipped saving: {result.get('reason', 'N/A')}")
            return False

        # 2. Thực hiện Ingestion vào FAISS
        try:
            print(f"✅ Approved for Ingestion: {result['reason']}")
            refined_text = result.get("refined_content", answer)
            target_path = "output"
            
            from langchain_community.vectorstores import FAISS
            from ingestion.service_manager import ServiceManager
            
            embedding_model = ServiceManager().get_embedding_model(self.embedding_model_name)
            print(f"Using embedding model for ingestion: {self.embedding_model_name}")

            # ✅ [NÂNG CẤP 2] Chunk nội dung dài trước khi nạp
            text_chunks = chunk_text(refined_text, max_chars=1500)
            print(f"📦 Splitting into {len(text_chunks)} chunk(s) for indexing...")
            
            # ✅ [NÂNG CẤP 3] Metadata phong phú hơn
            new_docs = []
            for i, chunk in enumerate(text_chunks):
                new_docs.append(Document(
                    page_content=chunk,
                    metadata={
                        "source": "auto_learned_from_user_like",
                        "question": question,
                        "type": "approved_knowledge",
                        "chunk_index": i,
                        "total_chunks": len(text_chunks),
                        "ingested_at": datetime.now().isoformat(),
                    }
                ))

            # Nạp vào FAISS
            if os.path.exists(target_path) and os.path.exists(os.path.join(target_path, "index.faiss")):
                vectorstore = FAISS.load_local(target_path, embedding_model, allow_dangerous_deserialization=True)
                vectorstore.add_documents(new_docs)
            else:
                vectorstore = FAISS.from_documents(new_docs, embedding_model)
            
            vectorstore.save_local(target_path)
            
            # ✅ Làm mới cache để chatbot thấy kiến thức mới ngay
            from ingestion.retriever import clear_faiss_cache
            clear_faiss_cache()
            
            # 3. Đánh dấu trong DB là đã được duyệt tự động
            db = UserDB()
            try:
                db.cursor.execute(
                    "UPDATE pending_knowledge SET approved = 1 WHERE question = ?",
                    (q_norm,)
                )
                db.conn.commit()
            finally:
                db.close()
            
            print(f"🚀 Successfully auto-ingested {len(new_docs)} chunk(s) to {target_path}")
            return True
                
        except Exception as e:
            print(f"❌ Auto Learning Error: {e}")
            import traceback
            traceback.print_exc()
            return False
