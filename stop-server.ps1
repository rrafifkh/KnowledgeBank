$appRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $appRoot '.language-bank-server.pid'

if (-not (Test-Path -LiteralPath $pidFile)) {
    Write-Host 'Server Language Bank tidak sedang dikelola oleh launcher.'
    exit 0
}

$serverPid = (Get-Content -Raw -LiteralPath $pidFile).Trim()
if ($serverPid -match '^\d+$') {
    $process = Get-Process -Id ([int]$serverPid) -ErrorAction SilentlyContinue
    if ($process -and $process.ProcessName -match '^python|^py$') {
        Start-Process -FilePath 'taskkill.exe' -ArgumentList @('/PID', $process.Id, '/T', '/F') -WindowStyle Hidden -Wait | Out-Null
        Write-Host 'Server Language Bank sudah dihentikan.'
    }
}
Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
