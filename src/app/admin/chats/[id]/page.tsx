'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.scss';

interface ChatMessage {
  id: number;
  content: string;
  role: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  sessionId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  userAgent?: string;
  ipAddress?: string;
  startedAt: string;
  endedAt?: string;
  messages: ChatMessage[];
  messageCount: number;
  duration?: number;
}

interface SessionResponse {
  session: ChatSession;
}

export default function ChatSessionDetailPage() {
  const params = useParams();
  const [session, setSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/chats/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Sesja czatu nie została znaleziona');
          } else {
            throw new Error('Błąd podczas pobierania sesji');
          }
          return;
        }

        const data: SessionResponse = await response.json();
        setSession(data.session);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Wystąpił błąd');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchSession();
    }
  }, [params.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'Nieznany';
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const getRoleClass = (role: string) => {
    switch (role) {
      case 'user': return styles.userMessage;
      case 'assistant': return styles.assistantMessage;
      case 'system': return styles.systemMessage;
      default: return styles.unknownMessage;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Ładowanie sesji czatu...</div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          {error || 'Sesja nie została znaleziona'}
        </div>
        <div className={styles.actions}>
          <Link href="/admin/chats" className={styles.backButton}>
            ← Powrót do listy
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.navigation}>
          <Link href="/admin/chats" className={styles.backButton}>
            ← Powrót do listy
          </Link>
        </div>
        
        <h1 className={styles.title}>Szczegóły sesji czatu</h1>
      </div>

      <div className={styles.sessionInfo}>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>Informacje o użytkowniku</h3>
            <div className={styles.infoContent}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Imię:</span>
                <span className={styles.value}>{session.userName || 'Nie podano'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Email:</span>
                <span className={styles.value}>{session.userEmail || 'Nie podano'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Telefon:</span>
                <span className={styles.value}>{session.userPhone || 'Nie podano'}</span>
              </div>
            </div>
          </div>

          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>Informacje o sesji</h3>
            <div className={styles.infoContent}>
              <div className={styles.infoRow}>
                <span className={styles.label}>ID sesji:</span>
                <span className={styles.value}>{session.sessionId}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Rozpoczęto:</span>
                <span className={styles.value}>{formatDate(session.startedAt)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Zakończono:</span>
                <span className={styles.value}>
                  {session.endedAt ? formatDate(session.endedAt) : 'W trakcie'}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Czas trwania:</span>
                <span className={styles.value}>{formatDuration(session.duration)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Liczba wiadomości:</span>
                <span className={styles.value}>{session.messageCount}</span>
              </div>
            </div>
          </div>

          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>Informacje techniczne</h3>
            <div className={styles.infoContent}>
              <div className={styles.infoRow}>
                <span className={styles.label}>IP:</span>
                <span className={styles.value}>{session.ipAddress || 'Nieznany'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>User Agent:</span>
                <span className={styles.value}>
                  {session.userAgent ? (
                    <span className={styles.userAgent}>{session.userAgent}</span>
                  ) : (
                    'Nieznany'
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.messagesSection}>
        <h2 className={styles.messagesTitle}>
          Konwersacja ({session.messageCount} wiadomości)
        </h2>
        
        {session.messages.length === 0 ? (
          <div className={styles.noMessages}>
            Brak wiadomości w tej sesji
          </div>
        ) : (
          <div className={styles.messagesContainer}>
            {session.messages.map((message, index) => (
              <div 
                key={message.id || index} 
                className={`${styles.message} ${getRoleClass(message.role)}`}
              >
                <div className={styles.messageWrapper}>
                  <div className={styles.messageSender}>
                    {message.role === 'user' ? 'Użytkownik' : 'SeBot'}
                  </div>
                  <div className={styles.messageContent}>
                    {message.content}
                  </div>
                  <div className={styles.messageTime}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
