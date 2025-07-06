@echo off
echo ==========================================
echo    AI Client Reports - Quick Start
echo ==========================================
echo.

echo Choose an option:
echo [1] Development Mode (Backend + Frontend)
echo [2] Production Mode  
echo [3] Install All Dependencies
echo [4] Test RAG System
echo [5] Populate RAG with Sample Data
echo [0] Exit
echo.

set /p choice="Enter your choice (0-5): "

if "%choice%"=="1" (
    echo Starting development mode...
    call scripts\start-dev.bat
)
if "%choice%"=="2" (
    echo Starting production mode...
    call scripts\start-prod.bat
)
if "%choice%"=="3" (
    echo Installing all dependencies...
    call scripts\install.bat
)
if "%choice%"=="4" (
    echo Testing RAG system...
    call scripts\test-rag.bat
)
if "%choice%"=="5" (
    echo Populating RAG with sample data...
    npm run populate:rag
)
if "%choice%"=="0" (
    echo Goodbye!
    exit
)

pause
