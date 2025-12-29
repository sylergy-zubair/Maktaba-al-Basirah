/**
 * Browser TTS Utility
 * Uses Web Speech API SpeechSynthesis for text-to-speech
 */

export interface TTSOptions {
  lang?: string;      // Default: 'ar-SA' for Arabic
  rate?: number;      // Default: 1.0 (0.1 - 10)
  pitch?: number;     // Default: 1.0 (0 - 2)
  volume?: number;    // Default: 1.0 (0 - 1)
}

/**
 * Check if browser TTS (SpeechSynthesis) is supported
 */
export function isBrowserTTSSupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return 'speechSynthesis' in window;
}

/**
 * Read text aloud using browser's built-in SpeechSynthesis API
 */
export function speakText(text: string, options?: TTSOptions): void {
  if (!isBrowserTTSSupported()) {
    console.warn('SpeechSynthesis not supported in this browser');
    return;
  }

  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set options with defaults
    utterance.lang = options?.lang || 'ar-SA'; // Arabic (Saudi Arabia)
    utterance.rate = options?.rate ?? 1.0;
    utterance.pitch = options?.pitch ?? 1.0;
    utterance.volume = options?.volume ?? 1.0;

    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('Error speaking text:', error);
  }
}

/**
 * Stop any ongoing speech
 */
export function stopSpeaking(): void {
  if (isBrowserTTSSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }
}


