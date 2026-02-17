@echo off
cd /d "%~dp0\.."
echo Installing backend deps...
cd backend
call npm install
if errorlevel 1 exit /b 1
cd ..\frontend
echo Installing frontend deps...
call npm install
if errorlevel 1 exit /b 1
cd ..
echo Install done.
