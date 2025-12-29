'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import styles from './page.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main role="main" className={styles.main}>
      <h1>Login</h1>
      
      <form onSubmit={handleSubmit} aria-label="Login form" className={styles.form}>
        {error && (
          <div role="alert" aria-live="polite" className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="email">
            Email
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              aria-required="true"
            />
          </label>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">
            Password
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              aria-required="true"
            />
          </label>
        </div>

        <button type="submit" disabled={isLoading} className={styles.submitButton}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className={styles.links}>
        <p>
          Don't have an account? <Link href="/register">Register here</Link>
        </p>
        <Link href="/" className={styles.backLink}>Back to home</Link>
      </div>
    </main>
  );
}

