# Automated script to download, transform, and import a book from Shamela Library
# Usage: .\scripts\import_book.ps1 -BookId <BOOK_ID>
# Example: .\scripts\import_book.ps1 -BookId 1157

param(
    [Parameter(Mandatory=$true)]
    [int]$BookId
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Automated Book Import" -ForegroundColor Cyan
Write-Host "Book ID: $BookId" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory and project root
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$dataDir = Join-Path $projectRoot "data"

# Ensure data directory exists
if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir | Out-Null
    Write-Host "Created data directory: $dataDir" -ForegroundColor Yellow
}

# File paths
$rawJsonFile = Join-Path $dataDir "book_${BookId}_raw.json"
$transformedJsonFile = Join-Path $dataDir "book_${BookId}.json"

# Step 1: Check if shamela_crawler exists
Write-Host "Step 1: Checking shamela_crawler setup..." -ForegroundColor Yellow
$shamelaCrawlerPath = Join-Path $projectRoot "shamela_crawler"

if (-not (Test-Path $shamelaCrawlerPath)) {
    Write-Host "  Cloning shamela_crawler repository..." -ForegroundColor Yellow
    Set-Location $projectRoot
    git clone https://github.com/OpenShamela/shamela_crawler.git
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ Failed to clone shamela_crawler" -ForegroundColor Red
        exit 1
    }
}

Set-Location $shamelaCrawlerPath

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "  Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ Failed to create virtual environment" -ForegroundColor Red
        exit 1
    }
}

# Activate virtual environment
Write-Host "  Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Install dependencies if needed
Write-Host "  Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "requirements.txt") {
    pip install -q -r requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Host "    Trying pip install ." -ForegroundColor Yellow
        pip install -q .
    }
} else {
    pip install -q .
    if ($LASTEXITCODE -ne 0) {
        pip install -q scrapy ebooklib sqlalchemy alembic tqdm h2
    }
}

# Step 2: Download the book
Write-Host ""
Write-Host "Step 2: Downloading book $BookId from Shamela Library..." -ForegroundColor Yellow
Write-Host "  This may take a few minutes..." -ForegroundColor Gray

# Run scrapy and capture output (scrapy writes to stderr, which is normal)
# Temporarily change error action to continue so stderr doesn't throw exceptions
$oldErrorAction = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
try {
    # Run scrapy and suppress normal output, but capture errors
    $downloadOutput = scrapy crawl book -a book_id=$BookId -s MAKE_JSON=true -o $rawJsonFile 2>&1
    $scrapyExitCode = $LASTEXITCODE
    
    # Show any errors from scrapy output
    $errors = $downloadOutput | Where-Object { $_ -match "ERROR|CRITICAL|Exception|Traceback|522|timeout|Gave up retrying" }
    if ($errors) {
        Write-Host "  Scrapy errors detected:" -ForegroundColor Yellow
        $errors | ForEach-Object { Write-Host "    $_" -ForegroundColor Yellow }
        
        # Check for specific error types (convert to string for matching)
        $downloadOutputString = if ($downloadOutput -is [string]) { $downloadOutput } else { ($downloadOutput | Out-String) }
        if ($downloadOutputString -match "522|timeout|Gave up retrying") {
            Write-Host "  ⚠ Cloudflare timeout detected (522 error)" -ForegroundColor Yellow
            Write-Host "  This usually means:" -ForegroundColor Yellow
            Write-Host "    - Shamela server is temporarily unavailable" -ForegroundColor Yellow
            Write-Host "    - Rate limiting is blocking the request" -ForegroundColor Yellow
            Write-Host "    - Network connection issues" -ForegroundColor Yellow
            Write-Host "  Suggestion: Wait a few minutes and try again" -ForegroundColor Cyan
        }
    }
} finally {
    $ErrorActionPreference = $oldErrorAction
}

if ($scrapyExitCode -ne 0) {
    Write-Host "  ✗ Failed to download book $BookId (exit code: $scrapyExitCode)" -ForegroundColor Red
    Write-Host "  Error output:" -ForegroundColor Red
    $downloadOutput | Where-Object { $_ -match "ERROR|CRITICAL|Exception|Traceback|Failed" } | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
    exit 1
}

# Check if file exists and has content
Start-Sleep -Milliseconds 500  # Give file system time to sync
if (-not (Test-Path $rawJsonFile)) {
    Write-Host "  ✗ Download completed but JSON file not found" -ForegroundColor Red
    Write-Host "  The file should be at: $rawJsonFile" -ForegroundColor Yellow
    exit 1
}

$fileInfo = Get-Item $rawJsonFile -ErrorAction Stop
$fileSize = $fileInfo.Length

if ($fileSize -eq 0) {
    Write-Host "" -ForegroundColor Red
    Write-Host "  ✗ Download completed but file is empty (0 bytes)" -ForegroundColor Red
    Write-Host "" -ForegroundColor Red
    
    # Check if it was a timeout error (convert to string if needed)
    $downloadOutputString = if ($null -ne $downloadOutput) {
        if ($downloadOutput -is [string]) { 
            $downloadOutput 
        } else { 
            ($downloadOutput | Out-String) 
        }
    } else {
        ""
    }
    
    if ($downloadOutputString -match "522|timeout|Gave up retrying") {
        Write-Host "  The download failed due to a Cloudflare timeout (522 error)." -ForegroundColor Yellow
        Write-Host "  This means the book exists but the server is temporarily unavailable." -ForegroundColor Yellow
        Write-Host "" -ForegroundColor Yellow
        Write-Host "  Solutions:" -ForegroundColor Cyan
        Write-Host "    1. Wait 5-10 minutes and try again" -ForegroundColor Cyan
        Write-Host "    2. Check your internet connection" -ForegroundColor Cyan
        Write-Host "    3. Try again later when server load is lower" -ForegroundColor Cyan
    } else {
        Write-Host "  This usually means:" -ForegroundColor Yellow
        Write-Host "    - The book ID doesn't exist on Shamela Library" -ForegroundColor Yellow
        Write-Host "    - There was an error during download" -ForegroundColor Yellow
        Write-Host "    - The book might be protected or unavailable" -ForegroundColor Yellow
        Write-Host "  Please check the scrapy output above for errors" -ForegroundColor Yellow
    }
    
    Write-Host "" -ForegroundColor Yellow
    Write-Host "  You can verify the book exists at: https://shamela.ws/book/$BookId" -ForegroundColor Cyan
    Write-Host "" -ForegroundColor Yellow
    
    Remove-Item $rawJsonFile -ErrorAction SilentlyContinue
    Write-Host "  Exiting due to empty file..." -ForegroundColor Red
    exit 1
}

Write-Host "  ✓ Download complete! File size: $([math]::Round($fileSize/1KB, 2)) KB" -ForegroundColor Green

# Step 3: Transform JSON
Write-Host ""
Write-Host "Step 3: Transforming JSON format..." -ForegroundColor Yellow

Set-Location $projectRoot
$oldErrorAction = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
try {
    $transformOutput = node scripts\transform_shamela_json.js $rawJsonFile $transformedJsonFile 2>&1 | Out-String
    $transformExitCode = $LASTEXITCODE
} finally {
    $ErrorActionPreference = $oldErrorAction
}

if ($transformExitCode -ne 0) {
    Write-Host "  ✗ Failed to transform JSON" -ForegroundColor Red
    Write-Host "  Error output:" -ForegroundColor Red
    if ($transformOutput) {
        $transformOutput -split "`n" | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
    }
    exit 1
}

if (-not (Test-Path $transformedJsonFile)) {
    Write-Host "  ✗ Transformation completed but output file not found" -ForegroundColor Red
    exit 1
}

Write-Host "  ✓ Transformation complete!" -ForegroundColor Green

# Step 4: Check database connection
Write-Host ""
Write-Host "Step 4: Checking database connection..." -ForegroundColor Yellow

Set-Location (Join-Path $projectRoot "backend")

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "  ✗ .env file not found in backend directory" -ForegroundColor Red
    Write-Host "  Please create .env file with database credentials" -ForegroundColor Yellow
    exit 1
}

# Step 5: Import into database
Write-Host ""
Write-Host "Step 5: Importing book into database..." -ForegroundColor Yellow

# Use relative path from backend directory to avoid path duplication
$relativeJsonPath = "..\data\book_${BookId}.json"

$oldErrorAction = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
try {
    $importOutput = npm run seed $relativeJsonPath 2>&1 | Out-String
    $importExitCode = $LASTEXITCODE
} finally {
    $ErrorActionPreference = $oldErrorAction
}

if ($importExitCode -ne 0) {
    Write-Host "  ✗ Failed to import book" -ForegroundColor Red
    Write-Host "  Error output:" -ForegroundColor Red
    if ($importOutput) {
        $importOutput -split "`n" | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
    }
    exit 1
}

# Check if import was successful (look for success messages)
if ($importOutput -match 'Successfully imported|already exists|Skipping import') {
    Write-Host '  ✓ Book imported successfully!' -ForegroundColor Green
} else {
    Write-Host '  ⚠ Import completed, but check output above for warnings' -ForegroundColor Yellow
}

# Cleanup: Optionally remove raw JSON file to save space
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Import Process Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files created:" -ForegroundColor Cyan
Write-Host "  Raw JSON: $rawJsonFile" -ForegroundColor Gray
Write-Host "  Transformed JSON: $transformedJsonFile" -ForegroundColor Gray
Write-Host ""
Write-Host 'You can now view the book in the application!' -ForegroundColor Green

Set-Location $projectRoot

