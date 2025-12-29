'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { booksApi, Book } from '@/lib/api';
import Link from 'next/link';
import { speakText, stopSpeaking } from '@/utils/browserTTS';
import styles from './page.module.css';

export default function Home() {
  const { isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusedBookIndex, setFocusedBookIndex] = useState<number | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (isAuthenticated) {
      loadBooks();
    }
  }, [isAuthenticated, isLoading]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await booksApi.getBooks(1, 20);
      setBooks(response.books);
      setError(null);
      // Initialize focus to first book if books are loaded
      if (response.books.length > 0) {
        setFocusedBookIndex(0);
      } else {
        setFocusedBookIndex(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load books');
      setFocusedBookIndex(null);
    } finally {
      setLoading(false);
    }
  };

  // Format book text for TTS reading
  const getBookTTSText = useCallback((book: Book): string => {
    if (book.author) {
      return `${book.title}، ${book.author}`;
    }
    return book.title;
  }, []);

  // Focus navigation functions
  const focusNextBook = useCallback(() => {
    if (books.length === 0) return;
    
    setFocusedBookIndex((prev) => {
      if (prev === null) return 0;
      const next = prev + 1;
      return next < books.length ? next : prev; // Stop at last book
    });
  }, [books.length]);

  const focusPreviousBook = useCallback(() => {
    if (books.length === 0) return;
    
    setFocusedBookIndex((prev) => {
      if (prev === null) return 0;
      const prevIndex = prev - 1;
      return prevIndex >= 0 ? prevIndex : prev; // Stop at first book
    });
  }, [books.length]);

  // Read book name when focus changes
  useEffect(() => {
    if (focusedBookIndex !== null && books[focusedBookIndex]) {
      const book = books[focusedBookIndex];
      const textToRead = getBookTTSText(book);
      speakText(textToRead, { lang: 'ar-SA' });
    }
  }, [focusedBookIndex, books, getBookTTSText]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Don't handle if no books or not focused
      if (books.length === 0 || focusedBookIndex === null) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          focusNextBook();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          focusPreviousBook();
          break;
        case 'Enter':
        case ' ':
          if (focusedBookIndex !== null && books[focusedBookIndex]) {
            e.preventDefault();
            stopSpeaking(); // Stop TTS when opening book
            router.push(`/book/${books[focusedBookIndex].id}`);
          }
          break;
        case 'Escape':
          // Stop TTS on Escape
          stopSpeaking();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [books, focusedBookIndex, focusNextBook, focusPreviousBook, router]);

  // Reset focus when books array changes
  useEffect(() => {
    if (books.length > 0 && (focusedBookIndex === null || focusedBookIndex >= books.length)) {
      setFocusedBookIndex(0);
    } else if (books.length === 0) {
      setFocusedBookIndex(null);
    }
  }, [books.length, focusedBookIndex]);

  // Cleanup: stop TTS on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <main role="main" className={styles.main} dir="ltr">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <header role="banner" className={styles.header}>
        <h1>Shamela TTS Reader</h1>
        <nav role="navigation" aria-label="Main navigation" className={styles.nav}>
          {isAuthenticated && (
            <Link href="/settings" aria-label="Settings">
              Settings
            </Link>
          )}
          {isAuthenticated ? (
            <button onClick={logout} aria-label="Logout">
              Logout
            </button>
          ) : (
            <Link href="/login" aria-label="Login">
              Login
            </Link>
          )}
        </nav>
      </header>

      <section id="main-content" role="region" aria-labelledby="books-heading" className={styles.booksSection}>
        <h2 id="books-heading">Available Books</h2>
        {!loading && !error && books.length > 0 && (
          <p className={styles.keyboardHint}>
            Use arrow keys (← → or ↑ ↓) to navigate, Enter or Space to open a book. Book names will be read aloud automatically.
          </p>
        )}
        
        {loading && <div className={styles.loading}>Loading books...</div>}
        
        {error && (
          <div role="alert" aria-live="polite" className={styles.error}>
            <p>Error: {error}</p>
          </div>
        )}

        {!loading && !error && books.length === 0 && (
          <div className={styles.empty}>
            <p>No books available. Please import books first.</p>
            <p>See SETUP.md for instructions on importing books.</p>
          </div>
        )}

        {!loading && !error && books.length > 0 && (
          <ul 
            role="listbox" 
            aria-label="Available books. Use arrow keys to navigate, Enter to open."
            className={styles.booksList}
          >
            {books.map((book, index) => (
              <li
                key={book.id}
                role="option"
                aria-selected={index === focusedBookIndex}
                tabIndex={index === focusedBookIndex ? 0 : -1}
                aria-label={`Book ${index + 1} of ${books.length}: ${book.title}${book.author ? ` by ${book.author}` : ''}`}
                className={`${styles.bookItem} ${index === focusedBookIndex ? styles.focused : ''}`}
              >
                <Link
                  href={`/book/${book.id}`}
                  className={styles.bookLink}
                  onClick={(e) => {
                    stopSpeaking(); // Stop TTS when clicking to open
                  }}
                  aria-label={`Read ${book.title}${book.author ? ` by ${book.author}` : ''}`}
                >
                  <h3>{book.title}</h3>
                  {book.author && <p>Author: {book.author}</p>}
                  {book.description && <p>{book.description}</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

