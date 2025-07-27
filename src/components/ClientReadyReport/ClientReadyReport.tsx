/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'
import styles from './ClientReadyReport.module.scss'
import { getManualAudit } from '@/app/actions/manual-audit'
import { PDFDownloadLink, pdf } from '@react-pdf/renderer'
import AuditPDF from './AuditPDF'

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
  readyMadeAudit?: string | null;
  clientReadyAudit?: string | null;
  aiAnalysis?: string | null;
  selectedLevels?: string | null;
  status?: string | null;
  completedAt?: Date | null;
  totalIssuesCount?: number | null;
  criticalCount?: number | null;
  seriousCount?: number | null;
  auditType: string;
  errorMessage?: string | null;
}

type Props = {
  id: string;
  audit?: Audit | null;
}

// Interfejsy dla danych JSON z AI Summary
interface AuditIssue {
  description: string;
  severity: string;
  recommendation: string;
  wcagCriterion: string;
}

interface ProblemCategory {
  category: string;
  severity?: string;
  issues: AuditIssue[];
}

interface ParsedAuditSummary {
  summary: string[];
  problems: ProblemCategory[];
}

const ClientReadyReport = ({ id, audit }: Props) => {
  const [auditData, setAuditData] = useState<Audit | null>(null);
  const [parsedSummary, setParsedSummary] = useState<ParsedAuditSummary | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState({
    url: '',
    auditorName: 'Anna Piotrowiak-Wołosiuk',
    auditGoal: 'Ocena zgodności serwisu z wymaganiami WCAG 2.2 na poziomie AA',
    auditScope: 'Strona główna oraz przykładowe podstrony (np. kontakt, FAQ)',
    complianceLevel: 'Niepełna zgodność z WCAG 2.2 AA',
    summary: '',
    problems: [] as ProblemCategory[],
    updatedAt: new Date().toISOString()
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // Helper function to format dates
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  function getDomainOnly(url: string): string {
    try {
      const { hostname } = new URL(url);
      return hostname.replace(/^www\./, '');
    } catch (e) {
      return '';
    }
  }

  // Funkcja do parsowania JSON z odpowiedzi AI
  const parseJsonFromMarkdown = (text: string | null | undefined): ParsedAuditSummary | null => {
    if (!text) return null;

    try {
      // Przygotowanie tekstu do parsowania
      let jsonString = text.trim();
      
      // Sprawdzamy czy nadal są jakieś backticki (dla kompatybilności wstecznej)
      if (jsonString.startsWith('```')) {
        // Znajdź pierwszy i ostatni znacznik ``` i usuń wszystko poza tym
        const firstDelimiter = jsonString.indexOf('```');
        const secondDelimiter = jsonString.indexOf('```', firstDelimiter + 3);
        if (secondDelimiter !== -1) {
          // Jeśli znaleziono końcowy znacznik, wyodrębnij zawartość między znacznikami
          jsonString = jsonString.substring(firstDelimiter + 3, secondDelimiter).trim();
          // Usuń także identyfikator języka (np. json) jeśli istnieje
          if (jsonString.startsWith('json')) {
            jsonString = jsonString.substring(4).trim();
          }
        } else {
          // Jeśli nie znaleziono końcowego znacznika, usuń tylko początkowy
          jsonString = jsonString.substring(firstDelimiter + 3).trim();
          if (jsonString.startsWith('json')) {
            jsonString = jsonString.substring(4).trim();
          }
        }
      }
      
      // Try to make it valid JSON by applying fixes iteratively
      let parseable = false;
      try {
        JSON.parse(jsonString);
        parseable = true;
      } catch (syntaxError) {
        // If it can't be parsed, try more aggressive fixes
        //console.log('Initial parsing failed, trying more aggressive fixes:', syntaxError);
        
        // Log the problematic position and nearby content
        const errorMatch = String(syntaxError).match(/position (\d+)/i);
        if (errorMatch && errorMatch[1]) {
          const pos = parseInt(errorMatch[1]);
          const start = Math.max(0, pos - 30);
          const end = Math.min(jsonString.length, pos + 30);
          //console.log(`Error near position ${pos}: '${jsonString.substring(start, pos)}👉HERE👈${jsonString.substring(pos, end)}'`);
        }
        jsonString = jsonString.replace(/("[^"]*")(\s*\n\s*")/g, '$1,$2');
        jsonString = jsonString.replace(/([^\s,\{\[])\s*("\w+"\s*:)/g, '$1,$2');
        jsonString = jsonString.replace(/(\]|\})\s*("\w+"\s*:)/g, '$1,$2');
      }
      
      //console.log('Cleaned JSON string => :', jsonString);
      
      // Parse the JSON
      const parsedJson = JSON.parse(jsonString);
      //console.log('Parsed JSON:', parsedJson);
      
      // Transform the JSON structure if needed
      const transformedJson: ParsedAuditSummary = {
        summary: typeof parsedJson.summary === 'string' ? [parsedJson.summary] : parsedJson.summary,
        problems: []
      };
      
      // Handle problems based on format
      if (Array.isArray(parsedJson.problems)) {
        // Group problems by WCAG criterion for the new format
        const problemsByCategory: Record<string, AuditIssue[]> = {};
        
        parsedJson.problems.forEach((item: any) => {
          const category = item.wcag || 'Nieokreślone kryterium';
          if (!problemsByCategory[category]) {
            problemsByCategory[category] = [];
          }
          
          problemsByCategory[category].push({
            description: item.problem || '',
            severity: item.severity || '',
            recommendation: item.recommendation || '',
            wcagCriterion: item.wcag || ''
          });
        });
        
        // Convert categories to our format
        Object.entries(problemsByCategory).forEach(([category, issues]) => {
          transformedJson.problems.push({
            category: category,
            issues: issues
          });
        });
      } 
      // Handle object with category keys format (previous format)
      else if (parsedJson.problems && typeof parsedJson.problems === 'object') {
        Object.entries(parsedJson.problems).forEach(([category, issues]) => {
          if (Array.isArray(issues)) {
            const transformedCategory: ProblemCategory = {
              category: category,
              issues: issues.map((issue: any) => ({
                description: issue.problem || '',
                severity: issue.waga || '',
                recommendation: issue.rekomendacja || '',
                wcagCriterion: issue.rekomendacja?.match(/Kryterium WCAG: ([\d\.\s\w]+)/)?.[1] || ''
              }))
            };
            transformedJson.problems.push(transformedCategory);
          }
        });
      }
      
      return transformedJson;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        // If audit is provided as prop, use it, otherwise fetch it
        if (audit) {
          setAuditData(audit);
          //console.log(audit.consolidatedAuditAISummary);
        } else {
          const response = await getManualAudit(id);
          setAuditData(response);
        }
      } catch (error) {
        console.error('Error fetching audit:', error);
      }
    };

    fetchAudit();
  }, [id, audit]);
  
  // Parsuj dane po załadowaniu auditData
  useEffect(() => {
    if (auditData?.consolidatedAuditAISummary) {
      const parsed = parseJsonFromMarkdown(auditData.consolidatedAuditAISummary);
      setParsedSummary(parsed);
    }
  }, [auditData?.consolidatedAuditAISummary]);

  // Initialize edited content when data is loaded
  useEffect(() => {
    if (auditData) {
      // Check if there's already saved clientReadyAudit data
      if (auditData.clientReadyAudit) {
        try {
          const savedContent = JSON.parse(auditData.clientReadyAudit);
          setEditedContent(savedContent);
          return;
        } catch (error) {
          console.error('Error parsing clientReadyAudit:', error);
          // Fall through to use parsedSummary
        }
      }
      
      // Use parsedSummary as fallback if no clientReadyAudit or parsing failed
      if (parsedSummary) {
        setEditedContent({
          url: auditData.url || '',
          auditorName: 'Anna Piotrowiak-Wołosiuk',
          auditGoal: 'Ocena zgodności serwisu z wymaganiami WCAG 2.2 na poziomie AA',
          auditScope: 'Strona główna oraz przykładowe podstrony (np. kontakt, FAQ)',
          complianceLevel: 'Niepełna zgodność z WCAG 2.2 AA',
          summary: Array.isArray(parsedSummary.summary) 
            ? parsedSummary.summary.join(' ') 
            : parsedSummary.summary || '',
          problems: parsedSummary.problems || [],
          updatedAt: new Date().toISOString()
        });
      }
    }
  }, [auditData, parsedSummary]);

  // Handle editing functions
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const currentDate = new Date();
      
      // Dodaj datę aktualizacji do obiektu editedContent
      const updatedContent = {
        ...editedContent,
        updatedAt: currentDate.toISOString() // Używamy ISO formatu dla lepszej kompatybilności
      };
      
      const response = await fetch('/api/audit/save-client-ready', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auditId: id,
          clientReadyAudit: JSON.stringify(updatedContent),
          updatedAt: currentDate
        })
      });

      if (response.ok) {
        console.log('Audit saved successfully');
        setIsEditing(false);
        // Optionally refresh audit data
        const updatedAudit = await getManualAudit(id);
        setAuditData(updatedAudit);
      } else {
        console.error('Failed to save audit');
      }
    } catch (error) {
      console.error('Error saving audit:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values - prioritize clientReadyAudit if available
    if (auditData) {
      if (auditData.clientReadyAudit) {
        try {
          const savedContent = JSON.parse(auditData.clientReadyAudit);
          setEditedContent(savedContent);
          setIsEditing(false);
          return;
        } catch (error) {
          console.error('Error parsing clientReadyAudit in cancel:', error);
        }
      }
      
      // Fallback to parsedSummary
      if (parsedSummary) {
        setEditedContent({
          url: auditData.url || '',
          auditorName: 'Anna Piotrowiak-Wołosiuk',
          auditGoal: 'Ocena zgodności serwisu z wymaganiami WCAG 2.2 na poziomie AA',
          auditScope: 'Strona główna oraz przykładowe podstrony (np. kontakt, FAQ)',
          complianceLevel: 'Niepełna zgodność z WCAG 2.2 AA',
          updatedAt: auditData.updatedAt.toISOString(),
          summary: Array.isArray(parsedSummary.summary) 
            ? parsedSummary.summary.join(' ') 
            : parsedSummary.summary || '',
          problems: parsedSummary.problems || []
        });
      }
    }
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryChange = (catIndex: number, field: string, value: string) => {
    console.log(`Updating category ${catIndex}, field ${field} to value ${value}`);
    
    setEditedContent(prev => {
      const updatedProblems = [...prev.problems];
      
      // Make a direct modification to the category
      if (field === 'severity') {
        updatedProblems[catIndex] = {
          ...updatedProblems[catIndex],
          severity: value
        };
        console.log('Updated severity to:', value, 'for category:', updatedProblems[catIndex].category);
      } else {
        updatedProblems[catIndex] = {
          ...updatedProblems[catIndex],
          [field]: value
        };
      }
      
      return {
        ...prev,
        problems: updatedProblems
      };
    });
  };

  const handleAddIssue = (categoryIndex: number): void => {
    setEditedContent((prev) => ({
      ...prev,
      problems: prev.problems.map((category, catIdx) => {
        if (catIdx === categoryIndex) {
          return {
            ...category,
            issues: [...category.issues, {
              description: 'Nowy problem',
              severity: 'krytyczny',
              recommendation: 'Zalecana poprawa',
              wcagCriterion: 'WCAG 1.1.1'
            }]
          };
        }
        return category;
      })
    }));
  };

  const handleRemoveIssue = (categoryIndex: number, issueIndex: number): void => {
    setEditedContent((prev) => ({
      ...prev,
      problems: prev.problems.map((category: ProblemCategory, catIdx: number) => {
        if (catIdx === categoryIndex) {
          return {
            ...category,
            issues: category.issues.filter((_: AuditIssue, issIdx: number) => issIdx !== issueIndex)
          };
        }
        return category;
      })
    }));
  };

  // Helper function to get severity for a category - returns category severity if set, otherwise highest severity from issues
  const getCategorySeverity = (category: ProblemCategory): string => {
    // If category has severity set, use it
    if (category.severity) return category.severity;
    
    // Otherwise determine severity from issues
    if (!category.issues || category.issues.length === 0) return 'lekki';
    
    // Define severity order (lower number = higher severity)
    const severityOrder: Record<string, number> = {
      'krytyczny': 1,
      'critical': 1,
      'poważny': 2, 
      'serious': 2,
      'umiarkowany': 3,
      'średni': 3,
      'moderate': 3,
      'lekki': 4,
      'minor': 4,
      'low': 4,
      'mało istotny': 5
    };
    
    // Find the highest severity (lowest number) among issues
    let highestSeverity = 999;
    let severityName = 'lekki';
    
    category.issues.forEach(issue => {
      const severity = issue.severity.toLowerCase();
      const value = severityOrder[severity] || 10; // Default to low priority if unknown
      
      if (value < highestSeverity) {
        highestSeverity = value;
        severityName = issue.severity;
      }
    });
    
    return severityName;
  };
  
  // Move category up or down in the list
  const handleMoveCategory = (index: number, direction: 'up' | 'down'): void => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === editedContent.problems.length - 1)) {
      return; // Can't move beyond boundaries
    }
    
    setEditedContent((prev) => {
      const newProblems = [...prev.problems];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      // Swap positions
      [newProblems[index], newProblems[targetIndex]] = 
      [newProblems[targetIndex], newProblems[index]];
      
      return {
        ...prev,
        problems: newProblems
      };
    });
  };
  
  // Handle changes to issue fields
  const handleProblemChange = (categoryIndex: number, issueIndex: number, field: string, value: string): void => {
    setEditedContent((prev) => ({
      ...prev,
      problems: prev.problems.map((category: ProblemCategory, catIdx: number) => {
        if (catIdx === categoryIndex) {
          return {
            ...category,
            issues: category.issues.map((issue: AuditIssue, issIdx: number) => {
              if (issIdx === issueIndex) {
                return {
                  ...issue,
                  [field]: value
                };
              }
              return issue;
            })
          };
        }
        return category;
      })
    }));
  };
  
  // Helper function to normalize severity values to match dropdown options
  const normalizeSeverity = (severity: string): string => {
    const severityMap: Record<string, string> = {
      'critical': 'krytyczny',
      'serious': 'poważny',
      'moderate': 'umiarkowany',
      'średni': 'umiarkowany',
      'minor': 'lekki',
      'low': 'lekki'
    };
    
    // Convert to lowercase for case-insensitive matching
    const lowerSeverity = severity?.toLowerCase() || '';
    
    // Return mapped value if exists, otherwise return original or default
    return severityMap[lowerSeverity] || severity || 'lekki';
  };
  
  // Function to sort issues by severity
  const sortIssuesBySeverity = (issues: AuditIssue[]): AuditIssue[] => {
    const severityOrder: Record<string, number> = {
      'krytyczny': 1,
      'critical': 1,
      'poważny': 2,
      'serious': 2,
      'umiarkowany': 3,
      'średni': 3,
      'moderate': 3,
      'lekki': 4,
      'minor': 4,
      'low': 4,
      'mało istotny': 5
    };
    
    return [...issues].sort((a, b) => {
      const severityA = severityOrder[a.severity.toLowerCase()] || 999;
      const severityB = severityOrder[b.severity.toLowerCase()] || 999;
      return severityA - severityB;
    });
  };

  const handleAddCategory = () => {
    const newCategory: ProblemCategory = {
      category: 'Nowa kategoria',
      issues: [{
        description: '',
        severity: '',
        recommendation: '',
        wcagCriterion: ''
      }]
    };

    setEditedContent(prev => ({
      ...prev,
      problems: [...prev.problems, newCategory]
    }));
  };

  const handleRemoveCategory = (categoryIndex: number) => {
    setEditedContent(prev => ({
      ...prev,
      problems: prev.problems.filter((_, catIdx) => catIdx !== categoryIndex)
    }));
  };



return (
  <div className={styles.wrapper}>
    {isEditing && (
      <div className={styles.editSidebar}>
        <h3 className={styles.editSidebarTitle}>Edycja raportu</h3>
        <p className={styles.editSidebarDescription}>Wprowadź zmiany w raporcie i zapisz je.</p>
        
        <div className={styles.editSidebarButtons}>
          <button 
            onClick={handleSave} 
            className={`${styles.saveButton} ${isSaving ? styles.savingButton : ''}`}
            disabled={isSaving}
          >
            {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </button>
          <button 
            onClick={handleCancel} 
            className={styles.cancelButton}
            disabled={isSaving}
          >
            Anuluj
          </button>
        </div>
      </div>
    )}

    <div className={`${styles.mainContent} ${isEditing ? styles.mainContentWithSidebar : ''}`} >

      {!isEditing && (
        <div className={styles.topEditControls}>
          <button onClick={handleEditToggle} className={styles.editButton}>
            Edytuj raport
          </button>
          <button
            type="button"
            className={styles.editButton}
            style={{ marginLeft: 8 }}
            onClick={() => {
              // Konsoluj JSON z clientReadyAudit (editedContent)
              console.log('RAPORT W JSON =>', editedContent);
            }}
          >
            Pokaż JSON
          </button>
          {editedContent && editedContent.problems && editedContent.problems.length > 0 && (
            <>
              <button
                className={styles.editButton}
                style={{ marginLeft: 8 }}
                onClick={() => {
                  const filename = `Raport_WCAG22_${editedContent?.url ? editedContent.url.replace(/^https?:\/\/(?:www\.)?/, '').replace(/[\/:*?"<>|]/g, '_').substring(0, 30) : ''}.pdf`;
                  
                  // Generate PDF
                  const blob = pdf(<AuditPDF data={editedContent} />).toBlob();
                  
                  // When generation completes, create download link
                  blob.then((blobData: Blob) => {
                    const url = URL.createObjectURL(blobData);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = filename;
                    link.click();
                    
                    // Clean up
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                  });
                }}
              >
                Generuj i pobierz PDF
              </button>
            </>
          )}
        </div>
      )}

      <h1 className={styles.title}>Raport z Audytu Dostępności Cyfrowej</h1>
      
      <p>
        <strong>Adres audytowanej strony:</strong>{' '}
        {isEditing ? (
          <input
            type="text"
            value={editedContent.url}
            onChange={(e) => handleInputChange('url', e.target.value)}
            className={styles.editInput}
          />
        ) : (
          auditData?.url ? getDomainOnly(auditData.url) : 'Brak adresu URL'
        )}
      </p>
      
      <p><strong>Data zakończenia audytu:</strong> {auditData?.updatedAt ? formatDate(auditData.updatedAt) : 'Brak daty'}</p>
      
      <p>
        <strong>Audyt wykonany przez:</strong>{' '}
        {isEditing ? (
          <input
            type="text"
            value={editedContent.auditorName}
            onChange={(e) => handleInputChange('auditorName', e.target.value)}
            className={styles.editInput}
          />
        ) : (
          editedContent.auditorName
        )}
      </p>
      
      <p>
        <strong>Cel audytu:</strong>{' '}
        {isEditing ? (
          <textarea
            value={editedContent.auditGoal}
            onChange={(e) => handleInputChange('auditGoal', e.target.value)}
            className={styles.editTextarea}
            rows={2}
          />
        ) : (
          editedContent.auditGoal
        )}
      </p>

      <h2 className={styles.title}>
        Poziom zgodności -{' '}
        {isEditing ? (
          <input
            type="text"
            value={editedContent.complianceLevel}
            onChange={(e) => handleInputChange('complianceLevel', e.target.value)}
            className={styles.editInput}
          />
        ) : (
          editedContent.complianceLevel
        )}
      </h2>

      <h3 className={styles.subtitle}>Zakres audytu</h3>
      <p><strong>Metoda:</strong> Audyt automatyczny, manualny oraz analiza kodu źródłowego</p>
      <p><strong>Narzędzia:</strong> Audyt przy pomocy narzędzi (axe-core, NDVA, LightHouse, WAVE) oraz manualny audyt wg checklisty WCAG</p>
      
      <p>
        <strong>Zakres:</strong>{' '}
        {isEditing ? (
          <textarea
            value={editedContent.auditScope}
            onChange={(e) => handleInputChange('auditScope', e.target.value)}
            className={styles.editTextarea}
            rows={2}
          />
        ) : (
          editedContent.auditScope
        )}
      </p>
      
      <p><strong>Poziom oceny:</strong> Podstawowy poziom WCAG 2.2 – poziom AA</p>

      <h2 className={styles.title}>
        Poziom zgodności -{' '}
        {isEditing ? (
          <input
            type="text"
            value={editedContent.complianceLevel}
            onChange={(e) => handleInputChange('complianceLevel', e.target.value)}
            className={styles.editInput}
          />
        ) : (
          editedContent.complianceLevel
        )}
      </h2>

       {(parsedSummary || isEditing) && (
        <div className={styles.aiSummary}>
          <h3 className={styles.subtitle}>Raport podsumowujący audyt dostępności cyfrowej</h3>
          {isEditing ? (
            <textarea
              value={editedContent.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              className={styles.editTextarea}
              rows={5}
              placeholder="Wprowadź podsumowanie audytu..."
            />
          ) : (
            <p className={styles.summaryList}>
              {editedContent.summary || 'Brak podsumowania'}
            </p>
          )}
          
          <h3 className={styles.subtitle}>Główne problemy dostępności i rekomendacje naprawy</h3>
          
          {editedContent.problems && editedContent.problems.length > 0 ? editedContent.problems.map((category, catIndex) => (
            <div key={`category-${catIndex}`} className={styles.problemCategory}>
              <div className={styles.categoryHeader}>
                <div>
                  <p className={styles.categoryTitle}>
                    {catIndex + 1}. WCAG:{" "}
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={category.category}
                          onChange={(e) => handleCategoryChange(catIndex, 'category', e.target.value)}
                          className={styles.editInputSmall}
                        />
                        {" - błąd "}
                        <input
                          type="text"
                          className={styles.editInputSmall}
                          value={category.severity || getCategorySeverity(category)}
                          onChange={(e) => handleCategoryChange(catIndex, 'severity', e.target.value)}
                          placeholder="krytyczny/poważny/umiarkowany/lekki/mało istotny"
                        />
                      </>
                    ) : (
                      <>
                        {category.category}{" - błąd "}
                        <span 
                          className={`${styles.severityBadge} ${styles[`severity_${(category.severity || getCategorySeverity(category)).toLowerCase().replace(/\s/g, '_')}`]}`}
                        >
                          {(category.severity || getCategorySeverity(category)).toLowerCase()}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                
                {isEditing && (
                  <div className={styles.categoryButtons}>
                    <div className={styles.orderButtons}>
                      <button
                        className={styles.moveButton}
                        onClick={() => handleMoveCategory(catIndex, 'up')}
                        disabled={catIndex === 0}
                        title="Przesuń wyżej"
                      >
                        ↑
                      </button>
                      <button
                        className={styles.moveButton}
                        onClick={() => handleMoveCategory(catIndex, 'down')}
                        disabled={catIndex === editedContent.problems.length - 1}
                        title="Przesuń niżej"
                      >
                        ↓
                      </button>
                    </div>
                    <button
                      className={styles.addIssueButton}
                      onClick={() => handleAddIssue(catIndex)}
                    >
                      Dodaj problem
                    </button>
                    <button
                      className={styles.removeButton}
                      onClick={() => handleRemoveCategory(catIndex)}
                    >
                      Usuń kategorię
                    </button>
                  </div>
                )}
              </div>
                {/* Lista problemów - posortowana wg severity */}
                <ul className={styles.problemsList}>
                  {sortIssuesBySeverity(category.issues).map((issue, idx) => {
                    // Znajdź oryginalny indeks problemu (przed sortowaniem)
                    const originalIndex = category.issues.findIndex(
                      (i) => i.description === issue.description && i.recommendation === issue.recommendation
                    );
                    
                    return (
                      <li key={`issue-${catIndex}-${idx}`} className={styles.problemItem}>
                        {isEditing && (
                          <div className={styles.issueControls}>
                            <button 
                              onClick={() => handleRemoveIssue(catIndex, originalIndex)}
                              className={styles.removeIssueButton}
                              title="Usuń ten problem"
                            >
                              ×
                            </button>
                          </div>
                        )}
                        <div>
                          <strong>Problem: </strong>
                          {isEditing ? (
                            <textarea
                              value={issue.description}
                              onChange={(e) => handleProblemChange(catIndex, originalIndex, 'description', e.target.value)}
                              className={styles.editTextarea}
                              rows={2}
                              placeholder="Opisz problem dostępności..."
                            />
                          ) : (
                            issue.description
                          )}
                        </div>
                        <div>
                          <strong>Rekomendacja: </strong>
                          {isEditing ? (
                            <textarea
                              value={issue.recommendation}
                              onChange={(e) => handleProblemChange(catIndex, originalIndex, 'recommendation', e.target.value)}
                              className={styles.editTextarea}
                              rows={3}
                              placeholder="Podaj rekomendację naprawy..."
                            />
                          ) : (
                            issue.recommendation
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            
          )) : <p>Brak szczegółowego opisu problemów dostępności.</p>}
        </div>
      )}
      
      {auditData?.consolidatedAuditAISummary && !parsedSummary && (
        <div className={styles.aiSummary}>
          <h3 className={styles.subtitle}>Raport podsumowujący audyt dostępności cyfrowej</h3>
          <div className={styles.content}>
            <p>{auditData.consolidatedAuditAISummary}</p>
          </div>
        </div>
      )}


        <h3 className={styles.subtitle}>Oświadczenie</h3>
        <p>Audyt został przeprowadzony manualnie oraz przy pomocy narzędzi automatycznych zgodnie z wytycznymi WCAG 2.2 na poziomie AA. Raport nie stanowi certyfikatu zgodności, lecz dokumentuje aktualny stan dostępności oraz kierunki poprawy.</p>
      </div>
    </div>
  );
};

export default ClientReadyReport;