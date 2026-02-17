@echo off
cd /d "%~dp0\.."
echo Linting backend...
cd backend
call npm run lint
if errorlevel 1 exit /b 1
cd ..\frontend
echo Linting frontend...
call npm run lint
if errorlevel 1 exit /b 1
cd ..
echo Lint done.
