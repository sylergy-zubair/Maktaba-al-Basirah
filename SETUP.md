# Setup Guide - Shamela TTS Reader

Complete setup instructions for getting the application running.

## Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 12+ (running and accessible)
- **Python 3.8+** (for shamela_crawler, optional for initial setup)
- **TTS API Key** (ElevenLabs or Google Cloud TTS)

## Step 1: Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE shamela_tts_reader;
```

2. Note your database credentials (host, port, database name, user, password)

## Step 2: Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Edit `.env` with your configuration:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shamela_tts_reader
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# TTS Provider (choose one: 'elevenlabs' or 'google')
TTS_PROVIDER=elevenlabs
ELEVENLABS_API_KEY=your-elevenlabs-api-key

# Or for Google TTS:
# TTS_PROVIDER=google
# GOOGLE_TTS_API_KEY=your-google-tts-api-key

# Server
PORT=3001
NODE_ENV=development

# CORS (frontend URL)
CORS_ORIGIN=http://localhost:3000
```

5. Run database migrations:
```bash
npm run migrate
```

6. Verify migrations:
```bash
# Check that tables were created
psql -U postgres -d shamela_tts_reader -c "\dt"
```

7. Start the backend server:
```bash
npm run dev
```

Backend should be running on `http://localhost:3001`

## Step 3: Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Start the frontend:
```bash
npm run dev
```

Frontend should be running on `http://localhost:3000`

## Step 4: Import Books (Optional)

### Option A: Using shamela_crawler

1. Clone or set up shamela_crawler:
```bash
cd ..
git clone https://github.com/OpenShamela/shamela_crawler.git
cd shamela_crawler
pip install -r requirements.txt
# or: poetry install
```

2. Download books from Shamela Library:
```bash
# Find book IDs from Shamela website
# Example: book ID 12345
scrapy crawl book -a book_id=12345 -s MAKE_JSON=true -o ../data/book1.json

# Download second book
scrapy crawl book -a book_id=67890 -s MAKE_JSON=true -o ../data/book2.json
```

3. Transform JSON if needed (shamela_crawler format may vary):
   - Ensure JSON has: `{title, author?, units: [{index, heading?, text}]}`
   - Each unit should have at least `text` field

4. Import books into database:
```bash
cd backend
npm run seed ../data/book1.json ../data/book2.json
```

### Option B: Manual JSON Format

Create JSON files in `data/` directory with this structure:

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
      "heading": "Chapter 1 Title (optional)",
      "text": "Unit text content here..."
    },
    {
      "index": 2,
      "heading": null,
      "text": "More text content..."
    }
  ]
}
```

Then import:
```bash
cd backend
npm run seed ../data/book1.json ../data/book2.json
```

## Step 5: Test the Application

1. Open browser: `http://localhost:3000`

2. Register a new account:
   - Click "Login" → "Register here"
   - Enter email and password (min 6 characters)
   - Submit

3. Browse books:
   - You should see imported books on the home page
   - Click on a book to open the reader

4. Test reader:
   - Navigate units with arrow keys
   - Press Space to play/pause audio
   - Press B to bookmark (requires login)
   - Test keyboard navigation

5. Test TTS:
   - Click Play button
   - Audio should generate (first time may take 10-15 seconds)
   - Subsequent plays should be instant (cached)

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env`
- Test connection: `psql -U postgres -d shamela_tts_reader`

### Migration Errors

- Check database exists
- Verify user has CREATE TABLE permissions
- Check migration files are correct

### TTS Not Working

- Verify API key is correct
- Check API key has credits/quota
- Check backend logs for TTS errors
- Verify `storage/audio` directory is writable

### Frontend Can't Connect to Backend

- Verify backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Check CORS settings in backend `.env`
- Check browser console for errors

### Audio Not Playing

- Check browser console for errors
- Verify audio file was generated (check `backend/storage/audio/`)
- Check TTS provider API is working
- Try regenerating audio (delete from cache and play again)

## Development Commands

### Backend
```bash
npm run dev          # Start development server
npm run migrate      # Run migrations
npm run seed         # Import books (with file paths)
npm run migrate:rollback  # Rollback last migration batch
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
```

## Next Steps

- Set up production deployment
- Configure TTS provider with appropriate quota
- Add more books using the crawler
- Test with screen readers (NVDA, JAWS)
- Customize styling and accessibility features

