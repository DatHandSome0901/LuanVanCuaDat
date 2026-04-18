# File cấu hình chung cho ứng dụng

import os
from dotenv import load_dotenv

# Load các biến môi trường từ file .env
load_dotenv()


class Settings:
    # SETTING
    DIR_ROOT = os.path.dirname(os.path.abspath(".env"))
    
    # API KEY
    SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")
    
    # SECURITY
    ALLOW_ORIGINS = os.getenv("ALLOW_ORIGINS", "*")

    # TITLE
    TITLE_APP = os.getenv("TITLE_APP", "Bloom API")
    VERSION_APP = os.getenv("VERSION_APP", "v1")
    NAME_WEB = os.getenv("NAME_WEB", "BLOOM")
    
    # GOOGLE OAUTH
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # SEPAY
    SEPAY_API_KEY = os.getenv("SEPAY_API_KEY")
    SEPAY_ACCOUNT_NUMBER = os.getenv("SEPAY_ACCOUNT_NUMBER")
    SEPAY_BANK_BRAND = os.getenv("SEPAY_BANK_BRAND")

    # DB (SQLite)
    DB_PATH = os.path.join(DIR_ROOT, "database.db")


settings = Settings()
