'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.scss';

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
  messageCount: number;
  lastMessage?: {
    content: string;
    timestamp: string;
  };
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ChatsResponse {
  sessions: ChatSession[];
  pagination: PaginationInfo;
}

export default function AdminChatsPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSessions = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search })
      });

      const response = await fetch(`/api/admin/chats?${params}`);
      if (!response.ok) {
        throw new Error('Błąd podczas pobierania sesji');
      }

      const data: ChatsResponse = await response.json();
      setSessions(data.sessions);
      setPagination(data.pagination);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions(1, '');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSessions(1, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    fetchSessions(newPage, searchTerm);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL');
  };

  const formatDuration = (startedAt: string, endedAt?: string) => {
    if (!endedAt) return 'W trakcie';
    
    const start = new Date(startedAt);
    const end = new Date(endedAt);
    const diffMinutes = Math.round((end.getTime() - start.getTime()) / 1000 / 60);
    
    if (diffMinutes < 1) return '< 1 min';
    if (diffMinutes < 60) return `${diffMinutes} min`;
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}min`;
  };

  if (loading && sessions.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Ładowanie sesji czatu...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Archiwum Chatów</h1>
        <p className={styles.subtitle}>
          Przeglądaj i analizuj konwersacje z chatbotem
        </p>
      </div>

      <div className={styles.controls}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Szukaj po nazwie, emailu lub ID sesji..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            Szukaj
          </button>
        </form>

        {pagination && (
          <div className={styles.stats}>
            Znaleziono {pagination.totalCount} sesji
          </div>
        )}
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {sessions.length === 0 && !loading ? (
        <div className={styles.noData}>
          Nie znaleziono sesji czatu
        </div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th>Użytkownik</th>
                  <th>Email</th>
                  <th>Rozpoczęto</th>
                  <th>Czas trwania</th>
                  <th>Wiadomości</th>
                  <th>Ostatnia wiadomość</th>
                  <th>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className={styles.row}>
                    <td className={styles.cell}>
                      <div className={styles.userInfo}>
                        <div className={styles.userName}>
                          {session.userName || 'Anonim'}
                        </div>
                        <div className={styles.sessionId}>
                          ID: {session.sessionId.substring(0, 8)}...
                        </div>
                      </div>
                    </td>
                    <td className={styles.cell}>
                      {session.userEmail || '-'}
                    </td>
                    <td className={styles.cell}>
                      {formatDate(session.startedAt)}
                    </td>
                    <td className={styles.cell}>
                      <span className={`${styles.duration} ${!session.endedAt ? styles.active : ''}`}>
                        {formatDuration(session.startedAt, session.endedAt)}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.messageCount}>
                        {session.messageCount}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <div className={styles.lastMessage}>
                        {session.lastMessage?.content || 'Brak wiadomości'}
                      </div>
                    </td>
                    <td className={styles.cell}>
                      <Link 
                        href={`/admin/chats/${session.id}`}
                        className={styles.viewButton}
                      >
                        Zobacz szczegóły
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrev || loading}
                className={styles.pageButton}
              >
                Poprzednia
              </button>
              
              <span className={styles.pageInfo}>
                Strona {pagination.currentPage} z {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext || loading}
                className={styles.pageButton}
              >
                Następna
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
