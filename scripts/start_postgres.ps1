# Script to start PostgreSQL service on Windows

Write-Host "Checking PostgreSQL service..." -ForegroundColor Yellow

# Try to find PostgreSQL service
$postgresServices = Get-Service | Where-Object { $_.Name -like "*postgres*" -or $_.DisplayName -like "*PostgreSQL*" }

if ($postgresServices.Count -eq 0) {
    Write-Host "PostgreSQL service not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please ensure PostgreSQL is installed." -ForegroundColor Yellow
    Write-Host "You can download it from: https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    exit 1
}

Write-Host "Found PostgreSQL service(s):" -ForegroundColor Green
$postgresServices | Format-Table Name, Status, DisplayName

# Try to start the first PostgreSQL service found
$service = $postgresServices[0]

if ($service.Status -eq 'Running') {
    Write-Host "`nPostgreSQL service '$($service.Name)' is already running!" -ForegroundColor Green
} else {
    Write-Host "`nStarting PostgreSQL service '$($service.Name)'..." -ForegroundColor Yellow
    try {
        Start-Service -Name $service.Name
        Write-Host "PostgreSQL service started successfully!" -ForegroundColor Green
    } catch {
        Write-Host "Failed to start PostgreSQL service: $_" -ForegroundColor Red
        Write-Host "`nYou may need to run PowerShell as Administrator." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "`nPostgreSQL is ready!" -ForegroundColor Green

