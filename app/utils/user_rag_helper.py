import os
import shutil
from langchain_community.vectorstores import FAISS
from ingestion.service_manager import ServiceManager
from app.models.base_db import UserDB

def sync_user_vector_store(user_id: int, embedding_model_name: str):
    """
    Rebuilds the FAISS vector index for a specific user and embedding model.
    Path: utils/data_vector_new/user_rag_{user_id}/{embedding_model_name}
    """
    target_path = os.path.join("utils", "data_vector_new", f"user_rag_{user_id}", embedding_model_name)
    
    db_inst = UserDB()
    try:
        items = db_inst.get_user_rag_items(user_id)
        
        # If no items, clear the vector store directory to prevent outdated search results
        if not items:
            if os.path.exists(target_path):
                try:
                    shutil.rmtree(target_path)
                except Exception as e:
                    print(f"⚠️ [USER RAG] Failed to remove empty dir {target_path}: {e}")
            print(f"[USER RAG] Cleaned up empty vector store for user_id={user_id}")
            return
        
        # Fetch the embedding model from ServiceManager
        embedding_model = ServiceManager().get_embedding_model(embedding_model_name)
        
        texts = []
        metadatas = []
        
        for item in items:
            parts = []
            if item.get("original_question"):
                parts.append(f"Câu hỏi: {item['original_question']}")
            if item.get("selected_text"):
                parts.append(f"Đoạn văn bản gốc: {item['selected_text']}")
            parts.append(f"Thông tin lưu ý/sửa đổi/ghi chú: {item['content']}")
            
            text = "\n".join(parts)
            texts.append(text)
            
            metadatas.append({
                "id": item["id"],
                "user_id": user_id,
                "content_type": item["content_type"],
                "created_at": item["created_at"],
                "original_question": item.get("original_question") or "",
                "selected_text": item.get("selected_text") or "",
                "corrected_text": item.get("corrected_text") or "",
                "content": item["content"]
            })
            
        # Create and save FAISS index
        os.makedirs(target_path, exist_ok=True)
        db = FAISS.from_texts(
            texts,
            embedding_model,
            metadatas=metadatas
        )
        db.save_local(target_path)
        print(f"[USER RAG] Synced FAISS index for user_id={user_id} with {len(items)} items at {target_path}")
        
    finally:
        db_inst.close()
