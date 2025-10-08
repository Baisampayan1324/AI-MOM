@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo AI MOM - System Health Check
echo ============================================================
echo.
echo Checking system components...
echo.

cd /d "%~dp0"

set "all_ok=1"

:: Check 1: Python
echo [1/6] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('python --version 2^>^&1') do echo       [OK] %%i
) else (
    echo       [FAIL] Python not found
    set "all_ok=0"
)
echo.

:: Check 2: Backend Directory
echo [2/6] Checking backend directory...
if exist "backend\main.py" (
    echo       [OK] Backend files found
) else (
    echo       [FAIL] backend\main.py not found
    set "all_ok=0"
)
echo.

:: Check 3: Frontend Directory
echo [3/6] Checking frontend directory...
if exist "frontend\index.html" (
    echo       [OK] Frontend files found
) else (
    echo       [FAIL] Frontend files not found
    set "all_ok=0"
)
echo.

:: Check 4: Extension Directory
echo [4/6] Checking extension directory...
if exist "extension\manifest.json" (
    echo       [OK] Extension files found
) else (
    echo       [FAIL] Extension files not found
    set "all_ok=0"
)
echo.

:: Check 5: Backend Server
echo [5/6] Checking backend server...
curl -s -o nul -w "%%{http_code}" http://localhost:8000/health >temp_status.txt 2>nul
set /p status=<temp_status.txt
del temp_status.txt >nul 2>&1

if "%status%"=="200" (
    echo       [OK] Backend server is running
    echo       URL: http://localhost:8000
) else (
    echo       [WARN] Backend server is not running
    echo       Run: start_backend.bat to start the server
)
echo.

:: Check 6: Dependencies
echo [6/6] Checking Python dependencies...
python -c "import fastapi; import uvicorn; import openai; print('[OK] Core dependencies installed')" 2>nul
if %errorlevel% equ 0 (
    python -c "import fastapi; import uvicorn; print('      ')" 2>nul
) else (
    echo       [WARN] Some dependencies may be missing
    echo       Run: pip install -r backend\requirements.txt
)
echo.

:: Summary
echo ============================================================
echo Health Check Summary
echo ============================================================
echo.

if "%all_ok%"=="1" (
    if "%status%"=="200" (
        echo [SUCCESS] All systems operational!
        echo.
        echo You can now:
        echo 1. Open test_integration.html to verify integration
        echo 2. Run start_frontend.bat to use the app
        echo 3. Load extension in Chrome for meeting capture
    ) else (
        echo [READY] System is ready, but backend is not running
        echo.
        echo Next step:
        echo 1. Run: start_backend.bat
        echo 2. Then run: start_frontend.bat
    )
) else (
    echo [ERROR] Some components are missing or misconfigured
    echo.
    echo Please check the errors above and fix them.
)

echo.
echo ============================================================
echo.

:: Show system info if backend is running
if "%status%"=="200" (
    echo Current Backend Status:
    echo.
    curl -s http://localhost:8000/health 2>nul
    echo.
    echo.
)

pause
