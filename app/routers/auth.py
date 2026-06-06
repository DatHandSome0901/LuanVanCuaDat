import httpx
from fastapi import APIRouter, HTTPException, Form, Depends, Query, Request, File, UploadFile
from datetime import datetime, timedelta
from jose import jwt
from app.config import settings
from app.models.base_db import UserDB
from app.security.security import get_current_user
from pydantic import BaseModel
from typing import Optional
import bcrypt
import os
import shutil
from uuid import uuid4


router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    picture_url: Optional[str] = None
    cover_url: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None


def verify_password(plain_password: str, hashed_password: str):
    # Trực tiếp sử dụng bcrypt để kiểm tra
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def get_password_hash(password: str):
    # Trực tiếp sử dụng bcrypt để hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/register")
def register(username: str = Form(...), password: str = Form(...), email: str = Form(...)):
    user_db = UserDB()
    existing = user_db.get_by_username(username)
    if existing:
        user_db.close()
        raise HTTPException(status_code=400, detail="Tên người dùng đã tồn tại!")
    
    existing_email = user_db.get_by_email(email)
    if existing_email:
        user_db.close()
        raise HTTPException(status_code=400, detail="Email đã được sử dụng!")

    hashed_pw = get_password_hash(password)
    user_db.add(username, hashed_pw, email)
    user_db.close()
    return {"message": "✅ Đăng ký thành công!"}


@router.post("/login")
def login(request: Request, username: str = Form(...), password: str = Form(...)):
    user_db = UserDB()
    user = user_db.get_by_username(username)

    if not user or not user.get("password"):
        user_db.close()
        raise HTTPException(status_code=401, detail="Sai tên đăng nhập hoặc mật khẩu!")

    if not verify_password(password, user["password"]):
        user_db.close()
        raise HTTPException(status_code=401, detail="Sai tên đăng nhập hoặc mật khẩu!")
    
    # Log login
    client_ip = request.client.host
    user_agent = request.headers.get("user-agent", "unknown")
    user_db.log_login(user["id"], client_ip, user_agent)
    user_db.close()

    token = create_access_token({
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "is_admin": bool(user["is_admin"]),
        "token_balance": user.get("token_balance", 0)
    })
    return {
        "access_token": token, 
        "token_type": "bearer", 
        "user": {
            **user,
            "is_admin": bool(user["is_admin"]),
            "token_balance": user.get("token_balance", 0)
        }
    }


@router.get("/google/login")
async def google_login(request: Request, frontend_url: str = Query("http://localhost:3000")):
    # Tự động chọn địa chỉ trả về (Redirect URI)
    host = request.headers.get("host", "localhost:2643")
    
    if "vercel.app" in frontend_url or frontend_url.startswith("chatbot://"):
        # Nếu đang dùng Vercel hoặc App di động (chatbot://), bắt Google trả về Vercel (để Vercel tự trung chuyển về đây)
        # Cách này giúp bypass hoàn toàn trang cảnh báo Ngrok và lỗi redirect_uri_mismatch trên di động
        vercel_host = "https://frontend-neon-gamma-98.vercel.app"
        redirect_uri = f"{vercel_host}/api/v1/auth/google/callback"
    elif "localhost" in host:
        redirect_uri = f"http://{host}/api/v1/auth/google/callback"
    else:
        # Trường hợp dùng IP mạng LAN thì vẫn phải dùng Ngrok trực tiếp
        scheme = request.headers.get("x-forwarded-proto", request.url.scheme)
        ngrok_url = f"{scheme}://{host}"
        redirect_uri = f"{ngrok_url}/api/v1/auth/google/callback"
    
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
        "state": frontend_url
    }
    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    return {"auth_url": f"https://accounts.google.com/o/oauth2/v2/auth?{query_string}"}


@router.get("/google/callback")
async def google_callback(request: Request, code: str = Query(...), state: str = Query(None)):
    # Phải dùng đúng Redirect URI đã khai báo với Google ở trên
    host = request.headers.get("host", "localhost:2643")
    frontend_url = state if state else "http://localhost:3000"
    
    if "vercel.app" in frontend_url or frontend_url.startswith("chatbot://"):
        vercel_host = "https://frontend-neon-gamma-98.vercel.app"
        redirect_uri = f"{vercel_host}/api/v1/auth/google/callback"
    elif "localhost" in host:
        redirect_uri = f"http://{host}/api/v1/auth/google/callback"
    else:
        scheme = request.headers.get("x-forwarded-proto", request.url.scheme)
        ngrok_url = f"{scheme}://{host}"
        redirect_uri = f"{ngrok_url}/api/v1/auth/google/callback"
    
    # Tiếp tục xử lý lấy token từ Google...

    # 1. Trao đổi code lấy access_token từ Google
    async with httpx.AsyncClient() as client:
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        }
        resp = await client.post(token_url, data=data)
        if resp.status_code != 200:
            print("Google Token Error:", resp.text)
            raise HTTPException(status_code=400, detail="Lỗi xác thực Google (Token Exchange)")
        
        token_data = resp.json()
        access_token = token_data.get("access_token")

        # 2. Lấy thông tin user (email, name) từ Google
        user_info_url = "https://www.googleapis.com/oauth2/v3/userinfo"
        headers = {"Authorization": f"Bearer {access_token}"}
        user_resp = await client.get(user_info_url, headers=headers)
        if user_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Lỗi lấy thông tin người dùng từ Google")
        
        google_user = user_resp.json()
        email = google_user.get("email")
        name = google_user.get("name")
        picture = google_user.get("picture")

    # 3. Lưu/Cập nhật user vào Database
    user_db = UserDB()
    user = user_db.update_or_create_google_user(email, name, picture)
    user_db.close()

    # 4. Tạo JWT token và trả về
    token = create_access_token({
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "is_admin": bool(user.get("is_admin", 0)),
        "token_balance": user.get("token_balance", 0)
    })
    
    # 5. Redirect về Frontend kèm token (Dùng JS redirect để tránh lỗi 307/Mixed Content trên Android WebView)
    from fastapi.responses import HTMLResponse
    
    redirect_target = f"{frontend_url}/?token={token}"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Đang xử lý đăng nhập...</title>
        <script>
            window.location.href = "{redirect_target}";
        </script>
    </head>
    <body>
        <p>Đang chuyển hướng về ứng dụng, vui lòng chờ...</p>
        <p><a href="{redirect_target}">Bấm vào đây nếu không tự động chuyển hướng</a></p>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)


@router.get("/tokens/history")
def get_tokens_history(user=Depends(get_current_user)):
    user_db = UserDB()
    history = user_db.get_token_history(user["id"])
    user_db.close()
    return {"history": history}


@router.post("/tokens/transaction")
def token_transaction(
    amount: int = Form(...), 
    description: str = Form("Nạp/Rút token"), 
    tx_type: str = Form(...), # 'in' or 'out'
    user=Depends(get_current_user)
):
    if tx_type not in ['in', 'out']:
        raise HTTPException(status_code=400, detail="Loại giao dịch không hợp lệ")
        
    user_db = UserDB()
    
    # Nếu là 'out', kiểm tra số dư
    if tx_type == 'out':
        current_user = user_db.get_by_email(user["email"])
        if current_user["token_balance"] < amount:
            user_db.close()
            raise HTTPException(status_code=400, detail="Số dư token không đủ")
            
    new_balance = user_db.change_token_balance(user["id"], amount, description, tx_type)
    user_db.close()
    
    return {
        "message": f"✅ Giao dịch thành công ({tx_type})",
        "new_balance": new_balance
    }


@router.put("/profile")
async def update_profile(data: ProfileUpdate, user=Depends(get_current_user)):
    user_db = UserDB()
    db_user = user_db.get_by_email(user["email"])
    
    if not db_user:
        user_db.close()
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
        
    # Update full_name, picture_url, cover_url
    if data.full_name is not None or data.picture_url is not None or data.cover_url is not None:
        user_db.update_user_info(
            db_user["id"], 
            full_name=data.full_name, 
            picture_url=data.picture_url,
            cover_url=data.cover_url
        )
        
    # Update password
    if data.new_password:
        # If user has current password, must verify it
        if db_user.get("password"):
            if not data.current_password or not verify_password(data.current_password, db_user["password"]):
                user_db.close()
                raise HTTPException(status_code=400, detail="Mật khẩu hiện tại không chính xác")
        
        hashed = get_password_hash(data.new_password)
        user_db.update_user_password(db_user["id"], hashed)
        
    user_db.close()
    return {"message": "Cập nhật hồ sơ thành công"}

@router.post("/upload-avatar")
async def upload_avatar(file: UploadFile = File(...), user=Depends(get_current_user)):
    """Upload avatar ảnh cho người dùng và cập nhật picture_url."""
    # Validate file type
    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Chỉ chấp nhận ảnh JPG, PNG, WebP, GIF")

    # Max 5MB
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Ảnh không được vượt quá 5MB")

    # Save to utils/download (reuse existing file serving route)
    ext = os.path.splitext(file.filename or "avatar.jpg")[1] or ".jpg"
    unique_name = f"avatar_{uuid4().hex}{ext}"
    save_dir = os.path.join(settings.DIR_ROOT, "utils", "download")
    os.makedirs(save_dir, exist_ok=True)
    file_path = os.path.join(save_dir, unique_name)

    with open(file_path, "wb") as f:
        f.write(content)

    picture_url = f"/api/v1/upload-file/view/{unique_name}"

    # Update DB
    user_db = UserDB()
    db_user = user_db.get_by_email(user["email"])
    if not db_user:
        user_db.close()
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
    user_db.update_user_info(db_user["id"], picture_url=picture_url)
    user_db.close()

    return {"picture_url": picture_url}


@router.get("/check")
def check_login(user=Depends(get_current_user)):
    user_db = UserDB()
    db_user = user_db.get_by_email(user["email"])
    user_db.close()
    if not db_user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
    
    # Exclude password for security
    safe_user = {k: v for k, v in db_user.items() if k != "password"}
    safe_user["is_admin"] = bool(safe_user["is_admin"])
    return {
        "message": "✅ Token hợp lệ, người dùng đang đăng nhập!",
        "user": safe_user,
    }
