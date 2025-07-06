@echo off
echo ==========================================
echo    AI Client Reports - Install All
echo ==========================================
echo.

echo Installing all project dependencies...
echo.

echo [1/3] Installing root dependencies...
npm install

echo [2/3] Installing backend dependencies...
cd ai-whatsapp-reports-backend
npm install
cd ..

echo [3/3] Installing frontend dependencies...
cd ai-whatsapp-reports-frontend
npm install
cd ..

echo.
echo ✅ All dependencies installed successfully!
echo.
echo You can now run:
echo   start-dev.bat    - Start in development mode
echo   start-prod.bat   - Start in production mode
echo   test-rag.bat     - Test RAG functionality
echo.
pause
