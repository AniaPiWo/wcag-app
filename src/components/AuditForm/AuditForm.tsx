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
  const [responses, setResponses] = useState<Partial<Record<number, Evaluation>>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});

  // Inicjalizacja odpowiedzi z initialResponses, jeśli są dostępne
  useEffect(() => {
    if (initialResponses && initialResponses.length > 0) {
      const initialResponsesMap: Partial<Record<number, Evaluation>> = {};
      const initialNotesMap: Record<number, string> = {};

      // Overlay the actual responses
      initialResponses.forEach(response => {
        initialResponsesMap[response.itemId] = response.evaluation;
        initialNotesMap[response.itemId] = response.notes || '';
      });
      
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
      const formattedResponses = Object.keys(updatedResponses)
        .filter(key => updatedResponses[parseInt(key)] !== undefined)
        .map(key => ({
          itemId: parseInt(key),
          evaluation: updatedResponses[parseInt(key)] as Evaluation,
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
      const formattedResponses = Object.keys(responses)
        .filter(key => responses[parseInt(key)] !== undefined)
        .map(key => ({
          itemId: parseInt(key),
          evaluation: responses[parseInt(key)] as Evaluation,
          notes: parseInt(key) === itemId ? value : (notes[parseInt(key)] || '')
        }));
      onResponsesChange(formattedResponses);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Audyt {auditType} WCAG dla domeny {domain}</h1>

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
