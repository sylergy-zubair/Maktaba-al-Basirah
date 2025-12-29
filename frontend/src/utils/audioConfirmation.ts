/**
 * Audio Confirmation Utility
 * Plays a brief beep sound to confirm command recognition
 */

/**
 * Play a brief confirmation beep sound
 * Uses Web Audio API to generate a simple tone
 */
export function playConfirmationSound(): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure the beep sound (short, pleasant tone)
    oscillator.frequency.value = 800; // 800 Hz tone
    oscillator.type = 'sine'; // Smooth sine wave
    
    // Create a short envelope (fade in/out)
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01); // Quick fade in
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1); // Fade out
    
    oscillator.start(now);
    oscillator.stop(now + 0.1); // 100ms duration

    // Clean up after the sound finishes
    oscillator.onended = () => {
      audioContext.close();
    };
  } catch (error) {
    // Silently fail if audio context creation fails (e.g., autoplay restrictions)
    console.debug('Could not play confirmation sound:', error);
  }
}

/**
 * Play an error sound (different tone)
 */
export function playErrorSound(): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Lower, more urgent tone for errors
    oscillator.frequency.value = 400; // 400 Hz tone
    oscillator.type = 'sawtooth'; // More harsh sound
    
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    oscillator.start(now);
    oscillator.stop(now + 0.15);

    oscillator.onended = () => {
      audioContext.close();
    };
  } catch (error) {
    console.debug('Could not play error sound:', error);
  }
}

