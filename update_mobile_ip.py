import socket
import os
import re
import subprocess
import urllib.request
import json

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

def get_ngrok_url():
    """Tu dong lay ngrok URL dang chay tu ngrok local API."""
    try:
        with urllib.request.urlopen('http://localhost:4040/api/tunnels', timeout=2) as response:
            data = json.loads(response.read())
            tunnels = data.get('tunnels', [])
            for tunnel in tunnels:
                if tunnel.get('proto') == 'https':
                    return tunnel.get('public_url')
            # Neu khong co HTTPS thi lay HTTPS tu HTTP tunnel
            for tunnel in tunnels:
                url = tunnel.get('public_url', '')
                if url.startswith('https://'):
                    return url
    except Exception:
        pass
    return None

def update_api_ts(new_native_url):
    """Cap nhat DEFAULT_NATIVE_API trong api.ts."""
    api_path = os.path.join("frontend", "api.ts")
    if not os.path.exists(api_path):
        print(f"[-] Khong tim thay file: {api_path}")
        return False

    with open(api_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Match ca http va https, ca IP lan domain
    pattern = r"const DEFAULT_NATIVE_API = '(https?://[^']+)';"
    match = re.search(pattern, content)

    if match:
        old_url = match.group(1)
        if old_url == new_native_url:
            print(f"[i] DEFAULT_NATIVE_API da chinh xac ({new_native_url}), khong can cap nhat.")
            return False

        new_line = f"const DEFAULT_NATIVE_API = '{new_native_url}';"
        new_content = re.sub(pattern, new_line, content)
        with open(api_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"[+] Da cap nhat DEFAULT_NATIVE_API: {old_url} -> {new_native_url}")
        return True
    else:
        print("[-] Khong tim thay dong DEFAULT_NATIVE_API trong api.ts")
        return False

def update_capacitor_config(new_dev_server_url):
    """Cap nhat DEV_SERVER_URL trong capacitor.config.ts."""
    cap_path = os.path.join("frontend", "capacitor.config.ts")
    if not os.path.exists(cap_path):
        print(f"[-] Khong tim thay file: {cap_path}")
        return False

    with open(cap_path, "r", encoding="utf-8") as f:
        content = f.read()

    pattern = r"const DEV_SERVER_URL = '(https?://[^']+)';"
    match = re.search(pattern, content)

    if match:
        old_url = match.group(1)
        if old_url == new_dev_server_url:
            print(f"[i] DEV_SERVER_URL da chinh xac ({new_dev_server_url}), khong can cap nhat.")
            return False

        new_content = re.sub(pattern, f"const DEV_SERVER_URL = '{new_dev_server_url}';", content)
        with open(cap_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"[+] Da cap nhat DEV_SERVER_URL: {old_url} -> {new_dev_server_url}")
        return True
    else:
        print("[-] Khong tim thay dong DEV_SERVER_URL trong capacitor.config.ts")
        return False


def update_env_file(new_ip):
    env_path = ".env"
    if not os.path.exists(env_path):
        print(f"[-] Khong tim thay file: {env_path}")
        return False

    with open(env_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    new_lines = []
    changed = False

    for line in lines:
        if line.startswith("GOOGLE_REDIRECT_URI="):
            current_val = line.split("=", 1)[1].strip()
            new_val = f"http://{new_ip}:2643/api/v1/auth/google/callback"
            if current_val != new_val:
                new_lines.append(f"GOOGLE_REDIRECT_URI={new_val}\n")
                changed = True
            else:
                new_lines.append(line)
        elif line.startswith("FRONTEND_URL="):
            current_val = line.split("=", 1)[1].strip()
            new_val = f"http://{new_ip}:3000"
            if current_val != new_val:
                new_lines.append(f"FRONTEND_URL={new_val}\n")
                changed = True
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)

    if changed:
        with open(env_path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
        print(f"[+] Da cap nhat IP moi vao .env: {new_ip}")
        return True
    else:
        print(f"[i] IP trong .env da chinh xac, khong can cap nhat.")
        return False

def run_update():
    current_ip = get_local_ip()
    print(f"[*] IP may tinh hien tai: {current_ip}")

    # Uu tien dung ngrok URL cho Android Native (vuot tuong lua, hoat dong moi mang)
    ngrok_url = get_ngrok_url()
    if ngrok_url:
        print(f"[*] Phat hien ngrok dang chay: {ngrok_url}")
        native_api_url = ngrok_url
        server_url = ngrok_url
    else:
        print(f"[!] Ngrok khong chay - dung IP local (chi ket noi duoc cung mang LAN)")
        native_api_url = f"http://{current_ip}:2643"
        server_url = f"http://{current_ip}:3000"

    # Dev server URL cho Capacitor DEV mode (Vite chay o port 5173, dung IP local)
    dev_server_url = f"http://{current_ip}:5173"
    print(f"[*] Vite dev server URL: {dev_server_url}")

    update_env_file(current_ip)
    update_capacitor_config(dev_server_url)
    api_changed = update_api_ts(native_api_url)
    cap_changed = update_capacitor_config(dev_server_url)

    if api_changed or cap_changed:
        print("[!] Cau hinh da thay doi! Dang tu dong Build va Sync Android...")
        try:
            subprocess.run(["npm", "run", "build"], cwd="frontend", shell=True, check=True)
            subprocess.run(["npx", "cap", "copy", "android"], cwd="frontend", shell=True, check=True)
            print("\n[DONE] Da cap nhat va dong bo sang Android thanh cong!")
            return True
        except Exception as e:
            print(f"[-] Loi khi tu dong build: {e}")
            return False
    else:
        print("[+] Cau hinh van on, khong can Build lai.")
        return False

if __name__ == "__main__":
    run_update()
