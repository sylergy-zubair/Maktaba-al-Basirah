# Script to verify PostgreSQL and database setup

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Verifying Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check 1: Docker PostgreSQL
Write-Host "1. Checking PostgreSQL in Docker..." -ForegroundColor Yellow
$container = docker ps --filter "name=shamela_postgres" --format "{{.Names}}" 2>$null
if ($container -eq "shamela_postgres") {
    Write-Host "   ✓ PostgreSQL container is running" -ForegroundColor Green
} else {
    Write-Host "   ✗ PostgreSQL container is not running" -ForegroundColor Red
    Write-Host "     Run: .\scripts\docker_postgres.ps1 start" -ForegroundColor Yellow
}

Write-Host ""

# Check 2: Database connection (via Node.js)
Write-Host "2. Testing database connection..." -ForegroundColor Yellow
$testScript = @"
import pool from './src/config/database.js';

async function test() {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('SUCCESS: Database connection works!');
        process.exit(0);
    } catch (error) {
        console.error('ERROR:', error.message);
        process.exit(1);
    }
}
test();
"@

$testScript | Out-File -FilePath "backend/test-db.js" -Encoding UTF8
Set-Location backend
$dbTest = node test-db.js 2>&1
Set-Location ..

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Database connection successful" -ForegroundColor Green
} else {
    Write-Host "   ✗ Database connection failed" -ForegroundColor Red
    Write-Host "     Make sure:" -ForegroundColor Yellow
    Write-Host "     - PostgreSQL is running" -ForegroundColor Yellow
    Write-Host "     - .env file is configured correctly" -ForegroundColor Yellow
    Write-Host "     - Migrations have been run: cd backend; npm run migrate" -ForegroundColor Yellow
}

# Cleanup
Remove-Item "backend/test-db.js" -ErrorAction SilentlyContinue

Write-Host ""

# Check 3: Check if book was imported
Write-Host "3. Checking if book was imported..." -ForegroundColor Yellow
$checkScript = @"
import pool from './src/config/database.js';

async function check() {
    try {
        const books = await pool.query('SELECT COUNT(*) as count FROM books');
        const units = await pool.query('SELECT COUNT(*) as count FROM units');
        console.log(\`BOOKS: \${books.rows[0].count}\`);
        console.log(\`UNITS: \${units.rows[0].count}\`);
        
        if (parseInt(books.rows[0].count) > 0) {
            const bookInfo = await pool.query('SELECT id, title, author FROM books LIMIT 1');
            console.log(\`FIRST_BOOK: \${JSON.stringify(bookInfo.rows[0])}\`);
        }
        process.exit(0);
    } catch (error) {
        if (error.message.includes('does not exist')) {
            console.log('TABLES_NOT_FOUND: Run migrations first');
        } else {
            console.error('ERROR:', error.message);
        }
        process.exit(1);
    }
}
check();
"@

$checkScript | Out-File -FilePath "backend/check-import.js" -Encoding UTF8
Set-Location backend
$importCheck = node check-import.js 2>&1
Set-Location ..

if ($importCheck -match "BOOKS: (\d+)") {
    $bookCount = [int]$Matches[1]
    if ($bookCount -gt 0) {
        Write-Host "   ✓ Book imported successfully!" -ForegroundColor Green
        if ($importCheck -match "UNITS: (\d+)") {
            $unitCount = [int]$Matches[1]
            Write-Host "   ✓ Found $bookCount book(s) with $unitCount unit(s)" -ForegroundColor Green
        }
        if ($importCheck -match "FIRST_BOOK: (.+)") {
            $bookInfo = $Matches[1] | ConvertFrom-Json
            Write-Host "   Book: $($bookInfo.title)" -ForegroundColor Cyan
            Write-Host "   Author: $($bookInfo.author)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "   ⚠ No books found in database" -ForegroundColor Yellow
        Write-Host "     Run: cd backend; npm run seed ..\data\book_1157.json" -ForegroundColor Yellow
    }
} elseif ($importCheck -match "TABLES_NOT_FOUND") {
    Write-Host "   ✗ Database tables not found" -ForegroundColor Red
    Write-Host "     Run migrations: cd backend; npm run migrate" -ForegroundColor Yellow
} else {
    Write-Host "   ✗ Could not check import status" -ForegroundColor Red
}

# Cleanup
Remove-Item "backend/check-import.js" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Verification Complete" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

