@echo off
title IAEGIS - Inject Test Attacks
color 0E
echo.
echo  ============================================
echo   IAEGIS Attack Scenario Injector
echo   Fires 10 real attack scenarios
echo   so the dashboard shows data immediately
echo  ============================================
echo.
echo  Make sure START_BACKEND.bat is running first!
echo.
pause

set PYTHON=python
where python >nul 2>&1 || set PYTHON=python3

cd /d "%~dp0"
%PYTHON% tools/inject_scenarios.py
echo.
pause
