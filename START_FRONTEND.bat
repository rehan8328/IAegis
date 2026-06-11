@echo off
title IAEGIS Frontend
color 0B
echo.
echo  ============================================
echo   IAEGIS Frontend Starting...
echo  ============================================
echo.

cd /d "%~dp0frontend"

echo [1/2] Installing dependencies (first run takes 2-3 min)...
call npm install
echo.
echo [2/2] Starting dashboard on http://localhost:3000
echo.
echo  Open browser: http://localhost:3000
echo.
echo  Keep this window open!
echo ============================================
echo.
call npm run dev
pause
