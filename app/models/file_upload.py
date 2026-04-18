from pydantic import BaseModel


class FileUpload(BaseModel):
    filename: str
    download_url: str