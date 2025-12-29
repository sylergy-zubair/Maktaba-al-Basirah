'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import styles from './page.module.css';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main role="main" className={styles.main}>
      <h1>Register</h1>
      
      <form onSubmit={handleSubmit} aria-label="Registration form" className={styles.form}>
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
            Password (minimum 6 characters)
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              aria-required="true"
              minLength={6}
            />
          </label>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword">
            Confirm Password
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              aria-required="true"
            />
          </label>
        </div>

        <button type="submit" disabled={isLoading} className={styles.submitButton}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <div className={styles.links}>
        <p>
          Already have an account? <Link href="/login">Login here</Link>
        </p>
        <Link href="/" className={styles.backLink}>Back to home</Link>
      </div>
    </main>
  );
}

