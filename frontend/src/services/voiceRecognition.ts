/**
 * Voice Recognition Service
 * Wrapper around Web Speech API for voice command recognition
 */

export interface RecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export type RecognitionEventCallback = (result: RecognitionResult) => void;
export type RecognitionErrorCallback = (error: Error) => void;

const LANGUAGE_CONFIG = {
  'bn-en': 'bn-BD,en-US', // Bengali (Bangladesh) + English (US)
  'en': 'en-US', // English (US) only
} as const;

export class VoiceRecognitionService {
  private recognition: any; // SpeechRecognition or webkitSpeechRecognition
  private isListening: boolean = false;
  private language: 'bn-en' | 'en' = 'bn-en';
  private onResultCallback?: RecognitionEventCallback;
  private onErrorCallback?: RecognitionErrorCallback;
  private onEndCallback?: () => void;

  constructor() {
    if (typeof window === 'undefined') {
      throw new Error('VoiceRecognitionService can only be used in browser environment');
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      throw new Error('Speech Recognition API not supported in this browser');
    }

    this.recognition = new SpeechRecognition();
    this.setupRecognition();
  }

  private setupRecognition(): void {
    // Continuous recognition disabled for better command handling
    this.recognition.continuous = false;
    
    // Get interim results for better UX
    this.recognition.interimResults = true;
    
    // Maximum alternatives to consider
    this.recognition.maxAlternatives = 1;

    // Set up event handlers
    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      const resultIndex = event.resultIndex;
      const result = event.results[resultIndex];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence || 0;
      const isFinal = result.isFinal;

      if (this.onResultCallback) {
        this.onResultCallback({
          transcript: transcript.trim(),
          confidence,
          isFinal,
        });
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      
      let errorMessage = 'Speech recognition error occurred';
      let userFriendlyMessage = errorMessage;
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected';
          userFriendlyMessage = 'No speech detected. Please try speaking your command again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not found or not accessible';
          userFriendlyMessage = 'Microphone not found or not accessible. Please check your microphone connection.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied';
          userFriendlyMessage = 'Microphone access required. Please enable microphone permission in your browser settings and refresh the page.';
          break;
        case 'network':
          errorMessage = 'Network error occurred';
          userFriendlyMessage = 'Network error occurred. Please check your internet connection and try again.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech recognition service not allowed';
          userFriendlyMessage = 'Speech recognition service not available. Please try again or check your browser settings.';
          break;
        case 'bad-grammar':
          errorMessage = 'Grammar error';
          userFriendlyMessage = 'Grammar error. Please try speaking your command again.';
          break;
        case 'language-not-supported':
          errorMessage = 'Language not supported';
          userFriendlyMessage = 'Selected language not supported. Please change your language setting.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
          userFriendlyMessage = 'Voice recognition error occurred. Please try again.';
      }

      if (this.onErrorCallback) {
        // Create error with both technical and user-friendly messages
        const error = new Error(errorMessage);
        (error as any).userMessage = userFriendlyMessage;
        this.onErrorCallback(error);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };
  }

  /**
   * Set the recognition language
   */
  setLanguage(language: 'bn-en' | 'en'): void {
    this.language = language;
    this.recognition.lang = LANGUAGE_CONFIG[language];
  }

  /**
   * Get current language setting
   */
  getLanguage(): 'bn-en' | 'en' {
    return this.language;
  }

  /**
   * Set callback for recognition results
   */
  onResult(callback: RecognitionEventCallback): void {
    this.onResultCallback = callback;
  }

  /**
   * Set callback for recognition errors
   */
  onError(callback: RecognitionErrorCallback): void {
    this.onErrorCallback = callback;
  }

  /**
   * Set callback for when recognition ends
   */
  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  /**
   * Start recognition
   */
  start(): void {
    if (this.isListening) {
      return;
    }

    try {
      this.recognition.start();
    } catch (error) {
      // Recognition may already be starting
      if (this.onErrorCallback) {
        this.onErrorCallback(
          error instanceof Error
            ? error
            : new Error('Failed to start recognition')
        );
      }
    }
  }

  /**
   * Stop recognition
   */
  stop(): void {
    if (!this.isListening) {
      return;
    }

    try {
      this.recognition.stop();
    } catch (error) {
      // Ignore stop errors
    }
  }

  /**
   * Abort recognition
   */
  abort(): void {
    try {
      this.recognition.abort();
    } catch (error) {
      // Ignore abort errors
    }
    this.isListening = false;
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }
}

