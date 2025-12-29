'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceRecognitionService, RecognitionResult } from '@/services/voiceRecognition';
import { parseCommand, ParsedCommand } from '@/services/commandParser';
import { getVoiceControlPreferences, saveVoiceControlPreferences } from '@/utils/voiceControl';
import { CommandResult } from '@/hooks/useVoiceControl';
import { playConfirmationSound, playErrorSound } from '@/utils/audioConfirmation';
import styles from './PushToTalkButton.module.css';

export interface PushToTalkButtonProps {
  onCommand: (command: ParsedCommand) => CommandResult | void;
  onError?: (error: Error) => void;
  onListeningStart?: () => void;
}

export default function PushToTalkButton({
  onCommand,
  onError,
  onListeningStart,
}: PushToTalkButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(() => {
    const prefs = getVoiceControlPreferences();
    return prefs.enabled;
  });

  const recognitionServiceRef = useRef<VoiceRecognitionService | null>(null);
  const holdStartTimeRef = useRef<number>(0);
  const minHoldDuration = 0.5; // Minimum 0.5 seconds to avoid accidental triggers
  const lastCommandTimeRef = useRef<number>(0);
  const minCommandInterval = 500; // Minimum 500ms between commands (rate limiting)
  const commandDebounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if voice control is enabled
  useEffect(() => {
    const checkEnabled = () => {
      const prefs = getVoiceControlPreferences();
      setIsEnabled(prefs.enabled);
      if (!prefs.enabled && recognitionServiceRef.current) {
        recognitionServiceRef.current.abort();
        setIsListening(false);
        setIsProcessing(false);
        setError(null);
      }
    };

    checkEnabled();
    // Check periodically for preference changes
    const interval = setInterval(checkEnabled, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle window focus/blur events (pause recognition when tab is in background)
  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden && recognitionServiceRef.current && isListening) {
        // Tab is hidden, stop recognition
        recognitionServiceRef.current.stop();
        setIsListening(false);
        setError('Voice recognition paused (tab is in background)');
      }
    };

    const handleBlur = () => {
      if (recognitionServiceRef.current && isListening) {
        // Window lost focus, stop recognition
        recognitionServiceRef.current.stop();
        setIsListening(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isEnabled, isListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (commandDebounceTimeoutRef.current) {
        clearTimeout(commandDebounceTimeoutRef.current);
      }
      if (recognitionServiceRef.current) {
        recognitionServiceRef.current.abort();
      }
    };
  }, []);

  // Initialize recognition service
  useEffect(() => {
    if (!isEnabled) {
      return; // Don't initialize if disabled
    }
    try {
      const service = new VoiceRecognitionService();
      const prefs = getVoiceControlPreferences();
      service.setLanguage(prefs.language);

      service.onResult((result: RecognitionResult) => {
        setRecognizedText(result.transcript);
        
        // Only process final results
        if (result.isFinal) {
          // Clear any pending debounce
          if (commandDebounceTimeoutRef.current) {
            clearTimeout(commandDebounceTimeoutRef.current);
          }

          // Rate limiting: prevent rapid command sequences
          const now = Date.now();
          const timeSinceLastCommand = now - lastCommandTimeRef.current;
          
          if (timeSinceLastCommand < minCommandInterval) {
            // Ignore command if too soon after previous one
            setError('Please wait before giving another command');
            setIsProcessing(false);
            setRecognizedText(null);
            return;
          }

          setIsProcessing(true);
          
          // Debounce command execution slightly to avoid duplicate processing
          commandDebounceTimeoutRef.current = setTimeout(() => {
            const command = parseCommand(result.transcript);
            if (command) {
              lastCommandTimeRef.current = Date.now();
              
              try {
                const result = onCommand(command);
                const prefs = getVoiceControlPreferences();
                
                // If command handler returns error info, display it
                if (result && typeof result === 'object' && 'success' in result) {
                  if (!result.success && result.error) {
                    setError(result.error);
                    // Play error sound if enabled
                    if (prefs.audioConfirmation) {
                      playErrorSound();
                    }
                  } else {
                    setError(null);
                    // Play confirmation sound if enabled
                    if (prefs.audioConfirmation) {
                      playConfirmationSound();
                    }
                  }
                } else {
                  // Command executed without explicit result (legacy support)
                  setError(null);
                  // Play confirmation sound if enabled
                  if (prefs.audioConfirmation) {
                    playConfirmationSound();
                  }
                }
              } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'Failed to execute command';
                setError(errorMsg);
                const prefs = getVoiceControlPreferences();
                if (prefs.audioConfirmation) {
                  playErrorSound();
                }
                if (onError) {
                  onError(new Error(errorMsg));
                }
              }
            } else {
              const errorMsg = 'Command not recognized. Say "help" for available commands.';
              setError(errorMsg);
              const prefs = getVoiceControlPreferences();
              if (prefs.audioConfirmation) {
                playErrorSound();
              }
              if (onError) {
                onError(new Error(errorMsg));
              }
            }
            
            setIsProcessing(false);
            setRecognizedText(null);
          }, 100); // Small debounce delay
        }
      });

      service.onError((err: Error) => {
        // Extract user-friendly message if available
        const userMessage = (err as any).userMessage || err.message;
        setError(userMessage);
        setIsListening(false);
        setIsProcessing(false);
        
        // Clear any pending processing
        if (commandDebounceTimeoutRef.current) {
          clearTimeout(commandDebounceTimeoutRef.current);
          commandDebounceTimeoutRef.current = null;
        }
        
        if (onError) {
          onError(err);
        }
        
        // Auto-clear error after 5 seconds
        setTimeout(() => {
          setError(null);
        }, 5000);
      });

      service.onEnd(() => {
        setIsListening(false);
        setIsProcessing(false);
      });

      recognitionServiceRef.current = service;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to initialize voice recognition';
      setError(errorMessage);
      if (onError) {
        onError(new Error(errorMessage));
      }
    }

    return () => {
      if (recognitionServiceRef.current) {
        recognitionServiceRef.current.abort();
      }
    };
  }, [onCommand, onError, isEnabled]);

  // Handle push-to-talk button press (mouse/touch)
  const handleMouseDown = useCallback(() => {
    if (!recognitionServiceRef.current || !isEnabled) {
      return;
    }

    // Don't start if already processing a command
    if (isProcessing) {
      return;
    }

    // Don't start if tab is in background
    if (document.hidden) {
      setError('Voice recognition unavailable (tab is in background)');
      return;
    }

    holdStartTimeRef.current = Date.now();
    setError(null);
    setRecognizedText(null);
    
    try {
      setIsListening(true);
      recognitionServiceRef.current.start();
      
      // Notify parent that listening has started (e.g., to pause TTS)
      if (onListeningStart) {
        onListeningStart();
      }
    } catch (err) {
      setIsListening(false);
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Failed to start voice recognition';
      setError(errorMsg);
      if (onError) {
        onError(new Error(errorMsg));
      }
    }
  }, [isEnabled, isProcessing, onListeningStart, onError]);

  const handleMouseUp = useCallback(() => {
    if (!recognitionServiceRef.current || !isEnabled) {
      return;
    }

    const holdDuration = (Date.now() - holdStartTimeRef.current) / 1000;

    // Ignore if released too quickly (likely accidental)
    if (holdDuration < minHoldDuration) {
      recognitionServiceRef.current.abort();
      setIsListening(false);
      return;
    }

    recognitionServiceRef.current.stop();
  }, []);

  // Handle keyboard push-to-talk
  useEffect(() => {
    if (!isEnabled) {
      return; // Don't listen if voice control is disabled
    }
    const prefs = getVoiceControlPreferences();
    const pushToTalkKey = prefs.pushToTalkKey.toLowerCase();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't activate if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Handle space key specifically (it's a special key)
      const keyMatches = pushToTalkKey === 'space' 
        ? e.key === ' ' || e.key === 'Space'
        : e.key.toLowerCase() === pushToTalkKey;

      if (keyMatches && !isListening) {
        e.preventDefault();
        handleMouseDown();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Handle space key specifically
      const keyMatches = pushToTalkKey === 'space'
        ? e.key === ' ' || e.key === 'Space'
        : e.key.toLowerCase() === pushToTalkKey;

      if (keyMatches && isListening) {
        e.preventDefault();
        handleMouseUp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isListening, handleMouseDown, handleMouseUp, isEnabled]);

  // Update service language when preferences change
  useEffect(() => {
    if (recognitionServiceRef.current && isEnabled) {
      const prefs = getVoiceControlPreferences();
      recognitionServiceRef.current.setLanguage(prefs.language);
    }
  }, [isEnabled]);

  // Auto-stop after 5 seconds (timeout protection)
  useEffect(() => {
    if (!isListening) {
      return;
    }

    const timeout = setTimeout(() => {
      if (recognitionServiceRef.current) {
        recognitionServiceRef.current.stop();
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [isListening, isEnabled]);

  // Don't render if disabled
  if (!isEnabled) {
    return null;
  }

  const buttonState = isProcessing
    ? 'processing'
    : isListening
    ? 'listening'
    : error
    ? 'error'
    : 'idle';

  return (
    <div className={styles.pushToTalkContainer}>
      <button
        className={`${styles.pushToTalkButton} ${styles[buttonState]}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // Release if mouse leaves button
        onTouchStart={(e) => {
          e.preventDefault();
          handleMouseDown();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleMouseUp();
        }}
        disabled={isProcessing}
        aria-label={
          isListening
            ? 'Listening for voice command (release Space to process)'
            : 'Press and hold Space to speak command'
        }
        aria-pressed={isListening}
      >
        {isProcessing ? (
          <>
            <span className={styles.spinner}>⏳</span>
            Processing...
          </>
        ) : isListening ? (
          <>
            <span className={styles.micIcon}>🎤</span>
            Listening...
          </>
        ) : error ? (
          <>
            <span>❌</span>
            Error
          </>
        ) : (
          <>
            <span className={styles.micIcon}>🎤</span>
            Voice
          </>
        )}
      </button>

      {recognizedText && (
        <div className={styles.recognizedText} role="status" aria-live="polite">
          Heard: &quot;{recognizedText}&quot;
        </div>
      )}

      {error && (
        <div
          className={styles.errorMessage}
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}
    </div>
  );
}

