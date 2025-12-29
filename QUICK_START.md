# Quick Start Guide

Get the Shamela TTS Reader up and running in 5 minutes!

## Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Python 3.8+ (for downloading books)

## Step 1: Database

```bash
# Create database
createdb shamela_tts_reader
# Or: psql -U postgres -c "CREATE DATABASE shamela_tts_reader;"
```

## Step 2: Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env - set DB credentials and JWT_SECRET
npm run migrate
```

## Step 3: Frontend

```bash
cd frontend
npm install
# .env.local is optional (defaults work)
```

## Step 4: Download Books

**Windows:**
```powershell
.\scripts\setup_and_download.ps1
```

**Linux/Mac:**
```bash
./scripts/setup_and_download.sh
```

This downloads books 1157 and 16546 and imports them automatically.

## Step 5: Run

**Terminal 1:**
```bash
cd backend && npm run dev
```

**Terminal 2:**
```bash
cd frontend && npm run dev
```

## Step 6: Use

1. Open `http://localhost:3000`
2. Register an account
3. Browse books
4. Read with TTS!

## Keyboard Shortcuts

- **Space**: Play/Pause audio
- **← →**: Navigate units
- **B**: Toggle bookmark

## Troubleshooting

- **Database errors?** Check `.env` in `backend/`
- **Can't download books?** See [DOWNLOAD_BOOKS.md](./DOWNLOAD_BOOKS.md)
- **TTS not working?** Check TTS API key in `.env`

For detailed help, see [SETUP.md](./SETUP.md).

