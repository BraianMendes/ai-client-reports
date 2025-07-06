# AI Client Reports - PowerShell Development Script

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   AI Client Reports - Development Start" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check and install dependencies
Write-Host "Checking dependencies..." -ForegroundColor Yellow

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing root dependencies..." -ForegroundColor Green
    npm install
}

if (-not (Test-Path "ai-whatsapp-reports-backend\node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Green
    Set-Location "ai-whatsapp-reports-backend"
    npm install
    Set-Location ".."
}

if (-not (Test-Path "ai-whatsapp-reports-frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Green
    Set-Location "ai-whatsapp-reports-frontend"
    npm install
    Set-Location ".."
}

Write-Host ""
Write-Host "Starting Backend and Frontend in development mode..." -ForegroundColor Green
Write-Host "Backend will run on: http://localhost:3001" -ForegroundColor Magenta
Write-Host "Frontend will run on: http://localhost:3000" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Red
Write-Host ""

npm run dev
