# Huong dan + import DB len TiDB (chay sau khi co DATABASE_URL tu TiDB Cloud)

$ErrorActionPreference = "Stop"
$ServerDir = Join-Path (Split-Path $PSScriptRoot -Parent) "server"

Write-Host "=== Render + TiDB Cloud ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Buoc 1: Tao cluster free tai https://tidbcloud.com"
Write-Host "Buoc 2: Copy connection string (mysql://... port 4000)"
Write-Host "Buoc 3: Deploy web tai https://dashboard.render.com"
Write-Host "        New + -> Blueprint -> repo oder_code -> dien DATABASE_URL"
Write-Host ""
Write-Host "Chi tiet: docs\HUONG_DAN_DEPLOY_RENDER_TIDB.md"
Write-Host ""

$dbUrl = Read-Host "Dan DATABASE_URL TiDB (Enter de bo qua import)"
if ([string]::IsNullOrWhiteSpace($dbUrl)) {
  Write-Host "Bo qua import. Sau nay chay:" -ForegroundColor Yellow
  Write-Host '  cd server'
  Write-Host '  $env:DATABASE_URL="mysql://..."'
  Write-Host '  npm run import-cloud-db'
  exit 0
}

$env:DATABASE_URL = $dbUrl.Trim()
$env:DB_SSL = "true"
Set-Location $ServerDir
npm run import-cloud-db

Write-Host ""
Write-Host "Xong! Dien cung DATABASE_URL vao Render -> Environment." -ForegroundColor Green
