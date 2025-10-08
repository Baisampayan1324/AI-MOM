@echo off
echo ============================================================
echo AI MOM - Backend Server Launcher
echo ============================================================
echo.
echo Starting backend server...
echo.
echo NOTE: The server will stay running until you press CTRL+C
echo This is NORMAL behavior - the server is waiting for requests
echo.
echo To test the server:
echo 1. Keep this window open
echo 2. Open test_integration.html in your browser
echo 3. Or visit: http://localhost:8000/health
echo.
echo ============================================================
echo.

cd /d "%~dp0"
python backend/main.py

pause
