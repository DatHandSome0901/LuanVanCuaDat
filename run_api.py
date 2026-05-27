import sys
import os

# Configure stdout/stderr to use UTF-8 globally to prevent Windows encoding crashes
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

os.environ["PYTHONIOENCODING"] = "utf-8"
os.environ["PYTHONUTF8"] = "1"

import subprocess
import time
import urllib.request
import json
import atexit
from update_mobile_ip import run_update

# === CAU HINH ===
NGROK_STATIC_DOMAIN = "rehydrate-doing-crust.ngrok-free.dev"  # Static domain cua ban
BACKEND_PORT = 2643
FRONTEND_PORT = 5173
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend")

# Luu cac process de tat khi thoat
_processes = []

def cleanup():
    """Tat tat ca cac process khi thoat."""
    if _processes:
        print("\n--- Dang tat tat ca cac dich vu... ---")
        for p in _processes:
            try:
                p.terminate()
            except Exception:
                pass
        time.sleep(1)
        for p in _processes:
            try:
                p.kill()
            except Exception:
                pass
        print("--- Da tat tat ca! ---")

atexit.register(cleanup)

# ─── NGROK ───────────────────────────────────────────

def is_ngrok_running():
    try:
        with urllib.request.urlopen('http://localhost:4040/api/tunnels', timeout=2) as resp:
            data = json.loads(resp.read())
            return len(data.get('tunnels', [])) > 0
    except Exception:
        return False

def start_ngrok():
    if is_ngrok_running():
        print("[ngrok] Ngrok da dang chay!")
        return True

    print("[ngrok] Dang khoi dong ngrok...")
    try:
        if NGROK_STATIC_DOMAIN:
            cmd = ["ngrok", "http", f"--domain={NGROK_STATIC_DOMAIN}", str(BACKEND_PORT)]
        else:
            cmd = ["ngrok", "http", str(BACKEND_PORT)]

        p = subprocess.Popen(
            cmd,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
        )
        _processes.append(p)

        for i in range(8):
            time.sleep(1)
            if is_ngrok_running():
                print(f"[ngrok] San sang sau {i+1} giay!")
                return True

        print("[ngrok] Khoi dong cham, tiep tuc bang IP local...")
        return False
    except FileNotFoundError:
        print("[ngrok] Khong tim thay lenh 'ngrok' - bo qua.")
        return False
    except Exception as e:
        print(f"[ngrok] Loi: {e}")
        return False



# ─── BACKEND ──────────────────────────────────────────

def get_python_executable():
    for venv in [".venv", "venv"]:
        for path in [os.path.join(venv, "Scripts", "python.exe"),
                     os.path.join(venv, "bin", "python")]:
            if os.path.exists(path):
                return path
    return sys.executable

# ─── MAIN ─────────────────────────────────────────────

if __name__ == "__main__":
    print()
    print("===========================================")
    print("   KHOI DONG HE THONG CHATBOT LICH SU")
    print("===========================================")
    print()

    # Fix SSL
    try:
        import certifi
        os.environ['SSL_CERT_FILE'] = certifi.where()
        os.environ['GRPC_DEFAULT_SSL_ROOTS_FILE_PATH'] = certifi.where()
        print(f"[ssl] Da thiet lap SSL_CERT_FILE tu certifi")
    except ImportError:
        print("[ssl] Canh bao: Chua cai 'certifi', co the gap loi SSL")

    print()

    # Buoc 1: Ngrok
    print("[1/3] Khoi dong Ngrok...")
    start_ngrok()
    print()

    # Buoc 2: Cap nhat IP / URL
    print("[2/3] Cap nhat cau hinh mang...")
    run_update()
    print()

    # Buoc 3: Backend
    print("[3/3] Khoi dong Backend (FastAPI)...")
    python_exe = get_python_executable()
    print(f"[backend] Su dung: {python_exe}")
    print()
    print("===========================================")
    print("  Tat ca dich vu dang chay!")
    print(f"  Backend : http://localhost:{BACKEND_PORT}")
    print("  Nhan Ctrl+C de dung tat ca")
    print("===========================================")
    print()

    try:
        launch_env = os.environ.copy()
        launch_env["PYTHONUTF8"] = "1"
        launch_env["PYTHONIOENCODING"] = "utf-8"
        subprocess.run([
            python_exe, "-X", "utf8",
            "-m", "uvicorn",
            "app.main:app",
            "--host", "0.0.0.0",
            "--port", str(BACKEND_PORT),
            "--reload"
        ], env=launch_env)
    except KeyboardInterrupt:
        print("\n--- Nhan Ctrl+C - Dang dung tat ca... ---")
    finally:
        cleanup()
