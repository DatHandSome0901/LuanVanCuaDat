from fastapi import APIRouter, HTTPException, Depends, Body, File, UploadFile
from app.models.base_db import UserDB
from app.security.security import get_current_admin
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil
from uuid import uuid4
from app.config import settings
from langchain_google_vertexai import VertexAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
import os
router = APIRouter(prefix="/admin", tags=["Admin"])

class UserUpdate(BaseModel):
    token_balance: float

class UserBalanceAdjust(BaseModel):
    type: str # 'in' or 'out'
    amount: float

class UpdateUserAdmin(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None
    token_balance: Optional[float] = None
    is_admin: Optional[int] = None # 0 or 1

class PackageCreate(BaseModel):
    name: str
    tokens: int
    amount_vnd: int

class SettingsUpdate(BaseModel):
    rate_per_1000: Optional[float] = None
    logo_url: Optional[str] = None
    site_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None
    seo_author: Optional[str] = None
    favicon_url: Optional[str] = None
    no_answer_fallback: Optional[str] = None
    llm_name: Optional[str] = None 
    landing_bg: Optional[str] = None

def update_index_html_seo(site_title: str, description: str, keywords: str, author: str, favicon_url: str, logo_url: str):
    import re
    index_path = os.path.join(settings.DIR_ROOT, "frontend", "index.html")
    if not os.path.exists(index_path):
        return

    with open(index_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    original_content = content

    # Helper to update meta tag by name or property
    def update_meta(html_content, key, value, is_property=False):
        attr_name = "property" if is_property else "name"
        # Match <meta ... attr="key" ... content="..." ...> or vice versa
        # We replace the whole tag to ensure consistency
        pattern = fr'<meta\s+[^>]*?{attr_name}=["\']{re.escape(key)}["\'][^>]*?>'
        new_tag = f'<meta {attr_name}="{key}" content="{value}">'
        
        if re.search(pattern, html_content, re.IGNORECASE | re.DOTALL):
            return re.sub(pattern, new_tag, html_content, flags=re.IGNORECASE | re.DOTALL)
        else:
            # If not found, insert before </head>
            return html_content.replace("</head>", f"    {new_tag}\n</head>")

    # Update Title
    content = re.sub(r"<title>.*?</title>", f"<title>{site_title}</title>", content, flags=re.IGNORECASE | re.DOTALL)
    
    # Update Meta Tags
    content = update_meta(content, "description", description)
    content = update_meta(content, "keywords", keywords)
    content = update_meta(content, "author", author)
    content = update_meta(content, "og:title", site_title, True)
    content = update_meta(content, "og:description", description, True)
    content = update_meta(content, "twitter:title", site_title)
    content = update_meta(content, "twitter:description", description)
    
    if logo_url:
        content = update_meta(content, "og:image", logo_url, True)
        content = update_meta(content, "twitter:image", logo_url)

    # Update Favicon
    favicon_pattern = r'<link\s+[^>]*?rel=["\']icon["\'][^>]*?>'
    new_favicon_tag = f'<link rel="icon" href="{favicon_url}">'
    if re.search(favicon_pattern, content, re.IGNORECASE | re.DOTALL):
        content = re.sub(favicon_pattern, new_favicon_tag, content, flags=re.IGNORECASE | re.DOTALL)
    else:
        content = content.replace("</head>", f"    {new_favicon_tag}\n</head>")

    if content != original_content:
        with open(index_path, "w", encoding="utf-8") as f:
            f.write(content)

def extract_seo_from_index_html():
    import re
    index_path = os.path.join(settings.DIR_ROOT, "frontend", "index.html")
    if not os.path.exists(index_path):
        return {}

    try:
        with open(index_path, "r", encoding="utf-8") as f:
            content = f.read()

        res = {}
        # Title
        title_match = re.search(r"<title>(.*?)</title>", content, re.IGNORECASE | re.DOTALL)
        if title_match:
            res['site_title'] = title_match.group(1).strip()
            
        # Parse all meta tags
        meta_matches = re.findall(r'<meta\s+(.*?)>', content, re.IGNORECASE | re.DOTALL)
        for attrs in meta_matches:
            # Check for name="description"
            if re.search(r'name=["\']description["\']', attrs, re.IGNORECASE):
                c_match = re.search(r'content=["\'](.*?)["\']', attrs, re.IGNORECASE | re.DOTALL)
                if c_match: res['seo_description'] = c_match.group(1).strip()
            
            # Check for name="keywords"
            if re.search(r'name=["\']keywords["\']', attrs, re.IGNORECASE):
                c_match = re.search(r'content=["\'](.*?)["\']', attrs, re.IGNORECASE | re.DOTALL)
                if c_match: res['seo_keywords'] = c_match.group(1).strip()

            # Check for name="author"
            if re.search(r'name=["\']author["\']', attrs, re.IGNORECASE):
                c_match = re.search(r'content=["\'](.*?)["\']', attrs, re.IGNORECASE | re.DOTALL)
                if c_match: res['seo_author'] = c_match.group(1).strip()
                
        # Favicon
        favicon_match = re.search(r'<link\s+[^>]*?rel=["\']icon["\'][^>]*?href=["\'](.*?)["\']', content, re.IGNORECASE | re.DOTALL)
        if favicon_match:
            res['favicon_url'] = favicon_match.group(1).strip()
            
        return res
    except Exception as e:
        return {}

@router.get("/users")
async def get_all_users(admin: dict = Depends(get_current_admin)):
    db = UserDB()
    users = db.get_all()
    db.close()
    return {"users": users}

@router.post("/users/{user_id}/balance")
async def update_user_balance(
    user_id: int, 
    data: dict = Body(...), 
    admin: dict = Depends(get_current_admin)
):
    db = UserDB()
    user = next((u for u in db.get_all() if u['id'] == user_id), None)
    if not user:
        db.close()
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
    
    # Check if it's incremental adjustment or absolute set
    if "type" in data and "amount" in data:
        # Incremental
        tx_type = data["type"]
        amount = float(data["amount"])
        action_text = "Cộng số dư" if tx_type == "in" else "Trừ số dư"
        db.change_token_balance(
            user_id=user_id,
            amount=amount,
            description=f"Hệ thống: {action_text} {amount:.2f} tokens (Admin {admin['username']} điều chỉnh)",
            tx_type=tx_type
        )
        new_balance = user['token_balance'] + (amount if tx_type == 'in' else -amount)
    else:
        # Absolute set (backward compatibility or direct set)
        target_balance = float(data.get("token_balance", 0))
        diff = target_balance - user['token_balance']
        if diff != 0:
            action_text = "Cộng số dư" if diff > 0 else "Trừ số dư"
            db.change_token_balance(
                user_id=user_id,
                amount=abs(diff),
                description=f"Hệ thống: {action_text} {abs(diff):.2f} tokens (Admin {admin['username']} điều chỉnh)",
                tx_type="in" if diff > 0 else "out"
            )
        new_balance = target_balance
    
    db.close()
    return {"message": "Cập nhật số dư thành công", "new_balance": new_balance}

@router.delete("/users/{user_id}")
async def delete_user(user_id: int, admin: dict = Depends(get_current_admin)):
    db = UserDB()
    # PREVENT DELETING ADMINS
    db.cursor.execute("SELECT is_admin FROM users WHERE id = ?", (user_id,))
    row = db.cursor.fetchone()
    if row and row['is_admin']:
        db.close()
        raise HTTPException(status_code=400, detail="Không thể xóa tài khoản Admin")
        
    db.delete_user(user_id)
    db.close()
    return {"message": "Đã xóa người dùng thành công"}

@router.put("/users/{user_id}")
async def update_user_by_admin(
    user_id: int, 
    data: UpdateUserAdmin, 
    admin: dict = Depends(get_current_admin)
):
    from app.routers.auth import get_password_hash
    db = UserDB()
    
    # Update Full Name
    if data.full_name is not None:
        db.update_user_info(user_id, full_name=data.full_name)
    
    # Update Admin Status
    if data.is_admin is not None:
        db.update_user_info(user_id, is_admin=data.is_admin)
    
    # Update Password
    if data.password:
        hashed = get_password_hash(data.password)
        db.update_user_password(user_id, hashed)
        
    # Update Balance (reuse logic from existing post endpoint if needed, or just direct)
    if data.token_balance is not None:
        db.cursor.execute("SELECT token_balance FROM users WHERE id = ?", (user_id,))
        row = db.cursor.fetchone()
        if row:
            diff = data.token_balance - row['token_balance']
            if diff != 0:
                action_text = "Cộng số dư" if diff > 0 else "Trừ số dư"
                db.change_token_balance(
                    user_id=user_id,
                    amount=abs(diff),
                    description=f"Hệ thống: {action_text} {abs(diff):.2f} tokens (Admin {admin['username']} điều chỉnh)",
                    tx_type="in" if diff > 0 else "out"
                )
    
    db.close()
    return {"message": "Cập nhật người dùng thành công"}

@router.get("/users/{user_id}")
async def get_user_detail(user_id: int, admin: dict = Depends(get_current_admin)):
    db = UserDB()
    # Get user info
    db.cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = db.cursor.fetchone()
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
    
    user = dict(row)
    # Remove sensitive data
    user.pop('password', None)
    
    # Get stats
    history = db.get_token_history(user_id)
    logs = db.get_user_chat_logs(user_id)
    
    db.close()
    return {
        "user": user,
        "token_history": history,
        "chat_logs": logs
    }

@router.get("/packages")
async def get_all_packages(admin: dict = Depends(get_current_admin)):
    db = UserDB()
    packages = db.get_packages()
    db.close()
    return {"packages": packages}

@router.post("/packages")
async def create_package(data: PackageCreate, admin: dict = Depends(get_current_admin)):
    db = UserDB()
    db.add_package(data.name, data.tokens, data.amount_vnd)
    db.close()
    return {"message": "Tạo gói nạp thành công"}

@router.delete("/packages/{package_id}")
async def delete_package(package_id: int, admin: dict = Depends(get_current_admin)):
    db = UserDB()
    db.delete_package(package_id)
    db.close()
    return {"message": "Đã xóa gói nạp thành công"}

@router.put("/packages/{package_id}")
async def update_package(package_id: int, data: PackageCreate, admin: dict = Depends(get_current_admin)):
    db = UserDB()
    db.update_package(package_id, data.name, data.tokens, data.amount_vnd)
    db.close()
    return {"message": "Cập nhật gói nạp thành công"}

@router.get("/token-history")
async def get_all_token_history(admin: dict = Depends(get_current_admin)):
    db = UserDB()
    history = db.get_all_token_history()
    db.close()
    return {"history": history}

@router.get("/payments")
async def get_all_payments(admin: dict = Depends(get_current_admin)):
    db = UserDB()
    payments = db.get_all_payments()
    db.close()
    return {"payments": payments}

@router.get("/chat-logs")
async def get_all_chat_logs(admin: dict = Depends(get_current_admin)):
    db = UserDB()
    logs = db.get_all_chat_logs()
    db.close()
    return {"logs": logs}

@router.get("/settings")
async def get_all_settings(admin: dict = Depends(get_current_admin)):
    db = UserDB()
    html_seo = extract_seo_from_index_html()
    
    rate = db.get_setting("rate_per_1000", "1.0")
    logo_url = db.get_setting("logo_url", "")
    landing_bg = db.get_setting("landing_bg", "")
    
    # Use HTML values as default if DB doesn't have them
    site_title = db.get_setting("site_title", html_seo.get('site_title', "Chatbot Historical"))
    seo_description = db.get_setting("seo_description", html_seo.get('seo_description', ""))
    seo_keywords = db.get_setting("seo_keywords", html_seo.get('seo_keywords', ""))
    seo_author = db.get_setting("seo_author", html_seo.get('seo_author', "Chatbot Team"))
    favicon_url = db.get_setting("favicon_url", html_seo.get('favicon_url', ""))
    no_answer_fallback = db.get_setting("no_answer_fallback", "Xin lỗi, hiện tại tôi chưa tìm thấy câu trả lời chính xác cho vấn đề này.")
    llm_name = db.get_setting("llm_name", "openai")
    
    db.close()
    return {
        "rate_per_1000": float(rate),
        "logo_url": logo_url,
        "site_title": site_title,
        "landing_bg": landing_bg, 
        "seo_description": seo_description,
        "seo_keywords": seo_keywords,
        "seo_author": seo_author,
        "favicon_url": favicon_url,
        "llm_name": llm_name,
        "no_answer_fallback": no_answer_fallback
    }

@router.post("/settings")
async def update_settings(
    data: SettingsUpdate, 
    admin: dict = Depends(get_current_admin)
):
    db = UserDB()
    changed_any = False
    seo_changed = False

    # Define fields to check
    fields = [
        ("rate_per_1000", data.rate_per_1000),
        ("logo_url", data.logo_url),
        ("site_title", data.site_title),
        ("landing_bg", data.landing_bg),
        ("seo_description", data.seo_description),
        ("seo_keywords", data.seo_keywords),
        ("seo_author", data.seo_author),
        ("favicon_url", data.favicon_url),
        ("llm_name", data.llm_name),
        ("no_answer_fallback", data.no_answer_fallback)
    ]

    for key, new_val in fields:
        if new_val is not None:
            current_val = db.get_setting(key, "")
            # Special case for rate_per_1000 as it's a float stored as string
            if key == "rate_per_1000":
                try:
                    if float(current_val) != float(new_val):
                        db.set_setting(key, str(new_val))
                        changed_any = True
                except:
                    db.set_setting(key, str(new_val))
                    changed_any = True
            elif str(current_val) != str(new_val):
                db.set_setting(key, str(new_val))
                changed_any = True
                if key in ["site_title", "seo_description", "seo_keywords", "seo_author", "favicon_url", "logo_url"]:
                    seo_changed = True

    if seo_changed:
        current_title = db.get_setting("site_title", "Chatbot Phật Giáo")
        current_desc = db.get_setting("seo_description", "")
        current_keys = db.get_setting("seo_keywords", "")
        current_author = db.get_setting("seo_author", "")
        current_favicon = db.get_setting("favicon_url", "/favicon.svg")
        current_logo = db.get_setting("logo_url", "")
        update_index_html_seo(current_title, current_desc, current_keys, current_author, current_favicon, current_logo)
    
    db.close()
    return {"message": "Cập nhật cấu hình thành công", "changed": changed_any}

@router.post("/upload-logo")
async def upload_logo(
    file: UploadFile = File(...),
    admin: dict = Depends(get_current_admin)
):
    try:
        # Ngăn chặn Path Traversal
        safe_filename = os.path.basename(file.filename)
        file_extension = os.path.splitext(safe_filename)[1]
        unique_filename = f"logo_{uuid4().hex}{file_extension}"
        
        folder_path = os.path.join(settings.DIR_ROOT, "utils", "download")
        os.makedirs(folder_path, exist_ok=True)
        file_path = os.path.join(folder_path, unique_filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Trả về URL xem file (re-use /upload-file router logic)
        view_url = f"/api/v1/upload-file/view/{unique_filename}"
        
        return {"logo_url": view_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi tải lên logo: {str(e)}")
    
##
@router.get("/public/settings")
async def get_public_settings():
    db = UserDB()

    return {
        "logo_url": db.get_setting("logo_url", "/default.jpg"),
        "site_title": db.get_setting("site_title", "Chatbot Historical"),
        "landing_bg": db.get_setting("landing_bg", ""),
        "favicon_url": db.get_setting("favicon_url", "")
    }


@router.get("/active-users")
async def get_active_users(limit: int = 50, admin: dict = Depends(get_current_admin)):
    db = UserDB()
    logins = db.get_recent_logins(limit)
    db.close()
    return {"logins": logins}

@router.get("/payment-reports")
async def get_payment_reports(admin: dict = Depends(get_current_admin)):
    db = UserDB()
    reports = db.get_all_payment_reports()
    db.close()
    return {"reports": reports}

@router.get("/sync-from-html")
async def sync_from_html(admin: dict = Depends(get_current_admin)):
    html_seo = extract_seo_from_index_html()
    return html_seo

# ===============================
# APPROVE KNOWLEDGE (CHUẨN LANGCHAIN)
# ===============================
@router.post("/knowledge/approve/{id}")
async def approve_knowledge(id: int, admin: dict = Depends(get_current_admin)):
    db = UserDB()

    # ===== lấy data =====
    db.cursor.execute(
        "SELECT question, answer FROM pending_knowledge WHERE id = ?", (id,))
    row = db.cursor.fetchone()

    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="Không tìm thấy")

    question = row["question"]
    answer = row["answer"]

    # ===== CHECK TRÙNG =====
    db.cursor.execute("""
        SELECT * FROM pending_knowledge 
        WHERE question = ? AND approved = 1
    """, (question,))
    exist = db.cursor.fetchone()

    if exist:
        db.close()
        raise HTTPException(status_code=400, detail="Câu hỏi đã tồn tại")

    # ===== TẠO TEXT =====
    text = question + " " + answer

    # ===== EMBEDDING =====
    embedding = VertexAIEmbeddings(model_name="text-embedding-004")

    # ===== FAISS (LANGCHAIN) =====
    store_path = "output"
    os.makedirs(store_path, exist_ok=True)

    # tạo document
    doc = Document(
        page_content=text,
        metadata={
            "source": "history",
            "question": question
        }
    )

    # load hoặc tạo mới
    index_file = os.path.join(store_path, "index.faiss")

    if os.path.exists(index_file):
        vectorstore = FAISS.load_local(
            store_path,
            embedding,
            allow_dangerous_deserialization=True
        )
        vectorstore.add_documents([doc])
    else:
        vectorstore = FAISS.from_documents([doc], embedding)

    # lưu lại
    vectorstore.save_local(store_path)

    print("✅ TOTAL VECTOR:", len(vectorstore.docstore._dict))

    # ===== UPDATE DB =====
    db.approve_knowledge(id)
    db.close()

    return {"msg": "approved + saved to vector"}
# ===============================
# APPROVED KNOWLEDGE (LỊCH SỬ)
# ===============================
@router.get("/knowledge/approved")
async def get_approved_knowledge(admin: dict = Depends(get_current_admin)):
    db = UserDB()

    db.cursor.execute("""
        SELECT * FROM pending_knowledge 
        WHERE approved = 1
        ORDER BY created_at DESC
    """)

    data = [dict(row) for row in db.cursor.fetchall()]
    db.close()

    return {"data": data}
@router.get("/knowledge/pending")
async def get_pending_knowledge(admin: dict = Depends(get_current_admin)):
    db = UserDB()
    data = db.get_pending_knowledge()
    db.close()
    return {"data": data}
@router.delete("/knowledge/{id}")
async def delete_knowledge(id: int, admin: dict = Depends(get_current_admin)):
    db = UserDB()

    # check tồn tại
    db.cursor.execute("SELECT * FROM pending_knowledge WHERE id = ?", (id,))
    row = db.cursor.fetchone()

    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="Không tìm thấy")

    # xóa
    db.delete_knowledge(id)

    db.close()
    return {"msg": "deleted"}