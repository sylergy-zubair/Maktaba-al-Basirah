'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import VoiceControlSettings from '@/components/VoiceControlSettings';
import VoiceCommandReference from '@/components/VoiceCommandReference';
import { useState } from 'react';
import styles from './page.module.css';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'settings' | 'commands'>('settings');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main role="main" className={styles.main} dir="ltr">
      <header role="banner" className={styles.header}>
        <button onClick={() => router.push('/')} aria-label="Back to books">
          ← Back to Books
        </button>
        <h1>Settings</h1>
      </header>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'settings' ? styles.active : ''}`}
          onClick={() => setActiveTab('settings')}
          aria-selected={activeTab === 'settings'}
        >
          Voice Control Settings
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'commands' ? styles.active : ''}`}
          onClick={() => setActiveTab('commands')}
          aria-selected={activeTab === 'commands'}
        >
          Command Reference
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'settings' && <VoiceControlSettings />}
        {activeTab === 'commands' && <VoiceCommandReference />}
      </div>
    </main>
  );
}

