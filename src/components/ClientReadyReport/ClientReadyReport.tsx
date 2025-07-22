/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from 'react'
import styles from './ClientReadyReport.module.scss'
import { getManualAudit } from '@/app/actions/manual-audit'

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

/* const violations = [
    {
      "id": 1,
      "problem": "Kontrast między kolorami pierwszego planu i tła nie spełnia minimalnych progów współczynnika kontrastu WCAG 1.4 (błąd krytyczny).",
      "rekomendacje": [
        "Zmiana koloru --e-global-color-text z HEX #7a7a7a na ciemniejszy (np kolor #4e4e4e spełnia wymogi współczynnika kontrastu AA 4.5 oraz AAA 7.0), zgodnie z WCAG 1.4.3 (Kontrast).",
        "Zmiana koloru HEX #32c36c (zielony) na ciemniejszy (np kolor #1e7a43 spełnia wymogi współczynnika kontrastu AA 4.5), zgodnie z WCAG 1.4.3 (Kontrast)."
      ]
    },
    {
      "id": 2,
      "problem": "Obrazy slidera w hero nie zawierają atrybutu alt, co uniemożliwia jego zrozumienie użytkownikom korzystającym z czytników ekranu (błąd krytyczny).",
      "rekomendacje": [
        "Każdy obraz powinien posiadać opis alternatywny w atrybucie alt, zgodnie z WCAG 1.1.1 (Treść nietekstowa). Jeśli obraz pełni funkcję czysto dekoracyjną, należy dodać alt=\"\" lub role=\"presentation\"."
      ]
    },
    {
      "id": 3,
      "problem": "Obrazy przedstawiające loga klientów w karuzeli cms_clients_list nie zawierają atrybutu alt, co uniemożliwia jego zrozumienie użytkownikom korzystającym z czytników ekranu (błąd krytyczny).",
      "rekomendacje": [
        "Każdy z obrazów powinien posiadać opis alternatywny w atrybucie alt (przykład - alt=\"Logo firmy TCB Bud\"). Jeśli logo pełni funkcję informacyjną lub nawigacyjną, jego opis alternatywny powinien odzwierciedlać tę funkcję, zgodnie z WCAG 1.1.1 (Treść nietekstowa)."
      ]
    },
    {
      "id": 4,
      "problem": "Obrazy przedstawiające loga klientów w karuzeli cms_clients_list posiadają odwołanie aria-describedby do nieistniejącego elementu (błąd krytyczny)",
      "rekomendacje": [
        "Jeśli aria-describedby nie pełni żadnej funkcji dostępnościowej, najprostszym rozwiązaniem jest usunięcie tego atrybutu. Jeśli nie chcemy usuwać tego atrybutu, należy upewnić się, że aria-describedby wskazuje na istniejący element z opisem, co jest zgodne z WCAG 1.3.1."
      ]
    },
    {
      "id": 5,
      "problem": "Pole formularza wyszukiwania nie posiada etykiety (label), a przycisk wyszukiwania zawiera jedynie ikonę bez tekstu lub alternatywnego opisu. Oba elementy mogą być niezrozumiałe dla użytkowników korzystających z czytników ekranu (błąd krytyczny i umiarkowany).",
      "rekomendacje": [
        "Należy dodać ukrytą etykietę do pola wyszukiwania, np. Wyszukaj na stronie lub atrybut aria-label=\"Wyszukaj na stronie\" bezpośrednio do pola.",
        "Należy dodać atrybut aria-label=\"Szukaj\" do przycisku wysyłającego formularz (Kryteria WCAG 1.3.1 – Informacje i relacje, 3.3.2 – Etykiety lub instrukcje, 4.1.2 – Nazwa, rola, wartość)."
      ]
    },
    {
      "id": 6,
      "problem": "Brak widocznego obramowania (outline) dla linków (błąd krytyczny).",
      "rekomendacje": [
        "Upewnić się, że wszystkie linki mają widoczny focus outline, co jest zgodne z WCAG 2.2.1 (Klawiatura)."
      ]
    },
    {
      "id": 7,
      "problem": "Brak rozwinięcia akordeonu w sekcji FAQ przy pomocy klawiatury (błąd krytyczny).",
      "rekomendacje": [
        "Należy upewnić się, że pola zapytań FAQ posiadają widoczny focus outline oraz że można rozwinąć je, np przy pomocy klawisza enter, co jest zgodne z WCAG 2.2.1 (Klawiatura)."
      ]
    },
    {
      "id": 8,
      "problem": "W stopce (footer) użyto nagłówków poziomu 4 (h4), pomijając wcześniejsze poziomy (h2 i h3), co skutkuje przeskokiem w hierarchii nagłówków (błąd umiarkowany).",
      "rekomendacje": [
        "Zachować semantyczną kolejność nagłówków (np. h2, h3, h4) bez pomijania poziomów. Zgodne z WCAG 1.3.1 (Informacja i relacje)."
      ]
    },
    {
      "id": 9,
      "problem": "Brak informacji o otwieraniu nowych okien (umiarkowany).",
      "rekomendacje": [
        "Dodaj informację tekstową dla linków otwierających nowe okna, zgodnie z WCAG 3.2.2 (Zmiana na żądanie)."
      ]
    },
    {
      "id": 10,
      "problem": "Brak informacji o otwieraniu nowych okien (umiarkowany).",
      "rekomendacje": [
        "Dodaj informację tekstową dla linków otwierających nowe okna, zgodnie z WCAG 3.2.2 (Zmiana na żądanie)."
      ]
    },
    {
      "id": 11,
      "problem": "Brak opisu guzika powrotu do góry dla czytników ekranowych (umiarkowany).",
      "rekomendacje": [
        "Dodaj brakujący atrybut np aria-label=\"Powrót do góry strony\" lub tekst alternatywny, zgodnie z WCAG 1.1.1 (Treść nietekstowa)."
      ]
    },
    {
      "id": 12,
      "problem": "Link prowadzący do profilu Facebook nie zawiera żadnego tekstu ani alternatywnego opisu dostępnego dla czytników ekranu (np. aria-label). Ikona jest oznaczona jako aria-hidden=\"true\", a element tekstowy jest pusty (błąd umiarkowany).",
      "rekomendacje": [
        "Dodać atrybut aria-label=\"Facebook firmy\" do elementu lub uzupełnić element tekstowy o ukryty wizualnie opis. Poprawka zapewni zgodność z WCAG 2.4.4 – Cel linku (poziom A)."
      ]
    },
    {
      "id": 13,
      "problem": "Brak wskazówek przy błędach i weryfikacji danych (umiarkowany).",
      "rekomendacje": [
        "Implementacja mechanizmów walidacji i podpowiedzi, zgodnie z WCAG 3.3.1 (Identyfikacja błędów)."
      ]
    },
    {
      "id": 14,
      "problem": "Niespójna struktura tytułów na podstronach (mało istotny).",
      "rekomendacje": [
        "Ujednolicić strukturę tytułów, zgodnie z WCAG 2.4.2 (Tytuły stron)."
      ]
    },
    {
      "id": 15,
      "problem": "Brak linków umożliwiających pominięcie powtarzających się bloków nawigacyjnych (skiplinków).",
      "rekomendacje": [
        "Implementacja mechanizmu skiplinków (linków \"Przejdź do treści\"), zgodnie z WCAG 2.4.1 (Pomijanie bloków).",
        "Dodać widoczny (np. po najechaniu tabulatorem) link \"Przejdź do treści\" na początku strony, kierujący do sekcji ."
      ]
    }
  ] */

// Interfejsy dla danych JSON z AI Summary
interface AuditIssue {
  description: string;
  severity: string;
  recommendation: string;
  wcagCriterion: string;
}

interface ProblemCategory {
  category: string;
  issues: AuditIssue[];
}

interface ParsedAuditSummary {
  summary: string[];
  problems: ProblemCategory[];
}

const ClientReadyReport = ({ id, audit }: Props) => {
  const [auditData, setAuditData] = useState<Audit | null>(null);
  const [parsedSummary, setParsedSummary] = useState<ParsedAuditSummary | null>(null);
  
  // Editing state management
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState({
    url: '',
    auditorName: 'Anna Piotrowiak-Wołosiuk',
    auditGoal: 'Ocena zgodności serwisu z wymaganiami WCAG 2.2 na poziomie AA',
    auditScope: 'Strona główna oraz przykładowe podstrony (np. kontakt, FAQ)',
    complianceLevel: 'Niepełna zgodność z WCAG 2.2 AA',
    summary: '',
    problems: [] as ProblemCategory[]
  });
  const [isSaving, setIsSaving] = useState(false);

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
          console.log(audit.consolidatedAuditAISummary);
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
          problems: parsedSummary.problems || []
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
      const response = await fetch('/api/audit/save-client-ready', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auditId: id,
          clientReadyAudit: JSON.stringify(editedContent)
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

  const handleProblemChange = (categoryIndex: number, issueIndex: number, field: string, value: string) => {
    setEditedContent(prev => ({
      ...prev,
      problems: prev.problems.map((category, catIdx) => {
        if (catIdx === categoryIndex) {
          return {
            ...category,
            issues: category.issues.map((issue, issIdx) => {
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

  const handleAddIssue = (categoryIndex: number) => {
    const newIssue: AuditIssue = {
      description: '',
      severity: '',
      recommendation: '',
      wcagCriterion: ''
    };

    setEditedContent(prev => ({
      ...prev,
      problems: prev.problems.map((category, catIdx) => {
        if (catIdx === categoryIndex) {
          return {
            ...category,
            issues: [...category.issues, newIssue]
          };
        }
        return category;
      })
    }));
  };

  const handleRemoveIssue = (categoryIndex: number, issueIndex: number) => {
    setEditedContent(prev => ({
      ...prev,
      problems: prev.problems.map((category, catIdx) => {
        if (catIdx === categoryIndex) {
          return {
            ...category,
            issues: category.issues.filter((_, issIdx) => issIdx !== issueIndex)
          };
        }
        return category;
      })
    }));
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

  // Format date for display
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Brak daty';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.wrapper}>
      {/* Sticky Sidebar for Edit Controls */}
      {isEditing && (
        <div className={styles.stickySidebar}>
          <div className={styles.sidebarContent}>
            <h4 className={styles.sidebarTitle}>Edycja raportu</h4>
            
            <div className={styles.sidebarButtons}>
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className={styles.saveButton}
              >
                {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
              </button>
              
              <button onClick={handleCancel} className={styles.cancelButton}>
                Anuluj edycję
              </button>
              
              <div className={styles.divider}></div>
              
              <button 
                onClick={handleAddCategory}
                className={styles.addCategoryButton}
              >
                + Dodaj kategorię
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className={`${styles.mainContent} ${isEditing ? styles.mainContentWithSidebar : ''}`}>
        {/* Top Edit Button (only when not editing) */}
        {!isEditing && (
          <div className={styles.topEditControls}>
            <button onClick={handleEditToggle} className={styles.editButton}>
              Edytuj raport
            </button>
          </div>
        )}

      <h2 className={styles.title}>Raport z Audytu Dostępności Cyfrowej</h2>
      
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
          auditData?.url || 'Brak adresu URL'
        )}
      </p>
      
      <p><strong>Data zakończenia audytu:</strong> {auditData ? formatDate(auditData.updatedAt) : 'Brak daty'}</p>
      
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

      <h3 className={styles.subtitle}>Zakres audytu</h3>
      <p><strong>Metoda:</strong> Audyt automatyczny, manualny oraz analiza kodu źródłowego</p>
      <p><strong>Narzędzia:</strong> Automatyczny audyt przy pomocy narzędzi (axe-core, NDVA, LightHouse, WAVE) oraz manualny audyt wg checklisty WCAG</p>
      
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

      <h3 className={styles.title}>
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
      </h3>

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
                <p className={styles.categoryTitle}>
                  {catIndex + 1}. WCAG:{" "}
                  {isEditing ? (
                    <input
                      type="text"
                      value={category.category}
                      onChange={(e) => {
                        setEditedContent(prev => ({
                          ...prev,
                          problems: prev.problems.map((cat, idx) => 
                            idx === catIndex ? { ...cat, category: e.target.value } : cat
                          )
                        }));
                      }}
                      className={styles.editInput}
                    />
                  ) : (
                    category.category
                  )}
                </p>
                {isEditing && (
                  <div className={styles.categoryButtons}>
                    <button 
                      onClick={() => handleAddIssue(catIndex)}
                      className={styles.addIssueButton}
                    >
                      + Dodaj problem
                    </button>
                    {editedContent.problems.length > 1 && (
                      <button 
                        onClick={() => handleRemoveCategory(catIndex)}
                        className={styles.removeButton}
                      >
                        Usuń kategorię
                      </button>
                    )}
                  </div>
                )}
              </div>
              {category.issues && Array.isArray(category.issues) && (
                <ul className={styles.problemList}>
                  {category.issues.map((issue, issueIndex) => (
                    <li key={`issue-${catIndex}-${issueIndex}`} className={styles.problemItem}>
                      {isEditing && (
                        <div className={styles.issueControls}>
                          <button 
                            onClick={() => handleRemoveIssue(catIndex, issueIndex)}
                            className={styles.removeIssueButton}
                            title="Usuń ten problem"
                          >
                            ×
                          </button>
                        </div>
                      )}
                      <div>
                        <strong>Problem (</strong>
                        {isEditing ? (
                          <input
                            type="text"
                            value={issue.severity}
                            onChange={(e) => handleProblemChange(catIndex, issueIndex, 'severity', e.target.value)}
                            className={styles.editInputSmall}
                            placeholder="np. krytyczny"
                          />
                        ) : (
                          <strong>{issue.severity}</strong>
                        )}
                        <strong>): </strong>
                        {isEditing ? (
                          <textarea
                            value={issue.description}
                            onChange={(e) => handleProblemChange(catIndex, issueIndex, 'description', e.target.value)}
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
                            onChange={(e) => handleProblemChange(catIndex, issueIndex, 'recommendation', e.target.value)}
                            className={styles.editTextarea}
                            rows={3}
                            placeholder="Podaj rekomendację naprawy..."
                          />
                        ) : (
                          issue.recommendation
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
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

export default ClientReadyReport