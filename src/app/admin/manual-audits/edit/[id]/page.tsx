/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import React, { useState, useEffect } from 'react';
import styles from './page.module.scss';
import { useRouter } from 'next/navigation';
import { auditBasic } from '@/lib/wcag_checklist/basic';
import { auditIntermediate } from '@/lib/wcag_checklist/intermediate';
import { auditAdvanced } from '@/lib/wcag_checklist/advanced';

type AuditLevel = 'podstawowy' | 'średni' | 'zaawansowany';

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
  createdAt: string;
  updatedAt: string;
  selectedLevels: string;
  basicAudit?: string;
  intermediateAudit?: string;
  advancedAudit?: string;
  auditType: string;
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

  useEffect(() => {
    const fetchAudit = async () => {
      setIsLoading(true);
      try {

        const response = await fetch(`/api/manual-audit/${id}`, {
          credentials: 'include', // Include cookies with the request
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json()
        
        setAudit(data)
        
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
                    <p><strong>Wybrane poziomy:</strong> {audit.selectedLevels ? JSON.parse(audit.selectedLevels).join(', ') : 'Brak'}</p>
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
                                            readOnly 
                                        />
                                    </td>
                                    <td className={styles.cell}>
                                        <input 
                                            type="checkbox" 
                                            className={styles.checkbox}
                                            checked={auditItem?.evaluation === 'negative'} 
                                            readOnly 
                                        />
                                    </td>
                                    <td className={styles.cell}>
                                        <input 
                                            type="checkbox" 
                                            className={styles.checkbox}
                                            checked={auditItem?.evaluation === 'notApplicable'} 
                                            readOnly 
                                        />
                                    </td>
                                    <td className={styles.textarea}>
                                        <textarea 
                                            className={styles.notes}
                                            value={auditItem?.notes || ''}
                                            readOnly
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
                                            readOnly 
                                        />
                                    </td>
                                    <td className={styles.cell}>
                                        <input 
                                            type="checkbox" 
                                            className={styles.checkbox}
                                            checked={auditItem?.evaluation === 'negative'} 
                                            readOnly 
                                        />
                                    </td>
                                    <td className={styles.cell}>
                                        <input 
                                            type="checkbox" 
                                            className={styles.checkbox}
                                            checked={auditItem?.evaluation === 'notApplicable'} 
                                            readOnly 
                                        />
                                    </td>
                                    <td className={styles.textarea}>
                                        <textarea 
                                            className={styles.notes}
                                            value={auditItem?.notes || ''}
                                            readOnly
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
                                    <td className={styles.cell}>{item.title}</td>
                                
                                    <td className={`${styles.cell} ${styles.checkboxCell}`}>
                                       <input 
                                            type="checkbox" 
                                            className={styles.checkbox}
                                            checked={auditItem?.evaluation === 'positive'} 
                                            readOnly 
                                        />
                                    </td>
                                    <td className={`${styles.cell} ${styles.checkboxCell}`}>
                                        <input 
                                            type="checkbox" 
                                            className={styles.checkbox}
                                            checked={auditItem?.evaluation === 'negative'} 
                                            readOnly 
                                        />
                                    </td>
                                    <td className={`${styles.cell} ${styles.checkboxCell}`}>
                                       <input 
                                            type="checkbox" 
                                            className={styles.checkbox}
                                            checked={auditItem?.evaluation === 'notApplicable'} 
                                            readOnly 
                                        />
                                    </td>
                                    <td className={styles.textarea}>
                                        <textarea 
                                            className={styles.notes}
                                            value={auditItem?.notes || ''}
                                            readOnly
                                        ></textarea>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                
            </>
        ) : (
            <p>Nie znaleziono audytu o podanym ID.</p>
        )}
    </div>
);
    
}
