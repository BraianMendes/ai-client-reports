@echo off
echo ==========================================
echo    AI Client Reports - Development Start
echo ==========================================
echo.

echo Installing dependencies if needed...
if not exist "node_modules" (
    echo Installing root dependencies...
    npm install
)

if not exist "ai-whatsapp-reports-backend\node_modules" (
    echo Installing backend dependencies...
    cd ai-whatsapp-reports-backend
    npm install
    cd ..
)

if not exist "ai-whatsapp-reports-frontend\node_modules" (
    echo Installing frontend dependencies...
    cd ai-whatsapp-reports-frontend
    npm install
    cd ..
)

echo.
echo Starting Backend and Frontend in development mode...
echo Backend will run on: http://localhost:3001
echo Frontend will run on: http://localhost:3000
echo.
echo Press Ctrl+C to stop both servers
echo.

npm run dev
