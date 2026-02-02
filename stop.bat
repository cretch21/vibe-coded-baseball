@echo off
echo Stopping MLB Pitch Analytics App...

:: Kill processes on port 8000 (backend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    echo Stopping backend (PID: %%a)...
    taskkill /PID %%a /F > nul 2>&1
)

:: Kill processes on port 3000 (frontend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo Stopping frontend (PID: %%a)...
    taskkill /PID %%a /F > nul 2>&1
)

echo.
echo Servers stopped.
