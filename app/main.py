import sys
import os

os.environ["PYTHONIOENCODING"] = "utf-8"
os.environ["PYTHONUTF8"] = "1"

# Force stdout/stderr to UTF-8 to prevent charmap encoding errors on Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
if hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from fastapi import FastAPI
from fastapi.responses import FileResponse
from app.routers import auth, file_upload, payment, chatbot, admin, qa
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from time import perf_counter

# Prefix API theo version
api_prefix = f"/api/{settings.VERSION_APP}"

# Tạo instance của FastAPI - Reloaded with Gmail App Password
app = FastAPI(
    title=settings.TITLE_APP,
    docs_url=f"{api_prefix}/docs",
    redoc_url=f"{api_prefix}/redoc",
    openapi_url=f"{api_prefix}/openapi.json",
)

# Cấu hình CORS - Cho phép tất cả (Sửa lỗi Credentials với dấu *)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False, # BẮT BUỘC là False nếu dùng allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include các router vào ứng dụng chính
app.include_router(auth.router, prefix=api_prefix)
app.include_router(file_upload.router, prefix=api_prefix)
app.include_router(payment.router, prefix=api_prefix)
app.include_router(chatbot.router, prefix=api_prefix)
app.include_router(admin.router, prefix=api_prefix)
app.include_router(qa.router, prefix=api_prefix)


@app.get(f"{api_prefix}/")
def read_root():
    return {"message": f"Welcome to {settings.TITLE_APP}"}


@app.get("/download/apk")
def download_apk():
    """Serve file APK de nguoi dung tai ve."""
    # Tim file APK - uu tien file moi nhat
    apk_paths = [
        os.path.join("frontend", "public", "app-release.apk"),
        os.path.join("frontend", "android", "app", "build", "outputs", "apk", "debug", "app-debug.apk"),
    ]
    for path in apk_paths:
        if os.path.exists(path):
            return FileResponse(
                path,
                media_type="application/vnd.android.package-archive",
                filename="ChatbotLichSu.apk"
            )
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="File APK chua duoc build")


def _env_bool(name: str, default: bool) -> bool:
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() not in {"0", "false", "no", "off"}


def _has_faiss_index(path: str | None) -> bool:
    return bool(path) and os.path.exists(path) and os.path.exists(os.path.join(path, "index.faiss"))


@app.on_event("startup")
def prewarm_faiss_indexes():
    if not _env_bool("CHAT_PREWARM_FAISS", True):
        print("[RAG_PREWARM] Disabled by CHAT_PREWARM_FAISS=0")
        return

    started_at = perf_counter()

    try:
        from ingestion.retriever import Retriever

        embedding_model = os.environ.get("EMBEDDING_MODEL_NAME", "openai")
        base_vector_path = os.environ.get("PATH_VECTOR_STORE")
        model_vector_path = (
            os.path.join(base_vector_path, embedding_model)
            if base_vector_path
            else None
        )

        paths = [
            "output",
            os.path.join("output", embedding_model),
            model_vector_path if _has_faiss_index(model_vector_path) else base_vector_path,
        ]

        if _env_bool("RAG_SEARCH_OPENAI_LEGACY_INDEX", False):
            openai_path = os.path.join(base_vector_path or "", "openai")
            if _has_faiss_index(openai_path):
                print("[RAG_PREWARM] Loading OpenAI legacy index...")
                Retriever(embedding_model_name="openai").set_retriever(path_vector_store=openai_path)

        loaded = 0
        print(f"[RAG_PREWARM] Loading FAISS indexes for embedding={embedding_model}...")
        for path in dict.fromkeys(p for p in paths if p):
            if not _has_faiss_index(path):
                continue

            Retriever(embedding_model_name=embedding_model).set_retriever(path_vector_store=path)
            loaded += 1

        elapsed = perf_counter() - started_at
        print(f"[RAG_PREWARM] Done loaded={loaded} elapsed_s={elapsed:.2f}")
    except Exception as e:
        elapsed = perf_counter() - started_at
        print(f"[RAG_PREWARM] Failed elapsed_s={elapsed:.2f} error={e}")
