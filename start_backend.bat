@echo off
REM Start AI MOM backend using the root .venv (preferred environment)
setlocal ENABLEDELAYEDEXPANSION

REM Move to project root (directory of this script)
cd /d "%~dp0"

REM Ensure root virtual environment exists
if not exist ".venv\Scripts\python.exe" (
    echo [INFO] Root virtual environment .venv not found. Creating one...
    python -m venv .venv || (
        echo [ERROR] Failed to create .venv virtual environment.
        pause
        exit /b 1
    )
)

echo [INFO] Activating root virtual environment (.venv)
call ".venv\Scripts\activate.bat"
if errorlevel 1 (
    echo [ERROR] Failed to activate .venv environment.
    pause
    exit /b 1
)

REM Switch into backend directory and launch the server
cd backend
echo ============================================================
echo Launching AI MOM Backend (root .venv)
echo Python: %PYTHON%
echo Working Directory: %CD%
echo ============================================================

REM Use python main.py (contains internal uvicorn startup) to retain existing flow
python main.py

endlocal
