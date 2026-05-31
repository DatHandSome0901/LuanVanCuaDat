import sqlite3
import os

import json
from app.config import settings
from chatbot.utils.question_normalizer import normalize_question

class CustomRow:
    def __init__(self, cursor, row):
        self.fields = [col[0] for col in cursor.description]
        self.values = row
        
    def __getitem__(self, key):
        if isinstance(key, int):
            val = self.values[key]
            name = self.fields[key]
        else:
            try:
                idx = self.fields.index(key)
                val = self.values[idx]
                name = key
            except ValueError:
                raise KeyError(key)
        
        # Format datetime strings to ISO format with UTC 'Z' suffix
        if isinstance(val, str) and (name.endswith('_at') or name.endswith('_time')):
            if len(val) == 19 and val[4] == '-' and val[7] == '-' and val[13] == ':' and val[16] == ':':
                if val[10] == ' ':
                    return val.replace(' ', 'T') + 'Z'
                elif val[10] == 'T':
                    return val + 'Z'
        return val

    def keys(self):
        return self.fields

    def __iter__(self):
        return iter(self.fields)

class BaseDB:
    def __init__(self):
        self.conn = sqlite3.connect(settings.DB_PATH)
        self.conn.row_factory = CustomRow
        self.cursor = self.conn.cursor()
        self._create_tables()

    def _create_tables(self):
        # Create users table
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT,
                email TEXT UNIQUE,
                full_name TEXT,
                picture_url TEXT,
                is_admin BOOLEAN DEFAULT 0,
                token_balance REAL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create token_history table
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS token_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                type TEXT, -- 'in' or 'out'
                amount REAL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        
        # Create base table
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS base (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create packages table
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS packages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                tokens INTEGER,
                amount_vnd INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create payments table
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                package_id INTEGER,
                amount_vnd INTEGER,
                tokens INTEGER,
                status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
                sepay_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        # Create chat_logs table
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS chat_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                question TEXT,
                answer TEXT,
                tokens_charged REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        # Create settings table
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        """)
        
        # Initialize default settings if not exists
        self.cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('rate_per_1000', '1.0')")
        self.cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('logo_url', '')")
        self.cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('site_title', 'Chatbot Sử Việt')")
        self.cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('chat_bg', '')")
        self.cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('kb_version', '1.0')")
        
        # Create payment_reports table
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS payment_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                payment_id INTEGER,
                description TEXT,
                email TEXT,
                status TEXT DEFAULT 'pending', -- 'pending', 'resolved', 'ignored'
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        # 🔥 Migration: Thêm cột email vào payment_reports nếu chưa có
        try:
            self.cursor.execute("ALTER TABLE payment_reports ADD COLUMN email TEXT")
        except:
            pass

        # Create login_logs table
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS login_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                ip_address TEXT,
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        ## Create conversations table
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT,
            note TEXT,
            is_pinned INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """)

        # 🔥 Migration: Thêm cột note và is_pinned nếu chưa có
        try:
            self.cursor.execute("ALTER TABLE conversations ADD COLUMN note TEXT")
        except:
            pass
            
        try:
            self.cursor.execute("ALTER TABLE conversations ADD COLUMN is_pinned INTEGER DEFAULT 0")
        except:
            pass

        ## Create messages table
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER,
            role TEXT,
            content TEXT,
            sources TEXT, 
            timeline TEXT, -- JSON timeline data
            rating INTEGER DEFAULT 0, -- 0: no rating, 1: like, -1: dislike
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id)
        )
        """)

        # 🔥 Migration: Thêm các cột nếu chưa có
        try:
            self.cursor.execute("ALTER TABLE messages ADD COLUMN rating INTEGER DEFAULT 0")
        except:
            pass

        try:
            self.cursor.execute("ALTER TABLE messages ADD COLUMN likes_count INTEGER DEFAULT 0")
        except:
            pass

        try:
            self.cursor.execute("ALTER TABLE messages ADD COLUMN timeline TEXT")
        except:
            pass

        # ===============================
        # SELF LEARNING TABLE
        # ===============================
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS pending_knowledge (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT,
            answer TEXT,
            approved INTEGER DEFAULT 0,
            likes_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        try:
            self.cursor.execute("ALTER TABLE pending_knowledge ADD COLUMN likes_count INTEGER DEFAULT 0")
        except:
            pass

        # ===============================
        # ANTI-SPAM: Theo dõi lượt like theo từng user
        # ===============================
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_knowledge_likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            question_normalized TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, question_normalized)
        )
        """)

        # ===============================
        # DAILY Q&A REWARDS
        # ===============================
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS qa_checkins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            checkin_date TEXT NOT NULL,
            reward_amount REAL DEFAULT 0,
            streak_count INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, checkin_date),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """)

        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS qa_answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            question_date TEXT NOT NULL,
            question_key TEXT NOT NULL,
            selected_index INTEGER NOT NULL,
            is_correct INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, question_date, question_key),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """)

        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS qa_rewards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            reward_date TEXT NOT NULL,
            reward_key TEXT NOT NULL,
            amount REAL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, reward_date, reward_key),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """)

        # ===============================
        # SEMANTIC CACHE TABLE
        # ===============================
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS semantic_cache (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT,
            answer TEXT,
            sources TEXT,          -- JSON serialized list of SourceInfo dicts
            embedding TEXT,        -- JSON serialized list of floats (embedding vector)
            embedding_model TEXT,  -- Embedding model name used (openai, vertex, etc.)
            tenant_id TEXT DEFAULT 'default',
            user_id INTEGER,       -- NULL for public / global cache, or INTEGER for private user scope
            knowledge_base_id TEXT DEFAULT 'default',
            kb_version TEXT DEFAULT '1.0',
            expires_at TIMESTAMP,  -- ISO format / datetime string, NULL for never expires
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(question, tenant_id, user_id, knowledge_base_id, embedding_model)
        )
        """)

        # ===============================
        # SUPPORT CHAT TABLES
        # ===============================
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS support_rooms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            status TEXT DEFAULT 'open', -- 'open', 'closed'
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """)

        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS support_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id INTEGER NOT NULL,
            sender_type TEXT NOT NULL, -- 'user', 'admin', 'ai'
            sender_id INTEGER,         -- user_id (of user or admin)
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (room_id) REFERENCES support_rooms(id)
        )
        """)

        self.conn.commit()

    def log_login(self, user_id, ip_address, user_agent):
        self.cursor.execute(
            "INSERT INTO login_logs (user_id, ip_address, user_agent) VALUES (?, ?, ?)",
            (user_id, ip_address, user_agent)
        )
        self.conn.commit()

    def get_recent_logins(self, limit=50):
        query = """
            SELECT ll.*, u.username, u.email, u.picture_url 
            FROM login_logs ll
            JOIN users u ON ll.user_id = u.id
            ORDER BY ll.created_at DESC
            LIMIT ?
        """
        self.cursor.execute(query, (limit,))
        return [dict(row) for row in self.cursor.fetchall()]

    def get_setting(self, key, default=None):
        self.cursor.execute("SELECT value FROM settings WHERE key = ?", (key,))
        row = self.cursor.fetchone()
        return row['value'] if row else default

    def set_setting(self, key, value):
        self.cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (key, str(value)))
        self.conn.commit()

    def save_chat_log(self, user_id, question, answer, tokens_charged):
        self.cursor.execute(
            "INSERT INTO chat_logs (user_id, question, answer, tokens_charged) VALUES (?, ?, ?, ?)",
            (user_id, question, answer, float(tokens_charged))
        )
        self.conn.commit()

    def get_all_chat_logs(self):
        query = """
            SELECT cl.*, u.username, u.email, u.picture_url 
            FROM chat_logs cl
            JOIN users u ON cl.user_id = u.id
            ORDER BY cl.created_at DESC
        """
        self.cursor.execute(query)
        return [dict(row) for row in self.cursor.fetchall()]

    def get_user_chat_logs(self, user_id):
        query = "SELECT * FROM chat_logs WHERE user_id = ? ORDER BY created_at ASC"
        self.cursor.execute(query, (user_id,))
        return [dict(row) for row in self.cursor.fetchall()]

    def delete_user_chat_logs(self, user_id):
        self.cursor.execute("DELETE FROM chat_logs WHERE user_id = ?", (user_id,))
        self.conn.commit()

    def get_all_pictures(self):
        query = "SELECT * FROM base"
        self.cursor.execute(query)
        return [dict(row) for row in self.cursor.fetchall()]

    # ==========================================
    # SEMANTIC CACHE METHODS
    # ==========================================
    def get_all_semantic_cache(self, embedding_model, tenant_id='default', knowledge_base_id='default', user_id=None):
        query = """
            SELECT question, answer, sources, embedding, tenant_id, user_id, knowledge_base_id, kb_version, expires_at 
            FROM semantic_cache 
            WHERE embedding_model = ? 
              AND tenant_id = ? 
              AND knowledge_base_id = ? 
              AND (user_id IS NULL OR user_id = ?)
        """
        self.cursor.execute(query, (embedding_model, tenant_id, knowledge_base_id, user_id))
        return [dict(row) for row in self.cursor.fetchall()]

    def add_semantic_cache(self, question, answer, sources_json, embedding_json, embedding_model, tenant_id='default', user_id=None, knowledge_base_id='default', kb_version='1.0', expires_at=None):
        try:
            self.cursor.execute(
                """
                INSERT OR REPLACE INTO semantic_cache 
                (question, answer, sources, embedding, embedding_model, tenant_id, user_id, knowledge_base_id, kb_version, expires_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (question, answer, sources_json, embedding_json, embedding_model, tenant_id, user_id, knowledge_base_id, kb_version, expires_at)
            )
            self.conn.commit()
        except Exception as e:
            print(f"⚠️ add_semantic_cache error: {e}")

    def delete_cache_by_kb(self, knowledge_base_id):
        self.cursor.execute("DELETE FROM semantic_cache WHERE knowledge_base_id = ?", (knowledge_base_id,))
        self.conn.commit()

    def delete_cache_by_user(self, user_id):
        self.cursor.execute("DELETE FROM semantic_cache WHERE user_id = ?", (user_id,))
        self.conn.commit()

    def delete_expired_cache(self):
        self.cursor.execute("DELETE FROM semantic_cache WHERE expires_at IS NOT NULL AND expires_at < datetime('now')")
        self.conn.commit()

    def clear_all_cache(self):
        self.cursor.execute("DELETE FROM semantic_cache")
        self.conn.commit()

    def increment_kb_version(self):
        try:
            current_version_str = self.get_setting("kb_version", "1.0")
            try:
                current_version = float(current_version_str)
                new_version = f"{current_version + 0.1:.2f}"
            except Exception:
                import uuid
                new_version = str(uuid.uuid4().hex[:8])
            self.set_setting("kb_version", new_version)
            print(f"[VERSION] KB Version updated to: {new_version}")
            return new_version
        except Exception as e:
            print(f"[WARN] increment_kb_version error: {e}")
            return "1.0"

    def close(self):
        if self.conn:
            self.conn.close()

class UserDB(BaseDB):
    def get_all(self):
        self.cursor.execute("SELECT * FROM users")
        return [dict(row) for row in self.cursor.fetchall()]

    def get_by_username(self, username: str):
        self.cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        row = self.cursor.fetchone()
        if not row: return None
        data = dict(row)
        if not data.get("picture_url") and data.get("email"):
            import hashlib
            email_hash = hashlib.md5(data["email"].strip().lower().encode('utf-8')).hexdigest()
            data["picture_url"] = f"https://www.gravatar.com/avatar/{email_hash}?d=identicon"
        return data

    def get_by_email(self, email: str):
        self.cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        row = self.cursor.fetchone()
        if not row: return None
        data = dict(row)
        if not data.get("picture_url"):
            import hashlib
            email_hash = hashlib.md5(email.strip().lower().encode('utf-8')).hexdigest()
            data["picture_url"] = f"https://www.gravatar.com/avatar/{email_hash}?d=identicon"
        return data

    def add(self, username, password, email, is_admin=0):
        # Generate Gravatar URL if no picture_url is provided
        import hashlib
        email_hash = hashlib.md5(email.strip().lower().encode('utf-8')).hexdigest()
        picture_url = f"https://www.gravatar.com/avatar/{email_hash}?d=identicon"
        
        self.cursor.execute(
            "INSERT INTO users (username, password, email, is_admin, token_balance, picture_url) VALUES (?, ?, ?, ?, ?, ?)",
            (username, password, email, is_admin, 10, picture_url) # Initial 10 tokens
        )
        self.conn.commit()
        return self.cursor.lastrowid

    def update_or_create_google_user(self, email, full_name, picture_url):
        user = self.get_by_email(email)
        if user:
            # Update existing user but preserve custom name and picture
            existing_full_name = user.get("full_name")
            existing_picture = user.get("picture_url")
            
            # Keep custom name if set
            new_full_name = existing_full_name if existing_full_name else full_name
            
            # Keep custom profile picture (only override if it's currently missing or Gravatar)
            is_gravatar = existing_picture and "gravatar.com" in existing_picture
            new_picture_url = picture_url if (not existing_picture or is_gravatar) else existing_picture
            
            self.cursor.execute(
                "UPDATE users SET full_name = ?, picture_url = ? WHERE email = ?",
                (new_full_name, new_picture_url, email)
            )
            self.conn.commit()
            return self.get_by_email(email)
        else:
            # Create new user
            username = email.split("@")[0]
            # Handle username collision
            existing = self.get_by_username(username)
            if existing:
                username = f"{username}_{int(os.urandom(2).hex(), 16)}"
            
            # Use Gravatar if Google picture_url is missing
            if not picture_url:
                import hashlib
                email_hash = hashlib.md5(email.strip().lower().encode('utf-8')).hexdigest()
                picture_url = f"https://www.gravatar.com/avatar/{email_hash}?d=identicon"

            self.cursor.execute(
                "INSERT INTO users (username, email, full_name, picture_url, is_admin, token_balance) VALUES (?, ?, ?, ?, ?, ?)",
                (username, email, full_name, picture_url, 0, 10) # Default 10 free tokens
            )
            self.conn.commit()
            return self.get_by_email(email)

    def change_token_balance(self, user_id, amount, description, tx_type):
        # Update user balance
        self.cursor.execute(
            "UPDATE users SET token_balance = token_balance + ? WHERE id = ?",
            (float(amount) if tx_type == 'in' else -float(amount), user_id)
        )
        
        # Log history
        self.cursor.execute(
            "INSERT INTO token_history (user_id, type, amount, description) VALUES (?, ?, ?, ?)",
            (user_id, tx_type, float(amount), description)
        )
        self.conn.commit()
        
        # Return new balance
        self.cursor.execute("SELECT token_balance FROM users WHERE id = ?", (user_id,))
        row = self.cursor.fetchone()
        return row['token_balance'] if row else None

    def get_token_history(self, user_id):
        self.cursor.execute(
            "SELECT * FROM token_history WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,)
        )
        return [dict(row) for row in self.cursor.fetchall()]

    def get_all_token_history(self):
        query = """
            SELECT th.*, u.username, u.email, u.picture_url 
            FROM token_history th
            JOIN users u ON th.user_id = u.id
            ORDER BY th.created_at DESC
        """
        self.cursor.execute(query)
        return [dict(row) for row in self.cursor.fetchall()]

    def update_user_info(self, user_id, full_name=None, picture_url=None, is_admin=None):
        fields = []
        params = []
        if full_name is not None:
            fields.append("full_name = ?")
            params.append(full_name)
        if picture_url is not None:
            fields.append("picture_url = ?")
            params.append(picture_url)
        if is_admin is not None:
            fields.append("is_admin = ?")
            params.append(is_admin)
        
        if not fields:
            return
            
        params.append(user_id)
        query = f"UPDATE users SET {', '.join(fields)} WHERE id = ?"
        self.cursor.execute(query, tuple(params))
        self.conn.commit()

    def update_user_password(self, user_id, hashed_password):
        self.cursor.execute("UPDATE users SET password = ? WHERE id = ?", (hashed_password, user_id))
        self.conn.commit()

    def delete_user(self, user_id):
        self.cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        self.conn.commit()

    # --- Payment & Packages ---
    def get_packages(self):
        self.cursor.execute("SELECT * FROM packages ORDER BY amount_vnd ASC")
        return [dict(row) for row in self.cursor.fetchall()]

    def add_package(self, name, tokens, amount_vnd):
        self.cursor.execute(
            "INSERT INTO packages (name, tokens, amount_vnd) VALUES (?, ?, ?)",
            (name, tokens, amount_vnd)
        )
        self.conn.commit()

    def delete_package(self, package_id):
        self.cursor.execute("DELETE FROM packages WHERE id = ?", (package_id,))
        self.conn.commit()

    def update_package(self, package_id, name, tokens, amount_vnd):
        self.cursor.execute(
            "UPDATE packages SET name = ?, tokens = ?, amount_vnd = ? WHERE id = ?",
            (name, tokens, amount_vnd, package_id)
        )
        self.conn.commit()

    def create_payment(self, user_id, package_id, amount_vnd, tokens):
        self.cursor.execute(
            "INSERT INTO payments (user_id, package_id, amount_vnd, tokens) VALUES (?, ?, ?, ?)",
            (user_id, package_id, amount_vnd, tokens)
        )
        self.conn.commit()
        return self.cursor.lastrowid

    def get_payment(self, payment_id):
        self.cursor.execute("SELECT * FROM payments WHERE id = ?", (payment_id,))
        row = self.cursor.fetchone()
        return dict(row) if row else None

    def get_payment_by_sepay_id(self, sepay_id):
        self.cursor.execute("SELECT * FROM payments WHERE sepay_id = ?", (sepay_id,))
        row = self.cursor.fetchone()
        return dict(row) if row else None

    def update_payment_status(self, payment_id, status, sepay_id=None):
        if sepay_id:
            self.cursor.execute(
                "UPDATE payments SET status = ?, sepay_id = ? WHERE id = ?",
                (status, sepay_id, payment_id)
            )
        else:
            self.cursor.execute(
                "UPDATE payments SET status = ? WHERE id = ?",
                (status, payment_id)
            )
        self.conn.commit()

    def get_pending_payments(self):
        self.cursor.execute("SELECT * FROM payments WHERE status = 'pending'")
        return [dict(row) for row in self.cursor.fetchall()]

    def get_all_payments(self):
        query = """
            SELECT p.*, u.username, u.email, u.picture_url 
            FROM payments p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        """
        self.cursor.execute(query)
        return [dict(row) for row in self.cursor.fetchall()]

    # --- Payment Reports ---
    def create_payment_report(self, user_id, payment_id, description, email=None):
        self.cursor.execute(
            "INSERT INTO payment_reports (user_id, payment_id, description, email) VALUES (?, ?, ?, ?)",
            (user_id, payment_id, description, email)
        )
        self.conn.commit()
        return self.cursor.lastrowid
        
    def get_all_payment_reports(self):
        query = """
            SELECT pr.*, u.username, u.email as user_account_email, u.picture_url 
            FROM payment_reports pr
            JOIN users u ON pr.user_id = u.id
            ORDER BY pr.created_at DESC
        """
        self.cursor.execute(query)
        return [dict(row) for row in self.cursor.fetchall()]

    def update_payment_report_status(self, report_id, status):
        self.cursor.execute(
            "UPDATE payment_reports SET status = ? WHERE id = ?",
            (status, report_id)
        )
        self.conn.commit()
        # ===============================
    # CHAT CONVERSATIONS
    # ===============================

    def create_conversation(self, user_id, title="New Chat"):
        self.cursor.execute(
            "INSERT INTO conversations (user_id,title) VALUES (?,?)",
            (user_id,title)
        )
        self.conn.commit()
        return self.cursor.lastrowid

    def update_conversation(self, conversation_id, title=None, note=None, is_pinned=None):
        fields = []
        params = []
        if title is not None:
            fields.append("title = ?")
            params.append(title)
        if note is not None:
            fields.append("note = ?")
            params.append(note)
        if is_pinned is not None:
            fields.append("is_pinned = ?")
            params.append(1 if is_pinned else 0)
        
        if not fields:
            return

        params.append(conversation_id)
        query = f"UPDATE conversations SET {', '.join(fields)} WHERE id = ?"
        self.cursor.execute(query, tuple(params))
        self.conn.commit()


 
   
    def save_message(self, conversation_id, role, content, sources=None, timeline=None):
        self.cursor.execute(
        "INSERT INTO messages (conversation_id,role,content,sources,timeline) VALUES (?,?,?,?,?)",
        (conversation_id, role, content, json.dumps(sources) if sources else None, json.dumps(timeline) if timeline else None)
        
    )
        self.conn.commit()
        return self.cursor.lastrowid

    def rate_message(self, message_id, rating):
        """Cập nhật rating và tăng bộ đếm like nếu rating = 1"""
        if rating == 1:
            # 1. Tăng likes_count trong bảng messages
            self.cursor.execute(
                "UPDATE messages SET likes_count = likes_count + 1, rating = 1 WHERE id = ?",
                (message_id,)
            )
            
            # 2. Tăng likes_count trong bảng pending_knowledge (Cộng dồn theo câu hỏi)
            # Lấy nội dung câu hỏi trước
            ctx = self.get_message_context(message_id)
            if ctx and ctx["question"]:
                from chatbot.utils.question_normalizer import normalize_question
                q_norm = normalize_question(ctx["question"]).lower().strip()
                self.cursor.execute(
                    "UPDATE pending_knowledge SET likes_count = likes_count + 1 WHERE question = ?",
                    (q_norm,)
                )
        else:
            self.cursor.execute(
                "UPDATE messages SET rating = ? WHERE id = ?",
                (rating, message_id)
            )
        self.conn.commit()

    def get_likes_count(self, message_id):
        self.cursor.execute("SELECT likes_count FROM messages WHERE id = ?", (message_id,))
        row = self.cursor.fetchone()
        return row["likes_count"] if row else 0


    def get_conversations(self, user_id):
        self.cursor.execute(
            "SELECT * FROM conversations WHERE user_id=? ORDER BY is_pinned DESC, created_at DESC",
            (user_id,)
        )
        return [dict(row) for row in self.cursor.fetchall()]





    def get_messages(self, conversation_id):
        self.cursor.execute(
            "SELECT * FROM messages WHERE conversation_id=? ORDER BY created_at",
            (conversation_id,)
        )

        rows = self.cursor.fetchall()
        result = []

        for row in rows:
            msg = dict(row)

            if msg.get("sources"):
                try:
                    msg["sources"] = json.loads(msg["sources"])
                except:
                    msg["sources"] = []
            else:
                msg["sources"] = []

            if msg.get("timeline"):
                try:
                    msg["timeline"] = json.loads(msg["timeline"])
                except:
                    msg["timeline"] = None
            else:
                msg["timeline"] = None

            result.append(msg)

        return result


    def delete_conversation(self, conversation_id):

        self.cursor.execute(
            "DELETE FROM messages WHERE conversation_id=?",
            (conversation_id,)
        )

        self.cursor.execute(
            "DELETE FROM conversations WHERE id=?",
            (conversation_id,)
        )

        self.conn.commit()
  
    # ===============================
    # SELF LEARNING
    # ===============================
    
    def save_pending_knowledge(self, question, answer):
        question = normalize_question(question).lower().strip()

        self.cursor.execute(
            "INSERT INTO pending_knowledge (question, answer) VALUES (?, ?)",
            (question, answer)
        )
        self.conn.commit()

    def get_pending_knowledge(self):
        self.cursor.execute(
            "SELECT * FROM pending_knowledge WHERE approved = 0 ORDER BY created_at DESC"
        )
        return [dict(row) for row in self.cursor.fetchall()]

    

    def approve_knowledge(self, id):

        # 🔥 lấy data
        self.cursor.execute(
            "SELECT question, answer FROM pending_knowledge WHERE id = ?",
            (id,)
        )
        row = self.cursor.fetchone()

        if not row:
            return

        question = normalize_question(row["question"]).lower().strip()
        answer = row["answer"]

        # 🔥 update trạng thái
        self.cursor.execute(
            "UPDATE pending_knowledge SET approved = 1 WHERE id = ?",
            (id,)
        )
        self.conn.commit()
        self.increment_kb_version()

        # 🔥 ADD VÀO VECTOR
        try:
            from ingestion.vectorize import add_to_vector_store
            
            import os
            llm_name = self.get_setting("llm_name", os.environ.get("LLM_NAME", "openai"))

            add_to_vector_store(question, answer, llm_name=llm_name)

            print(f"✅ ĐÃ ADD VECTOR (Model: {llm_name})")

        except Exception as e:
            print("VECTOR ERROR:", e)

    def delete_knowledge(self, id):
        self.cursor.execute(
            "DELETE FROM pending_knowledge WHERE id = ?",
            (id,)
        )
        self.conn.commit()
        self.increment_kb_version()



    def get_pending_by_question(self, question):
        """Lấy bản ghi pending (bao gồm cả đã duyệt) theo câu hỏi"""
        from chatbot.utils.question_normalizer import normalize_question
        question = normalize_question(question).lower().strip()
        
        self.cursor.execute(
            """
            SELECT * FROM pending_knowledge
            WHERE question = ?
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (question,)
        )

        row = self.cursor.fetchone()

        if not row:
            return None

        return dict(row)

    def has_user_liked_question(self, user_id: int, question_normalized: str) -> bool:
        """Kiểm tra user đã like câu hỏi này chưa (anti-spam)"""
        self.cursor.execute(
            "SELECT 1 FROM user_knowledge_likes WHERE user_id = ? AND question_normalized = ? LIMIT 1",
            (user_id, question_normalized)
        )
        return self.cursor.fetchone() is not None

    def mark_user_liked_question(self, user_id: int, question_normalized: str):
        """Đánh dấu user đã like câu hỏi này (chặn spam)"""
        try:
            self.cursor.execute(
                "INSERT OR IGNORE INTO user_knowledge_likes (user_id, question_normalized) VALUES (?, ?)",
                (user_id, question_normalized)
            )
            self.conn.commit()
        except Exception as e:
            print(f"⚠️ mark_user_liked_question error: {e}")
        
    def get_message_context(self, message_id):
        """Lấy nội dung câu trả lời và câu hỏi ngay trước đó của nó"""
        self.cursor.execute("SELECT * FROM messages WHERE id = ?", (message_id,))
        msg = self.cursor.fetchone()
        if not msg:
            return None
            
        # Tìm câu hỏi (user message) ngay trước câu trả lời này trong cùng conversation
        self.cursor.execute(
            """
            SELECT content FROM messages 
            WHERE conversation_id = ? AND role = 'user' AND id < ?
            ORDER BY id DESC LIMIT 1
            """,
            (msg["conversation_id"], message_id)
        )
        prev_msg = self.cursor.fetchone()
        
        return {
            "answer": msg["content"],
            "question": prev_msg["content"] if prev_msg else None,
            "conversation_id": msg["conversation_id"]
        }

    # ===============================
    # SUPPORT CHAT OPERATIONS
    # ===============================
    def get_or_create_support_room(self, user_id):
        # Check if there is an open support room for this user
        self.cursor.execute("SELECT * FROM support_rooms WHERE user_id = ? AND status = 'open' LIMIT 1", (user_id,))
        row = self.cursor.fetchone()
        if row:
            return dict(row)
        
        # If not, create one
        self.cursor.execute("INSERT INTO support_rooms (user_id, status) VALUES (?, 'open')", (user_id,))
        self.conn.commit()
        room_id = self.cursor.lastrowid
        
        # Fetch and return the newly created room
        self.cursor.execute("SELECT * FROM support_rooms WHERE id = ?", (room_id,))
        new_row = self.cursor.fetchone()
        return dict(new_row) if new_row else None

    def add_support_message(self, room_id, sender_type, sender_id, message):
        self.cursor.execute(
            "INSERT INTO support_messages (room_id, sender_type, sender_id, message) VALUES (?, ?, ?, ?)",
            (room_id, sender_type, sender_id, message)
        )
        # Update updated_at of the room
        self.cursor.execute(
            "UPDATE support_rooms SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (room_id,)
        )
        self.conn.commit()
        return self.cursor.lastrowid

    def get_support_messages(self, room_id, limit=100):
        query = """
            SELECT sm.*, u.username, u.picture_url
            FROM support_messages sm
            LEFT JOIN users u ON sm.sender_id = u.id
            WHERE sm.room_id = ?
            ORDER BY sm.created_at ASC
            LIMIT ?
        """
        self.cursor.execute(query, (room_id, limit))
        return [dict(row) for row in self.cursor.fetchall()]

    def get_all_active_support_rooms(self):
        query = """
            SELECT sr.*, u.username, u.picture_url, u.email,
                   (SELECT sm.message FROM support_messages sm WHERE sm.room_id = sr.id ORDER BY sm.created_at DESC LIMIT 1) as last_message,
                   (SELECT sm.created_at FROM support_messages sm WHERE sm.room_id = sr.id ORDER BY sm.created_at DESC LIMIT 1) as last_message_time
            FROM support_rooms sr
            JOIN users u ON sr.user_id = u.id
            WHERE sr.status = 'open'
            ORDER BY sr.updated_at DESC
        """
        self.cursor.execute(query)
        return [dict(row) for row in self.cursor.fetchall()]
