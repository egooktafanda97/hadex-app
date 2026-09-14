@echo off
setlocal EnableExtensions
cd /d "%~dp0"

title HDEX Trans - Production Server

if not exist "package.json" (
  echo [ERROR] package.json tidak ditemukan.
  echo Jalankan file ini dari folder proyek.
  pause
  exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js tidak ditemukan di PATH.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo [INFO] node_modules belum ada. Menjalankan npm install...
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install gagal.
    pause
    exit /b 1
  )
)

echo [INFO] Memastikan database siap (migrate + seed jika perlu)...
call npm run db:ensure
if errorlevel 1 (
  echo [ERROR] Persiapan database gagal.
  pause
  exit /b 1
)

if not exist ".next\" (
  echo [INFO] Build belum ada. Menjalankan npm run build...
  call npm run build
  if errorlevel 1 (
    echo [ERROR] Build gagal. Perbaiki error di atas, lalu jalankan ulang.
    pause
    exit /b 1
  )
)

if "%PORT%"=="" set "PORT=3000"

echo.
echo ========================================
echo  HDEX Trans - Production Server
echo  URL: http://localhost:%PORT%
echo  Login: http://localhost:%PORT%/login
echo  Admin: admin@mail.com / password
echo  Super: super@mail.com / password
echo  Tekan Ctrl+C untuk menghentikan
echo ========================================
echo.

call npm start -- -p %PORT%
set "EXIT_CODE=%ERRORLEVEL%"

if not "%EXIT_CODE%"=="0" (
  echo.
  echo [ERROR] Server berhenti dengan kode %EXIT_CODE%.
  pause
)

exit /b %EXIT_CODE%
