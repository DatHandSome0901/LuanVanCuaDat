import sqlite3
import json

conn = sqlite3.connect('database.db')
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [t[0] for t in cursor.fetchall()]

results = {}
for table in tables:
    try:
        cursor.execute(f"PRAGMA table_info({table})")
        columns = [c[1] for c in cursor.fetchall()]
        
        # Search all columns
        query = f"SELECT * FROM {table}"
        cursor.execute(query)
        rows = cursor.fetchall()
        matching_rows = []
        for row in rows:
            row_str = " ".join([str(x) for x in row if x is not None])
            if "Về khả năng kháng chiến" in row_str:
                matching_rows.append(dict(zip(columns, row)))
        if matching_rows:
            results[table] = matching_rows
    except Exception as e:
        pass

with open('scratch_search_db_results.txt', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)
print("Done!")
