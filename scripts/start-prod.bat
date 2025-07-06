@echo off
echo ==========================================
echo    AI Client Reports - Production Start
echo ==========================================
echo.

echo Building frontend for production...
cd ai-whatsapp-reports-frontend
npm run build
cd ..

echo.
echo Starting Backend and Frontend in production mode...
echo Backend will run on: http://localhost:3001
echo Frontend will run on: http://localhost:3000
echo.
echo Press Ctrl+C to stop both servers
echo.

npm run start
