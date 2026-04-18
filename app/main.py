from fastapi import FastAPI
from app.routers import auth, file_upload, payment, chatbot, admin
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

# Prefix API theo version
api_prefix = f"/api/{settings.VERSION_APP}"

# Tạo instance của FastAPI
app = FastAPI(
    title=settings.TITLE_APP,
    docs_url=f"{api_prefix}/docs",
    redoc_url=f"{api_prefix}/redoc",
    openapi_url=f"{api_prefix}/openapi.json",
)

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép tất cả nguồn (hoặc chỉ định danh sách ["http://example.com"])
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả phương thức (GET, POST, PUT, DELETE, v.v.)
    allow_headers=["*"],  # Cho phép tất cả headers
)


# Include các router vào ứng dụng chính
app.include_router(auth.router, prefix=api_prefix)
app.include_router(file_upload.router, prefix=api_prefix)
app.include_router(payment.router, prefix=api_prefix)
app.include_router(chatbot.router, prefix=api_prefix)
app.include_router(admin.router, prefix=api_prefix)


@app.get(f"{api_prefix}/")
def read_root():
    return {"message": f"Welcome to {settings.TITLE_APP}"}
