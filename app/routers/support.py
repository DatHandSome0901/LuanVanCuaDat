from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from app.security.security import get_current_user, get_current_admin, is_any_admin_online, mark_admin_active
from app.models.base_db import UserDB
from chatbot.utils.llm import LLM
import os
import re

router = APIRouter(prefix="/support", tags=["Support Chat"])

class SendMessagePayload(BaseModel):
    room_id: int
    message: str

class AdminSendPayload(BaseModel):
    room_id: int
    message: str

@router.get("/status")
async def get_support_status():
    """Check if any admin is currently online."""
    return {"admin_online": is_any_admin_online()}

@router.get("/room")
async def get_or_create_room(current_user: dict = Depends(get_current_user)):
    """Get or create support chat room for the logged-in user."""
    db = UserDB()
    try:
        room = db.get_or_create_support_room(current_user["id"])
        if not room:
            raise HTTPException(status_code=500, detail="Không thể khởi tạo phòng hỗ trợ")
        return room
    finally:
        db.close()

@router.get("/messages/{room_id}")
async def get_messages(room_id: int, current_user: dict = Depends(get_current_user)):
    """Fetch all messages for a specific support room."""
    db = UserDB()
    try:
        # Check permissions: must be admin or the owner of the room
        db.cursor.execute("SELECT * FROM support_rooms WHERE id = ?", (room_id,))
        room = db.cursor.fetchone()
        if not room:
            raise HTTPException(status_code=404, detail="Không tìm thấy phòng hỗ trợ")
        
        # Standard users can only view their own support room
        if not current_user.get("is_admin") and room["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Không có quyền truy cập phòng hỗ trợ này")
        
        messages = db.get_support_messages(room_id)
        return {"messages": messages}
    finally:
        db.close()

@router.post("/send")
async def send_user_message(
    payload: SendMessagePayload,
    current_user: dict = Depends(get_current_user)
):
    """User sends a message to the support room. If admin is offline, triggers AI Support Agent fallback."""
    db = UserDB()
    try:
        room_id = payload.room_id
        message_text = payload.message.strip()
        if not message_text:
            raise HTTPException(status_code=400, detail="Tin nhắn không được bỏ trống")
            
        # Verify ownership
        db.cursor.execute("SELECT * FROM support_rooms WHERE id = ?", (room_id,))
        room = db.cursor.fetchone()
        if not room or room["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Phòng hỗ trợ không hợp lệ")

        # Save user message
        db.add_support_message(room_id, "user", current_user["id"], message_text)
        
        # Check if admin is online
        admin_online = is_any_admin_online()
        
        ai_replied = False
        ai_response = ""
        
        if not admin_online:
            # Trigger AI Agent support
            history = db.get_support_messages(room_id, limit=10)
            
            # Format chat history for LLM prompt
            history_str = ""
            for m in history:
                role_label = "Sĩ tử" if m["sender_type"] == "user" else ("Admin" if m["sender_type"] == "admin" else "AI Trợ lý")
                history_str += f"{role_label}: {m['message']}\n"
            
            system_prompt = (
                "Bạn là Trợ lý Hỗ trợ Sĩ tử (AI Support Agent) của Sử Việt AI.\n"
                "Nhiệm vụ của bạn là hỗ trợ sĩ tử giải quyết các sự cố/thắc mắc về Sử Việt AI (ví dụ: lỗi nạp tiền, nạp lộn gói, thiếu tokens, lỗi hệ thống, cách dùng).\n"
                "Hãy xưng hô lễ phép, lịch sự, mang phong cách cổ trang một chút (ví dụ gọi người dùng là 'sĩ tử', 'nhân sĩ', tự xưng là 'tiểu tử' hoặc 'bản sự quán').\n"
                "Trả lời ngắn gọn, trực diện, dễ hiểu, tránh lan man. Nếu là lỗi nạp tiền, khuyên sĩ tử có thể dùng form báo lỗi hoặc đợi admin phản hồi trực tiếp khi online.\n\n"
                "LỊCH SỬ HỘI THOẠI HỖ TRỢ:\n"
                f"{history_str}"
                "AI Trợ lý:"
            )
            
            try:
                llm_name = db.get_setting("llm_name", os.environ.get("LLM_NAME", "openai"))
                llm = LLM().get_llm(llm_name)
                
                response = llm.invoke(system_prompt)
                ai_response = response.content if hasattr(response, "content") else str(response)
                # Strip thinking tags if any
                ai_response = re.sub(r"<think>.*?</think>", "", ai_response, flags=re.DOTALL).strip()
                import unicodedata
                ai_response = unicodedata.normalize('NFC', ai_response)
                
                if ai_response:
                    db.add_support_message(room_id, "ai", None, ai_response)
                    ai_replied = True
            except Exception as e:
                print(f"Error generating AI support response: {e}")
                
        return {
            "status": "success",
            "admin_online": admin_online,
            "ai_replied": ai_replied,
            "ai_response": ai_response
        }
    finally:
        db.close()

@router.get("/admin/rooms")
async def admin_get_rooms(admin: dict = Depends(get_current_admin)):
    """Admin retrieves all open support rooms."""
    db = UserDB()
    try:
        rooms = db.get_all_active_support_rooms()
        return {"rooms": rooms}
    finally:
        db.close()

@router.post("/admin/send")
async def admin_send_message(
    payload: AdminSendPayload,
    admin: dict = Depends(get_current_admin)
):
    """Admin sends a reply to a support chat room."""
    db = UserDB()
    try:
        room_id = payload.room_id
        message_text = payload.message.strip()
        if not message_text:
            raise HTTPException(status_code=400, detail="Tin nhắn không được bỏ trống")
            
        # Verify room exists
        db.cursor.execute("SELECT * FROM support_rooms WHERE id = ?", (room_id,))
        room = db.cursor.fetchone()
        if not room:
            raise HTTPException(status_code=404, detail="Không tìm thấy phòng hỗ trợ")

        # Save admin message
        db.add_support_message(room_id, "admin", admin["id"], message_text)
        
        # Touch activity
        mark_admin_active(admin["id"])
        
        return {"status": "success"}
    finally:
        db.close()
