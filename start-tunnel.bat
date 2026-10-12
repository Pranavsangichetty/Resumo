@echo off
title Resumo Public Tunnel
echo ========================================================
echo          Starting Resumo Backend + Public Tunnel
echo ========================================================
echo.
echo [1/2] Launching Backend API (FastAPI) on port 8000...
start "Resumo Backend (Port 8000)" cmd /k "cd /d "%~dp0apps\api" && python -m uvicorn app.main:app --port 8000"

echo.
echo [2/2] Generating Public HTTPS Tunnel...
echo.
echo Copy the public URL that appears below (e.g. https://xxxx.loca.lt)
echo and set it in Netlify as NEXT_PUBLIC_API_URL!
echo ========================================================
echo.
npx localtunnel --port 8000
pause
