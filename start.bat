@echo off
echo Starting MLB Pitch Analytics App...

:: Start backend in background (hidden)
start /B cmd /c "cd /d %~dp0backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > nul 2>&1"

:: Wait a moment for backend to initialize
timeout /t 2 /nobreak > nul

:: Start frontend in background (hidden)
start /B cmd /c "cd /d %~dp0frontend && npm run dev > nul 2>&1"

echo.
echo Servers started in background!
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo.
echo Use stop.bat to shut them down.
