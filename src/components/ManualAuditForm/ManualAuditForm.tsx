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
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  basicAudit?: string | null;
  intermediateAudit?: string | null;
  advancedAudit?: string | null;
  basicAuditAISummary?: string | null;
  intermediateAuditAISummary?: string | null;
  advancedAuditAISummary?: string | null;
  consolidatedAuditAISummary?: string | null;
  selectedLevels?: string | null;
  status?: string | null;
  completedAt?: Date | null;
  totalIssuesCount?: number | null;
  criticalCount?: number | null;
  seriousCount?: number | null;
  auditType: string;
  errorMessage?: string | null;
}

interface ManualAuditFormProps {
  id: string;
}

export function ManualAuditForm({ id }: ManualAuditFormProps): React.ReactElement {
  const [audit, setAudit] = useState<Audit | null>(null);
  
  // Interface for audit item data that we send to the API
  interface AuditItemData {
    itemId: number;
    evaluation: string;
    notes: string;
  }
  
  // Interface for the UpdateAuditData type that we use with updateManualAudit
  interface UpdateAuditData {
    basicAudit?: AuditItemData[];
    intermediateAudit?: AuditItemData[];
    advancedAudit?: AuditItemData[];
    basicAuditAISummary?: string;
    intermediateAuditAISummary?: string;
    advancedAuditAISummary?: string;
    consolidatedAuditAISummary?: string;
  };
  const [isLoading, setIsLoading] = useState(true);
  const [basicAuditData, setBasicAuditData] = useState<Array<{itemId: number, evaluation: string, notes: string}>>([]);
  const [intermediateAuditData, setIntermediateAuditData] = useState<Array<{itemId: number, evaluation: string, notes: string}>>([]);
  const [advancedAuditData, setAdvancedAuditData] = useState<Array<{itemId: number, evaluation: string, notes: string}>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [basicAduditAISummary, setBasicAduditAISummary] = useState<string | null>(null);
  const [intermediateAduditAISummary, setIntermediateAduditAISummary] = useState<string | null>(null);
  const [advancedAduditAISummary, setAdvancedAduditAISummary] = useState<string | null>(null);
  const [consolidatedAISummary, setConsolidatedAISummary] = useState<string | null>(null);
  
  // Loading states for AI summaries
  const [isLoadingBasicSummary, setIsLoadingBasicSummary] = useState(false);
  const [isLoadingIntermediateSummary, setIsLoadingIntermediateSummary] = useState(false);
  const [isLoadingAdvancedSummary, setIsLoadingAdvancedSummary] = useState(false);
  const [isLoadingConsolidatedSummary, setIsLoadingConsolidatedSummary] = useState(false);
  
  // Selected audit levels for consolidated report
  const [selectedLevelsForReport, setSelectedLevelsForReport] = useState({
    basic: true,
    intermediate: true,
    advanced: true
  });
  
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
  
  /**
   * Handles generating an AI summary report for a specific audit level
   * @param level The audit level ('basic', 'intermediate', or 'advanced')
   */
  const handleAIReview = async (level: 'basic' | 'intermediate' | 'advanced') => {
    let auditData;
    let setLoading;
    let setSummary;
    
    // Set the appropriate data and state functions based on the level
    switch (level) {
      case 'basic':
        auditData = basicAuditData;
        setLoading = setIsLoadingBasicSummary;
        setSummary = setBasicAduditAISummary;
        break;
      case 'intermediate':
        auditData = intermediateAuditData;
        setLoading = setIsLoadingIntermediateSummary;
        setSummary = setIntermediateAduditAISummary;
        break;
      case 'advanced':
        auditData = advancedAuditData;
        setLoading = setIsLoadingAdvancedSummary;
        setSummary = setAdvancedAduditAISummary;
        break;
    }
    
    // Don't proceed if there's no audit data
    if (!auditData || auditData.length === 0) {
      setSummary('Brak danych audytowych dla tego poziomu.');
      return;
    }
    
    setLoading(true);
    setSummary('Generowanie podsumowania AI...');
    
    try {
      const response = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ auditData, level }),
      });
      
      if (!response.ok) {
        throw new Error(`Błąd HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      const aiSummary = data.summary;
      setSummary(aiSummary);
      
      // Save the AI summary to the database
      try {
        const updateData: UpdateAuditData = {};
        
        // Set the appropriate field based on level
        switch (level) {
          case 'basic':
            updateData.basicAuditAISummary = aiSummary;
            break;
          case 'intermediate':
            updateData.intermediateAuditAISummary = aiSummary;
            break;
          case 'advanced':
            updateData.advancedAuditAISummary = aiSummary;
            break;
        }
        
        // Update the audit in the database
        await updateManualAudit(id, updateData);
        console.log(`AI summary for ${level} level saved to database`);
      } catch (dbError) {
        console.error('Error saving AI summary to database:', dbError);
        // We don't need to show this error to the user since the summary is still displayed
      }
    } catch (error) {
      console.error('Błąd podczas generowania podsumowania AI:', error);
      setSummary(`Wystąpił błąd podczas generowania podsumowania AI: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generates a consolidated AI summary report from multiple audit levels
   */
  const handleConsolidatedAIReview = async () => {
    // Check if at least one level is selected
    if (!selectedLevelsForReport.basic && 
        !selectedLevelsForReport.intermediate && 
        !selectedLevelsForReport.advanced) {
      setConsolidatedAISummary('Proszę wybrać co najmniej jeden poziom audytu.');
      return;
    }

    setIsLoadingConsolidatedSummary(true);
    setConsolidatedAISummary('Generowanie podsumowania AI dla wybranych poziomów...');
    
    try {
      // Prepare data for all selected levels
      const consolidatedData = [];
      
      if (selectedLevelsForReport.basic && basicAuditData.length > 0) {
        consolidatedData.push({
          level: 'basic',
          data: basicAuditData
        });
      }
      
      if (selectedLevelsForReport.intermediate && intermediateAuditData.length > 0) {
        consolidatedData.push({
          level: 'intermediate',
          data: intermediateAuditData
        });
      }
      
      if (selectedLevelsForReport.advanced && advancedAuditData.length > 0) {
        consolidatedData.push({
          level: 'advanced',
          data: advancedAuditData
        });
      }
      
      if (consolidatedData.length === 0) {
        setConsolidatedAISummary('Brak danych audytowych dla wybranych poziomów.');
        setIsLoadingConsolidatedSummary(false);
        return;
      }
      
      // Call API to generate consolidated summary
      const response = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          auditData: consolidatedData.flatMap(item => item.data), 
          level: 'consolidated',
          selectedLevels: consolidatedData.map(item => item.level)
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Błąd HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      const aiSummary = data.summary;
      setConsolidatedAISummary(aiSummary);
      
      // Save the consolidated AI summary to the database
      try {
        const updateData: UpdateAuditData = {
          consolidatedAuditAISummary: aiSummary
        };
        
        await updateManualAudit(id, updateData);
        console.log('Zbiorcza analiza AI zapisana do bazy danych');
      } catch (dbError) {
        console.error('Błąd zapisywania zbiorczej analizy AI do bazy danych:', dbError);
        // Analiza nadal zostanie wyświetlona użytkownikowi
      }
      
    } catch (error) {
      console.error('Błąd generowania skonsolidowanego podsumowania AI:', error);
      setConsolidatedAISummary(`Błąd generowania podsumowania: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
    } finally {
      setIsLoadingConsolidatedSummary(false);
    }
  };

  useEffect(() => {
    const fetchAudit = async () => {
      setIsLoading(true);
      try {
        const data = await getManualAudit(id);
        setAudit(data as Audit);
        
        if (data.basicAudit) {
          setBasicAuditData(JSON.parse(data.basicAudit));
        }
        if (data.intermediateAudit) {
          setIntermediateAuditData(JSON.parse(data.intermediateAudit));
        }
        if (data.advancedAudit) {
          setAdvancedAuditData(JSON.parse(data.advancedAudit));
        }
        
        // Load existing AI summaries if available
        // Type cast to Audit to access the AI summary fields
        const auditData = data as Audit;
        
        if (auditData.basicAuditAISummary) {
          setBasicAduditAISummary(auditData.basicAuditAISummary);
        }
        if (auditData.intermediateAuditAISummary) {
          setIntermediateAduditAISummary(auditData.intermediateAuditAISummary);
        }
        if (auditData.advancedAuditAISummary) {
          setAdvancedAduditAISummary(auditData.advancedAuditAISummary);
        }
        if (auditData.consolidatedAuditAISummary) {
          setConsolidatedAISummary(auditData.consolidatedAuditAISummary);
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

  // The handleAIReview function has been moved to the top of the component

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
            
            <div className={styles.reportControls}>
              <h3>Generowanie raportu zbiorczego</h3>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={selectedLevelsForReport.basic} 
                    onChange={(e) => setSelectedLevelsForReport(prev => ({ ...prev, basic: e.target.checked }))} 
                  />
                  Poziom podstawowy
                </label>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={selectedLevelsForReport.intermediate} 
                    onChange={(e) => setSelectedLevelsForReport(prev => ({ ...prev, intermediate: e.target.checked }))} 
                  />
                  Poziom średni
                </label>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={selectedLevelsForReport.advanced} 
                    onChange={(e) => setSelectedLevelsForReport(prev => ({ ...prev, advanced: e.target.checked }))} 
                  />
                  Poziom zaawansowany
                </label>
              </div>
              
              <Button 
                onClick={handleConsolidatedAIReview} 
                disabled={isLoadingConsolidatedSummary ||
                  (!selectedLevelsForReport.basic && 
                   !selectedLevelsForReport.intermediate && 
                   !selectedLevelsForReport.advanced)}
              >
                {isLoadingConsolidatedSummary ? 'Generowanie...' : 'Generuj zbiorczy raport AI'}
              </Button>
            </div>
            
            {consolidatedAISummary && (
              <div className={styles.aiSummary}>
                <h3>Zbiorczy raport AI</h3>
                <div className={styles.summaryContent}>
                  {consolidatedAISummary}
                </div>
              </div>
            )}
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
            </table>
            {/* AI review button */}
            <div className={styles.AIreviewSection}>
              <button 
                type="button" 
                className={styles.AIreviewBtn} 
                onClick={() => handleAIReview('basic')}
                disabled={isLoadingBasicSummary}
              >
                {isLoadingBasicSummary ? 'Generowanie...' : 'Wygeneruj raport AI'}
              </button>
              {basicAduditAISummary && (
                <div className={styles.aiSummaryContainer}>
                  <div className={styles.aiSummaryContent}>{basicAduditAISummary}</div>
                </div>
              )}
            </div>

            <table className={styles.table}>
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
            </table>
            
            <div className={styles.AIreviewSection}>
              <button 
                type="button" 
                className={styles.AIreviewBtn} 
                onClick={() => handleAIReview('intermediate')}
                disabled={isLoadingIntermediateSummary}
              >
                {isLoadingIntermediateSummary ? 'Generowanie...' : 'Wygeneruj raport AI'}
              </button>
              {intermediateAduditAISummary && (
                <div className={styles.aiSummaryContainer}>
                  <div className={styles.aiSummaryContent}>{intermediateAduditAISummary}</div>
                </div>
              )}
            </div>
            
            <table className={styles.table}>
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
            
            <div className={styles.AIreviewSection}>
              <button 
                type="button" 
                className={styles.AIreviewBtn} 
                onClick={() => handleAIReview('advanced')}
                disabled={isLoadingAdvancedSummary}
              >
                {isLoadingAdvancedSummary ? 'Generowanie...' : 'Wygeneruj raport AI'}
              </button>
              {advancedAduditAISummary && (
                <div className={styles.aiSummaryContainer}>
                  <div className={styles.aiSummaryContent}>{advancedAduditAISummary}</div>
                </div>
              )}
            </div>
          
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