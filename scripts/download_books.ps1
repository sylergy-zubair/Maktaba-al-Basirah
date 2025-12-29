# PowerShell script to download books from Shamela Library using shamela_crawler
# Books to download: 1157 and 16546

Write-Host "Setting up shamela_crawler and downloading books..." -ForegroundColor Green

# Check if shamela_crawler directory exists
if (-not (Test-Path "shamela_crawler")) {
    Write-Host "Cloning shamela_crawler repository..." -ForegroundColor Yellow
    git clone https://github.com/OpenShamela/shamela_crawler.git
}

Set-Location shamela_crawler

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
& .\venv\Scripts\Activate.ps1

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
if (Test-Path "requirements.txt") {
    pip install -q -r requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Trying pip install ." -ForegroundColor Yellow
        pip install -q .
    }
} else {
    pip install -q .
    if ($LASTEXITCODE -ne 0) {
        pip install -q scrapy ebooklib sqlalchemy alembic tqdm h2
    }
}

# Create data directory if it doesn't exist
if (-not (Test-Path "..\data")) {
    New-Item -ItemType Directory -Path "..\data" | Out-Null
}

# Download book 1157
Write-Host "Downloading book 1157..." -ForegroundColor Cyan
scrapy crawl book -a book_id=1157 -s MAKE_JSON=true -o ..\data\book_1157.json 2>&1 | Where-Object { $_ -notmatch "DEBUG" }

# Download book 16546
Write-Host "Downloading book 16546..." -ForegroundColor Cyan
scrapy crawl book -a book_id=16546 -s MAKE_JSON=true -o ..\data\book_16546.json 2>&1 | Where-Object { $_ -notmatch "DEBUG" }

Write-Host ""
Write-Host "Download complete! Check ..\data\ directory for JSON files." -ForegroundColor Green
Write-Host "Next step: Run 'npm run seed' in the backend directory to import books." -ForegroundColor Yellow

Set-Location ..

