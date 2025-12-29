# Downloading Books from Shamela Library

This guide explains how to download books 1157 and 16546 from Shamela Library and import them into the database.

## Automated Setup (Recommended)

### Windows
```powershell
.\scripts\setup_and_download.ps1
```

### Linux/Mac
```bash
chmod +x scripts/setup_and_download.sh
./scripts/setup_and_download.sh
```

The script will automatically:
1. ✅ Clone shamela_crawler repository
2. ✅ Set up Python virtual environment
3. ✅ Install dependencies
4. ✅ Download book 1157
5. ✅ Download book 16546
6. ✅ Transform JSON files
7. ✅ Import books into database

## Manual Setup

If the automated script doesn't work, follow these steps:

### Prerequisites
- Python 3.8 or higher
- Git
- Node.js (for transformation and import)

### Step 1: Clone shamela_crawler

```bash
git clone https://github.com/OpenShamela/shamela_crawler.git
cd shamela_crawler
```

### Step 2: Set Up Python Environment

**Windows:**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

If `requirements.txt` doesn't exist or fails:
```bash
pip install scrapy
```

### Step 3: Download Books

From the `shamela_crawler` directory:

```bash
# Download book 1157
scrapy crawl book -a book_id=1157 -s MAKE_JSON=true -o ../data/book_1157_raw.json

# Download book 16546
scrapy crawl book -a book_id=16546 -s MAKE_JSON=true -o ../data/book_16546_raw.json
```

The JSON files will be saved in the `data/` directory.

### Step 4: Transform JSON Files

The shamela_crawler JSON format may differ from what our import script expects. Transform them:

```bash
cd ..  # Back to project root
node scripts/transform_shamela_json.js data/book_1157_raw.json data/book_1157.json
node scripts/transform_shamela_json.js data/book_16546_raw.json data/book_16546.json
```

### Step 5: Import to Database

```bash
cd backend
npm run seed ../data/book_1157.json ../data/book_16546.json
```

## Verify Import

Check that books were imported:

1. Start the backend server: `cd backend && npm run dev`
2. Start the frontend: `cd frontend && npm run dev`
3. Open `http://localhost:3000`
4. You should see the two imported books

Or query the database directly:

```sql
SELECT id, title, author FROM books;
SELECT book_id, COUNT(*) as unit_count FROM units GROUP BY book_id;
```

## Troubleshooting

### Issue: "Command 'scrapy' not found"
**Solution:** Make sure the virtual environment is activated and scrapy is installed:
```bash
source venv/bin/activate  # or .\venv\Scripts\Activate.ps1 on Windows
pip install scrapy
```

### Issue: "No module named 'scrapy'"
**Solution:** Install scrapy in the virtual environment:
```bash
pip install scrapy
```

### Issue: Download fails or returns empty JSON
**Solution:** 
- Check your internet connection
- Verify book IDs are correct (1157 and 16546)
- Check shamela_crawler repository for updates
- Try downloading one book at a time

### Issue: "Invalid book JSON structure" during import
**Solution:**
- Run the transform script first: `node scripts/transform_shamela_json.js <input> <output>`
- Check the JSON file structure manually
- The transformer handles multiple formats automatically

### Issue: Database connection errors
**Solution:**
- Ensure PostgreSQL is running
- Check `.env` file in `backend/` directory
- Verify database credentials
- Run migrations: `cd backend && npm run migrate`

## Expected JSON Format

After transformation, JSON files should have this structure:

```json
{
  "title": "Book Title",
  "author": "Author Name",
  "description": "Optional description",
  "category": "Optional category",
  "language": "ar",
  "units": [
    {
      "index": 1,
      "heading": "Chapter 1 (optional)",
      "text": "Unit text content..."
    },
    {
      "index": 2,
      "heading": null,
      "text": "More text..."
    }
  ]
}
```

## Book Information

- **Book 1157**: [Check Shamela Library for details](https://shamela.ws/book/1157)
- **Book 16546**: [Check Shamela Library for details](https://shamela.ws/book/16546)

## Next Steps

After successful import:
1. ✅ Books appear in the frontend
2. ✅ You can navigate through units
3. ✅ TTS audio can be generated
4. ✅ Bookmarks work (after login)

Enjoy reading! 📚

