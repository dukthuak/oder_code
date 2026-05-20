# Deploy len Railway (can chay sau khi: railway login)
# Huong dan day du: docs/HUONG_DAN_DEPLOY.md

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "=== Deploy Pho Ha Noi len Railway ===" -ForegroundColor Cyan

railway whoami 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Chua dang nhap Railway. Mo trinh duyet de login..." -ForegroundColor Yellow
  railway login
}

if (-not (Test-Path ".railway")) {
  Write-Host "Lien ket project (chon workspace + project hoac tao moi)..." -ForegroundColor Yellow
  railway link
}

Write-Host ""
Write-Host "Tren Railway Dashboard hay lam them:" -ForegroundColor Green
Write-Host "  1. Them MySQL vao project"
Write-Host "  2. Service Web: Root Directory = server"
Write-Host "  3. Variables: DATABASE_URL = tham chieu MYSQL_URL tu MySQL"
Write-Host "  4. Generate Domain"
Write-Host ""
Write-Host "Import DB (copy MYSQL_URL tu Railway):" -ForegroundColor Green
Write-Host '  cd server'
Write-Host '  $env:DATABASE_URL="mysql://..."'
Write-Host '  npm run import-cloud-db'
Write-Host ""

$push = Read-Host "Ban da cau hinh Railway xong chua? (y = deploy bang CLI / n = chi xem huong dan)"
if ($push -eq "y") {
  Set-Location server
  railway up
}
