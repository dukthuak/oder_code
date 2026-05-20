# Mo web ra Internet tam thoi (Cloudflare Tunnel) — khong can Railway/Render
# Yeu cau: MySQL local dang chay, file server/.env da cau hinh

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$BinDir = Join-Path $PSScriptRoot "bin"
$Cloudflared = Join-Path $BinDir "cloudflared.exe"
$ServerDir = Join-Path $Root "server"

if (-not (Test-Path $ServerDir)) {
  Write-Error "Khong tim thay thu muc server"
}

# Tai cloudflared neu chua co
if (-not (Test-Path $Cloudflared)) {
  New-Item -ItemType Directory -Force -Path $BinDir | Out-Null
  $Url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
  Write-Host "Dang tai cloudflared..." -ForegroundColor Cyan
  Invoke-WebRequest -Uri $Url -OutFile $Cloudflared -UseBasicParsing
}

# Doc PORT tu .env
$Port = 3000
$EnvFile = Join-Path $ServerDir ".env"
if (Test-Path $EnvFile) {
  foreach ($line in Get-Content $EnvFile) {
    if ($line -match '^\s*PORT\s*=\s*(\d+)') { $Port = [int]$Matches[1]; break }
  }
}

Write-Host "Kiem tra MySQL..." -ForegroundColor Cyan
Push-Location $ServerDir
node -e "require('./config/db').query('SELECT 1').then(()=>process.exit(0)).catch(()=>process.exit(1))"
if ($LASTEXITCODE -ne 0) {
  Pop-Location
  Write-Host "Loi: MySQL chua ket noi. Bat MySQL va kiem tra server/.env" -ForegroundColor Red
  exit 1
}

Write-Host "Khoi dong server tai port $Port ..." -ForegroundColor Cyan
$serverJob = Start-Job -ScriptBlock {
  param($dir, $port)
  Set-Location $dir
  $env:PORT = "$port"
  npm start 2>&1
} -ArgumentList $ServerDir, $Port

Start-Sleep -Seconds 3

Write-Host "Mo tunnel Cloudflare (URL se hien ben duoi)..." -ForegroundColor Green
Write-Host "Nhan Ctrl+C de dung server va tunnel." -ForegroundColor Yellow
Write-Host ""

try {
  & $Cloudflared tunnel --url "http://127.0.0.1:$Port"
} finally {
  Stop-Job $serverJob -ErrorAction SilentlyContinue
  Remove-Job $serverJob -Force -ErrorAction SilentlyContinue
  Pop-Location
}
