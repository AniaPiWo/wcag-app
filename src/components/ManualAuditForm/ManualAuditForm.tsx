/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import React, { useState, useEffect, useRef } from 'react';
import styles from './ManualAuditForm.module.scss';
import { auditBasic } from '@/lib/wcag_checklist/basic';
import { auditIntermediate } from '@/lib/wcag_checklist/intermediate';
import { auditAdvanced } from '@/lib/wcag_checklist/advanced';
import { Button } from '@/components';
import { getManualAudit, updateManualAudit, updateAuditItem as updateAuditItemAction } from '@/app/actions/manual-audit';

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

interface ManualAuditFormProps {
  id: string;
}

export function ManualAuditForm({ id }: ManualAuditFormProps) {
  const [audit, setAudit] = useState<Audit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [basicAuditData, setBasicAuditData] = useState<Array<{itemId: number, evaluation: string, notes: string}>>([]);
  const [intermediateAuditData, setIntermediateAuditData] = useState<Array<{itemId: number, evaluation: string, notes: string}>>([]);
  const [advancedAuditData, setAdvancedAuditData] = useState<Array<{itemId: number, evaluation: string, notes: string}>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    const fetchAudit = async () => {
      setIsLoading(true);
      try {
        const data = await getManualAudit(id);
        setAudit(data);
        
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
  
  const updateAuditItem = async (level: 'basic' | 'intermediate' | 'advanced', itemId: number, field: 'evaluation' | 'notes', value: string) => {
    try {
      if (level === 'basic') {
        setBasicAuditData(prev => {
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
      
      if (field === 'notes') {
        const timerKey = `${level}-${itemId}-${field}`;
        
        if (debounceTimers.current[timerKey]) {
          clearTimeout(debounceTimers.current[timerKey]);
        }
        
        debounceTimers.current[timerKey] = setTimeout(async () => {
          try {
            await updateAuditItemAction(id, level, itemId, field, value);
          } catch (error) {
            console.error('not ok', error);
          }
        }, 500);
      } else {
        await updateAuditItemAction(id, level, itemId, field, value);
      }
    } catch (error) {
      console.error('not ok', error);
    }
  };

  const handleSave = async () => {
    if (!audit) return;
    
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const updateData = {
        basicAudit: basicAuditData,
        intermediateAudit: intermediateAuditData,
        advancedAudit: advancedAuditData,
      };
      
      const updatedAudit = await updateManualAudit(id, updateData);
      setAudit(updatedAudit);
      setSaveMessage({ type: 'success', text: 'ok' });
      
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch (error) {
      console.error('not ok', error);
      setSaveMessage({ type: 'error', text: 'not ok.' });
      
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  };
  
  const renderSelectedLevels = () => {
    if (!audit?.selectedLevels) return "Brak";
    
    try {
      const levels: AuditLevel[] = JSON.parse(audit.selectedLevels);
      return levels.map((level: AuditLevel) => level.label).join(", ");
    } catch (error) {
      return audit.selectedLevels;
    }
  };

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

            <tbody className={styles.tbody}>
              <tr className={styles.sectionRow}>
                <td colSpan={6} className={styles.sectionHeader}>Poziom podstawowy</td>
              </tr>
              {auditBasic.map((item) => {
                const auditItem = basicAuditData.find(data => data.itemId === item.id);
                
                return (
                  <tr key={`basic-${item.id}`} className={styles.row}>
                    <td className={styles.cell}>{item.id}</td>
                    <td className={styles.cellTitle}>{item.title}
                      <span className={styles.description}>{item.description}</span>
                    </td>
                    <td className={styles.cell}>
                      <input 
                        type="radio" 
                        className={styles.checkbox}
                        checked={auditItem?.evaluation === 'positive'} 
                        onChange={() => updateAuditItem('basic', item.id, 'evaluation', 'positive')}
                      />
                    </td>
                    <td className={styles.cell}>
                      <input 
                        type="radio" 
                        className={styles.checkbox}
                        checked={auditItem?.evaluation === 'negative'} 
                        onChange={() => updateAuditItem('basic', item.id, 'evaluation', 'negative')}
                      />
                    </td>
                    <td className={styles.cell}>
                      <input 
                        type="radio" 
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

            <tbody className={styles.tbody}>
              <tr className={styles.sectionRow}>
                <td colSpan={6} className={styles.sectionHeader}>Poziom średni</td>
              </tr>
              {auditIntermediate.map((item) => {
                const auditItem = intermediateAuditData.find(data => data.itemId === item.id);
                
                return (
                  <tr key={`intermediate-${item.id}`} className={styles.row}>
                    <td className={styles.cell}>{item.id}</td>
                    <td className={styles.cellTitle}>{item.title}
                      <span className={styles.description}>{item.description}</span>
                    </td>
                    <td className={styles.cell}>
                      <input 
                        type="radio" 
                        className={styles.checkbox}
                        checked={auditItem?.evaluation === 'positive'} 
                        onChange={() => updateAuditItem('intermediate', item.id, 'evaluation', 'positive')}
                      />
                    </td>
                    <td className={styles.cell}>
                      <input 
                      type="radio" 
                        className={styles.checkbox}
                        checked={auditItem?.evaluation === 'negative'} 
                        onChange={() => updateAuditItem('intermediate', item.id, 'evaluation', 'negative')}
                      />
                    </td>
                    <td className={styles.cell}>
                      <input 
                         type="radio" 
                        className={styles.checkbox}
                        checked={auditItem?.evaluation === 'notApplicable'} 
                        onChange={() => updateAuditItem('intermediate', item.id, 'evaluation', 'notApplicable')}
                      />
                    </td>
                    <td className={styles.textarea}>
                      <textarea 
                        className={styles.notes}
                        value={auditItem?.notes || ''}
                        onChange={(e) => updateAuditItem('intermediate', item.id, 'notes', e.target.value)}
                      ></textarea>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <tbody className={styles.tbody}>
              <tr className={styles.sectionRow}>
                <td colSpan={6} className={styles.sectionHeader}>Poziom zaawansowany</td>
              </tr>
              {auditAdvanced.map((item) => {
                const auditItem = advancedAuditData.find(data => data.itemId === item.id);
                
                return (
                  <tr key={`advanced-${item.id}`} className={styles.row}>
                    <td className={styles.cell}>{item.id}</td>
                    <td className={styles.cellTitle}>{item.title}
                      <span className={styles.description}>{item.description}</span>  
                    </td>
                    <td className={`${styles.cell} ${styles.checkboxCell}`}>
                      <input 
                        type="radio" 
                        className={styles.checkbox}
                        checked={auditItem?.evaluation === 'positive'} 
                        onChange={() => updateAuditItem('advanced', item.id, 'evaluation', 'positive')}
                      />
                    </td>
                    <td className={`${styles.cell} ${styles.checkboxCell}`}>
                      <input 
                      type="radio" 
                        className={styles.checkbox}
                        checked={auditItem?.evaluation === 'negative'} 
                        onChange={() => updateAuditItem('advanced', item.id, 'evaluation', 'negative')}
                      />
                    </td>
                    <td className={`${styles.cell} ${styles.checkboxCell}`}>
                      <input 
                         type="radio" 
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
            <div className={styles.saveMessage}>{saveMessage?.text}</div>
          </div>
        </>
      ) : (
        <p>Nie znaleziono audytu o podanym ID.</p>
      )}
    </div>
  );
}