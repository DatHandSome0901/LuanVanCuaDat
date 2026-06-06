@echo off
chcp 65001 > nul
title Deploy Android App

REM === CAI DAT BIEN MOI TRUONG ===
set JAVA_HOME=C:\Program Files\Java\jdk-21
set ANDROID_HOME=C:\Users\DAT HANDSOME\AppData\Local\Android\Sdk
set PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%
set ADB=%ANDROID_HOME%\platform-tools\adb.exe
set APK_BUILD=frontend\android\app\build\outputs\apk\debug\app-debug.apk
set APK_PUBLIC=frontend\public\app-release.apk

echo.
echo ╔══════════════════════════════════════════╗
echo ║      DEPLOY APP ANDROID - CHATBOT        ║
echo ╚══════════════════════════════════════════╝
echo.
echo  Chon che do:
echo  [1] PROD  - Build APK chinh thuc + cap nhat trang web tai xuong
echo  [2] DEV   - Hot reload qua WiFi (KHONG can day, KHONG can build lai)
echo.
set /p MODE="Nhap 1 hoac 2: "

if "%MODE%"=="2" goto DEV_MODE
if "%MODE%"=="1" goto PROD_MODE
echo [LOI] Lua chon khong hop le!
pause & exit /b 1

REM ============================================
REM CHE DO DEV: Build 1 lan voi DEV_MODE=true
REM ============================================
:DEV_MODE
echo.
echo [DEV MODE] Thiet lap hot reload qua WiFi...
echo ─────────────────────────────────────────
echo.

REM Bat DEV_MODE trong capacitor.config.ts
powershell -Command "(Get-Content 'frontend\capacitor.config.ts' -Raw) -replace 'const DEV_MODE = false', 'const DEV_MODE = true' | Set-Content 'frontend\capacitor.config.ts'"
echo [OK] Da bat DEV_MODE!

echo [1/3] Dang build web...
cd frontend
call npm run build
if %ERRORLEVEL% NEQ 0 ( echo [LOI] Build that bai! & cd .. & pause & exit /b 1 )
echo [OK] Build xong!

REM Xoa cac file APK bi de quy de tranh lam phinh ung dung
if exist dist\app-release.apk del dist\app-release.apk
if exist dist\app-debug.apk del dist\app-debug.apk
if exist android\app\src\main\assets\public\app-release.apk del android\app\src\main\assets\public\app-release.apk
if exist android\app\src\main\assets\public\app-debug.apk del android\app\src\main\assets\public\app-debug.apk

echo [2/3] Dang copy va dong bo Android...
call npx cap copy android
if %ERRORLEVEL% NEQ 0 ( echo [LOI] Cap copy that bai! & cd .. & pause & exit /b 1 )
echo [OK] Copy xong!
cd ..

echo [3/3] Dang build APK voi DEV config...
cd frontend\android
call gradlew.bat assembleDebug
if %ERRORLEVEL% NEQ 0 ( echo [LOI] Build APK that bai! & cd ..\.. & pause & exit /b 1 )
cd ..\..

goto INSTALL_APK

REM ============================================
REM CHE DO PROD: Build APK chinh thuc
REM ============================================
:PROD_MODE
echo.
echo [PROD MODE] Build va cap nhat day du
echo ─────────────────────────────────────────
echo.

REM Tat DEV_MODE
powershell -Command "(Get-Content 'frontend\capacitor.config.ts' -Raw) -replace 'const DEV_MODE = true', 'const DEV_MODE = false' | Set-Content 'frontend\capacitor.config.ts'"
echo [OK] Da tat DEV_MODE (Prod mode)!

echo [1/4] Dang build web...
cd frontend
call npm run build
if %ERRORLEVEL% NEQ 0 ( echo [LOI] Build that bai! & cd .. & pause & exit /b 1 )
echo [OK] Build web xong!

REM Xoa cac file APK bi de quy de tranh lam phinh ung dung
if exist dist\app-release.apk del dist\app-release.apk
if exist dist\app-debug.apk del dist\app-debug.apk
if exist android\app\src\main\assets\public\app-release.apk del android\app\src\main\assets\public\app-release.apk
if exist android\app\src\main\assets\public\app-debug.apk del android\app\src\main\assets\public\app-debug.apk

echo [2/4] Dang copy sang Android...
call npx cap copy android
if %ERRORLEVEL% NEQ 0 ( echo [LOI] Copy that bai! & cd .. & pause & exit /b 1 )
echo [OK] Copy xong!
cd ..

echo [3/4] Dang build APK...
cd frontend\android
call gradlew.bat assembleDebug
if %ERRORLEVEL% NEQ 0 ( echo [LOI] Build APK that bai! & cd ..\.. & pause & exit /b 1 )
cd ..\..
echo [OK] Build APK xong!

echo [4/4] Dang cap nhat APK len trang web tai xuong...
copy /Y "%APK_BUILD%" "%APK_PUBLIC%" > nul
if %ERRORLEVEL% NEQ 0 (
    echo [LOI] Khong the copy APK vao public!
) else (
    echo [OK] Da cap nhat APK tai xuong! Nguoi dung co the tai APK moi qua web.
)

goto INSTALL_APK

REM ============================================
REM CAI APK LEN DIEN THOAI (qua USB)
REM ============================================
:INSTALL_APK
echo.
echo ─────────────────────────────────────────
echo  Ban co muon cai APK len dien thoai qua USB khong?
echo  [Y] Co - cam day va cai luon
echo  [N] Khong - chi build APK thoi
echo ─────────────────────────────────────────
set /p INSTALL="Nhap Y hoac N: "

if /i "%INSTALL%"=="N" goto DONE_NO_INSTALL

echo.
echo Kiem tra ket noi dien thoai (USB)...
"%ADB%" devices | findstr /C:"device" | findstr /V "List" > nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Chua phat hien dien thoai!
    echo     Cam day USB, bat USB Debugging, roi bam phim bat ky...
    pause
    "%ADB%" devices | findstr /C:"device" | findstr /V "List" > nul
    if %ERRORLEVEL% NEQ 0 ( echo [LOI] Khong tim thay dien thoai! & pause & exit /b 1 )
)

echo [OK] Tim thay dien thoai! Dang cai APK...
"%ADB%" install -r "%APK_BUILD%"
if %ERRORLEVEL% NEQ 0 ( echo [LOI] Cai APK that bai! & pause & exit /b 1 )

echo [OK] Cai APK thanh cong! Dang mo app...
"%ADB%" shell monkey -p com.historical.chatbot -c android.intent.category.LAUNCHER 1 > nul 2>&1

:DONE_NO_INSTALL
echo.
if "%MODE%"=="2" (
    echo ╔══════════════════════════════════════════════════════════════╗
    echo ║  DEV MODE HOAN TAT!                                          ║
    echo ║                                                              ║
    echo ║  Tu gio chi can:                                             ║
    echo ║  1. Sua code tsx/css bat ky                                  ║
    echo ║  2. Keo man hinh xuong de lam moi app                        ║
    echo ║     hoac rut day va mo lai app                               ║
    echo ║                                                              ║
    echo ║  KHONG can cam day, KHONG can build APK lai!                 ║
    echo ║  (May tinh phai bat va npm run dev dang chay)                ║
    echo ╚══════════════════════════════════════════════════════════════╝
) else (
    echo ╔══════════════════════════════════════════════════════════════╗
    echo ║  PROD MODE HOAN TAT!                                         ║
    echo ║                                                              ║
    echo ║  - APK moi da duoc cap nhat len trang web                    ║
    echo ║  - Nguoi dung tai APK tu nut "Tai xuong ban App" tren web    ║
    echo ╚══════════════════════════════════════════════════════════════╝
)
echo.
pause
