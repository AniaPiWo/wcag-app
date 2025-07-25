/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react'
import styles from './ClientReadyReport.module.scss'
import { getManualAudit } from '@/app/actions/manual-audit'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

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
  const [generatingPdf, setGeneratingPdf] = useState(false);  
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
    // Reference to report content for PDF generation
    const reportRef = useRef<HTMLDivElement>(null);
  
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

  // Generate PDF function
  const generatePdf = async () => {
    if (!reportRef.current || !auditData) return;
    
    setGeneratingPdf(true);
    
    // Define type for storing original styles
    interface OriginalStyle {
      element: HTMLElement;
      style: string;
    }
    const originalStyles: OriginalStyle[] = [];

    // Znajdź elementy do podziału na określone strony PDF
    const detailsElement = reportRef.current.querySelector(`.${styles.reportHeader}`);
    const summaryElement = reportRef.current.querySelector(`.${styles.aiSummary}`);
    const problemsElement = reportRef.current.querySelector('h3.'+styles.subtitle); // Główne problemy dostępności
    
    try {
      const reportElement = reportRef.current;
      
      // Save original styles to restore later
      const originalDisplay = reportElement.style.display;
      const originalPosition = reportElement.style.position;
      const originalOverflow = document.body.style.overflow;
      
      // Hide control buttons during PDF generation
      const controlButtons = document.querySelectorAll(`.${styles.topEditControls}`);
      const buttonsDisplay: string[] = [];
      
      controlButtons.forEach((button) => {
        const el = button as HTMLElement;
        buttonsDisplay.push(el.style.display);
        el.style.display = 'none';
      });
      
      // Prepare element for capturing
      reportElement.style.display = 'block';
      reportElement.style.position = 'static'; // Static position works better for capturing
      document.body.style.overflow = 'auto';
      
      // Apply inline styles directly to elements for PDF

      // Style title (h1)
      const titleElements1 = reportElement.querySelectorAll('h1');
      titleElements1.forEach(el => {
        const element = el as HTMLElement;
        originalStyles.push({element, style: element.getAttribute('style') || ''});
        element.style.cssText += 'font-size: 3rem; padding: 1rem; margin: 6rem 0;';
      });
      
      // Style title (h2)
      const titleElements2 = reportElement.querySelectorAll('h2');
      titleElements2.forEach(el => {
        const element = el as HTMLElement;
        originalStyles.push({element, style: element.getAttribute('style') || ''});
        element.style.cssText += 'font-size: 2.6rem; background-color: #A985FF; color: white; padding: 1rem; margin: 6rem 0;';
      });
      
      // Style h3 titles
      const h3Elements = reportElement.querySelectorAll('h3');
      h3Elements.forEach(el => {
        const element = el as HTMLElement;
        originalStyles.push({element, style: element.getAttribute('style') || ''});
        element.style.cssText += 'font-size: 2rem; margin: 3rem 0 2rem 0;';
      });
      
      // Style paragraphs
      const paragraphs = reportElement.querySelectorAll('p');
      paragraphs.forEach(el => {
        const element = el as HTMLElement;
        originalStyles.push({element, style: element.getAttribute('style') || ''});
        element.style.cssText += 'font-size: 1.6rem; line-height: 1.5; margin-bottom: 0.3rem;';
      });

            // Style list items
            const listItems = reportElement.querySelectorAll('li');
            listItems.forEach(el => {
              const element = el as HTMLElement;
              originalStyles.push({element, style: element.getAttribute('style') || ''});
              element.style.cssText += 'font-size: 1.6rem; line-height: 1.5; margin-bottom: 0.3rem;';
            });
      
      // Style strong elements
      const strongElements = reportElement.querySelectorAll('strong');
      strongElements.forEach(el => {
        const element = el as HTMLElement;
        originalStyles.push({element, style: element.getAttribute('style') || ''});
        element.style.cssText += 'font-size: 1.6rem;';
      });
      
      // Give browser time to apply styles
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Dodaj klasy CSS i atrybuty dla identyfikacji wszystkich ważnych elementów raportu
      const problemCategoriesElements = reportElement.querySelectorAll('[class*="problemCategory"]');
      problemCategoriesElements.forEach((el, idx) => {
        (el as HTMLElement).setAttribute('data-category', `category-${idx}`);
        (el as HTMLElement).style.pageBreakInside = 'avoid';
        (el as HTMLElement).style.breakInside = 'avoid';
      });
      
      // Oznacz wszystkie problemy i rekomendacje jako niepodzielne
      const problemElements = reportElement.querySelectorAll('[class*="problemItem"]');
      problemElements.forEach((el, idx) => {
        (el as HTMLElement).setAttribute('data-problem', `problem-${idx}`);
        (el as HTMLElement).style.pageBreakInside = 'avoid';
        (el as HTMLElement).style.breakInside = 'avoid';
      });
      
      // Zastosuj style do h3, h4 i p, aby zapobiec dzieleniu ich
      reportElement.querySelectorAll('h3, h4, p, div').forEach(el => {
        (el as HTMLElement).style.pageBreakInside = 'avoid';
        (el as HTMLElement).style.breakInside = 'avoid';
      });

      // Create basic A4 PDF
      const pdf = new jsPDF('portrait', 'pt', 'a4');
      
      // Get A4 dimensions in points
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      console.log("pageWidth", pageWidth);
      console.log("pageHeight", pageHeight);
      
      // Zmniejszone marginesy
      const topMargin = 30  ;
      const sideMargin = 40;
      const bottomMargin = 30;
      const printableWidth = pageWidth - (sideMargin * 2);
      
      // Capture the entire report at once with optimized quality
      const canvas = await html2canvas(reportElement, {
        scale: 1.5, // Zoptymalizowana jakość dla mniejszego rozmiaru pliku
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        imageTimeout: 0 // Zapobiegaj timeoutom dla dużych raportów
      });
      
      // Calculate dimensions and scaling
      const scale = printableWidth / canvas.width;
      const scaledHeight = canvas.height * scale;
      const totalPdfHeight = scaledHeight;
      
      // Calculate available height per page (accounting for margins and footer)
      const footerHeight = 20; // Zmniejszona wysokość stopki
      const availablePageHeight = pageHeight - topMargin - bottomMargin - footerHeight - 10; // Mniejszy margines dolny
      

      
      // If content fits on a single page
      if (totalPdfHeight <= availablePageHeight) {
        // Kompresja jakości
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.85),  // JPEG z kompresjÄ… dla mniejszej wagi pliku
          'JPEG',
          sideMargin,
          topMargin,
          printableWidth,
          scaledHeight
        );
      } else {
        // Content requires multiple pages - more precise page splitting
        const contentPixelsPerPdfPoint = canvas.height / totalPdfHeight;
        const pixelsPerPage = availablePageHeight * contentPixelsPerPdfPoint;
        
        const pageCount = Math.ceil(canvas.height / pixelsPerPage);
        
        // Zbierzmy informacje o pozycji kluczowych elementów dla sztywnego podziału stron
        // Strona 1: Szczegóły audytu
        // Strona 2: Tylko podsumowanie
        // Strona 3+: Problemy dostępności i rekomendacje
        const pageBoundaries: { pageType: string; top: number; bottom: number; }[] = [];
        
        // Pobierz informacje o położeniu poszczególnych sekcji
        let detailsTop = 0;
        let detailsBottom = 0;
        let summaryTop = 0;
        let summaryBottom = 0;
        let problemsTop = 0;
        
        if (detailsElement) {
          const rect = detailsElement.getBoundingClientRect();
          detailsTop = rect.top + window.scrollY;
          detailsBottom = rect.bottom + window.scrollY;
          console.log('Znaleziono szczegóły audytu:', detailsTop, detailsBottom);
        }
        
        if (summaryElement) {
          const rect = summaryElement.getBoundingClientRect();
          summaryTop = rect.top + window.scrollY;
          summaryBottom = rect.bottom + window.scrollY;
          console.log('Znaleziono podsumowanie:', summaryTop, summaryBottom);
        }
        
        if (problemsElement) {
          const rect = problemsElement.getBoundingClientRect();
          problemsTop = rect.top + window.scrollY;
          console.log('Znaleziono sekcję problemów:', problemsTop);
        }

        // Definiujemy granice stron na podstawie zebranych informacji
        // Strona 1: Od początku do końca szczegółów lub do początku podsumowania
        // Strona 2: Od początku podsumowania do końca podsumowania lub do początku problemów
        // Strona 3+: Od początku problemów do końca dokumentu
        
        // Granice strony 1 - Szczegóły
        const page1Start = 0;
        const page1End = summaryTop || problemsTop || canvas.height;
        
        // Granice strony 2 - Podsumowanie
        const page2Start = summaryTop;
        const page2End = problemsTop || canvas.height;
        
        // Granice strony 3 - Problemy
        const page3Start = problemsTop;
        
        console.log('Granice stron:', {
          page1: { start: page1Start, end: page1End },
          page2: { start: page2Start, end: page2End },
          page3Start
        });
        
        // Używamy małego overlap dla bezpiecznego nakładania się stron
        const overlapPixels = 20;
        
        // Generujemy dokładnie 3 strony (lub mniej, jeśli nie mamy np. sekcji problemów)
        // 1. Strona z szczegółami audytu
        // 2. Strona z podsumowaniem
        // 3. Strona z problemami i rekomendacjami
        
        // Strona 1 - Szczegóły audytu
        console.log('Generowanie strony 1 - szczegóły audytu');
        
        // Obliczanie obszaru strony 1
        const page1SourceY = page1Start;
        const page1Height = page1End - page1Start;
        const page1SourceHeight = Math.min(page1Height, canvas.height - page1SourceY);
        
        // Wycinamy fragment obrazu dla strony 1
        const tempCanvas1 = document.createElement('canvas');
        tempCanvas1.width = canvas.width;
        tempCanvas1.height = page1SourceHeight;
        const ctx1 = tempCanvas1.getContext('2d');
        if (ctx1) {
          ctx1.drawImage(
            canvas,
            0,
            page1SourceY,
            canvas.width,
            page1SourceHeight,
            0,
            0,
            tempCanvas1.width,
            tempCanvas1.height
          );
        }

        // Dodajemy wycięty fragment do PDF
        pdf.addImage({
          imageData: tempCanvas1.toDataURL('image/jpeg', 0.85),
          format: 'JPEG',
          x: sideMargin,
          y: topMargin,
          width: printableWidth,
          height: page1SourceHeight / contentPixelsPerPdfPoint,
          alias: undefined,
          compression: 'FAST',
          rotation: 0
        });
        
        // Strona 2 - Podsumowanie (tylko jeśli istnieje)
        if (summaryTop > 0) {
          pdf.addPage();
          console.log('Generowanie strony 2 - podsumowanie');
          
          // Obliczanie obszaru strony 2
          const page2SourceY = page2Start;
          const page2Height = page2End - page2Start;
          const page2SourceHeight = Math.min(page2Height, canvas.height - page2SourceY);
          
          // Wycinamy fragment obrazu dla strony 2 (podsumowanie)
          const tempCanvas2 = document.createElement('canvas');
          tempCanvas2.width = canvas.width;
          tempCanvas2.height = page2SourceHeight;
          const ctx2 = tempCanvas2.getContext('2d');
          if (ctx2) {
            ctx2.drawImage(
              canvas,
              0,
              page2SourceY,
              canvas.width,
              page2SourceHeight,
              0,
              0,
              tempCanvas2.width,
              tempCanvas2.height
            );
          }

          // Dodajemy wycięty fragment do PDF
          pdf.addImage({
            imageData: tempCanvas2.toDataURL('image/jpeg', 0.85),
            format: 'JPEG',
            x: sideMargin,
            y: topMargin,
            width: printableWidth,
            height: page2SourceHeight / contentPixelsPerPdfPoint,
            alias: undefined,
            compression: 'FAST',
            rotation: 0
          });
        }
        
        // Strona 3+ - Problemy i rekomendacje (tylko jeśli istnieje)
        if (problemsTop > 0) {
          pdf.addPage();
          console.log('Generowanie strony 3 - problemy i rekomendacje');
          
          // Dla sekcji problemów możemy potrzebować wielu stron, więc dzielimy ją na części
          const problemsHeight = canvas.height - page3Start;
          const problemsPages = Math.ceil(problemsHeight / pixelsPerPage);
          
          // Na pierwszej stronie problemów nie stosujemy overlap
          let sourceY = page3Start;
          let sourceHeight = Math.min(pixelsPerPage, canvas.height - sourceY);
          
          // Wycinamy fragment obrazu dla pierwszej strony problemów
          const tempCanvas3 = document.createElement('canvas');
          tempCanvas3.width = canvas.width;
          tempCanvas3.height = sourceHeight;
          const ctx3 = tempCanvas3.getContext('2d');
          if (ctx3) {
            ctx3.drawImage(
              canvas,
              0,
              sourceY,
              canvas.width,
              sourceHeight,
              0,
              0,
              tempCanvas3.width,
              tempCanvas3.height
            );
          }

          // Dodajemy wycięty fragment do PDF
          pdf.addImage({
            imageData: tempCanvas3.toDataURL('image/jpeg', 0.85),
            format: 'JPEG',
            x: sideMargin,
            y: topMargin,
            width: printableWidth,
            height: sourceHeight / contentPixelsPerPdfPoint,
            alias: undefined,
            compression: 'FAST',
            rotation: 0
          });
          
          // Dodajemy kolejne strony dla długiej sekcji problemów
          for (let i = 1; i < problemsPages; i++) {
            pdf.addPage();
            sourceY = page3Start + (i * pixelsPerPage) - overlapPixels;
            sourceHeight = Math.min(pixelsPerPage + overlapPixels, canvas.height - sourceY);
            
            // Wycinamy fragment obrazu dla kolejnych stron problemów
            const tempCanvas4 = document.createElement('canvas');
            tempCanvas4.width = canvas.width;
            tempCanvas4.height = sourceHeight;
            const ctx4 = tempCanvas4.getContext('2d');
            if (ctx4) {
              ctx4.drawImage(
                canvas,
                0,
                sourceY,
                canvas.width,
                sourceHeight,
                0,
                0,
                tempCanvas4.width,
                tempCanvas4.height
              );
            }

            // Dodajemy wycięty fragment do PDF
            pdf.addImage({
              imageData: tempCanvas4.toDataURL('image/jpeg', 0.85),
              format: 'JPEG',
              x: sideMargin,
              y: topMargin,
              width: printableWidth,
              height: sourceHeight / contentPixelsPerPdfPoint,
              alias: undefined,
              compression: 'FAST',
              rotation: 0
            });
          }
        }
        
        // Dodaj stopki na każdej stronie
        const totalPages = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          
          // Stopka na każdej stronie
          const footerY = pageHeight - bottomMargin - footerHeight / 2;
          pdf.setDrawColor(220, 220, 220);
          pdf.setLineWidth(0.5);
          pdf.line(sideMargin, footerY - footerHeight / 2, pageWidth - sideMargin, footerY - footerHeight / 2);
          
          // Dodaj stopkę na każdej stronie z polskimi znakami
          const url = auditData?.url || 'Brak adresu URL';
          const domain = getDomainOnly(url);
          const footerText = "Audyt dostepnosci cyfrowej dla " + domain + " | str. " + i + " z " + totalPages;
          const footerFontSize = 9;
          
          // Ustaw właściwości tekstu
          pdf.setFontSize(footerFontSize);
          pdf.setTextColor(100, 100, 100);
          
          // Oblicz szerokość tekstu aby go wycentrować
          const textWidth = pdf.getStringUnitWidth(footerText) * footerFontSize / pdf.internal.scaleFactor;
          const textX = (pageWidth - textWidth) / 2;
          
          // Pozycja tekstu w stopce
          pdf.text(footerText, textX, pageHeight - 12);
        }
      }
      
      // Generate sanitized filename from site URL and client name
      const sanitizedSiteUrl = (editedContent.url || auditData.url || 'strona')
        .replace(/https?:\/\//, '')
        .replace(/\/$/,'')
        .replace(/[^a-z0-9]/gi, '_');
      const fileName = `raport_wcag_${sanitizedSiteUrl}.pdf`;
      
      // Save the PDF
      pdf.save(fileName);
      // Clean up and restore original styles
      reportElement.style.display = originalDisplay;
      reportElement.style.position = originalPosition;
      document.body.style.overflow = originalOverflow;
      
      controlButtons.forEach((button, index) => {
        (button as HTMLElement).style.display = buttonsDisplay[index] || '';
      });
      
      // Restore original inline styles
      originalStyles.forEach(({element, style}) => {
        element.setAttribute('style', style);
      });
      
      setGeneratingPdf(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Restore original inline styles in case of error
      originalStyles.forEach(({element, style}) => {
        element.setAttribute('style', style);
      });
      
      setGeneratingPdf(false);
    }
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

    <div className={`${styles.mainContent} ${isEditing ? styles.mainContentWithSidebar : ''}`} ref={reportRef}>

      {!isEditing && (
        <div className={styles.topEditControls}>
          <button onClick={handleEditToggle} className={styles.editButton}>
            Edytuj raport
          </button>
          <button 
            onClick={generatePdf} 
            className={styles.pdfButton} 
            disabled={generatingPdf}
          >
            {generatingPdf ? 'Generowanie...' : 'Generuj PDF'}
          </button>
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