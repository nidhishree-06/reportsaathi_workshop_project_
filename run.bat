@echo off
echo Starting ReportSaathi...
start cmd /k "cd /d %~dp0backend && .\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
start cmd /k "cd /d %~dp0frontend && npm run dev -- --host 0.0.0.0 --port 5173"
echo.
echo ========================================================
echo   ReportSaathi is launching!
echo   Frontend: http://localhost:5173
echo   Backend API: http://localhost:8000/docs
echo ========================================================
pause
