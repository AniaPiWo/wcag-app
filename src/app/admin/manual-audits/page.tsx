/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import React, { useState, useEffect } from 'react';
import styles from './page.module.scss';
import { Button } from '@/components/atoms/Button/Button';
import Loader from '@/components/Loader/Loader';
import Link from 'next/link';

// Interfejs dla poziomu audytu
interface AuditLevel {
  id: string;
  label: string;
}

// Interfejs dla odpowiedzi na element audytu
interface AuditItemResponse {
  itemId: number;
  evaluation?: 'positive' | 'negative' | 'notApplicable' | string;
  notes?: string;
}

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
                          {(() => {
                            try {
                              const parsed = JSON.parse(audit.selectedLevels);
                              if (Array.isArray(parsed)) {
                                return parsed.map((level: string | AuditLevel, index: number) => {
                                  // Determine completion status for this level
                                  let completionStatus = 'notStarted';
                                  
                                  // Pobierz wartość poziomu (string lub obiekt z polem label)
                                  const levelValue = typeof level === 'object' && level !== null && level.label ? level.label : String(level);
                                  
                                  // Określ klucz na podstawie wartości poziomu
                                  let levelKey: string | undefined;
                                  if (levelValue === 'podstawowy') levelKey = 'basicAudit';
                                  else if (levelValue === 'średni') levelKey = 'intermediateAudit';
                                  else if (levelValue === 'zaawansowany') levelKey = 'advancedAudit';
                                  
                                  console.log('Level debug:', { level, levelValue, levelKey, auditData: levelKey ? audit[levelKey] : null });
                                  
                                  if (levelKey && audit[levelKey] && typeof audit[levelKey] === 'string') {
                                    try {
                                      const responses = JSON.parse(audit[levelKey] as string);
                                      if (responses && responses.length > 0) {
                                        // Jeśli są jakiekolwiek odpowiedzi, to poziom jest przynajmniej częściowo ukończony
                                        completionStatus = 'partiallyCompleted';
                                        
                                        // Sprawdź, czy wszystkie elementy mają ocenę (evaluation)
                                        const allHaveEvaluation = responses.every((item: AuditItemResponse) => 
                                          item && item.evaluation && 
                                          ['positive', 'negative', 'notApplicable'].includes(item.evaluation)
                                        );
                                        
                                        // Jeśli wszystkie elementy mają ocenę, to poziom jest ukończony
                                        if (allHaveEvaluation) {
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
                                    
                                  console.log('Status debug:', { completionStatus, statusClass, levelKey });
                                  
                                  // Użyj indeksu jako klucza i wyświetl odpowiednią wartość
                                  const displayText = typeof level === 'object' && level !== null && level.label ? level.label : String(level);
                                  return (
                                    <span key={`level-${index}`} className={`${styles.levelBadge} ${statusClass}`}>{displayText}</span>
                                  );
                                });
                              } else {
                                // Jeśli parsed nie jest tablicą, wyświetl jako string
                                return <span className={styles.levelBadge}>{String(parsed)}</span>;
                              }
                            } catch (e) {
                              // W przypadku błędu parsowania, wyświetl oryginalny string
                              return <span className={styles.levelBadge}>{String(audit.selectedLevels)}</span>;
                            }
                          })()}
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
