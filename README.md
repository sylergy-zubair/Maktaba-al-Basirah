# Shamela TTS Reader - PoC

A full-stack web application for blind users to access Maktaba Shamela books with TTS playback, keyboard navigation, and bookmarking.

## Project Structure

```
.
├── backend/          # Express API server
├── frontend/          # Next.js frontend application
├── data/              # Book data from crawler (to be added)
└── shamela_crawler/   # Book crawler tool (to be added)
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials and API keys:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shamela_tts_reader
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your-secret-key
TTS_PROVIDER=elevenlabs
ELEVENLABS_API_KEY=your-api-key
```

5. Run database migrations:
```bash
npm run migrate
```

6. Start the server:
```bash
npm run dev
```

Backend will run on `http://localhost:3001`

### Frontend Setup

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

4. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## Features

### Backend

- RESTful API with versioning (`/api/v1/`)
- JWT authentication
- Layered architecture (Controllers → Services → Repositories)
- TTS service with provider abstraction (ElevenLabs, Google TTS)
- Audio caching system
- Database migrations with Knex
- Comprehensive error handling and logging

### Frontend

- Accessible design with ARIA labels
- Full keyboard navigation
- Screen reader support
- TTS audio playback
- Bookmarking system
- Responsive layout

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### Books
- `GET /api/v1/books` - List books (with pagination)
- `GET /api/v1/books/:id` - Get book details
- `GET /api/v1/books/:id/units` - Get book units
- `GET /api/v1/books/:id/unit?index=N` - Get unit by index
- `GET /api/v1/books/units/:unitId` - Get unit by ID

### Bookmarks (Requires Auth)
- `GET /api/v1/bookmarks` - Get user's bookmarks
- `GET /api/v1/bookmarks/book/:bookId` - Get bookmark for book
- `POST /api/v1/bookmarks` - Create/update bookmark
- `DELETE /api/v1/bookmarks/book/:bookId` - Delete bookmark

### TTS
- `GET /api/v1/tts/unit/:unitId` - Get audio for unit
- `GET /api/v1/tts/unit/:unitId/status` - Check audio status

## Keyboard Shortcuts

- **Space**: Play/Pause audio
- **Arrow Right**: Next unit
- **Arrow Left**: Previous unit
- **B**: Toggle bookmark

## Quick Start

### 1. Database Setup
```bash
createdb shamela_tts_reader
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run migrate
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Download and Import Books

**Windows:**
```powershell
.\scripts\setup_and_download.ps1
```

**Linux/Mac:**
```bash
./scripts/setup_and_download.sh
```

This automatically downloads books 1157 and 16546 from Shamela Library and imports them.

### 5. Start Servers

**Terminal 1:**
```bash
cd backend && npm run dev
```

**Terminal 2:**
```bash
cd frontend && npm run dev
```

### 6. Access Application

Open `http://localhost:3000` in your browser.

## Documentation

- **[QUICK_START.md](./QUICK_START.md)** - 5-minute setup guide
- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
- **[DOWNLOAD_BOOKS.md](./DOWNLOAD_BOOKS.md)** - Guide for downloading books from Shamela
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines

## Project Status

✅ **All 14 tasks completed!**

The application is fully functional and ready for use.

## License

MIT

