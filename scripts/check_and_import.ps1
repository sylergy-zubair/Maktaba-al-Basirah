# Script to check if book is imported and import if needed

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Checking Book Import Status" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$checkScript = @"
import pool from './src/config/database.js';

async function check() {
    try {
        // Check if tables exist
        const tablesCheck = await pool.query(\`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('books', 'units')
        \`);
        
        if (tablesCheck.rows.length < 2) {
            console.log('TABLES_MISSING: Run migrations first');
            process.exit(1);
        }
        
        // Check books
        const books = await pool.query('SELECT id, title, author FROM books');
        console.log(\`BOOKS_COUNT: \${books.rows.length}\`);
        
        if (books.rows.length > 0) {
            console.log('BOOKS_FOUND:');
            books.rows.forEach(book => {
                console.log(\`  ID: \${book.id} - \${book.title} (by \${book.author || 'Unknown'})\`);
            });
            
            // Check units
            const units = await pool.query('SELECT COUNT(*) as count FROM units');
            console.log(\`UNITS_COUNT: \${units.rows[0].count}\`);
        } else {
            console.log('NO_BOOKS: Book needs to be imported');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('ERROR:', error.message);
        process.exit(1);
    }
}
check();
"@

$checkScript | Out-File -FilePath "backend/check-books.js" -Encoding UTF8
Set-Location backend
$result = node check-books.js 2>&1
Set-Location ..
Remove-Item "backend/check-books.js" -ErrorAction SilentlyContinue

if ($result -match "BOOKS_COUNT: (\d+)") {
    $bookCount = [int]$Matches[1]
    if ($bookCount -gt 0) {
        Write-Host "✓ Books found in database!" -ForegroundColor Green
        Write-Host ""
        $result | Where-Object { $_ -match "ID:" } | ForEach-Object {
            Write-Host "  $_" -ForegroundColor Cyan
        }
        if ($result -match "UNITS_COUNT: (\d+)") {
            Write-Host ""
            Write-Host "Total units: $($Matches[1])" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠ No books found in database" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Importing book 1157..." -ForegroundColor Yellow
        
        Set-Location backend
        npm run seed ..\data\book_1157.json
        $importResult = $LASTEXITCODE
        Set-Location ..
        
        if ($importResult -eq 0) {
            Write-Host ""
            Write-Host "✓ Book imported successfully!" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "✗ Import failed. Check the error above." -ForegroundColor Red
        }
    }
} elseif ($result -match "TABLES_MISSING") {
    Write-Host "✗ Database tables not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Running migrations..." -ForegroundColor Yellow
    Set-Location backend
    npm run migrate
    Set-Location ..
    Write-Host ""
    Write-Host "Now try importing the book:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor Cyan
    Write-Host "  npm run seed ..\data\book_1157.json" -ForegroundColor Cyan
} else {
    Write-Host "✗ Could not check database" -ForegroundColor Red
    Write-Host $result -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan

