@echo off
echo ============================================================
echo AI MOM - Frontend Launcher
echo ============================================================
echo.
echo Opening AI MOM Frontend...
echo.
echo NOTE: Make sure the backend server is running first!
echo If not, run start_backend.bat in another window.
echo.
echo ============================================================
echo.
echo Select which page to open:
echo.
echo [1] Home Page (index.html)
echo [2] Real-time Capture (real.html)
echo [3] File Upload (file.html)
echo [4] Integration Test Page
echo.
set /p choice="Enter your choice (1-4): "

cd /d "%~dp0"

if "%choice%"=="1" (
    echo.
    echo Opening Landing Page...
    start "" "frontend\index.html"
) else if "%choice%"=="2" (
    echo.
    echo Opening Real-time Capture...
    echo.
    echo REMINDER: Backend must be running for this to work!
    echo WebSocket will connect to: ws://localhost:8000/ws/audio
    echo.
    start "" "frontend\real.html"
) else if "%choice%"=="3" (
    echo.
    echo Opening File Upload...
    echo.
    echo REMINDER: Backend must be running for this to work!
    echo API endpoint: http://localhost:8000/api/process-audio
    echo.
    start "" "frontend\file.html"
) else if "%choice%"=="4" (
    echo.
    echo Opening Integration Test Page...
    echo.
    echo This will test all backend connections.
    echo Make sure backend is running!
    echo.
    start "" "test\test_integration.html"
) else if "%choice%"=="5" (
    echo.
    echo Opening all pages...
    echo.
    start "" "frontend\index.html"
    timeout /t 1 /nobreak >nul
    start "" "frontend\real.html"
    timeout /t 1 /nobreak >nul
    start "" "frontend\file.html"
    timeout /t 1 /nobreak >nul
    start "" "test_integration.html"
) else (
    echo.
    echo Invalid choice! Opening Landing Page by default...
    start "" "frontend\index.html"
)

echo.
echo ============================================================
echo Frontend pages opened in your default browser
echo ============================================================
echo.
echo Quick Tips:
echo - Use Real-time Capture for live microphone transcription
echo - Use File Upload to process pre-recorded audio files
echo - Check Integration Test to verify backend connection
echo.
echo If pages don't load or show errors:
echo 1. Make sure backend is running (start_backend.bat)
echo 2. Check http://localhost:8000/health in browser
echo 3. Open test_integration.html to diagnose issues
echo.
pause
