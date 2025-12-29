# PowerShell script for complete setup: download books 1157 and 16546 from Shamela
# Handles: cloning crawler, setup, download, transform, and import

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$DataDir = Join-Path $ProjectRoot "data"
$CrawlerDir = Join-Path $ProjectRoot "shamela_crawler"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Shamela TTS Reader - Book Download Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Setup shamela_crawler
Write-Host "Step 1: Setting up shamela_crawler..." -ForegroundColor Yellow
if (-not (Test-Path $CrawlerDir)) {
    Write-Host "  Cloning shamela_crawler repository..." -ForegroundColor Gray
    Set-Location $ProjectRoot
    git clone https://github.com/OpenShamela/shamela_crawler.git
} else {
    Write-Host "  shamela_crawler already exists, skipping clone..." -ForegroundColor Gray
}

Set-Location $CrawlerDir

# Setup Python environment
if (-not (Test-Path "venv")) {
    Write-Host "  Creating Python virtual environment..." -ForegroundColor Gray
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        python3 -m venv venv
    }
}

Write-Host "  Activating virtual environment..." -ForegroundColor Gray
& .\venv\Scripts\Activate.ps1

Write-Host "  Installing dependencies..." -ForegroundColor Gray
pip install -q --upgrade pip

# Try installing from requirements.txt first, then try pip install .
if (Test-Path "requirements.txt") {
    pip install -q -r requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  requirements.txt installation failed, trying pip install ." -ForegroundColor Yellow
        pip install -q .
    }
} else {
    Write-Host "  requirements.txt not found, trying pip install ." -ForegroundColor Yellow
    pip install -q .
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  pip install . failed, installing scrapy directly" -ForegroundColor Yellow
        pip install -q scrapy ebooklib sqlalchemy alembic tqdm h2
    }
}

# Step 2: Create data directory
if (-not (Test-Path $DataDir)) {
    New-Item -ItemType Directory -Path $DataDir | Out-Null
}

# Step 3: Download books
Write-Host ""
Write-Host "Step 2: Downloading books from Shamela..." -ForegroundColor Yellow
Write-Host "  Downloading book 1157..." -ForegroundColor Gray
$oldErrorAction = $ErrorActionPreference
$ErrorActionPreference = "Continue"
$outputFile = Join-Path $DataDir "book_1157_raw.json"
$scrapyArgs = @("crawl", "book", "-a", "book_id=1157", "-s", "MAKE_JSON=true", "-o", $outputFile)
& scrapy $scrapyArgs 2>&1 | ForEach-Object {
    if ($_ -notmatch "DEBUG") {
        Write-Host $_
    }
}
$scrapyExitCode = $LASTEXITCODE
$ErrorActionPreference = $oldErrorAction
if (Test-Path $outputFile) {
    Write-Host "  [OK] Book 1157 downloaded successfully" -ForegroundColor Green
} elseif ($scrapyExitCode -ne 0 -and $scrapyExitCode -ne $null) {
    Write-Host "  [ERROR] Scrapy exited with code $scrapyExitCode" -ForegroundColor Red
} else {
    Write-Host "  [WARNING] File was not created. Check Scrapy output above." -ForegroundColor Yellow
}

Write-Host "  Downloading book 16546..." -ForegroundColor Gray
$oldErrorAction = $ErrorActionPreference
$ErrorActionPreference = "Continue"
$outputFile = Join-Path $DataDir "book_16546_raw.json"
$scrapyArgs = @("crawl", "book", "-a", "book_id=16546", "-s", "MAKE_JSON=true", "-o", $outputFile)
& scrapy $scrapyArgs 2>&1 | ForEach-Object {
    if ($_ -notmatch "DEBUG") {
        Write-Host $_
    }
}
$scrapyExitCode = $LASTEXITCODE
$ErrorActionPreference = $oldErrorAction
if (Test-Path $outputFile) {
    Write-Host "  [OK] Book 16546 downloaded successfully" -ForegroundColor Green
} elseif ($scrapyExitCode -ne 0 -and $scrapyExitCode -ne $null) {
    Write-Host "  [ERROR] Scrapy exited with code $scrapyExitCode" -ForegroundColor Red
} else {
    Write-Host "  [WARNING] File was not created. Check Scrapy output above." -ForegroundColor Yellow
}

# Step 4: Transform JSON files
Write-Host ""
Write-Host "Step 3: Transforming JSON files..." -ForegroundColor Yellow
Set-Location $ProjectRoot

if (Test-Path "$DataDir\book_1157_raw.json") {
    Write-Host "  Transforming book_1157_raw.json..." -ForegroundColor Gray
    node scripts/transform_shamela_json.js "$DataDir\book_1157_raw.json" "$DataDir\book_1157.json"
}

if (Test-Path "$DataDir\book_16546_raw.json") {
    Write-Host "  Transforming book_16546_raw.json..." -ForegroundColor Gray
    node scripts/transform_shamela_json.js "$DataDir\book_16546_raw.json" "$DataDir\book_16546.json"
}

# Step 5: Import to database
Write-Host ""
Write-Host "Step 4: Importing books to database..." -ForegroundColor Yellow
Set-Location "$ProjectRoot\backend"

if ((Test-Path "$DataDir\book_1157.json") -and (Test-Path "$DataDir\book_16546.json")) {
    Write-Host "  Importing books..." -ForegroundColor Gray
    npm run seed ../data/book_1157.json ../data/book_16546.json
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "[SUCCESS] Setup complete! Books imported successfully." -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Yellow
    Write-Host "[WARNING] Setup incomplete. Please check:" -ForegroundColor Yellow
    Write-Host "  - JSON files in $DataDir" -ForegroundColor Yellow
    Write-Host "  - Run transformation manually if needed" -ForegroundColor Yellow
    $seedCommand = "cd backend; npm run seed ../data/book_1157.json ../data/book_16546.json"
    Write-Host "  - Then run: $seedCommand" -ForegroundColor Yellow
    Write-Host "==========================================" -ForegroundColor Yellow
}
