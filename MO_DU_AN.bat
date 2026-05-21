@echo off
title Nha hang Golden Taste
cd /d "%~dp0server"

echo Dang giai phong cong 3001 (neu co server cu)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
  taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul

echo Nha hang Golden Taste - http://localhost:3001
start http://localhost:3001
npm start
