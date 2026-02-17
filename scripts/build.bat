@echo off
cd /d "%~dp0\.."
echo Building backend...
cd backend
call npm run build
if errorlevel 1 exit /b 1
cd ..\frontend
echo Building frontend...
call npm run build
if errorlevel 1 exit /b 1
cd ..
echo Build done.
