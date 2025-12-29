# Simple script to transform book 1157
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$dataDir = Join-Path $projectRoot "data"

Set-Location $projectRoot

Write-Host "Transforming book 1157..." -ForegroundColor Yellow
node scripts\transform_shamela_json.js "$dataDir\book_1157_raw.json" "$dataDir\book_1157.json"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Transformation complete!" -ForegroundColor Green
} else {
    Write-Host "✗ Transformation failed!" -ForegroundColor Red
    exit 1
}

