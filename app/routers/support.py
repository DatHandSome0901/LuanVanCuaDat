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
            # Trigger AI Agent support: Fetch the 10 most recent messages, then reverse to chronological order (ASC)
            db.cursor.execute("""
                SELECT sm.*, u.username, u.picture_url
                FROM support_messages sm
                LEFT JOIN users u ON sm.sender_id = u.id
                WHERE sm.room_id = ?
                ORDER BY sm.created_at DESC
                LIMIT 10
            """, (room_id,))
            history = [dict(row) for row in db.cursor.fetchall()]
            history.reverse()
            
            # Format chat history for LLM prompt
            history_str = ""
            for m in history:
                role_label = "Sĩ tử" if m["sender_type"] == "user" else ("Admin" if m["sender_type"] == "admin" else "AI Trợ lý")
                history_str += f"{role_label}: {m['message']}\n"
            
            system_prompt = (
                "Bạn là Trợ lý Hỗ trợ Sĩ tử (AI Support Agent) của Sử Việt AI.\n"
                "Nhiệm vụ của bạn là hỗ trợ sĩ tử giải quyết các sự cố, thắc mắc về các chức năng và dịch vụ của hệ thống Sử Việt AI.\n\n"
                "DƯỚI ĐÂY LÀ THÔNG TIN VỀ CÁC CHỨC NĂNG CÓ TRONG HỆ THỐNG SỬ VIỆT AI:\n"
                "1. Trò chuyện Lịch sử (Main Chatbot):\n"
                "   - Đàm đạo, trả lời các câu hỏi về Lịch sử Việt Nam bằng mô hình TALRAG thông minh.\n"
                "   - RAG kết hợp đa nguồn: Approved Knowledge (kiến thức đã duyệt), tài liệu PDF qua Vertex AI, và OpenAI.\n"
                "   - Tự động classify intent để tính điểm tài liệu (Semantic, Temporal, Causal scores) và ưu tiên hiển thị file PDF.\n"
                "   - Nếu chatbot không có sẵn câu trả lời phù hợp trong dữ liệu, hệ thống tự động tìm kiếm Web (Web Learning Agent), tổng hợp câu trả lời từ các nguồn uy tín kèm link tham khảo.\n"
                "   - Trò chuyện trừ token dựa trên độ dài câu hỏi/trả lời và mô hình sử dụng.\n"
                "2. Cơ chế Tự học (Auto-learning & Self-learning loop):\n"
                "   - Các câu hỏi được chatbot trả lời từ web sẽ được lưu vào danh sách chờ duyệt (Pending Knowledge).\n"
                "   - Nếu câu trả lời nhận được từ 5 lượt thích (likes) của sĩ tử hoặc được Admin duyệt trực tiếp, hệ thống sẽ tự động học và nạp vào FAISS vector store.\n"
                "3. Hệ thống Q&A Đố vui / Điểm danh hàng ngày (Sử Quán Q&A):\n"
                "   - Mỗi ngày cung cấp 5 câu hỏi lịch sử ngẫu nhiên để sĩ tử thử sức.\n"
                "   - Trả lời đúng được thưởng Token miễn phí: Ngày thường nhận 2 Tokens, Chủ nhật nhận 5 Tokens.\n"
                "   - Duy trì chuỗi điểm danh liên tục (streak) 7 ngày nhận thêm 10 Tokens.\n"
                "   - Có các mốc thành tích hàng ngày: Đúng 3 câu nhận 1 Token, Đúng 5 câu nhận 2 Tokens.\n"
                "4. Trò chơi dã sử 'Hào Khí Tây Sơn' / 'Lam Sơn':\n"
                "   - Trò chơi mini-game lịch sử đồ họa Phaser tích hợp trực tiếp, giúp sĩ tử thư giãn giải trí.\n"
                "5. Hệ thống Nạp Token & Thanh toán tự động (SePay):\n"
                "   - Nạp tiền mua token thông qua chuyển khoản quét mã QR VietQR tự động qua cổng SePay.\n"
                "   - Hệ thống tự động rà soát giao dịch ngân hàng (Live polling) và cộng token lập tức khi giao dịch thành công.\n"
                "   - Nếu gặp lỗi nạp tiền (như chuyển sai cú pháp, sai số tiền, lỗi quét mã QR), sĩ tử có thể dùng tính năng 'Khai Báo Sự Cố' (nằm trong tab bên cạnh) kèm email liên hệ, ban quản trị sẽ rà soát thủ công để cộng bù token.\n"
                "6. Trang Cá Nhân & Nhật ký:\n"
                "   - Xem số dư token, lịch sử giao dịch nạp tiền, lịch sử trừ token đàm đạo, và lịch sử đăng nhập IP/User Agent.\n"
                "7. Đăng nhập đa phương thức: Hỗ trợ đăng nhập nhanh bằng Google OAuth 2.0 hoặc tài khoản thường.\n"
                "8. Trang Quản Trị (Admin Dashboard):\n"
                "   - Dành riêng cho quan quản trị: Quản lý người dùng, quản lý gói nạp, kiểm tra logs hệ thống, duyệt kiến thức tự học (Pending Knowledge) và phòng đàm đạo hỗ trợ sĩ tử trực tuyến (Support Chat).\n\n"
                "HƯỚNG DẪN ỨNG XỬ & XƯNG HÔ & PHẠM VI HỖ TRỢ (QUAN TRỌNG):\n"
                "- Bạn CHỈ được phép hỗ trợ các vấn đề, thắc mắc, sự cố liên quan trực tiếp đến hệ thống và chức năng của website Sử Việt AI (như tài khoản, nạp token, game Lam Sơn/Hào Khí Tây Sơn, đố vui Q&A, lỗi chức năng web).\n"
                "- TUYỆT ĐỐI KHÔNG trả lời các câu hỏi ngoài phạm vi hệ thống (ví dụ: viết code lập trình, giải toán, dịch thuật, trò chuyện ngoài lề hoặc các kiến thức không liên quan đến việc vận hành website Sử Việt AI).\n"
                "- Nếu sĩ tử hỏi những chủ đề không liên quan đến hệ thống, hãy lịch sự từ chối bằng phong cách cổ trang (ví dụ: 'Tiểu tử chỉ có thể hỗ trợ các vấn đề kỹ thuật và chức năng liên quan đến Sử Việt AI, xin quý hữu thông cảm hỏi các bậc tiền bối khác về chủ đề ngoài này').\n"
                "- Hãy xưng hô lễ phép, lịch sự, mang phong cách cổ trang một chút (ví dụ gọi người dùng là 'sĩ tử', 'nhân sĩ', 'quý hữu', tự xưng là 'tiểu tử' hoặc 'bản sự quán').\n"
                "- Trả lời ngắn gọn, trực diện, dễ hiểu, tránh lan man.\n"
                "- Nếu sĩ tử báo lỗi nạp tiền hoặc giao dịch bị lỗi, hãy khuyên họ sử dụng tính năng 'Gửi Sớ Khai Báo Sự Cố' (nằm ở tab 'Khai Báo Sự Cố' kề bên) hoặc chờ Admin online xử lý trực tiếp.\n\n"
                "LỊCH SỬ HỘI THOẠI HỖ TRỢ:\n"
                f"{history_str}"
                "AI Trợ lý:"
            )
            
            try:
                llm_name = db.get_setting("llm_name", os.environ.get("LLM_NAME", "openai"))
                
                # Optimize latency: If default LLM is vertex, fall back to direct openai or direct gemini if keys exist
                support_llm = llm_name
                if llm_name == "vertex":
                    if os.environ.get("KEY_API_OPENAI"):
                        support_llm = "openai"
                    elif os.environ.get("KEY_API_GOOGLE"):
                        support_llm = "gemini"
                
                llm = LLM().get_llm(support_llm)
                
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
