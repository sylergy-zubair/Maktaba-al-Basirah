---
name: Shamela TTS Reader PoC
overview: Build a full-stack web application for blind users to access Maktaba Shamela books with TTS playback, keyboard navigation, and bookmarking. Backend uses Node.js + Express + PostgreSQL, frontend is a React/Next.js app with full accessibility support.
todos:
  - id: backend-setup
    content: Initialize Express backend with layered architecture, logging, error handling, API versioning, and environment configuration
    status: pending
  - id: database-schema
    content: Create database migrations with indexes, foreign keys, JSONB columns for extensibility, and audio_cache table
    status: pending
    dependencies:
      - backend-setup
  - id: auth-system
    content: Implement user registration, login, and JWT authentication middleware
    status: pending
    dependencies:
      - database-schema
  - id: books-api
    content: Implement layered architecture (controllers, services, repositories) for books API with pagination and caching
    status: pending
    dependencies:
      - database-schema
  - id: tts-service
    content: Implement TTS service with provider abstraction pattern, storage abstraction, and audio caching
    status: pending
    dependencies:
      - books-api
  - id: bookmarks-api
    content: Create bookmark endpoints (create, read, delete) with authentication
    status: pending
    dependencies:
      - auth-system
      - books-api
  - id: frontend-setup
    content: Initialize Next.js frontend with TypeScript, API client, and auth context
    status: pending
  - id: book-list-page
    content: Build accessible book list page with keyboard navigation
    status: pending
    dependencies:
      - frontend-setup
  - id: reader-page
    content: Create reader page with unit display, audio player, and navigation controls
    status: pending
    dependencies:
      - book-list-page
  - id: keyboard-shortcuts
    content: Implement keyboard shortcuts (Space, Arrow keys, B for bookmark)
    status: pending
    dependencies:
      - reader-page
  - id: accessibility
    content: Add ARIA labels, semantic HTML, and screen reader support throughout
    status: pending
    dependencies:
      - reader-page
  - id: auth-ui
    content: Build login and registration pages with form validation
    status: pending
    dependencies:
      - frontend-setup
  - id: setup-crawler
    content: Set up shamela_crawler tool and download 2 books as JSON from Shamela Library
    status: pending
  - id: seed-data
    content: Process JSON files from crawler and import 2 books into database with proper unit segmentation
    status: pending
    dependencies:
      - database-schema
      - setup-crawler
---

# Shamela TTS Reader - PoC Implementation Plan

## Architecture Overview

Full-stack application with scalable, maintainable architecture:

- **Frontend**: React/Next.js web app with accessibility features
- **Backend**: Node.js + Express REST API with layered architecture
- **Database**: PostgreSQL for books, users, and bookmarks (with indexing and migration system)
- **TTS**: Cloud-based Arabic TTS API (ElevenLabs or Google Cloud TTS free tier) with abstraction layer
- **Caching**: Redis-ready architecture (optional for PoC, ready for production)
- **API Versioning**: `/api/v1/` prefix for future API evolution

## Project Structure

```
shamela-tts-reader/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/              # App router pages
│   │   │   ├── page.tsx      # Book list page
│   │   │   ├── book/[id]/    # Reader page
│   │   │   └── login/        # Authentication
│   │   ├── components/       # React components
│   │   │   ├── BookList.tsx
│   │   │   ├── Reader.tsx
│   │   │   ├── AudioPlayer.tsx
│   │   │   └── BookmarkButton.tsx
│   │   └── lib/              # Utilities
│   │       ├── api.ts        # API client
│   │       └── keyboard.ts   # Keyboard shortcuts
│   └── package.json
├── backend/                  # Express API
│   ├── src/
│   │   ├── api/              # API layer (versioned routes)
│   │   │   └── v1/           # API version 1
│   │   │       ├── routes/   # Route definitions
│   │   │       │   ├── books.js
│   │   │       │   ├── tts.js
│   │   │       │   ├── bookmarks.js
│   │   │       │   └── auth.js
│   │   │       └── controllers/  # Request handlers
│   │   │           ├── booksController.js
│   │   │           ├── ttsController.js
│   │   │           ├── bookmarksController.js
│   │   │           └── authController.js
│   │   ├── services/        # Business logic layer
│   │   │   ├── tts/         # TTS service abstraction
│   │   │   │   ├── TTSProvider.js  # Interface/abstract class
│   │   │   │   ├── ElevenLabsProvider.js
│   │   │   │   ├── GoogleTTSProvider.js
│   │   │   │   └── ttsService.js  # Main service
│   │   │   ├── audioCache.js
│   │   │   ├── bookService.js
│   │   │   ├── bookmarkService.js
│   │   │   └── authService.js
│   │   ├── repositories/    # Data access layer
│   │   │   ├── BookRepository.js
│   │   │   ├── UnitRepository.js
│   │   │   ├── UserRepository.js
│   │   │   └── BookmarkRepository.js
│   │   ├── models/          # Database models/schemas
│   │   │   ├── Book.js
│   │   │   ├── Unit.js
│   │   │   ├── User.js
│   │   │   └── Bookmark.js
│   │   ├── middleware/      # Express middleware
│   │   │   ├── auth.js      # JWT authentication
│   │   │   ├── errorHandler.js
│   │   │   ├── logger.js    # Request logging
│   │   │   └── validator.js # Input validation
│   │   ├── utils/           # Utilities
│   │   │   ├── logger.js    # Application logging
│   │   │   ├── errors.js    # Custom error classes
│   │   │   └── cache.js     # Cache utilities (Redis-ready)
│   │   ├── config/          # Configuration
│   │   │   ├── database.js
│   │   │   ├── tts.js
│   │   │   ├── cache.js
│   │   │   └── env.js       # Environment validation
│   │   └── server.js        # Express app entry
│   ├── migrations/          # Database migrations (using Knex or similar)
│   ├── tests/               # Test files
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── scripts/             # Data import scripts
│   │   └── importBooks.js   # Import JSON from crawler to DB
│   ├── docs/                # API documentation
│   │   └── api.md           # API endpoint documentation
│   └── package.json
├── data/                     # Book data from crawler
│   ├── book1.json           # Exported from shamela_crawler
│   └── book2.json           # Exported from shamela_crawler
└── shamela_crawler/         # Git submodule or cloned repo
    └── (shamela_crawler files)
```

## Database Schema

PostgreSQL tables with indexes and extensible design:

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Books table (extensible for future metadata)
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  author VARCHAR(255),
  description TEXT,
  category VARCHAR(100),  -- For future categorization
  language VARCHAR(10) DEFAULT 'ar',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_category ON books(category);

-- Units table (hadiths/paragraphs)
CREATE TABLE units (
  id SERIAL PRIMARY KEY,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  index INTEGER NOT NULL,
  heading VARCHAR(500),
  text TEXT NOT NULL,
  metadata JSONB,  -- For future extensibility (tags, references, etc.)
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(book_id, index)
);

CREATE INDEX idx_units_book_id ON units(book_id);
CREATE INDEX idx_units_book_index ON units(book_id, index);
CREATE INDEX idx_units_metadata ON units USING GIN(metadata);  -- For JSONB queries

-- Bookmarks table
CREATE TABLE bookmarks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE,
  notes TEXT,  -- For future note-taking feature
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, book_id)  -- One bookmark per book per user
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_book_id ON bookmarks(book_id);
CREATE INDEX idx_bookmarks_user_book ON bookmarks(user_id, book_id);

-- Audio cache table (for tracking generated audio files)
CREATE TABLE audio_cache (
  id SERIAL PRIMARY KEY,
  unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT,
  tts_provider VARCHAR(50),  -- Track which provider generated it
  generated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(unit_id)
);

CREATE INDEX idx_audio_cache_unit_id ON audio_cache(unit_id);
```

**Future-ready extensions:**

- `metadata` JSONB column in units for tags, references, cross-references
- `category` in books for future filtering/search
- `notes` in bookmarks for user annotations
- Separate `audio_cache` table for better audio management
- Timestamps for audit trails
- Foreign key cascades for data integrity

## Implementation Tasks

### Backend Setup

1. **Initialize Express backend with scalable architecture**

   - Set up Express server with CORS, body-parser, helmet for security
   - Configure PostgreSQL connection pool (pg library with connection pooling)
   - Environment variable validation and configuration management
   - Structured logging system (Winston or Pino)
   - Global error handling middleware with consistent error responses
   - API versioning structure (`/api/v1/`)
   - Request/response logging middleware
   - Rate limiting middleware (for future protection)

2. **Database setup with migration system**

   - Set up database migration tool (Knex.js or similar)
   - Create migration scripts for all tables with indexes
   - Connection pooling configuration (min/max connections)
   - Database health check endpoint
   - Seed script to import 2 Shamela books (see Data Preparation section below)
   - Migration rollback support for safe deployments

3. **Authentication system**

   - User registration endpoint (`POST /api/auth/register`)
   - User login endpoint (`POST /api/auth/login`) - returns JWT token
   - JWT middleware for protected routes
   - Password hashing with bcrypt

4. **Books API (layered architecture)**

   - **Routes**: `GET /api/v1/books`, `GET /api/v1/books/:id`, etc.
   - **Controllers**: Handle HTTP requests, validate input, call services
   - **Services**: Business logic (book retrieval, unit pagination)
   - **Repositories**: Data access layer (database queries)
   - **Features**:
     - Pagination support for book lists
     - Filtering by author/category (extensible)
     - Caching layer (Redis-ready, in-memory for PoC)
     - Input validation middleware
     - Error handling with proper HTTP status codes

5. **TTS API with provider abstraction**

   - **Route**: `POST /api/v1/tts/generate`
   - **Provider abstraction**: Interface/abstract class for TTS providers
     - Easy to swap providers (ElevenLabs, Google TTS, Azure, etc.)
     - Configuration-driven provider selection
   - **Service layer**:
     - Check audio cache (database + file system)
     - Generate audio via selected provider
     - Save to storage (local for PoC, S3/Cloud Storage ready)
     - Update audio_cache table
   - **Storage abstraction**: Interface for file storage (local/cloud)
   - **Features**:
     - Retry logic for failed TTS requests
     - Rate limiting per provider
     - Audio file validation
     - Background job support (for async generation, future feature)

6. **Bookmarks API (extensible for notes/annotations)**

   - **Routes**: `/api/v1/bookmarks` (all CRUD operations)
   - **Features**:
     - Create/update bookmark (requires auth)
     - Get user's bookmarks with pagination
     - Get bookmark for specific book
     - Delete bookmark
     - Extensible for future: notes, highlights, annotations
   - **Service layer**: Business logic for bookmark management
   - **Repository layer**: Database operations with proper indexing

### Frontend Setup

7. **Next.js application**

   - Initialize Next.js with TypeScript
   - Set up API client (axios/fetch wrapper)
   - Authentication context/provider
   - Environment variables for API URL

8. **Book List Page** (`/`)

   - Display list of 2 books
   - Accessible list with ARIA labels
   - Keyboard navigation (Tab, Enter to select)
   - Link to reader page for each book
   - Login/logout controls

9. **Reader Page** (`/book/[id]`)

   - Display current unit (heading + text)
   - Large, high-contrast text display
   - Audio player component
   - Navigation controls (Previous/Next unit)
   - Bookmark button
   - Keyboard shortcuts:
     - Space: Play/Pause
     - ArrowRight: Next unit
     - ArrowLeft: Previous unit
     - B: Toggle bookmark
   - URL state management (`?unit=12`)
   - Auto-resume from bookmark if exists

10. **Accessibility features**

    - Semantic HTML (nav, main, article, button)
    - ARIA labels on all interactive elements
    - Focus management (auto-focus on unit text)
    - Screen reader announcements for state changes
    - Skip links for navigation
    - Keyboard trap prevention

11. **Audio Player Component**

    - HTML5 audio element
    - Play/pause button with ARIA labels
    - Loading states
    - Error handling (show message if TTS fails)
    - Auto-play when unit changes (optional, user preference)

12. **Authentication UI**

    - Login page with email/password
    - Registration page
    - Form validation and error messages
    - Accessible form inputs with labels

### Data Preparation

13. **Shamela Book Import using shamela_crawler**

    - Set up Python environment for [shamela_crawler](https://github.com/OpenShamela/shamela_crawler)
    - Install dependencies: `pip install .` or `poetry install`
    - Download 2 books from Shamela Library:
      - Identify book IDs from Shamela website (e.g., book ID from URL)
      - Run crawler to export as JSON: `scrapy crawl book -a book_id=<ID> -s MAKE_JSON=true`
      - Save JSON output for each book
    - Process JSON files:
      - Parse JSON structure to extract:
        - Book metadata (title, author)
        - Book structure (volumes, chapters, sections)
        - Text units (hadiths/paragraphs) with proper segmentation
      - Create Node.js script to:
        - Read JSON files
        - Transform data to match database schema
        - Insert into PostgreSQL (books, units tables)
    - Validate imported data:
      - Verify 2 books are imported correctly
      - Check unit segmentation (each unit should be readable independently)
      - Ensure Arabic text encoding is correct (UTF-8)

## Technical Decisions (Scalability & Future-Proofing)

### Architecture Patterns

- **Layered Architecture**: Controllers → Services → Repositories → Database
  - Easy to test each layer independently
  - Clear separation of concerns
  - Easy to swap implementations (e.g., different databases)
- **Provider Pattern**: TTS providers implement common interface
  - Easy to add new TTS providers
  - Configuration-driven provider selection
- **Repository Pattern**: Data access abstraction
  - Easy to add caching layer
  - Easy to switch databases or add read replicas

### API Design

- **Versioning**: `/api/v1/` prefix for future API evolution
- **RESTful conventions**: Consistent HTTP methods and status codes
- **Pagination**: Built-in from start (cursor or offset-based)
- **Error responses**: Standardized format across all endpoints

### Database

- **Migrations**: Version-controlled schema changes
- **Indexes**: Optimized for common queries (book lookups, user bookmarks)
- **JSONB columns**: Extensible metadata without schema changes
- **Foreign keys**: Data integrity with CASCADE deletes

### Caching Strategy

- **Multi-layer caching**:
  - Application-level (in-memory for PoC)
  - Redis-ready architecture (easy to add for production)
  - Database query result caching
  - Audio file caching (filesystem + database tracking)
- **Cache invalidation**: Clear strategy for cache updates

### Storage

- **Audio Storage**: Local filesystem for PoC, abstraction layer for S3/Cloud Storage
- **File organization**: Deterministic paths for easy migration

### Security & Performance

- **JWT Tokens**: httpOnly cookies for XSS protection
- **Rate Limiting**: Middleware ready (can enable for production)
- **Connection Pooling**: Database connection management
- **Logging**: Structured logging for monitoring and debugging

### Testing Infrastructure

- **Unit tests**: Service and repository layer tests
- **Integration tests**: API endpoint tests
- **E2E tests**: Full user flow tests
- **Test database**: Separate test environment

### Future Features Ready

- **Search**: Full-text search indexes ready (PostgreSQL tsvector)
- **Annotations**: Notes column in bookmarks table
- **Multi-language**: Language column in books table
- **Categories/Tags**: Category column and metadata JSONB
- **Background Jobs**: Async TTS generation architecture ready
- **Analytics**: Timestamp columns for usage tracking

## Deployment Considerations

- Backend: Deployable on Railway, Render, or similar (needs persistent storage for audio files)
- Frontend: Can deploy on Vercel, Netlify, or same server
- Database: PostgreSQL on Railway, Supabase, or managed service
- Environment variables: Secure storage for DB credentials, TTS API keys
- **Horizontal scaling ready**: Stateless API design allows multiple instances
- **CDN ready**: Audio files can be served via CDN in production
- **Monitoring**: Structured logs ready for integration with monitoring tools

## Future Extensibility (Post-PoC)

The architecture is designed to easily support:

### Content Features

- **Search**: Full-text search across books and units
- **Advanced filtering**: By author, category, date, tags
- **Cross-references**: Link related hadiths/units
- **Multiple book formats**: Support for different book structures
- **Book collections**: User-created reading lists

### User Features

- **User profiles**: Reading preferences, accessibility settings
- **Reading history**: Track all read units (not just bookmarks)
- **Annotations**: Notes, highlights, and comments on units
- **Sharing**: Share bookmarks or annotations with others
- **Offline mode**: Download books for offline reading (future)

### Technical Enhancements

- **Multiple TTS providers**: User selection, fallback providers
- **Voice customization**: Speed, pitch, voice selection
- **Background sync**: Async audio generation queue
- **Analytics**: Usage tracking and insights
- **API for third-party**: Public API for integrations
- **Mobile apps**: REST API ready for mobile clients
- **Real-time features**: WebSocket support for live updates

### Performance & Scale

- **Redis caching**: Add Redis for high-performance caching
- **Read replicas**: Database read replicas for scaling
- **CDN integration**: CloudFront/Cloudflare for audio delivery
- **Load balancing**: Multiple API instances
- **Background workers**: Separate worker processes for TTS generation

## Success Criteria (Blind User Focused)

The PoC is successful only if a blind user can complete all core tasks independently using only keyboard and screen reader:

### Authentication & Access

- **Blind user can register**: Screen reader announces all form fields, labels, and error messages clearly. User can complete registration using only keyboard (Tab navigation, Enter to submit).
- **Blind user can login**: Login form is fully accessible with clear screen reader feedback. User can authenticate without sighted assistance.

### Book Discovery & Selection

- **Blind user can discover books**: Book list page announces available books clearly via screen reader. User can navigate list using arrow keys or Tab, with each book title and author announced.
- **Blind user can select a book**: User can activate book selection using Enter or Space key, with clear screen reader confirmation of selection.

### Content Reading & Navigation

- **Blind user can navigate book content**: 
  - Screen reader announces current unit number, heading (if present), and position in book (e.g., "Unit 15 of 200")
  - User can move between units using arrow keys with clear audio feedback
  - Navigation controls are keyboard-accessible and screen reader announces their state
- **Blind user can read content**: Current unit text is accessible to screen reader and can be read aloud by screen reader's built-in TTS if desired.

### Audio Playback

- **Blind user can control TTS playback**:
  - Play/Pause button is keyboard accessible and screen reader announces current state ("Playing" or "Paused")
  - User can start playback using Space key with clear audio feedback
  - Screen reader announces when audio is loading, playing, paused, or encounters errors
  - Audio playback does not interfere with screen reader functionality
- **Blind user receives audio feedback**: High-quality Arabic TTS is clear and understandable. Audio starts within reasonable time (< 5 seconds for cached, < 15 seconds for first-time generation).

### Bookmarking

- **Blind user can bookmark position**: 
  - Bookmark button is keyboard accessible (B key shortcut)
  - Screen reader clearly announces bookmark status ("Bookmarked" or "Not bookmarked")
  - User receives confirmation when bookmark is saved
- **Blind user can resume reading**: 
  - When returning to a book, screen reader announces if a bookmark exists
  - User can resume from bookmark with clear audio announcement of position
  - Bookmark persists across sessions and devices (for same user account)

### Error Handling & Feedback

- **Blind user receives error feedback**: All errors are announced via screen reader with clear, actionable messages (not just visual indicators)
- **Blind user understands system state**: Screen reader announces loading states, success messages, and any state changes in real-time

### Testing Requirements

- **Screen reader compatibility**: App must be tested and verified working with:
  - NVDA (Windows) - primary test platform
  - JAWS (Windows) - secondary verification
  - VoiceOver (macOS/iOS) - if targeting Apple users
- **Keyboard-only operation**: Complete user journey must be possible using only keyboard (no mouse/touch required)
- **WCAG 2.1 AA compliance**: App meets minimum accessibility standards for screen reader users

### User Acceptance

- **Real blind user testing**: At least one blind user can complete the full workflow (register → login → select book → navigate → listen → bookmark → resume) independently without assistance
- **User satisfaction**: Blind user confirms the app is usable and the TTS quality is acceptable for reading Arabic religious texts