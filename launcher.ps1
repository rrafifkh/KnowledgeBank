$ErrorActionPreference = 'Stop'
$appRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverUrl = 'http://127.0.0.1:8765/'
$pidFile = Join-Path $appRoot '.language-bank-server.pid'

function Test-LanguageBankServer {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $serverUrl -TimeoutSec 1
        return $response.StatusCode -eq 200 -and $response.Content -match '<title>Bank Hub</title>'
    } catch {
        return $false
    }
}

if (-not (Get-Command py -ErrorAction SilentlyContinue)) {
    Write-Host 'Python tidak ditemukan. Instal Python atau aktifkan perintah py.' -ForegroundColor Red
    exit 1
}

if (-not (Test-LanguageBankServer)) {
    try {
        $process = Start-Process -FilePath 'py' -ArgumentList @('server.py', '8765') -WorkingDirectory $appRoot -WindowStyle Hidden -PassThru
        Set-Content -LiteralPath $pidFile -Value $process.Id -Encoding ascii
    } catch {
        Write-Host "Server gagal dimulai: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }

    $ready = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        Start-Sleep -Milliseconds 200
        if (Test-LanguageBankServer) { $ready = $true; break }
        if ($process.HasExited) { break }
    }
    if (-not $ready) {
        Write-Host 'Port 8765 sedang dipakai aplikasi lain atau server gagal dimulai.' -ForegroundColor Red
        exit 1
    }
}

Start-Process $serverUrl
exit 0
