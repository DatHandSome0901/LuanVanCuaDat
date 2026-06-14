import os
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List

from app.security.security import get_current_user
from app.models.base_db import UserDB
from app.utils.user_rag_helper import sync_user_vector_store
from app.utils.helpers import clean_vietnamese_text

router = APIRouter(prefix="/user-rag", tags=["user-rag"])

class SelectionSaveRequest(BaseModel):
    conversationId: Optional[int] = None
    messageId: Optional[int] = None
    originalQuestion: Optional[str] = None
    assistantAnswer: Optional[str] = None
    selectedText: str
    correctedText: str
    noteType: str  # 'manual_note', 'correction', 'personal_context', 'hypothesis', 'saved_idea', 'user_argument', etc.

class ManualSaveRequest(BaseModel):
    content: str
    noteType: str

class ItemUpdateRequest(BaseModel):
    content: str
    noteType: str

def get_embedding_model_name(db: UserDB) -> str:
    llm_name = db.get_setting("llm_name", os.environ.get("LLM_NAME", "openai"))
    embedding_model_name = os.environ.get("EMBEDDING_MODEL_NAME", "openai")
    if llm_name == "openai":
        embedding_model_name = "openai"
    elif llm_name in ["vertex", "gemini"]:
        embedding_model_name = "vertex"
    return embedding_model_name

@router.post("/save-selection")
def save_selection(req: SelectionSaveRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    db = UserDB()
    try:
        orig_q = req.originalQuestion
        asst_a = req.assistantAnswer
        if req.messageId and (not orig_q or not asst_a):
            ctx = db.get_message_context(req.messageId)
            if ctx:
                orig_q = orig_q or ctx.get("question")
                asst_a = asst_a or ctx.get("answer")
        
        content = req.correctedText
        
        item_id = db.save_user_rag_item(
            user_id=user_id,
            content=clean_vietnamese_text(content),
            content_type=req.noteType,
            conversation_id=req.conversationId,
            message_id=req.messageId,
            original_question=clean_vietnamese_text(orig_q) if orig_q else None,
            assistant_answer=clean_vietnamese_text(asst_a) if asst_a else None,
            selected_text=clean_vietnamese_text(req.selectedText),
            corrected_text=clean_vietnamese_text(req.correctedText)
        )
        
        emb_model = get_embedding_model_name(db)
        sync_user_vector_store(user_id, emb_model)
        
        return {"message": "Đã lưu bối cảnh cá nhân và cập nhật RAG thành công", "id": item_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi hệ thống: {str(e)}")
    finally:
        db.close()

@router.post("/save-manual")
def save_manual(req: ManualSaveRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    db = UserDB()
    try:
        item_id = db.save_user_rag_item(
            user_id=user_id,
            content=clean_vietnamese_text(req.content),
            content_type=req.noteType
        )
        emb_model = get_embedding_model_name(db)
        sync_user_vector_store(user_id, emb_model)
        
        return {"message": "Đã thêm tri thức mới thành công", "id": item_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi hệ thống: {str(e)}")
    finally:
        db.close()

@router.put("/item/{item_id}")
def update_item(item_id: int, req: ItemUpdateRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    db = UserDB()
    try:
        db.update_user_rag_item(
            user_id=user_id,
            item_id=item_id,
            content=clean_vietnamese_text(req.content),
            content_type=req.noteType
        )
        emb_model = get_embedding_model_name(db)
        sync_user_vector_store(user_id, emb_model)
        
        return {"message": "Đã cập nhật tri thức cá nhân thành công"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi hệ thống: {str(e)}")
    finally:
        db.close()

@router.delete("/item/{item_id}")
def delete_item(item_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    db = UserDB()
    try:
        db.delete_user_rag_item(user_id=user_id, item_id=item_id)
        emb_model = get_embedding_model_name(db)
        sync_user_vector_store(user_id, emb_model)
        
        return {"message": "Đã xóa tri thức cá nhân thành công"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi hệ thống: {str(e)}")
    finally:
        db.close()

@router.get("/items")
def get_items(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    db = UserDB()
    try:
        items = db.get_user_rag_items(user_id)
        return {"items": items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi hệ thống: {str(e)}")
    finally:
        db.close()
