import sys
import os

# Add the current directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.models.base_db import UserDB

def set_admin(email):
    db = UserDB()
    user = db.get_by_email(email)
    if not user:
        print(f"❌ Không tìm thấy người dùng với email: {email}")
        db.close()
        return

    db.cursor.execute("UPDATE users SET is_admin = 1 WHERE email = ?", (email,))
    db.conn.commit()
    print(f"✅ Đã cấp quyền Admin cho: {email}")
    db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Sử dụng: python set_admin.py <email>")
    else:
        set_admin(sys.argv[1])
