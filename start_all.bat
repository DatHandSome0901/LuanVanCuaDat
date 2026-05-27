@echo off
chcp 65001 > nul
echo ============================================
echo    KHOI DONG HE THONG CHATBOT LICH SU
echo ============================================
echo.

REM ---- BUOC 1: Kiem tra ngrok da chay chua ----
echo [1/3] Kiem tra ngrok...
curl -s http://localhost:4040/api/tunnels > nul 2>&1
if %ERRORLEVEL% == 0 (
    echo [OK] Ngrok dang chay roi!
    goto START_BACKEND
)

REM ---- BUOC 2: Khoi dong ngrok ----
echo [2/3] Dang khoi dong ngrok...

REM === CAI NHAT STATIC DOMAIN O DAY NEU CO ===
REM Neu ban da co static domain, thay dong duoi thanh:
REM   start "ngrok" cmd /k "ngrok http --domain=YOUR-STATIC-DOMAIN.ngrok-free.app 2643"
REM Neu chua co static domain, dung dong nay (URL se doi moi lan restart):
start "ngrok" cmd /k "ngrok http 2643"

echo [*] Dang cho ngrok khoi dong (5 giay)...
timeout /t 5 /nobreak > nul

REM Kiem tra lai ngrok da chay chua
curl -s http://localhost:4040/api/tunnels > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [LOI] Ngrok khong khoi dong duoc! Kiem tra lai ngrok da cai chua.
    pause
    exit /b 1
)
echo [OK] Ngrok da san sang!
echo.

REM ---- BUOC 3: Khoi dong Backend ----
:START_BACKEND
echo [3/3] Dang khoi dong Backend (FastAPI)...
echo [*] Luong: ngrok URL se tu dong duoc cap nhat vao api.ts
echo.
call venv\Scripts\activate.bat 2>nul || call .venv\Scripts\activate.bat 2>nul
python run_api.py

pause
