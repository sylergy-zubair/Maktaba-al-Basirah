# Script to manage PostgreSQL in Docker

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "restart", "status", "logs", "shell")]
    [string]$Action = "start"
)

$composeFile = Join-Path (Split-Path -Parent $PSScriptRoot) "docker-compose.yml"

if (-not (Test-Path $composeFile)) {
    Write-Host "docker-compose.yml not found!" -ForegroundColor Red
    exit 1
}

switch ($Action) {
    "start" {
        Write-Host "Starting PostgreSQL in Docker..." -ForegroundColor Yellow
        docker-compose -f $composeFile up -d postgres
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`nWaiting for PostgreSQL to be ready..." -ForegroundColor Yellow
            Start-Sleep -Seconds 3
            Write-Host "PostgreSQL is running!" -ForegroundColor Green
            Write-Host "Connection string: postgresql://postgres:postgres@localhost:5432/shamela_tts_reader" -ForegroundColor Cyan
        }
    }
    "stop" {
        Write-Host "Stopping PostgreSQL..." -ForegroundColor Yellow
        docker-compose -f $composeFile stop postgres
    }
    "restart" {
        Write-Host "Restarting PostgreSQL..." -ForegroundColor Yellow
        docker-compose -f $composeFile restart postgres
    }
    "status" {
        Write-Host "PostgreSQL Container Status:" -ForegroundColor Yellow
        docker-compose -f $composeFile ps postgres
    }
    "logs" {
        Write-Host "PostgreSQL Logs:" -ForegroundColor Yellow
        docker-compose -f $composeFile logs -f postgres
    }
    "shell" {
        Write-Host "Opening PostgreSQL shell..." -ForegroundColor Yellow
        docker-compose -f $composeFile exec postgres psql -U postgres -d shamela_tts_reader
    }
}

