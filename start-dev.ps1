# ─────────────────────────────────────────────────────────────
#  LudoScript — Levantar Backend + Frontend
# ─────────────────────────────────────────────────────────────

$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$BACKEND = Join-Path $ROOT "backend"
$FRONTEND = Join-Path $ROOT "ludoScript"

$BACKEND_URL = "http://localhost:3000"
$FRONTEND_URL = "http://localhost:5173"

Write-Host ""
Write-Host "  Arrancando servidores..." -ForegroundColor Cyan

# Lanzar Backend en nueva ventana
Start-Process powershell -ArgumentList `
    "-NoExit", "-Command", `
    "Set-Location '$BACKEND'; Write-Host '  [BACKEND] Iniciando...' -ForegroundColor Cyan; npm run dev"

# Lanzar Frontend en nueva ventana
Start-Process powershell -ArgumentList `
    "-NoExit", "-Command", `
    "Set-Location '$FRONTEND'; Write-Host '  [FRONTEND] Iniciando...' -ForegroundColor Magenta; npm run dev"

# Esperar a que ambos puertos estén disponibles
Write-Host "  Esperando a que los servidores estén listos..." -ForegroundColor Yellow

function Wait-Port {
    param([string]$Host, [int]$Port, [int]$TimeoutSec = 60)
    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    while ((Get-Date) -lt $deadline) {
        try {
            $tcp = [System.Net.Sockets.TcpClient]::new()
            $tcp.Connect($Host, $Port)
            $tcp.Close()
            return $true
        }
        catch {
            Start-Sleep -Milliseconds 500
        }
    }
    return $false
}

$backendReady = Wait-Port -Host "localhost" -Port 3000  -TimeoutSec 60
$frontendReady = Wait-Port -Host "localhost" -Port 5173 -TimeoutSec 60

# ─── URLs finales ───────────────────────────────────────────
Write-Host ""
Write-Host "  ══════════════════════════════════════════" -ForegroundColor Green
Write-Host "   Servidores listos!" -ForegroundColor Green
Write-Host "  ══════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

if ($frontendReady) {
    Write-Host "   Frontend  ➜  $FRONTEND_URL" -ForegroundColor Magenta
}
else {
    Write-Host "   Frontend  ➜  $FRONTEND_URL  (tiempo de espera agotado)" -ForegroundColor Red
}

if ($backendReady) {
    Write-Host "   Backend   ➜  $BACKEND_URL" -ForegroundColor Cyan
}
else {
    Write-Host "   Backend   ➜  $BACKEND_URL  (tiempo de espera agotado)" -ForegroundColor Red
}

Write-Host ""
Write-Host "  ══════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Mantener la ventana abierta
Read-Host "  Pulsa Enter para cerrar esta ventana"
