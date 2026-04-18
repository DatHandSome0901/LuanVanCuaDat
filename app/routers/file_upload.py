from fastapi import APIRouter
from fastapi import FastAPI, File, UploadFile, Header, HTTPException, Depends, Form  # noqa: E402, F401
from fastapi.responses import FileResponse  # noqa: E402
from uuid import uuid4
from app.models.file_upload import FileUpload
from app.config import settings
from mimetypes import guess_type
import os
import shutil


# Tạo router cho người dùng
router = APIRouter(prefix="/upload-file", tags=["file-upload"])


@router.post("/upload/", response_model=FileUpload)
async def upload_file(
    file: UploadFile = File(...),  # Tệp được upload
):
    try:
        # Ngăn chặn Path Traversal bằng os.path.basename
        safe_filename = os.path.basename(file.filename)
        file_extension = os.path.splitext(safe_filename)[1]
        unique_filename = f"{uuid4()}{file_extension}"
        folder_path = os.path.join(settings.DIR_ROOT, "utils", "download")
        os.makedirs(folder_path, exist_ok=True)
        file_path = os.path.join(folder_path, unique_filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        download_url = f"{router.prefix}/download/{unique_filename}"
        
        return FileUpload(filename=unique_filename, download_url=download_url)
    except Exception:
        raise HTTPException(status_code=404, detail="upload errors")


@router.get("/download/{filename}")
async def download_file(filename: str):
    """
    API để tải xuống tệp.

    Tham số:
    - `filename`: Tên tệp cần tải xuống.

    Trả về:
    - Nếu tệp tồn tại, trả về tệp dưới dạng phản hồi tải xuống.
    - Nếu tệp không tồn tại, trả về lỗi 404 với thông báo "File not found".
    """
    file_path = os.path.join(os.path.join(settings.DIR_ROOT, "utils", "download"), filename)
    if os.path.exists(file_path):
        return FileResponse(path=file_path, filename=filename, media_type="application/octet-stream")
    raise HTTPException(status_code=404, detail="File not found")


@router.get("/view/{filename}")
async def view_file(filename: str):
    """
    API để xem trước file (hình ảnh, video, audio, v.v.)

    Tham số:
    - `filename`: Tên file cần xem.

    Trả về:
    - File với media type phù hợp nếu tồn tại.
    - 404 nếu không tìm thấy file.
    """
    file_path = os.path.join(os.path.join(settings.DIR_ROOT, "utils", "download"), filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    media_type, _ = guess_type(file_path)
    media_type = media_type or "application/octet-stream"  # fallback nếu không đoán được

    return FileResponse(
        path=file_path, media_type=media_type, filename=filename, headers={"Content-Disposition": f"inline; filename={filename}"}
    )
