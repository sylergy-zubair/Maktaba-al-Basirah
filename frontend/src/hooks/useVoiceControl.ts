/**
 * useVoiceControl Hook
 * Hook for integrating voice control with book reader functionality
 */

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ParsedCommand } from '@/services/commandParser';
import { isVoiceControlEnabled, getVoiceControlPreferences } from '@/utils/voiceControl';

export interface VoiceControlCallbacks {
  onPlay: () => void | Promise<void>;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onBookmark: () => void;
  onRemoveBookmark: () => void;
  onGoToUnit: (unitNumber: number) => void;
  getCurrentUnitIndex: () => number | null;
  getTotalUnits: () => number;
  isPlaying: () => boolean;
}

export interface CommandResult {
  success: boolean;
  error?: string;
}

export function useVoiceControl(callbacks: VoiceControlCallbacks) {
  const router = useRouter();
  const callbacksRef = useRef(callbacks);

  // Keep callbacks ref up to date
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  const handleCommand = useCallback(
    (command: ParsedCommand): { success: boolean; error?: string } => {
      const { action, params } = command;

      try {
        switch (action) {
          case 'play':
            callbacksRef.current.onPlay();
            return { success: true };

          case 'pause':
            callbacksRef.current.onPause();
            return { success: true };

          case 'next': {
            const currentIndex = callbacksRef.current.getCurrentUnitIndex();
            const totalUnits = callbacksRef.current.getTotalUnits();
            
            if (currentIndex === null) {
              return { success: false, error: 'Current unit index unknown' };
            }
            
            if (currentIndex >= totalUnits) {
              return {
                success: false,
                error: `Cannot go to next unit. You're already on the last unit (${totalUnits}).`,
              };
            }
            
            callbacksRef.current.onNext();
            return { success: true };
          }

          case 'previous': {
            const currentIndex = callbacksRef.current.getCurrentUnitIndex();
            
            if (currentIndex === null) {
              return { success: false, error: 'Current unit index unknown' };
            }
            
            if (currentIndex <= 1) {
              return {
                success: false,
                error: "Cannot go to previous unit. You're already on the first unit.",
              };
            }
            
            callbacksRef.current.onPrevious();
            return { success: true };
          }

          case 'bookmark':
            callbacksRef.current.onBookmark();
            return { success: true };

          case 'removeBookmark':
            callbacksRef.current.onRemoveBookmark();
            return { success: true };

          case 'home':
            router.push('/');
            return { success: true };

          case 'goToUnit':
            if (params?.unitNumber) {
              const unitNumber = params.unitNumber;
              const totalUnits = callbacksRef.current.getTotalUnits();
              
              // Validate unit number
              if (unitNumber < 1) {
                return {
                  success: false,
                  error: `Unit number must be at least 1. You requested unit ${unitNumber}.`,
                };
              }
              
              if (unitNumber > totalUnits) {
                return {
                  success: false,
                  error: `Cannot go to unit ${unitNumber}. This book only has ${totalUnits} units.`,
                };
              }
              
              callbacksRef.current.onGoToUnit(unitNumber);
              return { success: true };
            }
            return { success: false, error: 'Unit number not specified' };

          default:
            return {
              success: false,
              error: `Unknown voice command: ${action}. Say "help" for available commands.`,
            };
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'An error occurred while executing the command';
        return { success: false, error: errorMessage };
      }
    },
    [router]
  );

  const handleError = useCallback((error: Error) => {
    console.error('Voice recognition error:', error);
    
    // Extract user-friendly message if available
    const userMessage = (error as any).userMessage || error.message;
    
    // Log error for debugging
    if (error.message.includes('permission')) {
      console.warn('Microphone permission issue. User needs to enable microphone access.');
    } else if (error.message.includes('network')) {
      console.warn('Network issue with speech recognition service.');
    }
    
    // Return error info for UI display
    return {
      message: userMessage,
      isPermissionError: error.message.includes('permission') || error.message.includes('not-allowed'),
      isNetworkError: error.message.includes('network'),
    };
  }, []);

  // Pause TTS when listening (if enabled in preferences)
  const pauseTtsIfNeeded = useCallback(() => {
    const prefs = getVoiceControlPreferences();
    if (prefs.pauseTtsWhenListening && callbacksRef.current.isPlaying()) {
      callbacksRef.current.onPause();
    }
  }, []);

  return {
    handleCommand,
    handleError,
    pauseTtsIfNeeded,
    isEnabled: isVoiceControlEnabled(),
  };
}

