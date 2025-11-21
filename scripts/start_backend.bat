@echo off
cd /d "%~dp0\backend"

if not exist "venv\Scripts\python.exe" (
    echo ERROR: Virtual environment not found!
    echo Please run: python -m venv venv
    pause
    exit /b 1
)

call venv\Scripts\activate.bat
python main.py
