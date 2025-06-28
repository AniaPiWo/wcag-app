'use client'
import React, { useState, useEffect } from 'react';
import styles from './page.module.scss';
import { Button } from '@/components/atoms/Button/Button';
import Loader from '@/components/Loader/Loader';
import Link from 'next/link';

export default function ManualAuditsPage() {
  interface Audit {
    id: string;
    url: string;
    createdAt: string;
    selectedLevels: string;
    auditType: string;
    [key: string]: string | number;
  }

  const [audits, setAudits] = useState<Audit[]>([]);
  const [auditsLoaded, setAuditsLoaded] = useState(false);
  const [search, setSearch] = useState('');

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin-audits/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAudits(audits => audits.filter(a => a.id !== id));
      } else {
        alert('Nie udało się usunąć rekordu.');
      }
    } catch {
      alert('Błąd sieci przy usuwaniu rekordu.');
    }
  }

  useEffect(() => {
    setAuditsLoaded(false);
    fetch('/api/admin-manual-audits')
      .then(res => res.json())
      .then(data => {
        setAudits(data);
        setAuditsLoaded(true);
      })
      .catch(() => setAuditsLoaded(true));
  }, []);

  // Sortowanie
  const [sortBy, setSortBy] = useState<'url' | 'createdAt'>('createdAt');
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
    return (audit.url && audit.url.toLowerCase().includes(q));
  });

  // Sortowanie wyników
  const sortedAudits = [...filteredAudits].sort((a, b) => {
    let aValue: string | number = a[sortBy];
    let bValue: string | number = b[sortBy];
    
    if (sortBy === 'createdAt') {
      aValue = aValue ? new Date(aValue.toString()).getTime() : 0;
      bValue = bValue ? new Date(bValue.toString()).getTime() : 0;
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

  if (auditsLoaded) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Audyty Manualne</h1>
        <div className={styles.actionsContainer}>
          <div className={styles.searchBar}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Szukaj po URL..."
              className={styles.searchInput}
            />
          </div>
          <Link href="/admin/manual-audits/new" className={styles.newAuditLink}>
            <Button className={styles.newAuditButton}>Nowy audyt manualny</Button>
          </Link>
        </div>
        <div className={styles.auditTableContainer}>
          <table className={styles.auditTable}>
            <thead className={styles.auditHead}>
              <tr>
                <th className={styles.auditCell + ' ' + styles.sortable} onClick={() => handleSort('url')}>
                  URL {sortBy === 'url' && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className={styles.auditCell + ' ' + styles.sortable} onClick={() => handleSort('createdAt')}>
                  Data {sortBy === 'createdAt' && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className={styles.auditCell}>Poziomy audytu</th>
                <th className={styles.auditCell}>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {sortedAudits.length > 0 ? (
                sortedAudits.map(audit => (
                  <tr
                    key={audit.id}
                    className={styles.auditRow}
                  >
                    <td className={styles.auditCell} onClick={() => window.location.href = `/admin/${audit.id}`}>
                      <a href={audit.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className={styles.urlLink}>
                        {audit.url}
                      </a>
                    </td>
                    <td className={styles.auditCell} onClick={() => window.location.href = `/admin/${audit.id}`}>
                      {audit.createdAt ? new Date(audit.createdAt).toLocaleString() : ''}
                    </td>
                    <td className={styles.auditCell} onClick={() => window.location.href = `/admin/${audit.id}`}>
                      {audit.selectedLevels ? (
                        <div className={styles.levelsList}>
                          {JSON.parse(audit.selectedLevels).map((level: string) => {
                            // Determine completion status for this level
                            let completionStatus = 'notStarted';
                            const levelKey = level === 'podstawowy' ? 'basicAudit' : level === 'średni' ? 'intermediateAudit' : 'advancedAudit';
                            
                            if (audit[levelKey] && typeof audit[levelKey] === 'string') {
                              try {
                                const responses = JSON.parse(audit[levelKey] as string);
                                if (responses && responses.length > 0) {
                                  // Check if all questions have responses
                                  
                                  // If there are any responses, it's at least partially completed
                                  completionStatus = 'partiallyCompleted';
                                  
                                  // If all questions have responses, it's fully completed
                                  // This is an approximation since we don't have direct access to the audit items count here
                                  if (responses.length >= 10) { // Assuming each level has at least 10 questions
                                    completionStatus = 'completed';
                                  }
                                }
                              } catch (e) {
                                console.error(`Error parsing ${levelKey}:`, e);
                              }
                            }
                            
                            // Apply appropriate class based on completion status
                            const statusClass = 
                              completionStatus === 'completed' ? styles.levelCompleted :
                              completionStatus === 'partiallyCompleted' ? styles.levelPartial :
                              styles.levelNotStarted;
                            
                            return (
                              <span key={level} className={`${styles.levelBadge} ${statusClass}`}>{level}</span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className={styles.noData}>Brak danych</span>
                      )}
                    </td>
                    <td className={styles.auditCell + ' ' + styles.actionsCell}>
                      <div className={styles.actionButtons}>
                        <Link 
                          href={`/admin/manual-audits/edit/${audit.id}`}
                          className={styles.editBtn}
                          onClick={e => e.stopPropagation()}
                          title="Edytuj audyt"
                          aria-label={`Edytuj audyt ${audit.url}`}
                        >
                          ✏️
                        </Link>
                        <button
                          type="button"
                          title="Usuń rekord"
                          className={styles.deleteBtn}
                          onClick={e => { e.stopPropagation(); handleDelete(audit.id); }}
                          aria-label={`Usuń audyt ${audit.url}`}
                        >
                          ❌
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className={styles.noAudits}>Brak audytów manualnych</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return <Loader />;
}
