# Shamela TTS Reader - Backend API

Backend API for the Shamela TTS Reader application, providing REST endpoints for books, TTS, bookmarks, and authentication.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your database credentials and API keys.

4. Run database migrations:
```bash
npm run migrate
```

5. Start the development server:
```bash
npm run dev
```

## Project Structure

- `src/api/v1/` - API routes and controllers
- `src/services/` - Business logic layer
- `src/repositories/` - Data access layer
- `src/middleware/` - Express middleware
- `src/config/` - Configuration files
- `src/utils/` - Utility functions
- `migrations/` - Database migration files
- `scripts/` - Utility scripts (data import, etc.)

## API Endpoints

API endpoints will be documented as they are implemented.

## Environment Variables

See `.env.example` for required environment variables.

