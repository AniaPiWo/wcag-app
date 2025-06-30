/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.scss';
import { useRouter } from 'next/navigation';
import { auditBasic } from '@/lib/wcag_checklist/basic';
import { auditIntermediate } from '@/lib/wcag_checklist/intermediate';
import { auditAdvanced } from '@/lib/wcag_checklist/advanced';
import { Button } from '@/components';
import { getManualAudit, updateManualAudit, updateAuditItem as updateAuditItemAction } from '@/app/actions/manual-audit';

type AuditLevelType = 'podstawowy' | 'średni' | 'zaawansowany';

interface AuditLevel {
  id: string;
  label: string;
}

interface AuditItem {
  id: number | string;
  response: string[];
  notes: string;
}

interface AuditData {
  basic: Record<string | number, AuditItem>;
  intermediate: Record<string | number, AuditItem>;
  advanced: Record<string | number, AuditItem>;
}

interface Audit {
  id: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  selectedLevels: string | null;
  basicAudit?: string | null;
  intermediateAudit?: string | null;
  advancedAudit?: string | null;
  auditType: string;
  name?: string | null;
  email?: string | null;
  status?: string | null;
  completedAt?: Date | null;
  totalIssuesCount?: number | null;
  criticalCount?: number | null;
  seriousCount?: number | null;
  errorMessage?: string | null;
}



export default function EditManualAuditPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const router = useRouter();
  const unwrappedParams = params instanceof Promise ? React.use(params) : params;
  const { id } = unwrappedParams;
  const [audit, setAudit] = useState<Audit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [basicAuditData, setBasicAuditData] = useState<Array<{itemId: number, evaluation: string, notes: string}>>([]);
  const [intermediateAuditData, setIntermediateAuditData] = useState<Array<{itemId: number, evaluation: string, notes: string}>>([]);
  const [advancedAuditData, setAdvancedAuditData] = useState<Array<{itemId: number, evaluation: string, notes: string}>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // Referencja do timerów debounce dla pól notes
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    const fetchAudit = async () => {
      setIsLoading(true);
      try {
        // Użycie server action zamiast fetch API
        const data = await getManualAudit(id);
        
        setAudit(data);
        
        // Parse JSON strings into objects
        if (data.basicAudit) {
          setBasicAuditData(JSON.parse(data.basicAudit));
        }
        if (data.intermediateAudit) {
          setIntermediateAuditData(JSON.parse(data.intermediateAudit));
        }
        if (data.advancedAudit) {
          setAdvancedAuditData(JSON.parse(data.advancedAudit));
        }
        
      } catch (error) {
        console.error('Błąd podczas pobierania audytu:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAudit();
  }, [id]);
  
// Funkcja do aktualizacji danych audytu
  const updateAuditItem = async (level: 'basic' | 'intermediate' | 'advanced', itemId: number, field: 'evaluation' | 'notes', value: string) => {
    try {
      // Aktualizacja stanu lokalnego natychmiast dla lepszego UX
      if (level === 'basic') {
        setBasicAuditData(prev => {
          const itemIndex = prev.findIndex(item => item.itemId === itemId);
          if (itemIndex === -1) {
            // Jeśli element nie istnieje, dodaj nowy
            const newItem: {itemId: number, evaluation: string, notes: string} = {
              itemId,
              evaluation: field === 'evaluation' ? value : '',
              notes: field === 'notes' ? value : ''
            };
            return [...prev, newItem];
          } else {
            // Jeśli element istnieje, zaktualizuj go
            const newData = [...prev];
            newData[itemIndex] = { ...newData[itemIndex], [field]: value };
            return newData;
          }
        });
      } else if (level === 'intermediate') {
        setIntermediateAuditData(prev => {
          const itemIndex = prev.findIndex(item => item.itemId === itemId);
          if (itemIndex === -1) {
            const newItem: {itemId: number, evaluation: string, notes: string} = {
              itemId,
              evaluation: field === 'evaluation' ? value : '',
              notes: field === 'notes' ? value : ''
            };
            return [...prev, newItem];
          } else {
            const newData = [...prev];
            newData[itemIndex] = { ...newData[itemIndex], [field]: value };
            return newData;
          }
        });
      } else if (level === 'advanced') {
        setAdvancedAuditData(prev => {
          const itemIndex = prev.findIndex(item => item.itemId === itemId);
          if (itemIndex === -1) {
            const newItem: {itemId: number, evaluation: string, notes: string} = {
              itemId,
              evaluation: field === 'evaluation' ? value : '',
              notes: field === 'notes' ? value : ''
            };
            return [...prev, newItem];
          } else {
            const newData = [...prev];
            newData[itemIndex] = { ...newData[itemIndex], [field]: value };
            return newData;
          }
        });
      }
      
      // Dla pól notes używamy debounce, aby opóźnić wywołanie server action
      if (field === 'notes') {
        const timerKey = `${level}-${itemId}-${field}`;
        
        // Anuluj poprzedni timer, jeśli istnieje
        if (debounceTimers.current[timerKey]) {
          clearTimeout(debounceTimers.current[timerKey]);
        }
        
        // Ustaw nowy timer do wywołania server action po 500ms bezczynności
        debounceTimers.current[timerKey] = setTimeout(async () => {
          try {
            await updateAuditItemAction(id, level, itemId, field, value);
          } catch (error) {
            console.error('Błąd podczas zapisywania notatek:', error);
          }
        }, 500);
      } else {
        // Dla checkboxów aktualizujemy od razu
        await updateAuditItemAction(id, level, itemId, field, value);
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji elementu audytu:', error);
    }
  };

  // Funkcja do zapisywania zmian
  const handleSave = async () => {
    if (!audit) return;
    
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // Przygotowanie danych do aktualizacji
      const updateData = {
        basicAudit: basicAuditData,
        intermediateAudit: intermediateAuditData,
        advancedAudit: advancedAuditData,
      };
      
      // Wywołanie server action do aktualizacji audytu
      const updatedAudit = await updateManualAudit(id, updateData);
      
      setAudit(updatedAudit);
      setSaveMessage({ type: 'success', text: 'Zmiany zostały zapisane pomyślnie!' });
      
      // Automatyczne ukrycie komunikatu po 3 sekundach
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Błąd podczas zapisywania audytu:', error);
      setSaveMessage({ type: 'error', text: 'Wystąpił błąd podczas zapisywania zmian.' });
      
      // Automatyczne ukrycie komunikatu po 3 sekundach
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Funkcja do parsowania i wyświetlania poziomów audytu w formacie JSON
  const renderSelectedLevels = () => {
    if (!audit?.selectedLevels) return "Brak";
    
    try {
      const levels: AuditLevel[] = JSON.parse(audit.selectedLevels);
      return levels.map((level: AuditLevel) => level.label).join(", ");
    } catch (error) {
      console.error('Błąd podczas parsowania poziomów audytu:', error);
      return audit.selectedLevels; // Fallback do starego formatu
    }
  };

  console.log("audit => ", audit);
return ( 
    <div className={styles.page}>
        <h1 className={styles.title}>Edycja audytu manualnego</h1>    
        
        {isLoading ? (
            <p>Ładowanie danych audytu...</p>
        ) : audit ? (
            <>
                <div className={styles.auditDetails}>
                    <p><strong>ID audytu:</strong> {id}</p>
                    <p><strong>URL:</strong> {audit.url}</p>
                    <p><strong>Data utworzenia:</strong> {new Date(audit.createdAt).toLocaleString()}</p>
                    <p><strong>Ostatnia aktualizacja:</strong> {new Date(audit.updatedAt).toLocaleString()}</p>
                    <p><strong>Wybrane poziomy:</strong> {renderSelectedLevels()}</p>
                </div>
                 
                <table className={styles.table}>
                    <caption className={styles.caption}>Wyniki audytu manualnego</caption>
                    <thead className={styles.thead}>
                        <tr className={styles.headerRow}>
                            <th className={styles.th}>#</th>
                            <th className={styles.th}>Treść pytania</th>
                            <th className={styles.th}>Pozytywna</th>
                            <th className={styles.th}>Negatywna</th>
                            <th className={styles.th}>Nie dotyczy</th>
                            <th className={styles.th}>Notatki</th>
                        </tr>
                    </thead>

                    {/* Podstawowy poziom */}
                    <tbody className={styles.tbody}>
                        <tr className={styles.sectionRow}>
                            <td colSpan={6} className={styles.sectionHeader}>Poziom podstawowy</td>
                        </tr>
                        {auditBasic.map((item) => {
                            // Find the corresponding audit data for this item
                            const auditItem = basicAuditData.find(data => data.itemId === item.id);
                            
                            return (
                                <tr key={`basic-${item.id}`} className={styles.row}>
                                    <td className={styles.cell}>{item.id}</td>
                                    <td className={styles.cellTitle}>{item.title}
                                      
                                      <span className={styles.description}>{item.description}</span>
                                    </td>
                                    <td className={styles.cell}>
                                       <input 
                                            type="checkbox" 
                                            className={styles.checkbox}
                                            checked={auditItem?.evaluation === 'positive'} 
                                            onChange={() => updateAuditItem('basic', item.id, 'evaluation', 'positive')}
                                        />
                                    </td>
                                    <td className={styles.cell}>
                                        <input 
                                            type="checkbox" 
                                            className={styles.checkbox}
                                            checked={auditItem?.evaluation === 'negative'} 
                                            onChange={() => updateAuditItem('basic', item.id, 'evaluation', 'negative')}
                                        />
                                    </td>
                                    <td className={styles.cell}>
                                        <input 
                                            type="checkbox" 
                                            className={styles.checkbox}
                                            checked={auditItem?.evaluation === 'notApplicable'} 
                                            onChange={() => updateAuditItem('basic', item.id, 'evaluation', 'notApplicable')}
                                        />
                                    </td>
                                    <td className={styles.textarea}>
                                        <textarea 
                                            className={styles.notes}
                                            value={auditItem?.notes || ''}
                                            onChange={(e) => updateAuditItem('basic', item.id, 'notes', e.target.value)}
                                        ></textarea>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>

                                   {/* Średni poziom */}
                                   <tbody className={styles.tbody}>
                        <tr className={styles.sectionRow}>
                            <td colSpan={6} className={styles.sectionHeader}>Poziom średni</td>
                        </tr>
                        {auditIntermediate.map((item) => {
                            // Find the corresponding audit data for this item
                            const auditItem = intermediateAuditData.find(data => data.itemId === item.id);
                            
                            return (
                                <tr key={`intermediate-${item.id}`} className={styles.row}>
                                    <td className={styles.cell}>{item.id}</td>
                                    <td className={styles.cellTitle}>{item.title}

                                      <span className={styles.description}>{item.description}</span>
                                    </td>
                                    <td className={styles.cell}>
                                       <input 
                                            type="checkbox" 
                                            className={styles.checkbox}
                                            checked={auditItem?.evaluation === 'positive'} 
                                            onChange={() => updateAuditItem('intermediate', item.id, 'evaluation', 'positive')}
                                        />
                                    </td>
                                    <td className={styles.cell}>
                                        <input 
                                            type="checkbox" 
                                            className={styles.checkbox}
                                            checked={auditItem?.evaluation === 'negative'} 
                                            onChange={() => updateAuditItem('intermediate', item.id, 'evaluation', 'negative')}
                                        />
                                    </td>
                                    <td className={styles.cell}>
                                        <input 
                                            type="checkbox" 
                                            className={styles.checkbox}
                                            checked={auditItem?.evaluation === 'notApplicable'} 
                                            onChange={() => updateAuditItem('intermediate', item.id, 'evaluation', 'notApplicable')}
                                        />
                                    </td>
                                    <td className={styles.textarea}>
                                        <textarea 
                                            className={styles.notes}
                                            value={auditItem?.notes || ''}
                                            onChange={(e) => updateAuditItem('advanced', item.id, 'notes', e.target.value)}
                                        ></textarea>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>

                    {/* Zaawansowany poziom */}
                    <tbody className={styles.tbody}>
                        <tr className={styles.sectionRow}>
                            <td colSpan={6} className={styles.sectionHeader}>Poziom zaawansowany</td>
                        </tr>
                        {auditAdvanced.map((item) => {
                            // Find the corresponding audit data for this item
                            const auditItem = advancedAuditData.find(data => data.itemId === item.id);
                            
                            return (
                                <tr key={`advanced-${item.id}`} className={styles.row}>
                                    <td className={styles.cell}>{item.id}</td>
                                    <td className={styles.cellTitle}>{item.title}
                                    <span className={styles.description}>{item.description}</span>  
                                    </td>
                              
                                    <td className={`${styles.cell} ${styles.checkboxCell}`}>
                                       <input 
                                            type="checkbox" 
                                            className={styles.checkbox}
                                            checked={auditItem?.evaluation === 'positive'} 
                                            onChange={() => updateAuditItem('advanced', item.id, 'evaluation', 'positive')}
                                        />
                                    </td>
                                    <td className={`${styles.cell} ${styles.checkboxCell}`}>
                                        <input 
                                            type="checkbox" 
                                            className={styles.checkbox}
                                            checked={auditItem?.evaluation === 'negative'} 
                                            onChange={() => updateAuditItem('advanced', item.id, 'evaluation', 'negative')}
                                        />
                                    </td>
                                    <td className={`${styles.cell} ${styles.checkboxCell}`}>
                                       <input 
                                            type="checkbox" 
                                            className={styles.checkbox}
                                            checked={auditItem?.evaluation === 'notApplicable'} 
                                            onChange={() => updateAuditItem('advanced', item.id, 'evaluation', 'notApplicable')}
                                        />
                                    </td>
                                    <td className={styles.textarea}>
                                        <textarea 
                                            className={styles.notes}
                                            value={auditItem?.notes || ''}
                                            onChange={(e) => updateAuditItem('advanced', item.id, 'notes', e.target.value)}
                                        ></textarea>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <div className={styles.saveSection}>
                  <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Zapisywanie...' : 'Zapisz'}
                  </Button>
       
                </div>
            </>
        ) : (
            <p>Nie znaleziono audytu o podanym ID.</p>
        )}
    </div>
);
    
}
