@echo off
title RJIT College ERP Launcher
echo Starting RJIT College ERP...

:: Ensure PM2 processes are running
cd /d "%~dp0"
call pm2 resurrect >nul 2>&1
call pm2 start ecosystem.config.cjs >nul 2>&1

:: Open default browser
start http://localhost:5173

exit
