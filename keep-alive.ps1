$URL = "https://tfg-backend-kyku.onrender.com/health"
$HORA_FIN = Get-Date "2026-06-10 15:00:00"

Write-Host "=== Keep-alive para Render ==="
Write-Host "Manteniendo despierto $URL"
Write-Host "Hasta: $HORA_FIN"
Write-Host "Pulsa Ctrl+C para detener"
Write-Host ""

while ((Get-Date) -lt $HORA_FIN) {
  try {
    $r = Invoke-WebRequest -Uri $URL -Method GET -TimeoutSec 30 -UseBasicParsing
    Write-Host "$(Get-Date -Format 'HH:mm:ss') - OK ($($r.StatusCode))" -ForegroundColor Green
  } catch {
    Write-Host "$(Get-Date -Format 'HH:mm:ss') - El servidor está despertando..." -ForegroundColor Yellow
  }
  Start-Sleep -Seconds 300
}

Write-Host "=== Keep-alive finalizado ===" -ForegroundColor Cyan
Read-Host "Pulsa Enter para cerrar"
