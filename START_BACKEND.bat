@echo off
title IAEGIS Backend
color 0A
echo.
echo  ============================================
echo   IAEGIS Backend Starting...
echo  ============================================
echo.

set PYTHON=python
where python >nul 2>&1 || set PYTHON=python3

cd /d "%~dp0backend"

echo [1/2] Installing dependencies...
%PYTHON% -m pip install -r requirements.txt -q
echo.
echo [2/2] Starting backend on http://localhost:8000
echo.
echo  API Docs:  http://localhost:8000/docs
echo  Health:    http://localhost:8000/health
echo.
echo  Keep this window open!
echo ============================================
echo.
%PYTHON% -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
