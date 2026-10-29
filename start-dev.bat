@echo off
title Resumo Application Starter
echo ========================================================
echo               Starting Resumo Application               
echo ========================================================
echo.
set "PY=python"
if exist "%~dp0apps\api\venv\Scripts\python.exe" (
    set "PY=%~dp0apps\api\venv\Scripts\python.exe"
) else (
    echo [WARN] No venv found in apps\api. Using system Python.
    echo        Run setup: cd apps\api ^&^& python -m venv venv ^&^& venv\Scripts\pip install -r requirements.txt
)
if not exist "%~dp0apps\web\node_modules" (
    echo [WARN] apps\web\node_modules missing. Run: cd apps\web ^&^& npm install
)

echo [1/2] Launching Backend API (FastAPI) on port 8000...
start "Resumo Backend (Port 8000)" cmd /k "cd /d "%~dp0apps\api" && "%PY%" -m uvicorn app.main:app --reload --port 8000"

echo [2/2] Launching Frontend (Next.js) on port 3000...
start "Resumo Frontend (Port 3000)" cmd /k "cd /d "%~dp0apps\web" && npm run dev"

echo.
echo ========================================================
echo Servers launched in two new windows (check them for errors).
echo - Frontend: http://localhost:3000
echo - Backend:  http://127.0.0.1:8000
echo - API Docs: http://127.0.0.1:8000/docs
echo ========================================================
echo.
pause
