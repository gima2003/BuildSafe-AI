@echo off
title BuildSafe-AI Server Launcher
echo ============================================================
echo   Starting BuildSafe-AI Backend and Frontend
echo ============================================================

start "BuildSafe-AI Backend (FastAPI)" cmd /k "cd /d "%~dp0" && python backend/run.py"
timeout /t 2 /nobreak >nul
start "BuildSafe-AI Frontend (React Vite)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Both servers have been launched in separate windows!
echo   * Frontend: http://localhost:5173
echo   * Backend:  http://127.0.0.1:8000/docs
echo.
pause
