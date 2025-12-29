# Scripts Directory

This directory contains utility scripts for downloading and importing books from Shamela Library.

## Quick Start - Automated Import (Recommended)

### Import a Book by ID (Easiest Method)

**Windows (PowerShell):**
```powershell
.\scripts\import_book.ps1 -BookId 1157
```

**Or using npm:**
```powershell
npm run import:book -- -BookId 1157
```

This single command will:
1. Set up shamela_crawler (if needed)
2. Download the book from Shamela Library
3. Transform the JSON to our format
4. Import it into the database

**Example:**
```powershell
# Import book with ID 1157
.\scripts\import_book.ps1 -BookId 1157

# Import book with ID 16546
.\scripts\import_book.ps1 -BookId 16546
```

### Legacy Automated Setup

**Windows (PowerShell):**
```powershell
.\scripts\setup_and_download.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x scripts/setup_and_download.sh
./scripts/setup_and_download.sh
```

This will:
1. Clone and set up shamela_crawler
2. Download books 1157 and 16546
3. Transform JSON files to our format
4. Import books into the database

## Individual Scripts

### Automated Book Import (Recommended)

The easiest way to import a book is using the automated script:

```powershell
.\scripts\import_book.ps1 -BookId <BOOK_ID>
```

This handles all steps automatically. See "Quick Start" section above for details.

### Download Books

**Windows:**
```powershell
.\scripts\download_books.ps1
```

**Linux/Mac:**
```bash
chmod +x scripts/download_books.sh
./scripts/download_books.sh
```

Downloads books 1157 and 16546 from Shamela Library using shamela_crawler.

### Transform JSON

Transform shamela_crawler JSON format to our expected format:

```bash
node scripts/transform_shamela_json.js <input-file> [output-file]
```

Example:
```bash
node scripts/transform_shamela_json.js data/book_1157_raw.json data/book_1157.json
```

### Import Books

Import transformed JSON files into the database:

```bash
cd backend
npm run seed ../data/book_1157.json ../data/book_16546.json
```

## Manual Steps

If the automated script doesn't work, follow these steps:

1. **Clone shamela_crawler:**
   ```bash
   git clone https://github.com/OpenShamela/shamela_crawler.git
   cd shamela_crawler
   ```

2. **Set up Python environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

3. **Download books:**
   ```bash
   scrapy crawl book -a book_id=1157 -s MAKE_JSON=true -o ../data/book_1157_raw.json
   scrapy crawl book -a book_id=16546 -s MAKE_JSON=true -o ../data/book_16546_raw.json
   ```

4. **Transform JSON:**
   ```bash
   cd ..
   node scripts/transform_shamela_json.js data/book_1157_raw.json data/book_1157.json
   node scripts/transform_shamela_json.js data/book_16546_raw.json data/book_16546.json
   ```

5. **Import to database:**
   ```bash
   cd backend
   npm run seed ../data/book_1157.json ../data/book_16546.json
   ```

## Troubleshooting

### Python/Scrapy Issues
- Ensure Python 3.8+ is installed
- Try `python3` instead of `python`
- Install scrapy manually: `pip install scrapy`

### JSON Format Issues
- Check the raw JSON file structure
- The transformer handles multiple formats, but some may need manual adjustment
- See `transform_shamela_json.js` for supported formats

### Import Errors
- Ensure database is running and migrations are complete
- Check `.env` file has correct database credentials
- Verify JSON files are valid and in the correct format

