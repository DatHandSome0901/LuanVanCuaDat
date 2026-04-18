# Kỹ thuật chuyên sâu: Bảo mật & Xác thực toàn diện

Tài liệu này đi sâu vào các lớp bảo mật (Security Layers) bảo vệ tài nguyên hệ thống.

## 1. Cơ chế JWT (JSON Web Token)
Chúng tôi sử dụng JWT để xác thực không lưu trạng thái (Stateless). Token được tạo tại Backend và lưu dưới dạng `Bearer` token ở Frontend.

### Cấu trúc Payload:
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "is_admin": true,
  "exp": 1700000000
}
```

### Logic Kiểm tra Token (FastAPI Dependency):
```python
# app/security/security.py
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        # Giải mã và kiểm tra chữ ký
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = payload.get("email")
        
        # Luôn truy vấn lại DB để đảm bảo user chưa bị xóa hoặc đổi quyền
        db = UserDB()
        user = db.get_by_email(email)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

## 2. Hệ thống Avatar 3 lớp (Fallback Mechanism)
Để tránh tình trạng "vỡ" giao diện khi ảnh lỗi, chúng tôi triển khai logic fallback cực kỳ bền bỉ.

### Lớp 1: Gravatar (Backend)
Nếu người dùng không có ảnh, hệ thống tự sinh mã MD5 từ email để gọi Gravatar.
```python
# app/models/base_db.py
import hashlib

def get_gravatar_url(email: str):
    email_hash = hashlib.md5(email.strip().lower().encode('utf-8')).hexdigest()
    return f"https://www.gravatar.com/avatar/{email_hash}?d=identicon"
```

### Lớp 2: Fallback UI (Frontend)
Sử dụng sự kiện `onError` của thẻ `<img>` để chuyển đổi sang dạng placeholder bằng tên.
```tsx
// frontend/components/AvatarImage.tsx
const AvatarImage = ({ src, name }) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return <div className="avatar-placeholder">{name[0]}</div>;
  }

  return <img src={src} onError={() => setError(true)} />;
}
```

## 3. Bảo vệ Admin API (RBAC)
Phân quyền dựa trên vai trò (Role-Based Access Control) được thực hiện qua các Dependency lồng nhau.
```python
def get_current_admin(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# Route này chỉ dành cho Admin
@router.get("/admin/users")
async def list_users(admin: dict = Depends(get_current_admin)):
    return db.get_all_users()
```

## 4. Chống Path Traversal (An toàn file)
Khi xử lý các tham số file từ người dùng, luôn sử dụng `os.path.basename` để triệt tiêu các ký tự điều hướng thư mục nguy hiểm (`../`).
```python
def safe_file_access(user_provided_path: str):
    # Dù user truyền vào "../../etc/passwd"
    filename = os.path.basename(user_provided_path)
    # filename sẽ chỉ còn "passwd"
    return os.path.join(SAFE_STORAGE_DIR, filename)
```

## 5. Security Checklist
- **Rate Limiting**: AI API cần giới hạn số lượt gọi/phút để tránh spam tốn tiền LLM.
- **CORS Configuration**:
  ```python
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["http://localhost:5173"], # Không nên để "*" ở production
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```
- **Environment Isolation**: File `.env` phải được đưa vào `.gitignore` để tránh rò rỉ Key lên Git.

---
*Ghi chú: Mọi thay đổi về logic bảo mật cần phải được review chéo bởi các thành viên khác trong team.*
