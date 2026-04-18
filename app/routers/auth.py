import httpx
from fastapi import APIRouter, HTTPException, Form, Depends, Query, Request
from datetime import datetime, timedelta
from jose import jwt
from app.config import settings
from app.models.base_db import UserDB
from app.security.security import get_current_user
from pydantic import BaseModel
from typing import Optional
import bcrypt


router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    picture_url: Optional[str] = None
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
async def google_login():
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent"
    }
    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    return {"auth_url": f"https://accounts.google.com/o/oauth2/v2/auth?{query_string}"}


@router.get("/google/callback")
async def google_callback(code: str = Query(...)):
    # 1. Trao đổi code lấy access_token từ Google
    async with httpx.AsyncClient() as client:
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }
        resp = await client.post(token_url, data=data)
        if resp.status_code != 200:
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
    
    # 5. Redirect về Frontend kèm token
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/?token={token}")


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
        
    # Update full_name, picture_url
    if data.full_name is not None or data.picture_url is not None:
        user_db.update_user_info(db_user["id"], full_name=data.full_name, picture_url=data.picture_url)
        
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

@router.get("/check")
def check_login(user=Depends(get_current_user)):
    user_db = UserDB()
    db_user = user_db.get_by_email(user["email"])
    user_db.close()
    return {
        "message": "✅ Token hợp lệ, người dùng đang đăng nhập!",
        "user": {
            **user,
            "token_balance": db_user["token_balance"]
        },
    }
