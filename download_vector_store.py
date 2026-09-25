import os
import urllib.request
import zipfile

def maybe_download_vector_store():
    """
    Tu dong tai kho vector store ve server neu duoc cau hinh bien moi truong VECTOR_STORE_ZIP_URL.
    Huu ich khi deploy len Cloud (Render/Railway) ma khong the day file >100MB len GitHub.
    """
    url = os.environ.get("VECTOR_STORE_ZIP_URL")
    target_dir = os.environ.get("PATH_VECTOR_STORE", "utils/data_vector_new")
    
    # Neu da ton tai file index thi bo qua khong can tai lai
    if os.path.exists(target_dir) and (
        os.path.exists(os.path.join(target_dir, "index.faiss")) or
        os.path.exists(os.path.join(target_dir, "vertex", "index.faiss")) or
        os.path.exists(os.path.join(target_dir, "openai", "index.faiss"))
    ):
        print(f"[VECTOR_DOWNLOAD] Vector store already exists at {target_dir}. Skipping download.")
        return

    if not url:
        print("[VECTOR_DOWNLOAD] VECTOR_STORE_ZIP_URL not set. Skipping download.")
        return

    print(f"[VECTOR_DOWNLOAD] Downloading vector store from {url}...")
    zip_path = "vector_store_temp.zip"
    try:
        # User-Agent header phong truong hop link yeu cau
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req) as response, open(zip_path, 'wb') as out_file:
            chunk_size = 16 * 1024 * 1024
            while True:
                chunk = response.read(chunk_size)
                if not chunk:
                    break
                out_file.write(chunk)
                
        print("[VECTOR_DOWNLOAD] Download complete. Extracting...")
        os.makedirs(target_dir, exist_ok=True)
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(target_dir)
        print(f"[VECTOR_DOWNLOAD] Successfully extracted to {target_dir}")
    except Exception as e:
        print(f"[VECTOR_DOWNLOAD] Error downloading/extracting vector store: {e}")
    finally:
        if os.path.exists(zip_path):
            try:
                os.remove(zip_path)
            except Exception:
                pass

if __name__ == "__main__":
    maybe_download_vector_store()
