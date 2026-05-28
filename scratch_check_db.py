import sqlite3
import os
import bcrypt

db_path = "database.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Hash password "admin123"
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw("admin123".encode('utf-8'), salt).decode('utf-8')
    
    cursor.execute("UPDATE users SET password = ? WHERE email = ?", (hashed, "admin@mail.com"))
    conn.commit()
    print("Admin password reset to: admin123")
    conn.close()
else:
    print("Database not found")
