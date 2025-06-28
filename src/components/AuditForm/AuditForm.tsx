'use client';
import React, { useState, useEffect } from 'react';
import styles from './AuditForm.module.scss';

type Evaluation = 'positive' | 'negative' | 'notApplicable';
type AuditType = 'podstawowy' | 'średni' | 'zaawansowany';

interface AnswerOption {
  value: Evaluation;
  label: string;
  columnClass: string;
}

export interface AuditItem {
  id: number;
  title: string;
  wcag: string;
  description?: string;
}

export interface AuditResponse {
  itemId: number;
  evaluation: Evaluation;
  notes: string;
}

interface AuditFormProps {
  auditItems: AuditItem[];
  auditType: AuditType;
  domain: string;
  onResponsesChange?: (responses: AuditResponse[]) => void;
  initialResponses?: AuditResponse[];
}

const answerOptions: AnswerOption[] = [
  { value: 'positive', label: 'Pozytywna', columnClass: 'positive' },
  { value: 'negative', label: 'Negatywna', columnClass: 'negative' },
  { value: 'notApplicable', label: 'Nie dotyczy', columnClass: 'notApplicable' }
];

export const AuditForm: React.FC<AuditFormProps> = ({ auditItems, auditType, domain, onResponsesChange, initialResponses }) => {
  const [responses, setResponses] = useState<Record<number, Evaluation>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  // Inicjalizacja odpowiedzi z initialResponses, jeśli są dostępne
  useEffect(() => {
    if (initialResponses && initialResponses.length > 0) {
      console.log(`AuditForm (${auditType}) initializing with responses:`, initialResponses);
      console.log(`AuditForm (${auditType}) audit items:`, auditItems);
      
      // Create a debug string to help diagnose issues
      let debugStr = `Audit type: ${auditType}\n`;
      debugStr += `Initial responses count: ${initialResponses.length}\n`;
      debugStr += `Audit items count: ${auditItems.length}\n`;
      
      // Map of item IDs to help identify missing items
      const auditItemIds = new Set(auditItems.map(item => item.id));
      const responseItemIds = new Set(initialResponses.map(resp => resp.itemId));
      
      debugStr += `Audit item IDs: ${[...auditItemIds].join(', ')}\n`;
      debugStr += `Response item IDs: ${[...responseItemIds].join(', ')}\n`;
      
      // Find missing items
      const missingInAudit = [...responseItemIds].filter(id => !auditItemIds.has(id));
      const missingInResponses = [...auditItemIds].filter(id => !responseItemIds.has(id));
      
      debugStr += `Items in responses but not in audit: ${missingInAudit.join(', ')}\n`;
      debugStr += `Items in audit but not in responses: ${missingInResponses.join(', ')}\n`;
      
      setDebugInfo(debugStr);
      
      const initialResponsesMap: Record<number, Evaluation> = {};
      const initialNotesMap: Record<number, string> = {};
      
      // Ensure all audit items have an entry in the responses map
      auditItems.forEach(item => {
        // Default to undefined so we don't show a selected radio button if there's no response
        initialResponsesMap[item.id] = undefined as unknown as Evaluation;
      });
      
      // Now overlay the actual responses
      initialResponses.forEach(response => {
        console.log(`Setting response for item ${response.itemId}:`, response.evaluation);
        initialResponsesMap[response.itemId] = response.evaluation;
        initialNotesMap[response.itemId] = response.notes || '';
      });
      
      console.log(`AuditForm (${auditType}) final response map:`, initialResponsesMap);
      setResponses(initialResponsesMap);
      setNotes(initialNotesMap);
    }
  }, [initialResponses, auditItems, auditType]);

  const handleResponseChange = (itemId: number, value: Evaluation) => {
    const updatedResponses = {
      ...responses,
      [itemId]: value
    };
    setResponses(updatedResponses);
    
    // Notify parent component of changes
    if (onResponsesChange) {
      const formattedResponses = Object.keys(updatedResponses).map(key => ({
        itemId: parseInt(key),
        evaluation: updatedResponses[parseInt(key)],
        notes: notes[parseInt(key)] || ''
      }));
      onResponsesChange(formattedResponses);
    }
  };
  
  const handleNotesChange = (itemId: number, value: string) => {
    const updatedNotes = {
      ...notes,
      [itemId]: value
    };
    setNotes(updatedNotes);
    
    // Notify parent component of changes
    if (onResponsesChange) {
      const formattedResponses = Object.keys(responses).map(key => ({
        itemId: parseInt(key),
        evaluation: responses[parseInt(key)],
        notes: parseInt(key) === itemId ? value : (notes[parseInt(key)] || '')
      }));
      onResponsesChange(formattedResponses);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Audyt {auditType} WCAG dla domeny {domain}</h1>
      
      {/* Debug information - remove in production */}
      <details className={styles.debugInfo}>
        <summary>Debug Info</summary>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', padding: '10px', background: '#f5f5f5', border: '1px solid #ddd' }}>
          {debugInfo}
          {initialResponses && (
            <>
              <br />
              <strong>Initial Responses JSON:</strong><br />
              {JSON.stringify(initialResponses, null, 2)}
            </>
          )}
          <br />
          <strong>Current Responses:</strong><br />
          {JSON.stringify(responses, null, 2)}
        </pre>
      </details>
      
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              <th className={styles.numberHeader}>Lp.</th>
              <th className={styles.questionHeader}>Pytanie</th>
              <th className={styles.wcagHeader}>WCAG</th>
              {answerOptions.map((option) => (
                <th 
                  key={option.value} 
                  className={`${styles.answerHeader} ${styles[option.columnClass]}`}
                >
                  {option.label}
                </th>
              ))}
              <th className={styles.notesHeader}>Notatki</th>
            </tr>
          </thead>
          <tbody className={styles.body}>
            {auditItems.map((item) => (
              <tr key={item.id} className={styles.row}>
                <td className={styles.numberCell}>
                  <span className={styles.questionNumber}>{item.id}.</span>
                </td>
                <td className={styles.questionCell}>
                  <div className={styles.questionContent}>
                    <span className={styles.questionText}>{item.title}</span>
                    {item.description && (
                      <div className={styles.questionDescription}>{item.description}</div>
                    )}
                  </div>
                </td>
                <td className={styles.wcagCell}>
                  <span className={styles.wcagBadge} title={`Kryterium WCAG ${item.wcag}`}>{item.wcag}</span>
                </td>
                {answerOptions.map((option) => (
                  <td 
                    key={option.value} 
                    className={`${styles.answerCell} ${styles[option.columnClass]}`}
                  >
                    <label className={styles.option}>
                      <input
                        type="radio"
                        name={`audit-${item.id}`}
                        value={option.value}
                        checked={responses[item.id] === option.value}
                        // Debug: {`Item ${item.id} response: ${responses[item.id]}, option: ${option.value}, match: ${responses[item.id] === option.value}`}
                        onChange={() => handleResponseChange(item.id, option.value)}
                        className={styles.radioInput}
                      />
                      <span className={styles.radioLabel}></span>
                    </label>
                  </td>
                ))}
                <td className={styles.notesCell}>
                  <div>
                    <textarea 
                      className={styles.notesInput}
                      placeholder="Dodaj notatkę..."
                      aria-label={`Notatki do pytania ${item.id}`}
                      rows={1}
                      value={notes[item.id] || ''}
                      onChange={(e) => handleNotesChange(item.id, e.target.value)}
                    />
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
