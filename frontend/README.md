# Shamela TTS Reader - Frontend

Next.js frontend application for the Shamela TTS Reader, built with accessibility in mind for blind users.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Features

- **Accessible Design**: Full keyboard navigation and screen reader support
- **Book List**: Browse available books
- **Reader**: Read books with TTS audio playback
- **Bookmarks**: Save reading position (requires authentication)
- **Keyboard Shortcuts**:
  - Space: Play/Pause audio
  - Arrow Right: Next unit
  - Arrow Left: Previous unit
  - B: Toggle bookmark

## Project Structure

- `src/app/` - Next.js app router pages
- `src/components/` - React components
- `src/contexts/` - React contexts (Auth)
- `src/lib/` - Utilities and API client

