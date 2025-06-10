'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.scss';
import { Button } from '@/components/atoms/Button/Button';
import Loader from '@/components/Loader/Loader';

export default function AdminLoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check if already logged in
  useEffect(() => {
    let ignore = false;
    setCheckingSession(true);
    
    fetch('/api/admin-session')
      .then(res => res.json())
      .then(data => {
        if (!ignore && data.valid) {
          // Already logged in, redirect to admin panel
          router.replace('/admin');
        }
        setCheckingSession(false);
      })
      .catch(() => setCheckingSession(false));
      
    return () => { ignore = true; };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
        credentials: 'include',
        cache: 'no-store'
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Redirect to admin panel
        router.push('/admin');
      } else {
        setError(data.error || 'Nieprawidłowy login lub hasło');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Błąd połączenia z serwerem');
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return <Loader />;
  }

  return (
    <div className={styles.loginPage}>
      <form className={styles.loginForm} onSubmit={handleSubmit} action="#" method="dialog" autoComplete="off">
        <h2 className={styles.title}>Panel administratora</h2>
        <div className={styles.fieldGroup}>
          <input
            id="login"
            type="text"
            placeholder="Login"
            className={styles.input}
            value={login}
            onChange={e => setLogin(e.target.value)}
            autoFocus
            autoComplete="username"
            disabled={isLoading}
          />
        </div>
        <div className={styles.fieldGroup}>
          <input
            id="password"
            type="password"
            placeholder="Password"
            className={styles.input}
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={isLoading}
          />
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <Button type="submit" className={styles.button} disabled={isLoading}>
          {isLoading ? 'Logowanie...' : 'Zaloguj się'}
        </Button>
      </form>
    </div>
  );
}
