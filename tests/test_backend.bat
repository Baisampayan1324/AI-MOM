@echo off
echo ============================================================
echo AI MOM - Quick Test
echo ============================================================
echo.
echo Testing backend server at http://localhost:8000
echo.

curl -s http://localhost:8000/health

if %errorlevel% equ 0 (
    echo.
    echo ============================================================
    echo SUCCESS! Backend is running correctly!
    echo ============================================================
    echo.
    echo You can now:
    echo 1. Open frontend\index.html in your browser
    echo 2. Open frontend\real.html for real-time capture
    echo 3. Open test_integration.html for full integration test
    echo.
) else (
    echo.
    echo ============================================================
    echo ERROR! Backend is not responding
    echo ============================================================
    echo.
    echo Please make sure:
    echo 1. Backend server is running: start_backend.bat
    echo 2. Server shows: "Uvicorn running on http://localhost:8000"
    echo.
)

echo.
pause
