'use client'
import React, { useState } from 'react';
import styles from './page.module.scss';
import Loader from '@/components/Loader/Loader';
import { GoBackBtn } from '@/components/GoBackBtn/GoBackBtn';
import { useRouter } from 'next/navigation';
import { convertToManualAudit } from '@/app/actions/convert-to-manual-audit';

interface AuditRow {
  id: string;
  email: string;
  url: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  totalIssuesCount: number | null;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();

  const handleConvertToManual = async (id: string) => {
    try {
      const confirmConvert = window.confirm('Czy na pewno chcesz utworzyć audyt manualny na podstawie tego audytu automatycznego?');
      
      if (!confirmConvert) {
        return;
      }

      const result = await convertToManualAudit(id);
      if (result?.id) {
        alert('Pomyślnie utworzono audyt manualny');
        router.push(`/admin/manual-audits/edit/${result.id}`);
      } else {
        alert('Wystąpił błąd podczas tworzenia audytu manualnego');
      }
    } catch (error) {
      console.error('Błąd podczas konwersji audytu:', error);
      alert('Wystąpił błąd podczas tworzenia audytu manualnego');
    }
  };

  const handleDelete = async (id: string) => {
    // Ask for confirmation before deleting
    const confirmDelete = window.confirm('Czy na pewno chcesz usunąć ten audyt?');
    
    if (!confirmDelete) {
      return; // If user cancels, don't proceed with deletion
    }

    try {
      const res = await fetch(`/api/admin-audits/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAudits(audits => audits.filter(a => a.id !== id));
      } else {
        alert('Nie udało się usunąć rekordu.');
      }
    } catch (e) {
      alert('Błąd sieci przy usuwaniu rekordu.');
    }
  }

  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [auditsLoaded, setAuditsLoaded] = useState(false);
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    setAuditsLoaded(false);
    fetch('/api/admin-audits')
      .then(res => res.json())
      .then(data => {
        setAudits(data);
        setAuditsLoaded(true);
      })
      .catch(() => setAuditsLoaded(true));
  }, []);

  // Sortowanie
  const [sortBy, setSortBy] = useState<'email' | 'url' | 'totalIssuesCount' | 'status' | 'createdAt'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  // Filtrowanie wyników
  const filteredAudits = audits.filter(audit => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (audit.email && audit.email.toLowerCase().includes(q)) ||
      (audit.url && audit.url.toLowerCase().includes(q)) ||
      (audit.status && audit.status.toLowerCase().includes(q))
    );
  });

  // Sortowanie wyników
  const sortedAudits = [...filteredAudits].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    if (sortBy === 'totalIssuesCount') {
      aValue = aValue ?? -1;
      bValue = bValue ?? -1;
    }
    if (sortBy === 'createdAt') {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue).getTime() : 0;
    }
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const cmp = aValue.localeCompare(bValue);
      return sortDir === 'asc' ? cmp : -cmp;
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDir === 'asc' ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  if (!auditsLoaded) {
    return <Loader />;
  }

  return (
      <div className={styles.page}>
     <GoBackBtn href="/admin" text="Powrót" />
        <div className={styles.headerContainer}>
          <h1 className={styles.title}>Audyty Automatyczne</h1>
          <div className={styles.searchBar}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Szukaj po email, url lub status..."
              className={styles.searchInput}
            />
          </div>
        </div>
        <div className={styles.auditTableContainer}>
          <table className={styles.auditTable}>
            <thead className={styles.auditHead}>
              <tr>
                <th className={styles.auditCell + ' ' + styles.sortable} onClick={() => handleSort('email')}>
                  Email {sortBy === 'email' && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className={styles.auditCell + ' ' + styles.sortable} onClick={() => handleSort('url')}>
                  URL {sortBy === 'url' && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className={styles.auditCell + ' ' + styles.sortable} onClick={() => handleSort('totalIssuesCount')}>
                  Wynik audytu {sortBy === 'totalIssuesCount' && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className={styles.auditCell + ' ' + styles.sortable} onClick={() => handleSort('status')}>
                  Status {sortBy === 'status' && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className={styles.auditCell + ' ' + styles.sortable} onClick={() => handleSort('createdAt')}>
                  Data {sortBy === 'createdAt' && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className={styles.auditCell + ' ' + styles.actionsHeader}></th>
              </tr>
            </thead>
            <tbody>
              {sortedAudits.map(audit => (
                <tr
                  key={audit.id}
                  className={styles.auditRow}
                >
                  <td className={styles.auditCell} onClick={() => router.push(`/admin/auto-audits/${audit.id}`)}>{audit.email}</td>
                  <td className={styles.auditCell} onClick={() => router.push(`/admin/auto-audits/${audit.id}`)}>
                    <a href={audit.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className={styles.urlLink}>
                      {audit.url}
                    </a>
                  </td>
                  <td className={styles.auditCell} onClick={() => router.push(`/admin/auto-audits/${audit.id}`)}>
                    {audit.status === 'failed' ? (
                      <span className={styles.errorMessage}>
                        Błąd audytu
                      </span>
                    ) : typeof audit.totalIssuesCount === 'number' ? (
                      <span className={styles.auditResult}>
                        {audit.totalIssuesCount} problemów
                      </span>
                    ) : (
                      <span className={styles.noData}>Brak danych</span>
                    )}
                  </td>
                  <td className={`${styles.auditCell} ${styles.auditStatus} ${styles[audit.status]}`} onClick={() => router.push(`/admin/auto-audits/${audit.id}`)}>
                    {
                    audit.status === 'completed' ? '✅' :
                    audit.status === 'failed' ? '⛔' :
                    audit.status === 'pending' ? '⏳' :
                    audit.status === 'in-progress' ? '🔄' :
                    audit.status
                  }</td>
                  <td className={styles.auditCell} onClick={() => router.push(`/admin/auto-audits/${audit.id}`)}>{audit.createdAt ? new Date(audit.createdAt).toLocaleString() : ''}</td>
                  <td className={styles.auditCell + ' ' + styles.actionsCell} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.actionButtons}>
                      <button
                        type="button"
                        title="Wykonaj audyt manualny"
                        className={styles.convertBtn}
                        onClick={e => { e.stopPropagation(); handleConvertToManual(audit.id); }}
                        aria-label={`Wykonaj audyt manualny dla ${audit.url}`}
                      >
                        📝
                      </button>
                      <button
                        type="button"
                        title="Usuń rekord"
                        className={styles.deleteBtn}
                        onClick={e => { e.stopPropagation(); handleDelete(audit.id); }}
                        aria-label={`Usuń audyt ${audit.email}`}
                      >
                        ❌
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
};

