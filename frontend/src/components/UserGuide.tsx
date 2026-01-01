'use client';

import { useEffect, useState } from 'react';
import styles from './UserGuide.module.css';

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

type Language = 'en' | 'bn';

interface GuideContent {
  title: string;
  closeLabel: string;
  gotIt: string;
  gettingStarted: {
    title: string;
    description: string;
  };
  keyboardNav: {
    title: string;
    items: Array<{ key: string; description: string }>;
  };
  voiceCommands: {
    title: string;
    description: string;
    commands: Array<{ label: string; examples: string }>;
    note: string;
  };
  audioPlayback: {
    title: string;
    items: string[];
  };
  bookmarks: {
    title: string;
    items: string[];
  };
  settings: {
    title: string;
    description: string;
    items: string[];
  };
  accessibility: {
    title: string;
    items: string[];
  };
  tips: {
    title: string;
    items: string[];
  };
}

const content: Record<Language, GuideContent> = {
  en: {
    title: 'User Guide - Maktabah Al-Basīrah',
    closeLabel: 'Close user guide',
    gotIt: 'Got it!',
    gettingStarted: {
      title: '📚 Getting Started',
      description: 'Welcome to Maktabah Al-Basīrah! This accessible reading platform helps you explore books with text-to-speech support, keyboard navigation, and voice commands.',
    },
    keyboardNav: {
      title: '⌨️ Keyboard Navigation',
      items: [
        { key: '← →', description: 'Navigate between books or units' },
        { key: '↑ ↓', description: 'Navigate up/down through items' },
        { key: 'Enter / Space', description: 'Select or open a book' },
        { key: 'J', description: 'Play/Pause audio playback' },
        { key: 'B', description: 'Toggle bookmark' },
        { key: 'Esc', description: 'Close dialogs or stop TTS' },
      ],
    },
    voiceCommands: {
      title: '🎤 Voice Commands',
      description: 'Hold the Voice button (or press and hold V key) while speaking your command:',
      commands: [
        { label: 'Play/Start:', examples: '"Play", "Start", "চালাও", "প্লে"' },
        { label: 'Pause/Stop:', examples: '"Pause", "Stop", "থামাও"' },
        { label: 'Next Unit:', examples: '"Next", "পরবর্তী"' },
        { label: 'Previous Unit:', examples: '"Previous", "পূর্ববর্তী"' },
        { label: 'Bookmark:', examples: '"Bookmark", "বুকমার্ক"' },
        { label: 'Go to Unit:', examples: '"Go to unit 5", "ইউনিটে যাও ৫"' },
      ],
      note: '💡 Voice commands support both English and Bengali (Bangla)',
    },
    audioPlayback: {
      title: '🔊 Audio Playback',
      items: [
        'Click the Play button or press J to start audio',
        'Audio is generated using text-to-speech technology',
        'First playback may take 10-15 seconds to generate',
        'Subsequent plays are instant (cached)',
        'Audio automatically pauses when you navigate to a new unit',
      ],
    },
    bookmarks: {
      title: '🔖 Bookmarks',
      items: [
        'Press B or use the bookmark button to save your reading position',
        'Bookmarks are saved automatically',
        'When you return to a book, you\'ll resume from your bookmark',
        'You can remove bookmarks from the bookmark button',
      ],
    },
    settings: {
      title: '⚙️ Settings',
      description: 'Access settings to configure:',
      items: [
        'Voice control preferences',
        'Voice command language (English/Bengali)',
        'Push-to-talk key configuration',
        'Audio confirmation sounds',
      ],
    },
    accessibility: {
      title: '♿ Accessibility Features',
      items: [
        'Full keyboard navigation support',
        'Screen reader compatible (ARIA labels)',
        'High contrast design',
        'Automatic text-to-speech for book names',
        'Focus indicators for keyboard users',
      ],
    },
    tips: {
      title: '💡 Tips',
      items: [
        'Book names are automatically read aloud when you navigate with arrow keys',
        'Use voice commands for hands-free navigation',
        'Press Escape to stop any ongoing text-to-speech',
        'All features work with keyboard-only navigation',
      ],
    },
  },
  bn: {
    title: 'ব্যবহারকারী নির্দেশিকা - মাকতাবাহ আল-বাসীরাহ',
    closeLabel: 'ব্যবহারকারী নির্দেশিকা বন্ধ করুন',
    gotIt: 'বুঝেছি!',
    gettingStarted: {
      title: '📚 শুরু করা',
      description: 'মাকতাবাহ আল-বাসীরাহে স্বাগতম! এই অ্যাক্সেসযোগ্য পড়ার প্ল্যাটফর্ম আপনাকে পাঠ-থেকে-বক্তৃতা সমর্থন, কীবোর্ড নেভিগেশন এবং ভয়েস কমান্ড সহ বইগুলি অন্বেষণ করতে সহায়তা করে।',
    },
    keyboardNav: {
      title: '⌨️ কীবোর্ড নেভিগেশন',
      items: [
        { key: '← →', description: 'বই বা ইউনিটের মধ্যে নেভিগেট করুন' },
        { key: '↑ ↓', description: 'আইটেমের মধ্যে উপরে/নীচে নেভিগেট করুন' },
        { key: 'Enter / Space', description: 'একটি বই নির্বাচন করুন বা খুলুন' },
        { key: 'J', description: 'অডিও প্লেব্যাক চালু/বিরতি দিন' },
        { key: 'B', description: 'বুকমার্ক টগল করুন' },
        { key: 'Esc', description: 'ডায়ালগ বন্ধ করুন বা TTS বন্ধ করুন' },
      ],
    },
    voiceCommands: {
      title: '🎤 ভয়েস কমান্ড',
      description: 'আপনার কমান্ড বলার সময় ভয়েস বোতামটি ধরে রাখুন (বা V কী চেপে ধরে রাখুন):',
      commands: [
        { label: 'চালাও/শুরু:', examples: '"Play", "Start", "চালাও", "প্লে"' },
        { label: 'বিরতি/বন্ধ:', examples: '"Pause", "Stop", "থামাও"' },
        { label: 'পরবর্তী ইউনিট:', examples: '"Next", "পরবর্তী"' },
        { label: 'পূর্ববর্তী ইউনিট:', examples: '"Previous", "পূর্ববর্তী"' },
        { label: 'বুকমার্ক:', examples: '"Bookmark", "বুকমার্ক"' },
        { label: 'ইউনিটে যাও:', examples: '"Go to unit 5", "ইউনিটে যাও ৫"' },
      ],
      note: '💡 ভয়েস কমান্ড ইংরেজি এবং বাংলা (বাংলা) উভয়ই সমর্থন করে',
    },
    audioPlayback: {
      title: '🔊 অডিও প্লেব্যাক',
      items: [
        'অডিও শুরু করতে প্লে বোতামে ক্লিক করুন বা J চাপুন',
        'অডিও পাঠ-থেকে-বক্তৃতা প্রযুক্তি ব্যবহার করে তৈরি করা হয়',
        'প্রথম প্লেব্যাক তৈরি করতে ১০-১৫ সেকেন্ড সময় লাগতে পারে',
        'পরবর্তী প্লেগুলি তাৎক্ষণিক (ক্যাশ করা)',
        'আপনি একটি নতুন ইউনিটে নেভিগেট করলে অডিও স্বয়ংক্রিয়ভাবে বিরতি নেয়',
      ],
    },
    bookmarks: {
      title: '🔖 বুকমার্ক',
      items: [
        'আপনার পড়ার অবস্থান সংরক্ষণ করতে B চাপুন বা বুকমার্ক বোতাম ব্যবহার করুন',
        'বুকমার্কগুলি স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়',
        'আপনি যখন একটি বইতে ফিরে আসবেন, আপনি আপনার বুকমার্ক থেকে আবার শুরু করবেন',
        'আপনি বুকমার্ক বোতাম থেকে বুকমার্কগুলি সরাতে পারেন',
      ],
    },
    settings: {
      title: '⚙️ সেটিংস',
      description: 'কনফিগার করতে সেটিংসে অ্যাক্সেস করুন:',
      items: [
        'ভয়েস কন্ট্রোল পছন্দ',
        'ভয়েস কমান্ড ভাষা (ইংরেজি/বাংলা)',
        'পুশ-টু-টক কী কনফিগারেশন',
        'অডিও নিশ্চিতকরণ শব্দ',
      ],
    },
    accessibility: {
      title: '♿ অ্যাক্সেসিবিলিটি বৈশিষ্ট্য',
      items: [
        'সম্পূর্ণ কীবোর্ড নেভিগেশন সমর্থন',
        'স্ক্রিন রিডার সামঞ্জস্যপূর্ণ (ARIA লেবেল)',
        'উচ্চ কনট্রাস্ট ডিজাইন',
        'বইয়ের নামের জন্য স্বয়ংক্রিয় পাঠ-থেকে-বক্তৃতা',
        'কীবোর্ড ব্যবহারকারীদের জন্য ফোকাস সূচক',
      ],
    },
    tips: {
      title: '💡 টিপস',
      items: [
        'আপনি তীর চাবি দিয়ে নেভিগেট করলে বইয়ের নামগুলি স্বয়ংক্রিয়ভাবে জোরে পড়া হয়',
        'হাত-মুক্ত নেভিগেশনের জন্য ভয়েস কমান্ড ব্যবহার করুন',
        'কোনও চলমান পাঠ-থেকে-বক্তৃতা বন্ধ করতে Escape চাপুন',
        'সমস্ত বৈশিষ্ট্য শুধুমাত্র কীবোর্ড নেভিগেশনের সাথে কাজ করে',
      ],
    },
  },
};

export default function UserGuide({ isOpen, onClose }: UserGuideProps) {
  const [language, setLanguage] = useState<Language>('en');
  const guideContent = content[language];
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className={styles.overlay} 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-guide-title"
    >
      <div 
        className={styles.modal} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id="user-guide-title">{guideContent.title}</h2>
          <div className={styles.headerControls}>
            <div className={styles.languageToggle}>
              <button
                onClick={() => setLanguage('en')}
                className={`${styles.langButton} ${language === 'en' ? styles.active : ''}`}
                aria-label="Switch to English"
                aria-pressed={language === 'en'}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('bn')}
                className={`${styles.langButton} ${language === 'bn' ? styles.active : ''}`}
                aria-label="Switch to Bengali"
                aria-pressed={language === 'bn'}
              >
                বাংলা
              </button>
            </div>
            <button 
              onClick={onClose}
              className={styles.closeButton}
              aria-label={guideContent.closeLabel}
            >
              ✕
            </button>
          </div>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h3>{guideContent.gettingStarted.title}</h3>
            <p>{guideContent.gettingStarted.description}</p>
          </section>

          <section className={styles.section}>
            <h3>{guideContent.keyboardNav.title}</h3>
            <div className={styles.featureGrid}>
              {guideContent.keyboardNav.items.map((item, index) => (
                <div key={index} className={styles.featureCard}>
                  <div className={styles.key}>{item.key}</div>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h3>{guideContent.voiceCommands.title}</h3>
            <p>{guideContent.voiceCommands.description}</p>
            <div className={styles.commandList}>
              {guideContent.voiceCommands.commands.map((cmd, index) => (
                <div key={index} className={styles.commandItem}>
                  <strong>{cmd.label}</strong> {cmd.examples}
                </div>
              ))}
            </div>
            <p className={styles.note}>{guideContent.voiceCommands.note}</p>
          </section>

          <section className={styles.section}>
            <h3>{guideContent.audioPlayback.title}</h3>
            <ul className={styles.list}>
              {guideContent.audioPlayback.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className={styles.section}>
            <h3>{guideContent.bookmarks.title}</h3>
            <ul className={styles.list}>
              {guideContent.bookmarks.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className={styles.section}>
            <h3>{guideContent.settings.title}</h3>
            <p>{guideContent.settings.description}</p>
            <ul className={styles.list}>
              {guideContent.settings.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className={styles.section}>
            <h3>{guideContent.accessibility.title}</h3>
            <ul className={styles.list}>
              {guideContent.accessibility.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className={styles.section}>
            <h3>{guideContent.tips.title}</h3>
            <ul className={styles.list}>
              {guideContent.tips.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <div className={styles.footer}>
          <button 
            onClick={onClose}
            className={styles.closeButtonLarge}
            autoFocus
          >
            {guideContent.gotIt}
          </button>
        </div>
      </div>
    </div>
  );
}

