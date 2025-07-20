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
        console.log('Initial parsing failed, trying more aggressive fixes:', syntaxError);
        
        // Log the problematic position and nearby content
        const errorMatch = String(syntaxError).match(/position (\d+)/i);
        if (errorMatch && errorMatch[1]) {
          const pos = parseInt(errorMatch[1]);
          const start = Math.max(0, pos - 30);
          const end = Math.min(jsonString.length, pos + 30);
          console.log(`Error near position ${pos}: '${jsonString.substring(start, pos)}👉HERE👈${jsonString.substring(pos, end)}'`);
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
        // Group problems by severity for the new format
        const problemsByCategory: Record<string, AuditIssue[]> = {};
        
        parsedJson.problems.forEach((item: any) => {
          const category = item.severity || 'Nieokreślona waga';
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
      <h2 className={styles.title}>Raport z Audytu Dostępności Cyfrowej</h2>
      <p><strong>Adres audytowanej strony:</strong> {auditData?.url || 'Brak adresu URL'}</p>
      <p><strong>Data zakończenia audytu:</strong> {auditData ? formatDate(auditData.updatedAt) : 'Brak daty'}</p>
      <p><strong>Audyt wykonany przez:</strong> {"Anna Piotrowiak-Wołosiuk"}</p>
      <p><strong>Cel audytu:</strong> Ocena zgodności serwisu z wymaganiami WCAG 2.2 na poziomie AA</p>

      <h3 className={styles.subtitle}>Zakres audytu</h3>
      <p><strong>Metoda:</strong> Audyt manualny oraz analiza kodu źródłowego</p>
      <p><strong>Narzędzia:</strong> Automatyczny audyt przy pomocy narzędzi (axe-core, NDVA, LightHouse, WAVE) oraz ręczne checklisty WCAG</p>
      <p><strong>Zakres:</strong> Strona główna oraz przykładowe podstrony (np. kontakt, FAQ)</p>
      <p><strong>Poziom oceny:</strong> Podstawowy poziom WCAG 2.2 – poziom AA</p>

      <h3 className={styles.title}>Poziom zgodności - Niepełna zgodność z WCAG 2.2 AA</h3>

       {parsedSummary && (
        <div className={styles.aiSummary}>
 <h3 className={styles.subtitle}>Raport podsumowujący audyt dostępności cyfrowej</h3>
                <p className={styles.summaryList}>
                  {Array.isArray(parsedSummary.summary) 
                    ? parsedSummary.summary.join(" ")
                    : parsedSummary.summary || 'Brak podsumowania'}
                </p>
                <h3 className={styles.subtitle}>Główne problemy dostępności i rekomendacje naprawy</h3>
                {Array.isArray(parsedSummary.problems) ? parsedSummary.problems.map((category, catIndex) => (
                  <div key={`category-${catIndex}`} className={styles.problemCategory}>
                    <h5 className={styles.categoryTitle}>{catIndex + 1}. {category.category}</h5>
                    {category.issues && Array.isArray(category.issues) && (
                      <ul className={styles.problemList}>
                        {category.issues.map((issue, issueIndex) => (
                          <li key={`issue-${catIndex}-${issueIndex}`} className={styles.problemItem}>
                            <div className={styles.problemItemTitle}>Kryterium WCAG: {issue.wcagCriterion}</div>
                            <div><strong>Problem:</strong> {issue.description} ({issue.severity})</div>
                            <div><strong>Rekomendacja:</strong> {issue.recommendation}</div>
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

      <h3 className={styles.subtitle}>Raport podsumowujący audyt dostępności cyfrowej</h3>
      <p>Strona internetowa wykazuje kilka pozytywnych aspektów dostępności cyfrowej. Przede wszystkim, nawigacja na stronie jest intuicyjna i spójna, co zostało potwierdzone przez spójne menu na wszystkich podstronach oraz nawigację od góry do dołu. Strona jest w pełni responsywna, co oznacza, że dobrze dostosowuje się do różnych rozmiarów ekranów, co jest istotne dla użytkowników korzystających z urządzeń mobilnych. W przypadku powiększenia do 200%, strona pozostaje czytelna, co jest kluczowe dla osób z wadami wzroku. Formularze na stronie mają zrozumiałe etykiety, co ułatwia ich wypełnianie i zrozumienie przez użytkowników. Dodatkowo, brak automatycznie odtwarzanych dźwięków eliminuje potencjalne zakłócenia dla użytkowników. Strona nie zawiera pułapek klawiaturowych, co pozwala na swobodne poruszanie się po niej przy użyciu klawiatury. Brak migających elementów eliminuje ryzyko wywołania ataków epileptycznych u niektórych użytkowników. Ogólnie, pozytywne wyniki wskazują na dobrą podstawę dostępności cyfrowej, choć istnieją obszary wymagające pilnej poprawy.
      </p>

      <h3 className={styles.subtitle}>Główne problemy dostępności i rekomendacje naprawy</h3>
      <p className={styles.errorTitle}>1. Błąd kontrastu:</p>
      <ul className={styles.errorList}>
      <li className={styles.errorItem}>Problem: Kontrast między kolorami pierwszego planu i tła nie spełnia minimalnych progów współczynnika kontrastu WCAG 1.4 (błąd krytyczny).</li>
      <li className={styles.errorItem}>Rekomendacja: Zmiana koloru --e-global-color-text z HEX #7a7a7a na ciemniejszy (np kolor #4e4e4e spełnia wymogi współczynnika kontrastu AA 4.5 oraz AAA 7.0), zgodnie z WCAG 1.4.3 (Kontrast).</li>
      <li className={styles.errorItem}>Rekomendacja: Zmiana koloru HEX #32c36c (zielony) na ciemniejszy (np kolor #1e7a43 spełnia wymogi współczynnika kontrastu AA 4.5), zgodnie z WCAG 1.4.3 (Kontrast).</li>
      </ul>
 
      <p className={styles.errorTitle}>2. Alternatywa dla obrazów:</p>
      <ul className={styles.errorList}>
      <li className={styles.errorItem}>Problem: Obrazy slidera w hero   nie zawierają atrybutu alt, co uniemożliwia jego zrozumienie użytkownikom korzystającym z czytników ekranu (błąd krytyczny).</li>
      <li className={styles.errorItem}>Rekomendacja: Każdy obraz powinien posiadać opis alternatywny w atrybucie alt, zgodnie z WCAG 1.1.1 (Treść nietekstowa). Jeśli obraz pełni funkcję czysto dekoracyjną, należy dodać alt="" lub role="presentation".</li>
      </ul>
        
      <p className={styles.errorTitle}>3. Alternatywa dla obrazów:</p>
      <ul className={styles.errorList}>
      <li className={styles.errorItem}>Problem: Obrazy przedstawiające loga klientów w karuzeli cms_clients_list nie zawierają atrybutu alt, co uniemożliwia jego zrozumienie użytkownikom korzystającym z czytników ekranu (błąd krytyczny).</li>
      <li className={styles.errorItem}>Rekomendacja: Każdy z obrazów powinien posiadać opis alternatywny w atrybucie alt (przykład - alt="Logo firmy TCB Bud"). Jeśli logo pełni funkcję informacyjną lub nawigacyjną, jego opis alternatywny powinien odzwierciedlać tę funkcję, zgodnie z WCAG 1.1.1 (Treść nietekstowa).</li>
      </ul>   

      <p className={styles.errorTitle}>4. Odwołanie do nieistniejącego elementu:</p>
      <ul className={styles.errorList}>
      <li className={styles.errorItem}>Problem: Obrazy przedstawiające loga klientów w karuzeli cms_clients_list posiadają odwołanie aria-describedby do nieistniejącego elementu (błąd krytyczny)</li>
      <li className={styles.errorItem}>Rekomendacja: Jeśli aria-describedby nie pełni żadnej funkcji dostępnościowej, najprostszym rozwiązaniem jest usunięcie tego atrybutu. Jeśli nie chcemy usuwać tego atrybutu, należy upewnić się, że aria-describedby wskazuje na istniejący element z opisem, co jest zgodne z WCAG 1.3.1.</li>
      </ul>

      <p className={styles.errorTitle}>5. Bark etykiety formularza:</p>
      <ul className={styles.errorList}>
      <li className={styles.errorItem}>Problem: Pole formularza wyszukiwania nie posiada etykiety (label), a przycisk wyszukiwania zawiera jedynie ikonę bez tekstu lub alternatywnego opisu. Oba elementy mogą być niezrozumiałe dla użytkowników korzystających z czytników ekranu (błąd krytyczny i umiarkowany).</li>
      <li className={styles.errorItem}>Rekomendacja: Należy dodać ukrytą etykietę do pola wyszukiwania, np.  Wyszukaj na stronie  lub atrybut aria-label="Wyszukaj na stronie" bezpośrednio do pola  . Należy dodać atrybut aria-label="Szukaj" do przycisku wysyłającego formularz (Kryteria WCAG 1.3.1 – Informacje i relacje, 3.3.2 – Etykiety lub instrukcje, 4.1.2 – Nazwa, rola, wartość).</li>
      </ul>

      <p className={styles.errorTitle}>6. Nawigacja klawiaturą:</p>
      <ul className={styles.errorList}>
      <li className={styles.errorItem}>Problem: Brak widocznego obramowania (outline) dla linków (błąd krytyczny).</li>
      <li className={styles.errorItem}>Rekomendacja: Upewnić się, że wszystkie linki mają widoczny focus outline, co jest zgodne z WCAG 2.2.1 (Klawiatura).</li>
      </ul>
    
      <p className={styles.errorTitle}>7. Nawigacja klawiaturą:</p>
      <ul className={styles.errorList}>
      <li className={styles.errorItem}>Problem: Brak rozwinięcia akordeonu w sekcji FAQ przy pomocy klawiatury (błąd krytyczny).</li>
      <li className={styles.errorItem}>Rekomendacja: Należy upewnić się, że pola zapytań FAQ posiadają widoczny focus outline oraz że można rozwinąć je, np przy pomocy klawisza enter, co jest zgodne z WCAG 2.2.1 (Klawiatura).</li>
      </ul>

      <p className={styles.errorTitle}>8. Struktura nagłówków:</p>
      <ul className={styles.errorList}>
      <li className={styles.errorItem}>Problem: W stopce (footer) użyto nagłówków poziomu 4 (h4), pomijając wcześniejsze poziomy (h2 i h3), co skutkuje przeskokiem w hierarchii nagłówków (błąd umiarkowany). Taka struktura może wprowadzać w błąd użytkowników technologii asystujących, utrudniając zrozumienie logicznej organizacji treści.</li>
      <li className={styles.errorItem}>Rekomendacja: Zachować semantyczną kolejność nagłówków (np. h2, h3, h4) bez pomijania poziomów. Zgodne z WCAG 1.3.1 (Informacja i relacje).</li>
      </ul>
    
      <p className={styles.errorTitle}>9. Linki zewnętrzne:</p>
      <ul className={styles.errorList}>
      <li className={styles.errorItem}>Problem: Brak informacji o otwieraniu nowych okien (umiarkowany).</li>
      <li className={styles.errorItem}>Rekomendacja: Dodaj informację tekstową dla linków otwierających nowe okna, zgodnie z WCAG 3.2.2 (Zmiana na żądanie).</li>
      </ul>
    
      <p className={styles.errorTitle}>10. Linki zewnętrzne:</p>
      <ul className={styles.errorList}>
      <li className={styles.errorItem}>Problem: Brak informacji o otwieraniu nowych okien (umiarkowany).</li>
      <li className={styles.errorItem}>Rekomendacja: Dodaj informację tekstową dla linków otwierających nowe okna, zgodnie z WCAG 3.2.2 (Zmiana na żądanie).</li>
      </ul>
    
      <p className={styles.errorTitle}>11. Treści nietekstowe:</p>
      <ul className={styles.errorList}>
      <li className={styles.errorItem}>Problem: Brak opisu guzika powrotu do góry dla czytników ekranowych (umiarkowany).</li>
      <li className={styles.errorItem}>Rekomendacja: Dodaj brakujący atrybut np aria-label="Powrót do góry strony" lub tekst alternatywny, zgodnie z WCAG 1.1.1 (Treść nietekstowa).</li>
      </ul>

      <p className={styles.errorTitle}>12. Puste linki:</p>
      <ul className={styles.errorList}>
      <li className={styles.errorItem}>Problem: Link prowadzący do profilu Facebook ( ) nie zawiera żadnego tekstu ani alternatywnego opisu dostępnego dla czytników ekranu (np. aria-label). Ikona ( ) jest oznaczona jako aria-hidden="true", a element tekstowy jest pusty. To powoduje, że użytkownicy korzystający z technologii asystujących nie wiedzą, dokąd prowadzi ten link (błąd umiarkowany).</li>
      <li className={styles.errorItem}>Rekomendacja: Dodać atrybut aria-label="Facebook firmy" do elementu   lub uzupełnić element tekstowy o ukryty wizualnie opis. Poprawka zapewni zgodność z WCAG 2.4.4 – Cel linku (poziom A).</li>
      </ul>

      <p className={styles.errorTitle}>13. Walidacja formularzy:</p>
      <ul className={styles.errorList}>
      <li className={styles.errorItem}>Problem: Brak wskazówek przy błędach i weryfikacji danych (umiarkowany).</li>
      <li className={styles.errorItem}>Rekomendacja: Implementacja mechanizmów walidacji i podpowiedzi, zgodnie z WCAG 3.3.1 (Identyfikacja błędów).</li>
      </ul>

      <p className={styles.errorTitle}>14. Struktura tytułów:</p>
      <ul className={styles.errorList}>
      <li className={styles.errorItem}>Problem: Niespójna struktura tytułów na podstronach (mało istotny).</li>
      <li className={styles.errorItem}>Rekomendacja: Ujednolicić strukturę tytułów, zgodnie z WCAG 2.4.2 (Tytuły stron).</li>
      </ul>

      <p className={styles.errorTitle}>15. Brak skiplinków:</p>
      <ul className={styles.errorList}>
      <li className={styles.errorItem}>Problem: Brak linków umożliwiających pominięcie powtarzających się bloków nawigacyjnych. Użytkownicy poruszający się po stronie za pomocą klawiatury lub czytników ekranu muszą każdorazowo przechodzić przez całe menu, co jest uciążliwe i czasochłonne.</li>
      <li className={styles.errorItem}>Rekomendacja: Implementacja mechanizmu skiplinków (linków "Przejdź do treści"), zgodnie z WCAG 2.4.1 (Pomijanie bloków). Dodać widoczny (np. po najechaniu tabulatorem) link "Przejdź do treści" na początku strony, kierujący do sekcji .</li>
      </ul>

      <p className={styles.errorTitle}>16. Brak skiplinków:</p>
      <ul className={styles.errorList}>
      <li className={styles.errorItem}>Problem: Brak linków umożliwiających pominięcie powtarzających się bloków nawigacyjnych. Użytkownicy poruszający się po stronie za pomocą klawiatury lub czytników ekranu muszą każdorazowo przechodzić przez całe menu, co jest uciążliwe i czasochłonne.</li>
      <li className={styles.errorItem}>Rekomendacja: Implementacja mechanizmu skiplinków (linków "Przejdź do treści"), zgodnie z WCAG 2.4.1 (Pomijanie bloków). Dodać widoczny (np. po najechaniu tabulatorem) link "Przejdź do treści" na początku strony, kierujący do sekcji .</li>
      </ul>

      <h3 className={styles.subtitle}>Oświadczenie</h3>
      <p>Audyt został przeprowadzony manualnie oraz przy pomocy narzędzi automatycznych zgodnie z wytycznymi WCAG 2.2 na poziomie AA. Raport nie stanowi certyfikatu zgodności, lecz dokumentuje aktualny stan dostępności oraz kierunki poprawy.</p>
    </div>
  )
}

export default ClientReadyReport