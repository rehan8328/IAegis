@echo off
title IAEGIS Agent
color 0C
echo.
echo  ============================================
echo   IAEGIS Endpoint Agent
echo   Collecting real telemetry from this PC
echo  ============================================
echo.

set PYTHON=python
where python >nul 2>&1 || set PYTHON=python3

cd /d "%~dp0agent"

echo [1/2] Installing agent dependencies...
%PYTHON% -m pip install -r requirements.txt -q
echo.
echo [2/2] Starting agent...
echo.
echo  Events will appear in the dashboard at:
echo  http://localhost:3000
echo.
echo  Keep this window open!
echo ============================================
echo.
%PYTHON% agent.py
pause
