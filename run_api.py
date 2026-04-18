import subprocess
import os
import sys

# Tìm đường dẫn đến python trong môi trường ảo (venv)
def get_python_executable():
    # Kiểm tra Windows
    venv_python = os.path.join(".venv", "Scripts", "python.exe")
    if not os.path.exists(venv_python):
        venv_python = os.path.join("venv", "Scripts", "python.exe")
    
    # Kiểm tra Linux/Mac
    if not os.path.exists(venv_python):
        venv_python = os.path.join(".venv", "bin", "python")
    if not os.path.exists(venv_python):
        venv_python = os.path.join("venv", "bin", "python")
        
    if os.path.exists(venv_python):
        return venv_python
    return sys.executable  # Trả về python mặc định nếu không thấy venv

# Chạy ứng dụng FastAPI
if __name__ == "__main__":
    python_exe = get_python_executable()
    print(f"--- Dang khoi dong Backend bang: {python_exe} ---")
    
    try:
        subprocess.run([
            python_exe, "-m", "uvicorn", 
            "app.main:app", 
            "--host", "0.0.0.0", 
            "--port", "2643", 
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\n--- Da dung Backend ---")
