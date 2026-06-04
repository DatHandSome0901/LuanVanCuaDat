from fastapi import APIRouter, HTTPException, Depends, Body, File, UploadFile, BackgroundTasks
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
from ingestion.retriever import clear_faiss_cache
from ingestion.vectorize import remove_from_vector_store
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
    chat_bg: Optional[str] = None
    game_enabled: Optional[int] = None
    landing_hero_title: Optional[str] = None
    landing_hero_subtitle: Optional[str] = None
    landing_section_eras_title: Optional[str] = None
    landing_section_stats_title: Optional[str] = None
    landing_section_features_title: Optional[str] = None
    landing_eras_json: Optional[str] = None
    landing_footer_company: Optional[str] = None
    landing_footer_mst: Optional[str] = None
    landing_footer_representative: Optional[str] = None
    landing_footer_address: Optional[str] = None
    landing_footer_phone: Optional[str] = None
    landing_footer_about_us: Optional[str] = None
    landing_footer_terms: Optional[str] = None
    landing_footer_privacy: Optional[str] = None
    landing_hero_words: Optional[str] = None
    landing_process_json: Optional[str] = None
    landing_features_json: Optional[str] = None
    landing_stats_json: Optional[str] = None
    landing_highlights_json: Optional[str] = None
    landing_contact_email: Optional[str] = None
    landing_contact_zalo_num: Optional[str] = None
    landing_contact_zalo_link: Optional[str] = None
    landing_contact_fb_link: Optional[str] = None

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
    chat_bg = db.get_setting("chat_bg", "")
    
    # Use HTML values as default if DB doesn't have them
    site_title = db.get_setting("site_title", html_seo.get('site_title', "Chatbot Historical"))
    seo_description = db.get_setting("seo_description", html_seo.get('seo_description', ""))
    seo_keywords = db.get_setting("seo_keywords", html_seo.get('seo_keywords', ""))
    seo_author = db.get_setting("seo_author", html_seo.get('seo_author', "Chatbot Team"))
    favicon_url = db.get_setting("favicon_url", html_seo.get('favicon_url', ""))
    no_answer_fallback = db.get_setting("no_answer_fallback", "Xin lỗi, hiện tại tôi chưa tìm thấy câu trả lời chính xác cho vấn đề này.")
    llm_name = db.get_setting("llm_name", "openai")
    
    game_enabled = db.get_setting("game_enabled", "1")
    landing_hero_title = db.get_setting("landing_hero_title", "Khám phá tinh hoa")
    landing_hero_subtitle = db.get_setting("landing_hero_subtitle", "Hỏi đáp, tra cứu và tìm hiểu kiến thức lịch sử chính xác thông qua sức mạnh của Trí Tuệ Nhân Tạo. Nền tảng học tập toàn diện cho mọi thế hệ.")
    landing_section_eras_title = db.get_setting("landing_section_eras_title", "Một nền tảng vận hành xuyên suốt")
    landing_section_stats_title = db.get_setting("landing_section_stats_title", "Tại sao nên chọn Sử Việt AI?")
    landing_section_features_title = db.get_setting("landing_section_features_title", "Giải pháp toàn diện cho hành trình học tập")
    landing_eras_json = db.get_setting("landing_eras_json", "")
    landing_footer_company = db.get_setting("landing_footer_company", "CÔNG TY TNHH MTV CÔNG NGHỆ KỸ THUẬT TIÊN PHONG")
    landing_footer_mst = db.get_setting("landing_footer_mst", "1801526082")
    landing_footer_representative = db.get_setting("landing_footer_representative", "NGÔ HỒ ANH KHÔI")
    landing_footer_address = db.get_setting("landing_footer_address", "P16, Đường số 8, KDC lô 49, Khu đô thị Nam Cần Thơ, Phường Cái Răng, TP. Cần Thơ")
    landing_footer_phone = db.get_setting("landing_footer_phone", "0916 416 409")
    landing_footer_about_us = db.get_setting("landing_footer_about_us", "Sử Việt AI được xây dựng và phát triển bởi CÔNG TY TNHH MTV CÔNG NGHỆ KỸ THUẬT TIÊN PHONG với sứ mệnh số hóa và bảo tồn các giá trị lịch sử dân tộc. Nền tảng ứng dụng công nghệ Trí tuệ nhân tạo (AI) hiện đại để tạo ra một chuyên gia lịch sử ảo, giúp học sinh, sinh viên và những người yêu thích lịch sử tiếp cận kiến thức một cách dễ dàng và sinh động.")
    landing_footer_terms = db.get_setting("landing_footer_terms", "1. Chấp nhận điều khoản\nBằng việc truy cập và sử dụng Sử Việt AI, bạn đồng ý tuân thủ các điều khoản và điều kiện dưới đây. Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.\n\n2. Quyền và trách nhiệm người dùng\nBạn cam kết sử dụng dịch vụ vào mục đích học tập, nghiên cứu hợp pháp. Không sử dụng AI để tạo ra, phát tán các nội dung xuyên tạc lịch sử, chống phá nhà nước hoặc vi phạm thuần phong mỹ tục Việt Nam.\n\n3. Giới hạn trách nhiệm\nMặc dù Sử Việt AI đã được huấn luyện bằng các nguồn sử liệu chính thống, nhưng vì bản chất của Trí tuệ nhân tạo, đôi khi hệ thống có thể cung cấp thông tin thiếu sót hoặc chưa hoàn toàn chính xác. Người dùng nên tham khảo và đối chiếu thông tin khi dùng cho các mục đích học thuật quan trọng.\n\n4. Bản quyền\nToàn bộ thiết kế, logo, mã nguồn và hệ thống thuộc bản quyền của CÔNG TY TNHH MTV CÔNG NGHỆ KỸ THUẬT TIÊN PHONG. Nghiêm cấm sao chép dưới mọi hình thức.")
    landing_footer_privacy = db.get_setting("landing_footer_privacy", "1. Thu thập thông tin\nChúng tôi chỉ thu thập các thông tin cơ bản khi bạn đăng nhập (Tên, Email) và nội dung các đoạn chat để phục vụ cho việc cải thiện chất lượng của AI cũng như lưu trữ lịch sử hội thoại cho cá nhân bạn.\n\n2. Bảo mật dữ liệu\nTất cả dữ liệu của bạn đều được mã hóa và lưu trữ an toàn trên máy chủ của chúng tôi. Chúng tôi cam kết không bán, không trao đổi hoặc chia sẻ thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào vì mục đích thương mại.\n\n3. Quyền kiểm soát của người dùng\nBạn có toàn quyền xem lại, xóa lịch sử chat hoặc yêu cầu xóa toàn bộ tài khoản và dữ liệu cá nhân bất cứ lúc nào thông qua chức năng Quản lý tài khoản.")
    
    landing_hero_words = db.get_setting("landing_hero_words", "Lịch Sử Việt Nam, Văn Hoá Dân Tộc, Trí Tuệ Cha Ông, Hào Khí Đông A")
    landing_process_json = db.get_setting("landing_process_json", "")
    landing_features_json = db.get_setting("landing_features_json", "")
    landing_stats_json = db.get_setting("landing_stats_json", "")
    landing_highlights_json = db.get_setting("landing_highlights_json", "")
    landing_contact_email = db.get_setting("landing_contact_email", "nguyenquocdat888888@gmail.com")
    landing_contact_zalo_num = db.get_setting("landing_contact_zalo_num", "0896 498 997")
    landing_contact_zalo_link = db.get_setting("landing_contact_zalo_link", "https://zalo.me/0896498997")
    landing_contact_fb_link = db.get_setting("landing_contact_fb_link", "https://www.facebook.com/nguyen.quoc.at.383270")

    db.close()
    return {
        "rate_per_1000": float(rate),
        "logo_url": logo_url,
        "site_title": site_title,
        "landing_bg": landing_bg, 
        "chat_bg": chat_bg,
        "seo_description": seo_description,
        "seo_keywords": seo_keywords,
        "seo_author": seo_author,
        "favicon_url": favicon_url,
        "llm_name": llm_name,
        "no_answer_fallback": no_answer_fallback,
        "game_enabled": int(game_enabled),
        "landing_hero_title": landing_hero_title,
        "landing_hero_subtitle": landing_hero_subtitle,
        "landing_section_eras_title": landing_section_eras_title,
        "landing_section_stats_title": landing_section_stats_title,
        "landing_section_features_title": landing_section_features_title,
        "landing_eras_json": landing_eras_json,
        "landing_footer_company": landing_footer_company,
        "landing_footer_mst": landing_footer_mst,
        "landing_footer_representative": landing_footer_representative,
        "landing_footer_address": landing_footer_address,
        "landing_footer_phone": landing_footer_phone,
        "landing_footer_about_us": landing_footer_about_us,
        "landing_footer_terms": landing_footer_terms,
        "landing_footer_privacy": landing_footer_privacy,
        "landing_hero_words": landing_hero_words,
        "landing_process_json": landing_process_json,
        "landing_features_json": landing_features_json,
        "landing_stats_json": landing_stats_json,
        "landing_highlights_json": landing_highlights_json,
        "landing_contact_email": landing_contact_email,
        "landing_contact_zalo_num": landing_contact_zalo_num,
        "landing_contact_zalo_link": landing_contact_zalo_link,
        "landing_contact_fb_link": landing_contact_fb_link
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
        ("chat_bg", data.chat_bg),
        ("seo_description", data.seo_description),
        ("seo_keywords", data.seo_keywords),
        ("seo_author", data.seo_author),
        ("favicon_url", data.favicon_url),
        ("llm_name", data.llm_name),
        ("no_answer_fallback", data.no_answer_fallback),
        ("game_enabled", data.game_enabled),
        ("landing_hero_title", data.landing_hero_title),
        ("landing_hero_subtitle", data.landing_hero_subtitle),
        ("landing_section_eras_title", data.landing_section_eras_title),
        ("landing_section_stats_title", data.landing_section_stats_title),
        ("landing_section_features_title", data.landing_section_features_title),
        ("landing_eras_json", data.landing_eras_json),
        ("landing_footer_company", data.landing_footer_company),
        ("landing_footer_mst", data.landing_footer_mst),
        ("landing_footer_representative", data.landing_footer_representative),
        ("landing_footer_address", data.landing_footer_address),
        ("landing_footer_phone", data.landing_footer_phone),
        ("landing_footer_about_us", data.landing_footer_about_us),
        ("landing_footer_terms", data.landing_footer_terms),
        ("landing_footer_privacy", data.landing_footer_privacy),
        ("landing_hero_words", data.landing_hero_words),
        ("landing_process_json", data.landing_process_json),
        ("landing_features_json", data.landing_features_json),
        ("landing_stats_json", data.landing_stats_json),
        ("landing_highlights_json", data.landing_highlights_json),
        ("landing_contact_email", data.landing_contact_email),
        ("landing_contact_zalo_num", data.landing_contact_zalo_num),
        ("landing_contact_zalo_link", data.landing_contact_zalo_link),
        ("landing_contact_fb_link", data.landing_contact_fb_link)
    ]

    for key, new_val in fields:
        if new_val is not None:
            current_val = db.get_setting(key, "")
            # Special case for rate_per_1000 and game_enabled
            if key == "rate_per_1000":
                try:
                    if float(current_val) != float(new_val):
                        db.set_setting(key, str(new_val))
                        changed_any = True
                except:
                    db.set_setting(key, str(new_val))
                    changed_any = True
            elif key == "game_enabled":
                try:
                    if int(current_val) != int(new_val):
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
    res = {
        "logo_url": db.get_setting("logo_url", "/default.jpg"),
        "site_title": db.get_setting("site_title", "Chatbot Historical"),
        "landing_bg": db.get_setting("landing_bg", ""),
        "chat_bg": db.get_setting("chat_bg", ""),
        "favicon_url": db.get_setting("favicon_url", ""),
        "game_enabled": int(db.get_setting("game_enabled", "1")),
        "landing_hero_title": db.get_setting("landing_hero_title", "Khám phá tinh hoa"),
        "landing_hero_subtitle": db.get_setting("landing_hero_subtitle", "Hỏi đáp, tra cứu và tìm hiểu kiến thức lịch sử chính xác thông qua sức mạnh của Trí Tuệ Nhân Tạo. Nền tảng học tập toàn diện cho mọi thế hệ."),
        "landing_section_eras_title": db.get_setting("landing_section_eras_title", "Một nền tảng vận hành xuyên suốt"),
        "landing_section_stats_title": db.get_setting("landing_section_stats_title", "Tại sao nên chọn Sử Việt AI?"),
        "landing_section_features_title": db.get_setting("landing_section_features_title", "Giải pháp toàn diện cho hành trình học tập"),
        "landing_eras_json": db.get_setting("landing_eras_json", ""),
        "landing_footer_company": db.get_setting("landing_footer_company", "CÔNG TY TNHH MTV CÔNG NGHỆ KỸ THUẬT TIÊN PHONG"),
        "landing_footer_mst": db.get_setting("landing_footer_mst", "1801526082"),
        "landing_footer_representative": db.get_setting("landing_footer_representative", "NGÔ HỒ ANH KHÔI"),
        "landing_footer_address": db.get_setting("landing_footer_address", "P16, Đường số 8, KDC lô 49, Khu đô thị Nam Cần Thơ, Phường Cái Răng, TP. Cần Thơ"),
        "landing_footer_phone": db.get_setting("landing_footer_phone", "0916 416 409"),
        "landing_footer_about_us": db.get_setting("landing_footer_about_us", "Sử Việt AI được xây dựng và phát triển bởi CÔNG TY TNHH MTV CÔNG NGHỆ KỸ THUẬT TIÊN PHONG với sứ mệnh số hóa và bảo tồn các giá trị lịch sử dân tộc. Nền tảng ứng dụng công nghệ Trí tuệ nhân tạo (AI) hiện đại để tạo ra một chuyên gia lịch sử ảo, giúp học sinh, sinh viên và những người yêu thích lịch sử tiếp cận kiến thức một cách dễ dàng và sinh động."),
        "landing_footer_terms": db.get_setting("landing_footer_terms", "1. Chấp nhận điều khoản\nBằng việc truy cập và sử dụng Sử Việt AI, bạn đồng ý tuân thủ các điều khoản và điều kiện dưới đây. Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.\n\n2. Quyền và trách nhiệm người dùng\nBạn cam kết sử dụng dịch vụ vào mục đích học tập, nghiên cứu hợp pháp. Không sử dụng AI để tạo ra, phát tán các nội dung xuyên tạc lịch sử, chống phá nhà nước hoặc vi phạm thuần phong mỹ tục Việt Nam.\n\n3. Giới hạn trách nhiệm\nMặc dù Sử Việt AI đã được huấn luyện bằng các nguồn sử liệu chính thống, nhưng vì bản chất của Trí tuệ nhân tạo, đôi khi hệ thống có thể cung cấp thông tin thiếu sót hoặc chưa hoàn toàn chính xác. Người dùng nên tham khảo và đối chiếu thông tin khi dùng cho các mục đích học thuật quan trọng.\n\n4. Bản quyền\nToàn bộ thiết kế, logo, mã nguồn và hệ thống thuộc bản quyền của CÔNG TY TNHH MTV CÔNG NGHỆ KỸ THUẬT TIÊN PHONG. Nghiêm cấm sao chép dưới mọi hình thức."),
        "landing_footer_privacy": db.get_setting("landing_footer_privacy", "1. Thu thập thông tin\nChúng tôi chỉ thu thập các thông tin cơ bản khi bạn đăng nhập (Tên, Email) và nội dung các đoạn chat để phục vụ cho việc cải thiện chất lượng của AI cũng như lưu trữ lịch sử hội thoại cho cá nhân bạn.\n\n2. Bảo mật dữ liệu\nTất cả dữ liệu của bạn đều được mã hóa và lưu trữ an toàn trên máy chủ của chúng tôi. Chúng tôi cam kết không bán, không trao đổi hoặc chia sẻ thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào vì mục đích thương mại.\n\n3. Quyền kiểm soát của người dùng\nBạn có toàn quyền xem lại, xóa lịch sử chat hoặc yêu cầu xóa toàn bộ tài khoản và dữ liệu cá nhân bất cứ lúc nào thông qua chức năng Quản lý tài khoản."),
        "landing_hero_words": db.get_setting("landing_hero_words", "Lịch Sử Việt Nam, Văn Hoá Dân Tộc, Trí Tuệ Cha Ông, Hào Khí Đông A"),
        "landing_process_json": db.get_setting("landing_process_json", ""),
        "landing_features_json": db.get_setting("landing_features_json", ""),
        "landing_stats_json": db.get_setting("landing_stats_json", ""),
        "landing_highlights_json": db.get_setting("landing_highlights_json", ""),
        "landing_contact_email": db.get_setting("landing_contact_email", "nguyenquocdat888888@gmail.com"),
        "landing_contact_zalo_num": db.get_setting("landing_contact_zalo_num", "0896 498 997"),
        "landing_contact_zalo_link": db.get_setting("landing_contact_zalo_link", "https://zalo.me/0896498997"),
        "landing_contact_fb_link": db.get_setting("landing_contact_fb_link", "https://www.facebook.com/nguyen.quoc.at.383270")
    }
    db.close()
    return res


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

class ReportStatusUpdate(BaseModel):
    status: str
    admin_reply: Optional[str] = None
    token_adjustment: Optional[float] = None

@router.post("/payment-reports/{report_id}/status")
async def update_report_status(
    report_id: int,
    payload: ReportStatusUpdate,
    background_tasks: BackgroundTasks,
    admin: dict = Depends(get_current_admin)
):
    if payload.status not in ["resolved", "ignored"]:
        raise HTTPException(status_code=400, detail="Trạng thái không hợp lệ")

    db = UserDB()
    db.cursor.execute("SELECT * FROM payment_reports WHERE id = ?", (report_id,))
    row = db.cursor.fetchone()
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="Không tìm thấy báo cáo")
    report = dict(row)

    # Apply token adjustment if resolved and positive amount specified
    if payload.status == "resolved" and payload.token_adjustment and payload.token_adjustment > 0:
        db.change_token_balance(
            user_id=report["user_id"],
            amount=payload.token_adjustment,
            description=f"Hệ thống: Duyệt nạp {payload.token_adjustment:.0f} tokens từ sớ báo cáo #{report_id}",
            tx_type="in"
        )

    db.update_payment_report_status(report_id, payload.status)
    db.close()

    to_email = report.get("email")
    if payload.status == "resolved" and to_email:
        from app.utils.email_helper import send_resolution_email
        background_tasks.add_task(
            send_resolution_email,
            to_email,
            report_id,
            report.get("description", ""),
            payload.admin_reply
        )

    return {"message": "Cập nhật trạng thái thành công"}

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
    embed_type = os.getenv("EMBEDDING_MODEL_NAME", "vertex")
    if embed_type == "vertex":
        embedding = VertexAIEmbeddings(model_name="text-embedding-004")
        sub_folder = "vertex"
    else:
        from langchain_openai import OpenAIEmbeddings
        embedding = OpenAIEmbeddings()
        sub_folder = "openai"

    # ===== FAISS (LANGCHAIN) =====
    # Lưu vào output/vertex hoặc output/openai để FilesChatAgent.retrieve tìm thấy ở nhánh EXTRA
    store_path = os.path.join("output", sub_folder)
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

    print(f"✅ ĐÃ ADD VECTOR (Model: {embed_type})")
    print("✅ TOTAL VECTOR:", len(vectorstore.docstore._dict))

    # ===== UPDATE DB =====
    db.approve_knowledge(id)
    db.close()
    clear_faiss_cache()

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
    # Nếu đã được duyệt (approved=1), thực hiện xóa khỏi Vector Store luôn
    if row["approved"] == 1:
        try:
            llm_name = db.get_setting("llm_name", os.environ.get("LLM_NAME", "openai"))
            remove_from_vector_store(row["question"], llm_name=llm_name)
        except Exception as e:
            print(f"⚠️ Lỗi khi xóa khỏi FAISS: {e}")

    db.delete_knowledge(id)

    db.close()
    clear_faiss_cache()
    return {"msg": "deleted"}
# ===============================
# QUẢN LÝ FEEDBACK (RATING)
# ===============================

@router.get("/feedback/negative")
async def get_negative_feedback(current_user: dict = Depends(get_current_admin)):
    """Lấy danh sách các câu trả lời bị người dùng chê (Dislike)"""
    db = UserDB()
    query = """
        SELECT m.id as message_id, m.content as answer, m.created_at, m.rating,
               prev_m.content as question, c.id as conversation_id, u.username
        FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        JOIN users u ON c.user_id = u.id
        LEFT JOIN messages prev_m ON prev_m.conversation_id = m.conversation_id 
             AND prev_m.id < m.id AND prev_m.role = 'user'
        WHERE m.rating = -1 AND m.role = 'assistant'
        GROUP BY m.id
        ORDER BY m.created_at DESC
    """
    try:
        db.cursor.execute(query)
        rows = db.cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        db.close()

@router.post("/feedback/{message_id}/to-pending")
async def feedback_to_pending(message_id: int, current_user: dict = Depends(get_current_admin)):
    """Chuyển một câu bị chê vào danh sách chờ duyệt để Admin sửa lại"""
    db = UserDB()
    try:
        query = """
            SELECT m.content as answer, prev_m.content as question
            FROM messages m
            LEFT JOIN messages prev_m ON prev_m.conversation_id = m.conversation_id 
                 AND prev_m.id < m.id AND prev_m.role = 'user'
            WHERE m.id = ?
            ORDER BY prev_m.id DESC LIMIT 1
        """
        db.cursor.execute(query, (message_id,))
        row = db.cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Không tìm thấy tin nhắn")
            
        db.save_pending_knowledge(row["question"], row["answer"])
        db.cursor.execute("UPDATE messages SET rating = -2 WHERE id = ?", (message_id,))
        db.conn.commit()
        
        return {"msg": "Đã đưa vào danh sách chờ duyệt"}
    finally:
        db.close()
