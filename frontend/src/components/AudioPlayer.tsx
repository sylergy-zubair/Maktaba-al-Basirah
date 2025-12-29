'use client';

import { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { ttsApi } from '@/lib/api';
import styles from './AudioPlayer.module.css';

interface AudioPlayerProps {
  unitId: number;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export interface AudioPlayerRef {
  play: () => void;
  pause: () => void;
  isPlaying: () => boolean;
}

const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>(
  ({ unitId, onPlayStateChange }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentUnitIdRef = useRef<number>(unitId);

  // Store blob URLs to revoke them later
  const blobUrlRef = useRef<string | null>(null);

  // Cleanup function
  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('loadstart', () => {});
      audioRef.current.removeEventListener('canplay', () => {});
      audioRef.current.removeEventListener('canplaythrough', () => {});
      audioRef.current.removeEventListener('error', () => {});
      audioRef.current.removeEventListener('ended', () => {});
      audioRef.current.src = '';
      audioRef.current.load();
      audioRef.current = null;
    }
    // Revoke blob URL to free memory
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  useEffect(() => {
    // Reset when unit changes
    if (currentUnitIdRef.current !== unitId) {
      setIsPlaying(false);
      setIsLoading(false);
      setError(null);
      cleanupAudio();
      currentUnitIdRef.current = unitId;
    }
  }, [unitId, cleanupAudio]);

  const handlePlayPause = useCallback(async () => {
    try {
      if (isPlaying) {
        // Pause if currently playing
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
        return;
      }

      // If audio element doesn't exist or unit changed, create a new one
      if (!audioRef.current || currentUnitIdRef.current !== unitId) {
        // Clean up any existing audio first
        cleanupAudio();
        
        setIsLoading(true);
        setError(null);

        // Fetch audio with authentication and create blob URL
        let audioUrl: string;
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
          if (!token) {
            throw new Error('Not authenticated');
          }

          const response = await fetch(ttsApi.getAudioUrl(unitId), {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
          }

          const audioBlob = await response.blob();
          audioUrl = URL.createObjectURL(audioBlob);
        } catch (fetchError) {
          setIsLoading(false);
          setIsPlaying(false);
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to load audio');
          return;
        }

        const audio = new Audio(audioUrl);
        blobUrlRef.current = audioUrl; // Store blob URL for cleanup

        // Set up event listeners
        const handleLoadStart = () => {
          setIsLoading(true);
          setError(null);
        };

        const handleCanPlay = () => {
          setIsLoading(false);
        };

        const handleCanPlayThrough = () => {
          setIsLoading(false);
        };

        const handleError = (e: Event) => {
          setIsLoading(false);
          setIsPlaying(false);
          const audioElement = e.target as HTMLAudioElement;
          let errorMessage = 'Failed to load audio.';
          
          if (audioElement.error) {
            switch (audioElement.error.code) {
              case MediaError.MEDIA_ERR_ABORTED:
                errorMessage = 'Audio loading was aborted.';
                break;
              case MediaError.MEDIA_ERR_NETWORK:
                errorMessage = 'Network error while loading audio. Please check your connection.';
                break;
              case MediaError.MEDIA_ERR_DECODE:
                errorMessage = 'Audio decoding error. The audio format may not be supported.';
                break;
              case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                errorMessage = 'Audio format not supported. The TTS service may be unavailable.';
                break;
            }
          }
          
          setError(errorMessage);
          cleanupAudio();
        };

        const handleEnded = () => {
          setIsPlaying(false);
        };

        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('canplaythrough', handleCanPlayThrough);
        audio.addEventListener('error', handleError);
        audio.addEventListener('ended', handleEnded);

        audioRef.current = audio;
        currentUnitIdRef.current = unitId;
      }

      // Play the audio
      if (audioRef.current) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
          setError(null);
        } catch (playError) {
          setIsLoading(false);
          setIsPlaying(false);
          setError(playError instanceof Error ? playError.message : 'Failed to play audio');
          cleanupAudio();
        }
      }
    } catch (err) {
      setIsLoading(false);
      setIsPlaying(false);
      setError(err instanceof Error ? err.message : 'Failed to play audio');
      cleanupAudio();
    }
  }, [isPlaying, unitId, cleanupAudio]);

  // Expose methods via ref
  // Use callback ref pattern to avoid dependency issues with handlePlayPause
  const handlePlayCommand = useCallback(async () => {
    if (!isPlaying && !isLoading) {
      await handlePlayPause();
    }
  }, [isPlaying, isLoading, handlePlayPause]);

  const handlePauseCommand = useCallback(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  useImperativeHandle(ref, () => ({
    play: handlePlayCommand,
    pause: handlePauseCommand,
    isPlaying: () => isPlaying,
  }), [handlePlayCommand, handlePauseCommand, isPlaying]);

  // Notify parent of play state changes
  useEffect(() => {
    if (onPlayStateChange) {
      onPlayStateChange(isPlaying);
    }
  }, [isPlaying, onPlayStateChange]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Use 'j' key for play/pause (J/K keys are common for media controls)
      if ((e.key === 'j' || e.key === 'J') && e.target === document.body) {
        e.preventDefault();
        handlePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlePlayPause]);

  return (
    <div className={styles.audioPlayer} role="region" aria-label="Audio player">
      <button
        onClick={handlePlayPause}
        disabled={isLoading}
        aria-label={isPlaying ? 'Pause audio (Press J)' : 'Play audio (Press J)'}
        aria-live="polite"
        className={styles.playButton}
        title={isPlaying ? 'Pause audio (J key)' : 'Play audio (J key)'}
      >
        {isLoading ? 'Loading...' : isPlaying ? '⏸ Pause' : '▶ Play'}
      </button>
      
      {error && (
        <div role="alert" aria-live="assertive" className={styles.errorMessage}>
          {error}
        </div>
      )}
    </div>
  );
});

AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;

