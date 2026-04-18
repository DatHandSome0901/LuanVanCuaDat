import sys
import os

# Add the current directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.models.base_db import UserDB

def add_tokens(email, amount, description="Admin nạp token"):
    db = UserDB()
    user = db.get_by_email(email)
    if not user:
        print(f"❌ Không tìm thấy người dùng với email: {email}")
        db.close()
        return

    new_balance = db.change_token_balance(user["id"], amount, description, "in")
    print(f"✅ Đã nạp {amount} token cho: {email}. Số dư mới: {new_balance}")
    db.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Sử dụng: python add_tokens.py <email> <số_lượng> [mô_tả]")
    else:
        email = sys.argv[1]
        amount = int(sys.argv[2])
        description = sys.argv[3] if len(sys.argv) > 3 else "Admin nạp token"
        add_tokens(email, amount, description)
