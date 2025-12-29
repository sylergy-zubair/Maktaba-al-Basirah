# How to Import Books - Quick Guide

## 🚀 Automated Import (Easiest Method)

Simply run this command with the book ID you want to import:

```powershell
.\scripts\import_book.ps1 -BookId <BOOK_ID>
```

### Examples:

```powershell
# Import book 1157
.\scripts\import_book.ps1 -BookId 1157

# Import book 16546
.\scripts\import_book.ps1 -BookId 16546

# Import any other book
.\scripts\import_book.ps1 -BookId 12345
```

### What it does automatically:

1. ✅ Sets up `shamela_crawler` (if not already set up)
2. ✅ Downloads the book from Shamela Library
3. ✅ Transforms the JSON to the correct format
4. ✅ Imports it into your database
5. ✅ Shows you the results

### Requirements:

- Python 3.8+ installed
- PostgreSQL running (use `.\scripts\docker_postgres.ps1 start` if using Docker)
- Database migrations run (`npm run migrate` in backend directory)
- `.env` file configured in `backend/` directory

### Using npm (Alternative):

You can also use npm:

```powershell
npm run import:book -- -BookId 1157
```

## 📋 Manual Steps (If Automated Script Fails)

If the automated script doesn't work, you can do it manually:

### Step 1: Download the book

```powershell
cd shamela_crawler
.\venv\Scripts\Activate.ps1
scrapy crawl book -a book_id=<BOOK_ID> -s MAKE_JSON=true -o ..\data\book_<BOOK_ID>_raw.json
```

### Step 2: Transform JSON

```powershell
cd ..
node scripts\transform_shamela_json.js data\book_<BOOK_ID>_raw.json data\book_<BOOK_ID>.json
```

### Step 3: Import to database

```powershell
cd backend
npm run seed ..\data\book_<BOOK_ID>.json
```

## 🔍 Finding Book IDs

Book IDs can be found in the URL when viewing a book on Shamela Library:

- Example: `https://shamela.ws/book/1157` → Book ID is `1157`

## ⚠️ Troubleshooting

### "Book already exists"

- This means the book is already in your database. The script will skip it.

### "Failed to download book"

- Check your internet connection
- Verify the book ID is correct
- The book might not exist on Shamela Library

### "Database connection error"

- Make sure PostgreSQL is running
- Check your `.env` file in the `backend/` directory
- Run migrations: `cd backend && npm run migrate`

### "Python/Scrapy not found"

- Make sure Python 3.8+ is installed
- The script will try to set up the environment automatically

## 📁 File Locations

After importing, you'll find:

- **Raw JSON**: `data/book_<BOOK_ID>_raw.json` (original format from Shamela)
- **Transformed JSON**: `data/book_<BOOK_ID>.json` (ready for import)

You can delete the raw JSON files to save space if needed.
