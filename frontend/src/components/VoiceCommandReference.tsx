'use client';

import { useState } from 'react';
import styles from './VoiceCommandReference.module.css';

export default function VoiceCommandReference() {
  const [language, setLanguage] = useState<'both' | 'english' | 'bengali'>(
    'both'
  );

  const englishCommands = [
    {
      category: 'Audio Controls',
      commands: [
        { action: 'Play', phrases: ['play', 'start', 'resume'] },
        { action: 'Pause', phrases: ['pause', 'stop'] },
      ],
    },
    {
      category: 'Navigation',
      commands: [
        { action: 'Next', phrases: ['next', 'next unit', 'next chapter', 'forward'] },
        {
          action: 'Previous',
          phrases: ['previous', 'prev', 'back', 'backward', 'last'],
        },
        {
          action: 'Go to Unit',
          phrases: ['go to unit 5', 'unit 5', 'chapter 5'],
        },
        { action: 'Home', phrases: ['home', 'back to books', 'books', 'library'] },
      ],
    },
    {
      category: 'Bookmarks',
      commands: [
        { action: 'Bookmark', phrases: ['bookmark', 'save', 'mark'] },
        {
          action: 'Remove Bookmark',
          phrases: ['remove bookmark', 'unbookmark', 'delete bookmark'],
        },
      ],
    },
  ];

  const bengaliCommands = [
    {
      category: 'Audio Controls',
      commands: [
        { action: 'Play', phrases: ['চালাও', 'চালান', 'শুরু কর'] },
        { action: 'Pause', phrases: ['থামাও', 'থামান', 'বন্ধ কর'] },
      ],
    },
    {
      category: 'Navigation',
      commands: [
        { action: 'Next', phrases: ['পরবর্তী', 'আগামী', 'সামনে'] },
        { action: 'Previous', phrases: ['পূর্ববর্তী', 'পিছনে', 'গত'] },
        { action: 'Go to Unit', phrases: ['ইউনিটে যাও ৫', 'অধ্যায় ৫'] },
        { action: 'Home', phrases: ['বাড়ি', 'হোম', 'বই'] },
      ],
    },
    {
      category: 'Bookmarks',
      commands: [
        { action: 'Bookmark', phrases: ['বুকমার্ক', 'সংরক্ষণ', 'মার্ক'] },
        { action: 'Remove Bookmark', phrases: ['বুকমার্ক সরাও', 'অসংরক্ষণ'] },
      ],
    },
  ];

  const showEnglish = language === 'both' || language === 'english';
  const showBengali = language === 'both' || language === 'bengali';

  return (
    <div className={styles.referenceContainer} dir="ltr">
      <div className={styles.header}>
        <h2 className={styles.title}>Voice Command Reference</h2>
        <div className={styles.languageFilter}>
          <button
            className={`${styles.filterButton} ${
              language === 'both' ? styles.active : ''
            }`}
            onClick={() => setLanguage('both')}
          >
            Both
          </button>
          <button
            className={`${styles.filterButton} ${
              language === 'english' ? styles.active : ''
            }`}
            onClick={() => setLanguage('english')}
          >
            English
          </button>
          <button
            className={`${styles.filterButton} ${
              language === 'bengali' ? styles.active : ''
            }`}
            onClick={() => setLanguage('bengali')}
          >
            Bengali
          </button>
        </div>
      </div>

      <div className={styles.instructions}>
        <p>
          <strong>How to use:</strong> Hold the push-to-talk button (or press
          and hold the V key), speak your command, then release.
        </p>
      </div>

      {showEnglish && (
        <div className={styles.commandSection}>
          <h3 className={styles.sectionTitle}>English Commands</h3>
          {englishCommands.map((category, idx) => (
            <div key={`en-${idx}`} className={styles.category}>
              <h4 className={styles.categoryTitle}>{category.category}</h4>
              <div className={styles.commandsList}>
                {category.commands.map((cmd, cmdIdx) => (
                  <div key={`en-cmd-${idx}-${cmdIdx}`} className={styles.command}>
                    <div className={styles.commandAction}>{cmd.action}:</div>
                    <div className={styles.commandPhrases}>
                      {cmd.phrases.map((phrase, phraseIdx) => (
                        <span key={`en-phrase-${idx}-${cmdIdx}-${phraseIdx}`} className={styles.phrase}>
                          &quot;{phrase}&quot;
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showBengali && (
        <div className={styles.commandSection}>
          <h3 className={styles.sectionTitle}>Bengali Commands (বাংলা)</h3>
          {bengaliCommands.map((category, idx) => (
            <div key={`bn-${idx}`} className={styles.category}>
              <h4 className={styles.categoryTitle}>{category.category}</h4>
              <div className={styles.commandsList}>
                {category.commands.map((cmd, cmdIdx) => (
                  <div key={`bn-cmd-${idx}-${cmdIdx}`} className={styles.command}>
                    <div className={styles.commandAction}>{cmd.action}:</div>
                    <div className={styles.commandPhrases}>
                      {cmd.phrases.map((phrase, phraseIdx) => (
                        <span key={`bn-phrase-${idx}-${cmdIdx}-${phraseIdx}`} className={styles.phrase}>
                          &quot;{phrase}&quot;
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.tips}>
        <h4 className={styles.tipsTitle}>Tips:</h4>
        <ul className={styles.tipsList}>
          <li>Speak clearly and at a normal pace</li>
          <li>You can use any of the phrases listed for each command</li>
          <li>For &quot;go to unit&quot;, say the number in your chosen language</li>
          <li>Make sure your microphone has permission in your browser settings</li>
        </ul>
      </div>
    </div>
  );
}

