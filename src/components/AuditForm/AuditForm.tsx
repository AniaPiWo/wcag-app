'use client';
import React, { useState } from 'react';
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

interface AuditFormProps {
  auditItems: AuditItem[];
  auditType: AuditType;
  domain: string;
}

const answerOptions: AnswerOption[] = [
  { value: 'positive', label: 'Pozytywna', columnClass: 'positive' },
  { value: 'negative', label: 'Negatywna', columnClass: 'negative' },
  { value: 'notApplicable', label: 'Nie dotyczy', columnClass: 'notApplicable' }
];

export const AuditForm: React.FC<AuditFormProps> = ({ auditItems, auditType, domain }) => {
  const [responses, setResponses] = useState<Record<number, Evaluation>>({});

  const handleResponseChange = (itemId: number, value: Evaluation) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: value
    }));
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
