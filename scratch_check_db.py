import sqlite3
import os

db_path = "database.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM settings")
    rows = cursor.fetchall()
    for row in rows:
        print(f"{row['key']}: {row['value']}")
    conn.close()
else:
    print("Database not found")
