'use client';

import { useState, useEffect } from 'react';
import { bookmarksApi } from '@/lib/api';
import styles from './BookmarkButton.module.css';

interface BookmarkButtonProps {
  bookId: number;
  unitId: number;
  unitIndex: number;
  onToggleRef?: React.MutableRefObject<(() => void) | null>;
}

export default function BookmarkButton({ bookId, unitId, unitIndex, onToggleRef }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<number | null>(null);

  useEffect(() => {
    checkBookmark();
  }, [bookId]);

  // Expose toggle function via ref if provided
  useEffect(() => {
    if (onToggleRef) {
      onToggleRef.current = handleToggle;
    }
    return () => {
      if (onToggleRef) {
        onToggleRef.current = null;
      }
    };
  }, [onToggleRef, isBookmarked, bookId, unitId]);

  const checkBookmark = async () => {
    try {
      const bookmark = await bookmarksApi.getBookmarkByBook(bookId);
      if (bookmark) {
        setIsBookmarked(true);
        setBookmarkId(bookmark.id);
      } else {
        setIsBookmarked(false);
        setBookmarkId(null);
      }
    } catch (err) {
      // Bookmark doesn't exist
      setIsBookmarked(false);
      setBookmarkId(null);
    }
  };

  const handleToggle = async () => {
    try {
      setIsLoading(true);
      
      if (isBookmarked) {
        await bookmarksApi.deleteBookmark(bookId);
        setIsBookmarked(false);
        setBookmarkId(null);
      } else {
        const bookmark = await bookmarksApi.createBookmark(bookId, unitId);
        setIsBookmarked(true);
        setBookmarkId(bookmark.id);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update bookmark');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'b' || e.key === 'B') {
        if (e.target === document.body || e.target instanceof HTMLElement) {
          const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
          if (!isInput) {
            e.preventDefault();
            handleToggle();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isBookmarked, bookId, unitId]);

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      aria-pressed={isBookmarked}
      className={styles.bookmarkButton}
    >
      {isBookmarked ? '🔖 Bookmarked' : '🔖 Bookmark'}
    </button>
  );
}

