# Railway Setup Script for Desperados Destiny
# Run this in PowerShell

Write-Host "Setting up Railway services..." -ForegroundColor Cyan

# Navigate to project directory
Set-Location "C:\Users\kaine\Documents\Desperados Destiny Dev"

# Add MongoDB
Write-Host "`nAdding MongoDB..." -ForegroundColor Yellow
railway add -d mongo

# Add Redis
Write-Host "`nAdding Redis..." -ForegroundColor Yellow
railway add -d redis

# Add server service from GitHub repo
Write-Host "`nAdding server service..." -ForegroundColor Yellow
railway add --repo kc92/Desperado-s-Destiny

Write-Host "`nSetup complete! Run 'railway status' to verify." -ForegroundColor Green
