'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { booksApi, bookmarksApi, ttsApi, Unit, Book } from '@/lib/api';
import AudioPlayer, { AudioPlayerRef } from '@/components/AudioPlayer';
import BookmarkButton from '@/components/BookmarkButton';
import PushToTalkButton from '@/components/PushToTalkButton';
import { useVoiceControl } from '@/hooks/useVoiceControl';
import { isVoiceControlAvailable } from '@/utils/voiceControl';
import styles from './page.module.css';

export default function BookReader() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const bookId = parseInt(params.id as string, 10);

  const [book, setBook] = useState<Book | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [totalUnits, setTotalUnits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmark, setBookmark] = useState<{ unitId: number; unitIndex: number } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const unitRef = useRef<HTMLDivElement>(null);
  const audioPlayerRef = useRef<AudioPlayerRef>(null);
  const bookmarkToggleRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    loadBook();
  }, [bookId, isAuthenticated]);

  useEffect(() => {
    if (book) {
      const indexFromUrl = searchParams.get('unit');
      if (indexFromUrl) {
        loadUnitByIndex(parseInt(indexFromUrl, 10));
      } else {
        // Check for bookmark
        loadBookmark();
      }
    }
  }, [book, searchParams]);

  const loadBook = async () => {
    try {
      setLoading(true);
      const bookData = await booksApi.getBook(bookId);
      setBook(bookData);
      
      // Get total units count
      const unitsResponse = await booksApi.getBookUnits(bookId, 1, 1);
      setTotalUnits(unitsResponse.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load book');
    } finally {
      setLoading(false);
    }
  };

  const loadBookmark = async () => {
    if (!isAuthenticated) {
      // If not authenticated, just load first unit
      loadUnitByIndex(1);
      return;
    }
    
    try {
      const bookmarkData = await bookmarksApi.getBookmarkByBook(bookId);
      if (bookmarkData) {
        const unitIndex = bookmarkData.unit_index || 1;
        setBookmark({ unitId: bookmarkData.unit_id, unitIndex });
        loadUnitByIndex(unitIndex);
      } else {
        // Load first unit
        loadUnitByIndex(1);
      }
    } catch (err) {
      // If bookmark fails, just load first unit
      loadUnitByIndex(1);
    }
  };

  const loadUnitByIndex = async (index: number) => {
    try {
      setLoading(true);
      const unitData = await booksApi.getUnitByBookAndIndex(bookId, index);
      setUnit(unitData);
      setCurrentIndex(index);
      
      // Update URL
      router.replace(`/book/${bookId}?unit=${index}`, { scroll: false });
      
      // Focus on unit content for screen readers
      setTimeout(() => {
        unitRef.current?.focus();
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load unit');
    } finally {
      setLoading(false);
    }
  };

  const goToNext = () => {
    if (currentIndex !== null && currentIndex < totalUnits) {
      loadUnitByIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex !== null && currentIndex > 1) {
      loadUnitByIndex(currentIndex - 1);
    }
  };

  // Voice control integration
  const voiceControlCallbacks = {
    onPlay: async () => {
      if (audioPlayerRef.current) {
        await audioPlayerRef.current.play();
      }
    },
    onPause: () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    },
    onNext: goToNext,
    onPrevious: goToPrevious,
    onBookmark: () => {
      if (bookmarkToggleRef.current) {
        bookmarkToggleRef.current();
      }
    },
    onRemoveBookmark: () => {
      if (bookmarkToggleRef.current) {
        bookmarkToggleRef.current();
      }
    },
    onGoToUnit: loadUnitByIndex,
    getCurrentUnitIndex: () => currentIndex,
    getTotalUnits: () => totalUnits,
    isPlaying: () => isPlaying,
  };

  const { handleCommand, handleError, pauseTtsIfNeeded, isEnabled: voiceControlEnabled } = useVoiceControl(voiceControlCallbacks);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't handle shortcuts when typing in inputs
      }

      switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        goToNext();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        goToPrevious();
        break;
      case 'j':
      case 'J':
        // J key handled by AudioPlayer for play/pause
        break;
      case ' ':
        // Space key handled by PushToTalkButton for voice commands
        break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, totalUnits]);

  if (loading && !unit) {
    return <div>Loading book...</div>;
  }

  if (error) {
    return (
      <div role="alert">
        <p>Error: {error}</p>
        <button onClick={() => router.push('/')}>Back to Books</button>
      </div>
    );
  }

  if (!book || !unit) {
    return <div>Book or unit not found</div>;
  }

  return (
    <main role="main">
      <header role="banner" className={styles.header}>
        <nav role="navigation" aria-label="Book navigation">
          <div className={styles.headerButtons}>
            <button onClick={() => router.push('/')} aria-label="Back to book list">
              ← Back to Books
            </button>
            <button onClick={() => router.push('/settings')} aria-label="Settings">
              Settings
            </button>
          </div>
          <h1>{book.title}</h1>
          {book.author && <p>Author: {book.author}</p>}
        </nav>
      </header>

      <article role="article" aria-label={`Unit ${currentIndex} of ${totalUnits}`}>
        <div
          ref={unitRef}
          tabIndex={-1}
          role="region"
          aria-label={`Unit ${currentIndex} of ${totalUnits}${unit.heading ? `: ${unit.heading}` : ''}`}
          className={styles.unitContent}
        >
          {unit.heading && <h2>{unit.heading}</h2>}
          <div className={styles.unitText} aria-live="polite">
            {unit.text}
          </div>
        </div>

        <div className={styles.readerControls} role="toolbar" aria-label="Reading controls">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 1}
            aria-label="Previous unit"
          >
            ← Previous
          </button>

          <AudioPlayer 
            ref={audioPlayerRef}
            unitId={unit.id}
            onPlayStateChange={setIsPlaying}
          />

          {isAuthenticated && (
            <BookmarkButton
              bookId={bookId}
              unitId={unit.id}
              unitIndex={currentIndex || 0}
              onToggleRef={bookmarkToggleRef}
            />
          )}

          {voiceControlEnabled && (
            <PushToTalkButton
              onCommand={handleCommand}
              onError={handleError}
              onListeningStart={pauseTtsIfNeeded}
            />
          )}

          <button
            onClick={goToNext}
            disabled={currentIndex === totalUnits}
            aria-label="Next unit"
          >
            Next →
          </button>
        </div>

        <div className={styles.unitInfo} aria-live="polite" aria-atomic="true">
          <p>Unit {currentIndex} of {totalUnits}</p>
        </div>
      </article>
    </main>
  );
}

