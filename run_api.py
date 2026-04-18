import subprocess

# Chạy ứng dụng FastAPI
if __name__ == "__main__":
    subprocess.run(["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "2643", "--workers", "1"])

