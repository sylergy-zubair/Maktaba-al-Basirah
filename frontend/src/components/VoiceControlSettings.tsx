'use client';

import { useState, useEffect } from 'react';
import {
  getVoiceControlPreferences,
  saveVoiceControlPreferences,
  VoiceControlPreferences,
  isVoiceControlAvailable,
} from '@/utils/voiceControl';
import styles from './VoiceControlSettings.module.css';

interface VoiceControlSettingsProps {
  onClose?: () => void;
}

export default function VoiceControlSettings({
  onClose,
}: VoiceControlSettingsProps) {
  const [preferences, setPreferences] = useState<VoiceControlPreferences>(
    getVoiceControlPreferences()
  );
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    setIsAvailable(isVoiceControlAvailable());
  }, []);

  const updatePreference = (
    key: keyof VoiceControlPreferences,
    value: any
  ) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    saveVoiceControlPreferences({ [key]: value });
  };

  if (!isAvailable) {
    return (
      <div className={styles.settingsContainer}>
        <div className={styles.unavailableMessage}>
          <p>
            Voice control is not available in your browser. Please use Chrome or
            Edge for voice control support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.settingsContainer} dir="ltr">
      <h2 className={styles.settingsTitle}>Voice Control Settings</h2>

      <div className={styles.settingsSection}>
        <label className={styles.settingItem}>
          <input
            type="checkbox"
            checked={preferences.enabled}
            onChange={(e) => updatePreference('enabled', e.target.checked)}
            className={styles.checkbox}
          />
          <span className={styles.settingLabel}>Enable Voice Control</span>
        </label>
        <p className={styles.settingDescription}>
          Allow voice commands to control navigation and playback
        </p>
      </div>

      <div className={styles.settingsSection}>
        <label className={styles.settingLabel}>Command Language</label>
        <select
          value={preferences.language}
          onChange={(e) =>
            updatePreference('language', e.target.value as 'bn-en' | 'en')
          }
          className={styles.select}
          disabled={!preferences.enabled}
        >
          <option value="bn-en">Bengali + English</option>
          <option value="en">English Only</option>
        </select>
        <p className={styles.settingDescription}>
          Choose which languages to recognize for voice commands
        </p>
      </div>

      <div className={styles.settingsSection}>
        <label className={styles.settingLabel}>Push-to-Talk Key</label>
        <select
          value={preferences.pushToTalkKey}
          onChange={(e) => updatePreference('pushToTalkKey', e.target.value)}
          className={styles.select}
          disabled={!preferences.enabled}
        >
          <option value="space">Space (Default)</option>
          <option value="v">V</option>
          <option value="c">C</option>
          <option value="m">M (Microphone)</option>
        </select>
        <p className={styles.settingDescription}>
          Hold this key while speaking your command. Play/pause uses the J key.
        </p>
      </div>

      <div className={styles.settingsSection}>
        <label className={styles.settingItem}>
          <input
            type="checkbox"
            checked={preferences.pauseTtsWhenListening}
            onChange={(e) =>
              updatePreference('pauseTtsWhenListening', e.target.checked)
            }
            className={styles.checkbox}
            disabled={!preferences.enabled}
          />
          <span className={styles.settingLabel}>Pause TTS When Listening</span>
        </label>
        <p className={styles.settingDescription}>
          Automatically pause audio playback when voice recognition is active
        </p>
      </div>

      <div className={styles.settingsSection}>
        <label className={styles.settingItem}>
          <input
            type="checkbox"
            checked={preferences.audioConfirmation}
            onChange={(e) =>
              updatePreference('audioConfirmation', e.target.checked)
            }
            className={styles.checkbox}
            disabled={!preferences.enabled}
          />
          <span className={styles.settingLabel}>Audio Confirmation Sounds</span>
        </label>
        <p className={styles.settingDescription}>
          Play a brief sound when commands are recognized (optional)
        </p>
      </div>

      {onClose && (
        <div className={styles.actions}>
          <button onClick={onClose} className={styles.closeButton}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}

