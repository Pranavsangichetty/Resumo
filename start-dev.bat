@echo off
title Resumo Application Starter
echo ========================================================
echo               Starting Resumo Application               
echo ========================================================
echo.
echo [1/2] Launching Backend API (FastAPI) on port 8000...
start "Resumo Backend (Port 8000)" cmd /k "cd /d "%~dp0Resumo_Application_Export\apps\api" && python -m uvicorn app.main:app --reload --port 8000"

echo [2/2] Launching Frontend (Next.js) on port 3000...
start "Resumo Frontend (Port 3000)" cmd /k "cd /d "%~dp0Resumo_Application_Export\apps\web" && npm run dev"

echo.
echo ========================================================
echo Resumo is now running!
echo - Frontend: http://localhost:3000
echo - Backend:  http://127.0.0.1:8000
echo - API Docs: http://127.0.0.1:8000/docs
echo ========================================================
echo.
pause
