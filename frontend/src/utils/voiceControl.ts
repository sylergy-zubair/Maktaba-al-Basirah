/**
 * Voice Control Utilities
 * Browser detection and feature flag management for voice control functionality
 */

/**
 * Check if Web Speech API is supported in the current browser
 */
export function isVoiceControlSupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

/**
 * Check if the current browser is Chrome or Edge
 * These browsers have the best support for Web Speech API
 */
export function isChromeOrEdge(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const userAgent = navigator.userAgent;
  return (
    (/Chrome/.test(userAgent) && !/Edge/.test(userAgent)) ||
    /Edg/.test(userAgent)
  );
}

/**
 * Check if voice control should be available
 * Requires both API support and Chrome/Edge browser
 */
export function isVoiceControlAvailable(): boolean {
  return isVoiceControlSupported() && isChromeOrEdge();
}

/**
 * Voice control preferences stored in localStorage
 */
export interface VoiceControlPreferences {
  enabled: boolean;
  language: 'bn-en' | 'en'; // 'bn-en' = Bengali + English, 'en' = English only
  pushToTalkKey: string; // Default: 'v'
  pauseTtsWhenListening: boolean;
  audioConfirmation: boolean;
}

const DEFAULT_PREFERENCES: VoiceControlPreferences = {
  enabled: false,
  language: 'bn-en',
  pushToTalkKey: 'space',
  pauseTtsWhenListening: true,
  audioConfirmation: true,
};

const STORAGE_KEY = 'voiceControlPreferences';

/**
 * Get voice control preferences from localStorage
 */
export function getVoiceControlPreferences(): VoiceControlPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading voice control preferences:', error);
  }

  return DEFAULT_PREFERENCES;
}

/**
 * Save voice control preferences to localStorage
 */
export function saveVoiceControlPreferences(
  preferences: Partial<VoiceControlPreferences>
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const current = getVoiceControlPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving voice control preferences:', error);
  }
}

/**
 * Check if voice control is enabled and available
 */
export function isVoiceControlEnabled(): boolean {
  const prefs = getVoiceControlPreferences();
  return prefs.enabled && isVoiceControlAvailable();
}

