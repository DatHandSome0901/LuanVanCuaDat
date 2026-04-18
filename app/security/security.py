# app/security/security.py

from fastapi import Header, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.config import settings

from fastapi import Security  # noqa: E402
from fastapi.security import APIKeyHeader  # noqa: E402

# === Config ===
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# ✅ Xác thực JWT và lấy dữ liệu mới nhất từ DB
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("email")
        if not email:
            raise HTTPException(status_code=401, detail="Token thiếu thông tin email")
        
        from app.models.base_db import UserDB
        db = UserDB()
        user = db.get_by_email(email)
        db.close()
        
        if not user:
            raise HTTPException(status_code=401, detail="Người dùng không tồn tại hoặc đã bị xóa")
            
        return user
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ hoặc hết hạn",
        )

# ✅ Kiểm tra quyền Admin
def get_current_admin(user: dict = Depends(get_current_user)):
    if not user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập tính năng này!"
        )
    return user

# ✅ Kiểm tra số dư Token (Yêu cầu n tokens để chạy)
def require_tokens(amount: int):
    def token_checker(user: dict = Depends(get_current_user)):
        balance = user.get("token_balance", 0)
        if balance < amount:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Số dư token không đủ. Yêu cầu: {amount}, hiện có: {balance}"
            )
        return user
    return token_checker
