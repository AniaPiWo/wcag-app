/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import React, { useState, useEffect, useRef } from 'react';
import styles from './ManualAuditForm.module.scss';
import { auditBasic } from '@/lib/wcag_checklist/basic';
import { auditIntermediate } from '@/lib/wcag_checklist/intermediate';
import { auditAdvanced } from '@/lib/wcag_checklist/advanced';
import { Button } from '@/components';
import { getManualAudit, updateManualAudit, updateAuditItem as updateAuditItemAction } from '@/app/actions/manual-audit';
import ClientReadyReport from '../ClientReadyReport/ClientReadyReport';

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
  readyMadeAudit?: string | null;
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
    readyMadeAudit?: string;
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
  const [readyMadeAudit, setReadyMadeAudit] = useState<string | null>(null);
  
  // Loading states for AI summaries
  const [isLoadingBasicSummary, setIsLoadingBasicSummary] = useState(false);
  const [isLoadingIntermediateSummary, setIsLoadingIntermediateSummary] = useState(false);
  const [isLoadingAdvancedSummary, setIsLoadingAdvancedSummary] = useState(false);
  const [isLoadingConsolidatedSummary, setIsLoadingConsolidatedSummary] = useState(false);
  const [isRunningAutomatedAudit, setIsRunningAutomatedAudit] = useState(false);
  const [automatedAuditMessage, setAutomatedAuditMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  // Definicja typu dla istniejącego audytu
  type ExistingAuditType = {
    id: string;
    url: string;
    email: string;
    name: string;
    status: string;
    createdAt: string;
    completedAt?: string;
    results?: {
      violations: {
        id: string;
        impact: string;
        tags: string[];
        description: string;
        help: string;
        helpUrl: string;
        nodes: {
          html: string;
          target: string[];
          failureSummary?: string;
        }[];
      }[];
      passes: {
        id: string;
        tags: string[];
        description: string;
        help: string;
        helpUrl: string;
        nodes: {
          html: string;
          target: string[];
        }[];
      }[];
      incomplete: {
        id: string;
        impact?: string;
        tags: string[];
        description: string;
        help: string;
        helpUrl: string;
        nodes: {
          html: string;
          target: string[];
          failureSummary?: string;
        }[];
      }[];
      inapplicable: {
        id: string;
        tags: string[];
        description: string;
        help: string;
        helpUrl: string;
      }[];
      summary: string;
    };
    aiSummary?: {
      basic?: string;
      technical?: string;
      consolidated?: string;
    };
  };
  
  const [existingAudit, setExistingAudit] = useState<ExistingAuditType | null>(null);
  const [showExistingAudit, setShowExistingAudit] = useState<boolean>(false);
  const [showFullViolations, setShowFullViolations] = useState<boolean>(false);
  
  // Edit mode states for AI summaries
  const [isEditingBasicSummary, setIsEditingBasicSummary] = useState(false);
  const [isEditingIntermediateSummary, setIsEditingIntermediateSummary] = useState(false);
  const [isEditingAdvancedSummary, setIsEditingAdvancedSummary] = useState(false);
  const [isEditingConsolidatedSummary, setIsEditingConsolidatedSummary] = useState(false);
  const [isEditingReadyMadeAudit, setIsEditingReadyMadeAudit] = useState(false);
  
  // Temporary states for editing summaries
  const [editedBasicSummary, setEditedBasicSummary] = useState<string>('');
  const [editedIntermediateSummary, setEditedIntermediateSummary] = useState<string>('');
  const [editedAdvancedSummary, setEditedAdvancedSummary] = useState<string>('');
  const [editedConsolidatedSummary, setEditedConsolidatedSummary] = useState<string>('');
  const [editedReadyMadeAudit, setEditedReadyMadeAudit] = useState<string>('');

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
  // Function to save edited AI summary
  const saveEditedSummary = async (level: 'basic' | 'intermediate' | 'advanced' | 'consolidated' | 'readyMade') => {
    try {
      const updateData: UpdateAuditData = {};
      
      switch (level) {
        case 'basic':
          updateData.basicAuditAISummary = editedBasicSummary;
          setBasicAduditAISummary(editedBasicSummary);
          setIsEditingBasicSummary(false);
          break;
        case 'intermediate':
          updateData.intermediateAuditAISummary = editedIntermediateSummary;
          setIntermediateAduditAISummary(editedIntermediateSummary);
          setIsEditingIntermediateSummary(false);
          break;
        case 'advanced':
          updateData.advancedAuditAISummary = editedAdvancedSummary;
          setAdvancedAduditAISummary(editedAdvancedSummary);
          setIsEditingAdvancedSummary(false);
          break;
        case 'consolidated':
          updateData.consolidatedAuditAISummary = editedConsolidatedSummary;
          setConsolidatedAISummary(editedConsolidatedSummary);
          setIsEditingConsolidatedSummary(false);
          break;
        case 'readyMade':
          updateData.readyMadeAudit = editedReadyMadeAudit;
          setReadyMadeAudit(editedReadyMadeAudit);
          setIsEditingReadyMadeAudit(false);
          break;
      }
      
      await updateManualAudit(id, updateData);
      setSaveMessage({ type: 'success', text: 'Raport AI zapisany' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Błąd podczas zapisywania edytowanego raportu AI:', error);
      setSaveMessage({ type: 'error', text: 'Błąd podczas zapisywania raportu AI' });
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };
  
  // Function to run automated audit
  const handleAutomatedAudit = async () => {
    if (!audit?.url) {
      setAutomatedAuditMessage({ type: 'error', text: 'Brak adresu URL do audytu automatycznego' });
      setTimeout(() => setAutomatedAuditMessage(null), 3000);
      return;
    }

    setIsRunningAutomatedAudit(true);
    setAutomatedAuditMessage({ type: 'info', text: 'Sprawdzanie istniejących audytów...' });

    try {
      // Upewnij się, że URL ma prawidłowy format (zaczyna się od http:// lub https://)
      let auditUrl = audit.url;
      if (!auditUrl.startsWith('http://') && !auditUrl.startsWith('https://')) {
        auditUrl = 'https://' + auditUrl;
      }
      
      // Najpierw sprawdź, czy istnieją już audyty dla tego URL
      const existingAuditsResponse = await fetch(`/api/check-existing-audits?url=${encodeURIComponent(auditUrl)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (existingAuditsResponse.ok) {
        const existingAuditsData = await existingAuditsResponse.json();
        
        if (existingAuditsData.existingAudits && existingAuditsData.existingAudits.length > 0) {
          // Znaleziono istniejące audyty dla tego URL
          const mostRecentAudit = existingAuditsData.existingAudits[0]; // Pierwszy to najnowszy
          const auditDate = new Date(mostRecentAudit.completedAt || mostRecentAudit.createdAt);
          const formattedDate = auditDate.toLocaleDateString('pl-PL') + ' ' + auditDate.toLocaleTimeString('pl-PL');
          
          // Pobierz szczegółowe dane audytu
          const detailedAuditResponse = await fetch(`/api/admin-audits/${mostRecentAudit.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (detailedAuditResponse.ok) {
            const detailedAudit = await detailedAuditResponse.json();
            console.log('Pobrane dane audytu:', detailedAudit);
            console.log('Naruszenia:', detailedAudit.parsedViolations);
            
            // Przygotowanie danych w oczekiwanej strukturze
            const formattedAudit = {
              ...detailedAudit,
              results: {
                ...detailedAudit.results || {},
                violations: detailedAudit.parsedViolations || []
              }
            };
            setExistingAudit(formattedAudit);
            
            // Zapytaj użytkownika, czy chce użyć istniejącego audytu
            if (confirm(`Znaleziono istniejący audyt dla URL ${auditUrl} z dnia ${formattedDate}. \n\nCzy chcesz użyć tego audytu zamiast generować nowy?`)) {
              setAutomatedAuditMessage({ 
                type: 'success', 
                text: `Użyto istniejącego audytu z ID: ${mostRecentAudit.id}` 
              });
              setShowExistingAudit(true);
              setIsRunningAutomatedAudit(false);
              setTimeout(() => setAutomatedAuditMessage(null), 5000);
              return;
            } else {
              // Jeśli użytkownik nie chce użyć istniejącego audytu, wyczyść dane
              setExistingAudit(null);
              setShowExistingAudit(false);
            }
          } else {
            console.error('Nie udało się pobrać szczegółów audytu:', await detailedAuditResponse.text());
          }
        }
      }
      
      // Kontynuuj z generowaniem nowego audytu
      setAutomatedAuditMessage({ type: 'info', text: 'Uruchamianie audytu automatycznego...' });
      
      const requestData = { 
        url: auditUrl,
        email: audit.email || 'test@example.com', // Domyślny email jeśli brak
        name: audit.name || 'Audyt automatyczny' // Domyślna nazwa jeśli brak
      };
      
      console.log('Wysyłanie żądania audytu automatycznego:', requestData);
      
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Odpowiedź błędu:', errorText);
        throw new Error(`Błąd HTTP: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Odpowiedź z API audytu:', data);
      
      if (data.id) {
        setAutomatedAuditMessage({ 
          type: 'success', 
          text: `Audyt automatyczny uruchomiony pomyślnie. ID: ${data.id}` 
        });
      } else {
        setAutomatedAuditMessage({ 
          type: 'info', 
          text: 'Audyt automatyczny w trakcie przetwarzania. Sprawdź listę audytów automatycznych za kilka minut.' 
        });
      }
    } catch (error) {
      console.error('Błąd podczas uruchamiania audytu automatycznego:', error);
      setAutomatedAuditMessage({ 
        type: 'error', 
        text: `Błąd podczas uruchamiania audytu automatycznego: ${error instanceof Error ? error.message : 'Nieznany błąd'}` 
      });
    } finally {
      setIsRunningAutomatedAudit(false);
      setTimeout(() => setAutomatedAuditMessage(null), 5000);
    }
  };
  
  // Function to start editing a summary
  const startEditingSummary = (level: 'basic' | 'intermediate' | 'advanced' | 'consolidated' | 'readyMade') => {
    switch (level) {
      case 'basic':
        setEditedBasicSummary(basicAduditAISummary || '');
        setIsEditingBasicSummary(true);
        break;
      case 'intermediate':
        setEditedIntermediateSummary(intermediateAduditAISummary || '');
        setIsEditingIntermediateSummary(true);
        break;
      case 'advanced':
        setEditedAdvancedSummary(advancedAduditAISummary || '');
        setIsEditingAdvancedSummary(true);
        break;
      case 'consolidated':
        setEditedConsolidatedSummary(consolidatedAISummary || '');
        setIsEditingConsolidatedSummary(true);
        break;
      case 'readyMade':
        setEditedReadyMadeAudit(readyMadeAudit || '');
        setIsEditingReadyMadeAudit(true);
        break;
    }
  };
  
  // Function to cancel editing
  const cancelEditingSummary = (level: 'basic' | 'intermediate' | 'advanced' | 'consolidated' | 'readyMade') => {
    switch (level) {
      case 'basic':
        setIsEditingBasicSummary(false);
        break;
      case 'intermediate':
        setIsEditingIntermediateSummary(false);
        break;
      case 'advanced':
        setIsEditingAdvancedSummary(false);
        break;
      case 'consolidated':
        setIsEditingConsolidatedSummary(false);
        break;
      case 'readyMade':
        setIsEditingReadyMadeAudit(false);
        break;
    }
  };

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
        // Używamy dedykowanego pola readyMadeAudit
        if (auditData.readyMadeAudit) {
          setReadyMadeAudit(auditData.readyMadeAudit);
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

            <ClientReadyReport id={id} audit={audit} />
            
            {/* Sekcja gotowego audytu */}
            <div className={styles.aiSummary}>
              <div className={styles.summaryHeader}>
                <h3>Gotowy audyt</h3>
                {!isEditingReadyMadeAudit ? (
                  <div className={styles.editButtons}>
                    <Button 
                      onClick={() => startEditingSummary('readyMade')}
                      variant="secondary"
                    >
                      Edytuj audyt
                    </Button>
                  </div>
                ) : (
                  <div className={styles.editButtons}>
                    <Button 
                      onClick={() => saveEditedSummary('readyMade')}
                      variant="primary"
                    >
                      Zapisz
                    </Button>
                    <Button 
                      onClick={() => cancelEditingSummary('readyMade')}
                      variant="secondary"
                    >
                      Anuluj
                    </Button>
                  </div>
                )}
              </div>
              {!isEditingReadyMadeAudit ? (
                <div className={styles.summaryContent}>
                  {readyMadeAudit || 'Brak gotowego audytu. Kliknij "Edytuj audyt" aby dodać.'}
                </div>
              ) : (
                <textarea
                  className={styles.summaryTextarea}
                  value={editedReadyMadeAudit}
                  onChange={(e) => setEditedReadyMadeAudit(e.target.value)}
                  rows={15}
                  placeholder="Wprowadź tekst gotowego audytu..."
                />
              )}
            </div>
            
            {/* Sekcja raportu podsumowujący AI */}
            {!consolidatedAISummary && (
              <div className={styles.reportControls}>
                <h3>Generowanie raportu zbiorczego</h3>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      className={styles.checkbox}
                      checked={selectedLevelsForReport.basic} 
                      onChange={(e) => setSelectedLevelsForReport(prev => ({ ...prev, basic: e.target.checked }))} 
                    />
                    Poziom podstawowy
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      className={styles.checkbox}
                      checked={selectedLevelsForReport.intermediate} 
                      onChange={(e) => setSelectedLevelsForReport(prev => ({ ...prev, intermediate: e.target.checked }))} 
                    />
                    Poziom średni
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      className={styles.checkbox}
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
            )}
            
            {consolidatedAISummary && (
              <div className={styles.aiSummary}>
                <div className={styles.summaryHeader}>
                  <h3>Zbiorczy raport AI</h3>
                  {!isEditingConsolidatedSummary ? (
                    <div className={styles.editButtons}>
                      <Button 
                        onClick={() => startEditingSummary('consolidated')}
                        variant="secondary"
                      >
                        Edytuj raport
                      </Button>
                      <Button 
                        onClick={() => {
                          setConsolidatedAISummary(null);
                          setIsLoadingConsolidatedSummary(false);
                        }}
                        variant="secondary"
                      >
                        Wygeneruj ponownie
                      </Button>
                    </div>
                  ) : (
                    <div className={styles.editButtons}>
                      <Button 
                        onClick={() => saveEditedSummary('consolidated')}
                        variant="primary"
                      >
                        Zapisz
                      </Button>
                      <Button 
                        onClick={() => cancelEditingSummary('consolidated')}
                        variant="secondary"
                      >
                        Anuluj
                      </Button>
                    </div>
                  )}
                </div>
                {!isEditingConsolidatedSummary ? (
                  <div className={styles.summaryContent}>
                    {consolidatedAISummary}
                  </div>
                ) : (
                  <textarea
                    className={styles.summaryTextarea}
                    value={editedConsolidatedSummary}
                    onChange={(e) => setEditedConsolidatedSummary(e.target.value)}
                    rows={10}
                  />
                )}
              </div>
            )}

            {/* Sekcja audytu automatycznego */}
            <div className={styles.automatedAuditSection}>
              <h3>Audyt automatyczny</h3>

              <Button 
                variant="secondary"
                onClick={handleAutomatedAudit}
                disabled={isRunningAutomatedAudit}
              >
                {isRunningAutomatedAudit ? 'Uruchamianie...' : 'Uruchom audyt automatyczny'}
              </Button>
              {automatedAuditMessage && (
                <div className={`${styles.automatedAuditMessage} ${styles[automatedAuditMessage.type]}`}>
                  {automatedAuditMessage.text}
                </div>
              )}
              
              {showExistingAudit && existingAudit && (
                <div className={styles.existingAuditContainer}>
                <h4>Istniejący audyt automatyczny</h4>
                <div className={styles.existingAuditDetails}>
                  <p><strong>ID:</strong> {existingAudit.id}</p>
                  <p><strong>URL:</strong> {existingAudit.url}</p>
                  <p><strong>Data utworzenia:</strong> {new Date(existingAudit.createdAt).toLocaleString('pl-PL')}</p>
                  {existingAudit.completedAt && (
                    <p><strong>Data zakończenia:</strong> {new Date(existingAudit.completedAt).toLocaleString('pl-PL')}</p>
                  )}
                  <p><strong>Status:</strong> {existingAudit.status}</p>
                </div>
                
                {existingAudit.results && (
                  <div className={styles.existingAuditResults}>
                    <h5>Wyniki audytu</h5>
                    <div className={styles.violationsSummary}>
                      <p><strong>Liczba naruszeń:</strong> {existingAudit.results?.violations?.length || 0}</p>
                      <p><strong>Liczba zaliczonych testów:</strong> {existingAudit.results?.passes?.length || 0}</p>
                      <p><strong>Liczba niekompletnych testów:</strong> {existingAudit.results?.incomplete?.length || 0}</p>
                      <p><strong>Liczba nieaplikowalnych testów:</strong> {existingAudit.results?.inapplicable?.length || 0}</p>
                    </div>
                    
                    {existingAudit.results?.violations && existingAudit.results.violations.length > 0 && (
                      <div className={styles.existingAuditViolations}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h5>Naruszenia ({existingAudit.results?.violations?.length || 0}):</h5>
                          <button 
                            className={styles.viewFullAuditButton}
                            onClick={() => {
                              console.log('Przełączanie widoku naruszeń, aktualny stan:', showFullViolations);
                              console.log('Liczba naruszeń:', existingAudit.results?.violations?.length);
                              setShowFullViolations(!showFullViolations);
                            }}
                          >
                            {showFullViolations ? 'Pokaż skrócony widok' : 'Zobacz pełne naruszenia'}
                          </button>
                        </div>
                        <ul>
                          {/* Logowanie stanu naruszeń */}
                          {(() => { console.log('Renderowanie naruszeń, showFullViolations:', showFullViolations); return null; })()}
                          {!showFullViolations ? (
                            // Pokazuje tylko pierwsze 5 naruszeń
                            <>
                              {(() => { console.log('Renderowanie skróconej listy naruszeń'); return null; })()}
                              {existingAudit.results?.violations?.slice(0, 5).map((violation, index) => (
                                <li key={index}>
                                  <strong>{violation.id}</strong> - {violation.description}
                                  <span className={styles.impactTag}>{violation.impact}</span>
                                </li>
                              ))}
                              {(existingAudit.results?.violations?.length || 0) > 5 && (
                                <li>... i {(existingAudit.results?.violations?.length || 0) - 5} więcej</li>
                              )}
                            </>
                          ) : (
                            // Pokazuje wszystkie naruszenia z pełnymi szczegółami
                            <>
                              {(() => { console.log('Renderowanie pełnej listy naruszeń'); return null; })()}
                              {existingAudit.results?.violations?.map((violation, index) => (
                                <li key={index} className={styles.fullViolation}>
                                  <div className={styles.violationHeader}>
                                    <strong>{violation.id}</strong>
                                    <span className={`${styles.impactTag} ${styles[violation.impact || 'minor']}`}>
                                      {violation.impact}
                                    </span>
                                  </div>
                                  <div className={styles.violationDescription}>
                                    <p><strong>Opis:</strong> {violation.description}</p>
                                    <p><strong>Pomoc:</strong> {violation.help}</p>
                                    <p><strong>Wpływ:</strong> {violation.impact}</p>
                                    <p><strong>Reguła WCAG:</strong> {violation.tags?.filter(tag => tag.startsWith('wcag')).join(', ')}</p>
                                  </div>
                                  {violation.nodes && violation.nodes.length > 0 && (
                                    <div className={styles.violationNodes}>
                                      <p><strong>Znalezione elementy ({violation.nodes.length}):</strong></p>
                                      <ul>
                                        {violation.nodes.map((node, nodeIndex) => (
                                          <li key={nodeIndex}>
                                            <code>{node.html}</code>
                                            {node.failureSummary && (
                                              <p className={styles.failureSummary}>{node.failureSummary}</p>
                                            )}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </li>
                              ))}
                            </>
                          )}
                        </ul>
                      </div>
                    )}
                    
                    {existingAudit.results.summary && (
                      <div className={styles.auditSummary}>
                        <h6>Podsumowanie audytu:</h6>
                        <p>{existingAudit.results.summary}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {existingAudit.aiSummary && (
                  <div className={styles.aiSummarySection}>
                    <h5>Podsumowanie AI</h5>
                    
                    {existingAudit.aiSummary.basic && (
                      <div className={styles.aiSummaryItem}>
                        <h6>Podstawowe podsumowanie:</h6>
                        <p>{existingAudit.aiSummary.basic}</p>
                      </div>
                    )}
                    
                    {existingAudit.aiSummary.technical && (
                      <div className={styles.aiSummaryItem}>
                        <h6>Techniczne podsumowanie:</h6>
                        <p>{existingAudit.aiSummary.technical}</p>
                      </div>
                    )}
                    
                    {existingAudit.aiSummary.consolidated && (
                      <div className={styles.aiSummaryItem}>
                        <h6>Skonsolidowane podsumowanie:</h6>
                        <p>{existingAudit.aiSummary.consolidated}</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className={styles.existingAuditActions}>
  
                  <button 
                    onClick={() => setShowFullViolations(!showFullViolations)}
                    className={styles.viewFullAuditButton}
                  >
                    {showFullViolations ? 'Ukryj szczegóły naruszeń' : 'Zobacz pełne naruszenia'}
                  </button>
                </div>
                </div>
              )}
            </div>
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
                      <span className={styles.description}>{item.wcag}</span>
                      {'level' in item && <span className={styles.tags}>{(item as {level: string}).level}</span>}
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
                  <div className={styles.summaryHeader}>
                    <h4>Raport AI - poziom podstawowy</h4>
                    {!isEditingBasicSummary ? (
                      <div className={styles.editButtons}>
                        <Button 
                          onClick={() => startEditingSummary('basic')}
                          variant="secondary"
                        >
                          Edytuj raport
                        </Button>
                        <Button 
                          onClick={() => {
                            setBasicAduditAISummary(null);
                            setIsLoadingBasicSummary(false);
                          }}
                          variant="secondary"
                        >
                          Wygeneruj ponownie
                        </Button>
                      </div>
                    ) : (
                      <div className={styles.editButtons}>
                        <Button 
                          onClick={() => saveEditedSummary('basic')}
                          variant="primary"
                        >
                          Zapisz
                        </Button>
                        <Button 
                          onClick={() => cancelEditingSummary('basic')}
                          variant="secondary"
                        >
                          Anuluj
                        </Button>
                      </div>
                    )}
                  </div>
                  {!isEditingBasicSummary ? (
                    <div className={styles.aiSummaryContent}>{basicAduditAISummary}</div>
                  ) : (
                    <textarea
                      className={styles.summaryTextarea}
                      value={editedBasicSummary}
                      onChange={(e) => setEditedBasicSummary(e.target.value)}
                      rows={8}
                    />
                  )}
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
                  <div className={styles.summaryHeader}>
                    <h4>Raport AI - poziom średni</h4>
                    {!isEditingIntermediateSummary ? (
                      <div className={styles.editButtons}>
                        <Button 
                          onClick={() => startEditingSummary('intermediate')}
                          variant="secondary"
                        >
                          Edytuj raport
                        </Button>
                        <Button 
                          onClick={() => {
                            setIntermediateAduditAISummary(null);
                            setIsLoadingIntermediateSummary(false);
                          }}
                          variant="secondary"
                        >
                          Wygeneruj ponownie
                        </Button>
                      </div>
                    ) : (
                      <div className={styles.editButtons}>
                        <Button 
                          onClick={() => saveEditedSummary('intermediate')}
                          variant="primary"
                        >
                          Zapisz
                        </Button>
                        <Button 
                          onClick={() => cancelEditingSummary('intermediate')}
                          variant="secondary"
                          >
                          Anuluj
                        </Button>
                      </div>
                    )}
                  </div>
                  {!isEditingIntermediateSummary ? (
                    <div className={styles.aiSummaryContent}>{intermediateAduditAISummary}</div>
                  ) : (
                    <textarea
                      className={styles.summaryTextarea}
                      value={editedIntermediateSummary}
                      onChange={(e) => setEditedIntermediateSummary(e.target.value)}
                      rows={8}
                    />
                  )}
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
                  <div className={styles.summaryHeader}>
                    <h4>Raport AI - poziom zaawansowany</h4>
                    {!isEditingAdvancedSummary ? (
                      <div className={styles.editButtons}>
                        <Button 
                          onClick={() => startEditingSummary('advanced')}
                          variant="secondary"
                        >
                          Edytuj raport
                        </Button>
                        <Button 
                          onClick={() => {
                            setAdvancedAduditAISummary(null);
                            setIsLoadingAdvancedSummary(false);
                          }}
                          variant="secondary"
                        >
                          Wygeneruj ponownie
                        </Button>
                      </div>
                    ) : (
                      <div className={styles.editButtons}>
                        <Button 
                          onClick={() => saveEditedSummary('advanced')}
                          variant="primary"
                        >
                          Zapisz
                        </Button>
                        <Button 
                          onClick={() => cancelEditingSummary('advanced')}
                          variant="secondary"
                        >
                          Anuluj
                        </Button>
                      </div>
                    )}
                  </div>
                  {!isEditingAdvancedSummary ? (
                    <div className={styles.aiSummaryContent}>{advancedAduditAISummary}</div>
                  ) : (
                    <textarea
                      className={styles.summaryTextarea}
                      value={editedAdvancedSummary}
                      onChange={(e) => setEditedAdvancedSummary(e.target.value)}
                      rows={8}
                    />
                  )}
                </div>
              )}
            </div>
          
            <div className={styles.saveSection}>
              <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Zapisywanie...' : 'Zapisz'}
              </Button>
              <div className={styles.saveMessage}>{saveMessage?.text}</div>
            </div>
          
            {/* Client Ready Report Section */}
            <div className={styles.clientReadyReportSection}>
              <h3>Raport dla klienta</h3>
              <p>Poniżej znajduje się podgląd raportu, który zostanie wygenerowany dla klienta.</p>
              <div className={styles.clientReadyReportContainer}>
                <ClientReadyReport id={id} audit={audit} />
              </div>
            </div>
          </>
        ) : (
          <p>Nie znaleziono audytu o podanym ID.</p>
        )}
      </div>
    );
  }