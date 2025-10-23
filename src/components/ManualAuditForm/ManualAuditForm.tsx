/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import React, { useState, useEffect, useRef, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import styles from './ManualAuditForm.module.scss';
import { auditBasic } from '@/lib/wcag_checklist/basic';
import { auditIntermediate } from '@/lib/wcag_checklist/intermediate';
import { auditAdvanced } from '@/lib/wcag_checklist/advanced';
import { Button } from '@/components';
import { getManualAudit, updateManualAudit, updateAuditItem as updateAuditItemAction } from '@/app/actions/manual-audit';

// Dynamic import dla ClientReadyReport (zawiera react-pdf ~500KB) - ładuje się tylko gdy potrzebny
const ClientReadyReport = dynamic(() => import('../ClientReadyReport/ClientReadyReport'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Ładowanie raportu...</div>
});

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
  violations: string | null;
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
    aiAnalysis: ReactNode;
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
  
  // Surowe dane audytu automatycznego
  const [rawViolations, setRawViolations] = useState<string | null>(null);
  const [rawAiAnalysis, setRawAiAnalysis] = useState<string | null>(null);
  const [showRawData, setShowRawData] = useState<boolean>(false);
  
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

  // States for editable fields
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [isEditingLevels, setIsEditingLevels] = useState(false);
  const [editedEmail, setEditedEmail] = useState<string>('');
  const [editedUrl, setEditedUrl] = useState<string>('');
  const [editedLevels, setEditedLevels] = useState<string>('');

  // Selected audit levels for consolidated report
  const [selectedLevelsForReport, setSelectedLevelsForReport] = useState({
    basic: true,
    intermediate: true,
    advanced: true
  });
  
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
  
  /**
   * Updates a specific audit item with the given value
   * @param level The audit level ('basic', 'intermediate', or 'advanced')
   * @param itemId The ID of the audit item to update
   * @param field The field to update ('evaluation' or 'notes')
   * @param value The new value for the field
   */
  const updateAuditItem = async (level: 'basic' | 'intermediate' | 'advanced', itemId: number, field: 'evaluation' | 'notes', value: string) => {
    try {
      // Update local state first
      switch (level) {
        case 'basic':
          setBasicAuditData(prev => prev.map(item => {
            if (item.itemId === itemId) {
              return { ...item, [field]: value };
            }
            return item;
          }));
          break;
        case 'intermediate':
          setIntermediateAuditData(prev => prev.map(item => {
            if (item.itemId === itemId) {
              return { ...item, [field]: value };
            }
            return item;
          }));
          break;
        case 'advanced':
          setAdvancedAuditData(prev => prev.map(item => {
            if (item.itemId === itemId) {
              return { ...item, [field]: value };
            }
            return item;
          }));
          break;
      }
      
      // If this is a notes field, use debouncing to avoid too many API calls
      if (field === 'notes') {
        const timerKey = `${level}-${itemId}-${field}`;
        
        if (debounceTimers.current[timerKey]) {
          clearTimeout(debounceTimers.current[timerKey]);
        }
        
        debounceTimers.current[timerKey] = setTimeout(async () => {
          try {
            // Zapisz do bazy danych i ponownie załaduj stan audytu aby synchronizować interfejs
            const updatedAudit = await updateAuditItemAction(id, level, itemId, field, value);
            
            // Wypełnij dane audytu po zapisie, aby mieć pewność, że UI odzwierciedla stan z bazy danych
            if (updatedAudit) {
              setAudit(updatedAudit);
              
              // Aktualizuj odpowiednie dane audytu w zależności od poziomu
              try {
                if (level === 'basic' && updatedAudit.basicAudit) {
                  setBasicAuditData(JSON.parse(updatedAudit.basicAudit));
                } else if (level === 'intermediate' && updatedAudit.intermediateAudit) {
                  setIntermediateAuditData(JSON.parse(updatedAudit.intermediateAudit));
                } else if (level === 'advanced' && updatedAudit.advancedAudit) {
                  setAdvancedAuditData(JSON.parse(updatedAudit.advancedAudit));
                }
              } catch (parseError) {
                console.error('Błąd parsowania danych audytu po zapisie:', parseError);
              }
            }
          } catch (error) {
            console.error('Błąd podczas aktualizacji notatek:', error);
          }
        }, 500);
      } else {
        // For other fields (like evaluation), update immediately
        try {
          // Zapisz do bazy danych i ponownie załaduj stan audytu aby synchronizować interfejs
          const updatedAudit = await updateAuditItemAction(id, level, itemId, field, value);
          
          // Wypełnij dane audytu po zapisie, aby mieć pewność, że UI odzwierciedla stan z bazy danych
          if (updatedAudit) {
            setAudit(updatedAudit);
            
            // Aktualizuj odpowiednie dane audytu w zależności od poziomu
            try {
              if (level === 'basic' && updatedAudit.basicAudit) {
                setBasicAuditData(JSON.parse(updatedAudit.basicAudit));
              } else if (level === 'intermediate' && updatedAudit.intermediateAudit) {
                setIntermediateAuditData(JSON.parse(updatedAudit.intermediateAudit));
              } else if (level === 'advanced' && updatedAudit.advancedAudit) {
                setAdvancedAuditData(JSON.parse(updatedAudit.advancedAudit));
              }
            } catch (parseError) {
              console.error('Błąd parsowania danych audytu po zapisie:', parseError);
            }
          }
        } catch (error) {
          console.error('Błąd podczas aktualizacji elementu audytu:', error);
        }
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji elementu audytu:', error);
    }
  };
  
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
  
  // Functions to handle editable fields
  // Dostępne poziomy audytu
  const availableLevels = [
    { id: "basic", label: "podstawowy" },
    { id: "intermediate", label: "średni" },
    { id: "advanced", label: "zaawansowany" }
  ];
  
  const handleEditField = (field: 'email' | 'url' | 'levels') => {
    if (!audit) return;
    
    switch (field) {
      case 'email':
        setIsEditingEmail(true);
        setEditedEmail(audit.email || '');
        break;
      case 'url':
        setIsEditingUrl(true);
        setEditedUrl(audit.url || '');
        break;
      case 'levels':
        setIsEditingLevels(true);
        setEditedLevels(audit.selectedLevels || '[]');
        break;
    }
  };

  const handleSaveField = async (field: 'email' | 'url' | 'levels') => {
    if (!audit) return;
    
    try {
      setIsSaving(true);
      type FieldUpdateData = {
        email?: string;
        url?: string;
        selectedLevels?: string;
      };
      
      let updateData: FieldUpdateData = {};
      
      switch (field) {
        case 'email':
          updateData = { email: editedEmail };
          setIsEditingEmail(false);
          setAudit(prev => prev ? { ...prev, email: editedEmail } : null);
          break;
        case 'url':
          updateData = { url: editedUrl };
          setIsEditingUrl(false);
          setAudit(prev => prev ? { ...prev, url: editedUrl } : null);
          break;
        case 'levels':
          updateData = { selectedLevels: editedLevels };
          setIsEditingLevels(false);
          setAudit(prev => prev ? { ...prev, selectedLevels: editedLevels } : null);
          break;
      }
      
      // Wywołanie API do aktualizacji pola
      await fetch(`/api/manual-audit/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      setSaveMessage({ type: 'success', text: 'Pole zaktualizowane' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error(`Błąd podczas zapisywania pola ${field}:`, error);
      setSaveMessage({ type: 'error', text: 'Błąd podczas zapisywania' });
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent, field: 'email' | 'url' | 'levels') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveField(field);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      switch (field) {
        case 'email':
          setIsEditingEmail(false);
          break;
        case 'url':
          setIsEditingUrl(false);
          break;
        case 'levels':
          setIsEditingLevels(false);
          break;
      }
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
            //console.log('Pobrane dane audytu:', detailedAudit);
            //console.log('Naruszenia:', detailedAudit.parsedViolations);
            
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
      
      //console.log('Wysyłanie żądania audytu automatycznego:', requestData);
      
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
      // Prepare data for all selected levels with full audit question context
      const consolidatedData = [];
      
      if (selectedLevelsForReport.basic && basicAuditData.length > 0) {
        // Wzbogacamy dane audytu o pełne informacje z pytań audytowych
        const enhancedBasicData = basicAuditData.map(auditItem => {
          const fullQuestionInfo = auditBasic.find(question => question.id.toString() === auditItem.itemId.toString());
          return {
            ...auditItem,
            title: fullQuestionInfo?.title || '',
            description: fullQuestionInfo?.description || '',
            wcag: fullQuestionInfo?.wcag || '',
            level: 'basic'
          };
        });
        
        consolidatedData.push({
          level: 'basic',
          data: enhancedBasicData
        });
      }
      
      if (selectedLevelsForReport.intermediate && intermediateAuditData.length > 0) {
        // Wzbogacamy dane audytu o pełne informacje z pytań audytowych
        const enhancedIntermediateData = intermediateAuditData.map(auditItem => {
          const fullQuestionInfo = auditIntermediate.find(question => question.id.toString() === auditItem.itemId.toString());
          return {
            ...auditItem,
            title: fullQuestionInfo?.title || '',
            description: fullQuestionInfo?.description || '',
            wcag: fullQuestionInfo?.wcag || '',
            level: 'intermediate'
          };
        });
        
        consolidatedData.push({
          level: 'intermediate',
          data: enhancedIntermediateData
        });
      }
      
      if (selectedLevelsForReport.advanced && advancedAuditData.length > 0) {
        // Wzbogacamy dane audytu o pełne informacje z pytań audytowych
        const enhancedAdvancedData = advancedAuditData.map(auditItem => {
          const fullQuestionInfo = auditAdvanced.find(question => question.id.toString() === auditItem.itemId.toString());
          return {
            ...auditItem,
            title: fullQuestionInfo?.title || '',
            description: fullQuestionInfo?.description || '',
            wcag: fullQuestionInfo?.wcag || '',
            level: 'advanced'
          };
        });
        
        consolidatedData.push({
          level: 'advanced',
          data: enhancedAdvancedData
        });
      }
      
      if (consolidatedData.length === 0) {
        setConsolidatedAISummary('Brak danych audytowych dla wybranych poziomów.');
        setIsLoadingConsolidatedSummary(false);
        return;
      }
      
      // Policz ilość negatywnych ocen dla debugowania
      const negativeCount = consolidatedData.flatMap(item => item.data)
        .filter(item => item.evaluation === 'negative').length;
      
      // Przygotuj dane do wysłania
      const dataToSend = consolidatedData.flatMap(item => item.data);
      
      // Loguj przykładowe dane negatywne dla debugowania
      const exampleNegativeItems = dataToSend
        .filter(item => item.evaluation === 'negative')
        .slice(0, 3); // Pokaż maksymalnie 3 przykłady
      
      console.log(`Wysyłanie danych do analizy - znaleziono ${negativeCount} negatywnych elementów`);
      console.log('Przykładowe elementy negatywne:', JSON.stringify(exampleNegativeItems, null, 2));
      
      // Call API to generate consolidated summary with enhanced data
      const response = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          auditData: dataToSend, 
          level: 'consolidated',
          selectedLevels: consolidatedData.map(item => item.level)
        }),
      });
      
      // Loguj odpowiedź od API, aby zobaczyć, co otrzymujemy
      const apiResponse = await response.json();
      console.log('Odpowiedź API - pierwsze 200 znaków:', apiResponse.summary?.substring(0, 200));
      
      // Sprawdź, czy summary jest w formacie JSON i zawiera sekcję problems
      try {
        const parsedSummary = JSON.parse(apiResponse.summary || '{}');
        if (parsedSummary.problems) {
          console.log(`Liczba problemów w odpowiedzi: ${parsedSummary.problems.length} z ${negativeCount} negatywnych elementów`);
        }
      } catch(e) {
        console.log('Odpowiedź nie jest w formacie JSON lub wystąpił problem z parsowaniem:', e);
      }
      
      if (!response.ok) {
        throw new Error(`Błąd HTTP: ${response.status}`);
      }
      
      const aiSummary = apiResponse.summary;
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
          try {
            setBasicAuditData(JSON.parse(data.basicAudit));
          } catch (e) {
            console.error('Błąd parsowania basicAudit:', e);
            // Ustawienie pustej tablicy, aby uniknąć błędów renderowania
            setBasicAuditData([]);
          }
        }
        if (data.intermediateAudit) {
          try {
            setIntermediateAuditData(JSON.parse(data.intermediateAudit));
          } catch (e) {
            console.error('Błąd parsowania intermediateAudit:', e);
            setIntermediateAuditData([]);
          }
        }
        if (data.advancedAudit) {
          try {
            setAdvancedAuditData(JSON.parse(data.advancedAudit));
          } catch (e) {
            console.error('Błąd parsowania advancedAudit:', e);
            setAdvancedAuditData([]);
          }
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
        
        // Sprawdź dane automatycznego audytu (violations i aiAnalysis)
        let hasAutomatedAudit = false;
        let hasAiAnalysis = false;
        
        // Zachowaj surowe dane violations i aiAnalysis
        if (auditData.violations) {
          setRawViolations(auditData.violations);
        }
        
        if (auditData.aiAnalysis) {
          setRawAiAnalysis(auditData.aiAnalysis);
        }
        
        // Sprawdź tekst analizy AI w polu aiAnalysis
        if (auditData.aiAnalysis && auditData.aiAnalysis.trim()) {
          console.log('Znaleziono tekst analizy AI w polu aiAnalysis');
          hasAiAnalysis = true;
        }
        
        // Sprawdź dane violations w formacie JSON
        if (auditData.violations) {
          try {
            // Sprawdź, czy zawartość violations wygląda na JSON przed próbą parsowania
            const content = auditData.violations.trim();
            if (!content.startsWith('{') && !content.startsWith('[')) {
              console.info('Pole violations nie zawiera poprawnego JSON');
            } else {
              const automatedAuditInfo = JSON.parse(content);
              
              if (automatedAuditInfo && typeof automatedAuditInfo === 'object') {
                // Sprawdź, czy mamy obiekt automatedAudit lub czy dane są już bezpośrednio obiektem audytu
                if ('automatedAudit' in automatedAuditInfo && automatedAuditInfo.automatedAudit) {
                  console.log('Znaleziono zapisany audyt automatyczny w automatedAudit:', automatedAuditInfo.automatedAuditId);
                  setExistingAudit(automatedAuditInfo.automatedAudit);
                  setShowExistingAudit(true);
                  hasAutomatedAudit = true;
                } else if ('results' in automatedAuditInfo || 'parsedViolations' in automatedAuditInfo) {
                  // Jeśli sam automatedAuditInfo wygląda jak obiekt audytu
                  console.log('Znaleziono zapisany audyt automatyczny bezpośrednio w violations');
                  setExistingAudit(automatedAuditInfo);
                  setShowExistingAudit(true);
                  hasAutomatedAudit = true;
                }
              }
            }
          } catch (parseError) {
            console.error('Błąd parsowania zapisanych violations:', parseError);
          }
        }
        
        // Wyświetl odpowiedni komunikat dla użytkownika zależnie od stanu
        if (hasAutomatedAudit) {
          setAutomatedAuditMessage({
            type: 'success', 
            text: 'Dla tego audytu przeprowadzono już automatyczną analizę. Wyniki są dostępne poniżej.'
          });
          setShowExistingAudit(true);
        } else if (hasAiAnalysis) {
          setAutomatedAuditMessage({
            type: 'info', 
            text: 'Dla tego audytu istnieje analiza AI, ale brak pełnych danych audytu automatycznego.'
          });
        } else {
          setAutomatedAuditMessage({
            type: 'info', 
            text: 'Dla tego audytu nie przeprowadzono jeszcze automatycznej analizy. Czy chcesz ją uruchomić?'
          });
        }
      } catch (error) {
        console.error('Błąd podczas pobierania audytu:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAudit();
  }, [id]);

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
      
      // Zdefiniuj porządek wyświetlania poziomów
      const orderMap: Record<string, number> = {
        'basic': 1,
        'intermediate': 2,
        'advanced': 3
      };
      
      // Posortuj poziomy według zdefiniowanego porządku
      const sortedLevels = [...levels].sort((a, b) => {
        return (orderMap[a.id] || 999) - (orderMap[b.id] || 999);
      });
      
      return sortedLevels.map((level: AuditLevel) => level.label).join(", ");
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
            <table className={styles.infoTable}>
              <tbody>
                <tr>
                  <th>ID audytu:</th>
                  <td>{id}</td>
                </tr>
                <tr>
                  <th>URL:</th>
                  <td>
                    {isEditingUrl ? (
                      <input 
                        type="text" 
                        value={editedUrl} 
                        onChange={(e) => setEditedUrl(e.target.value)} 
                        onKeyDown={(e) => handleKeyDown(e, 'url')}
                        autoFocus
                        className={styles.editableField}
                      />
                    ) : (
                      <div 
                        className={styles.editableText} 
                        onClick={() => handleEditField('url')}
                        title="Kliknij, aby edytować"
                      >
                        {audit.url}
                      </div>
                    )}
                  </td>
                </tr>
                <tr>
                  <th>Email:</th>
                  <td>
                    {isEditingEmail ? (
                      <input 
                        type="text" 
                        value={editedEmail} 
                        onChange={(e) => setEditedEmail(e.target.value)} 
                        onKeyDown={(e) => handleKeyDown(e, 'email')}
                        autoFocus
                        className={styles.editableField}
                      />
                    ) : (
                      <div 
                        className={styles.editableText} 
                        onClick={() => handleEditField('email')}
                        title="Kliknij, aby edytować"
                      >
                        {audit.email || '-'}
                      </div>
                    )}
                  </td>
                </tr>
                <tr>
                  <th>Data utworzenia:</th>
                  <td>{new Date(audit.createdAt).toLocaleString()}</td>
                </tr>
                <tr>
                  <th>Ostatnia aktualizacja:</th>
                  <td>{new Date(audit.updatedAt).toLocaleString()}</td>
                </tr>
                <tr>
                  <th>Wybrane poziomy:</th>
                  <td>
                    {isEditingLevels ? (
                      <div className={styles.checkboxContainer}>
                        <div className={styles.checkboxRow}>
                          {availableLevels.map(level => {
                            // Parsujemy aktualne wybrany poziom aby sprawdzić, czy ten poziom jest już wybrany
                            let selectedLevels: Array<{id: string, label: string}> = [];
                            try {
                              selectedLevels = JSON.parse(editedLevels);
                            } catch (e) {
                              // Ignorujemy błędy parsowania i zakładamy, że nie ma wybranych poziomów
                            }
                            
                            const isChecked = selectedLevels.some(sel => sel.id === level.id);
                            
                            return (
                              <label key={level.id} className={styles.checkboxLabel}>
                                <input 
                                  type="checkbox" 
                                  checked={isChecked}
                                  onChange={(e) => {
                                    // Aktualizacja wybranych poziomów
                                    let updatedLevels = [...selectedLevels];
                                    
                                    if (e.target.checked) {
                                      // Dodaj poziom, jeśli nie istnieje
                                      if (!isChecked) {
                                        updatedLevels.push(level);
                                      }
                                    } else {
                                      // Usuń poziom
                                      updatedLevels = updatedLevels.filter(l => l.id !== level.id);
                                    }
                                    
                                    setEditedLevels(JSON.stringify(updatedLevels));
                                  }}
                                  className={styles.checkbox}
                                />
                                {level.label}
                              </label>
                            );
                          })}
                        </div>
                        <div className={styles.checklistButtons}>
                          <button 
                            type="button" 
                            onClick={() => handleSaveField('levels')} 
                            className={styles.saveButton}
                            disabled={isSaving}
                          >
                            {isSaving ? 'Zapisywanie...' : 'Zapisz'}
                          </button>
                          <button 
                            type="button" 
                            onClick={() => {
                              setIsEditingLevels(false);
                            }} 
                            className={styles.cancelButton}
                          >
                            Anuluj
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className={styles.editableText} 
                        onClick={() => handleEditField('levels')}
                        title="Kliknij, aby edytować"
                      >
                        {renderSelectedLevels()}
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
            
            <ClientReadyReport id={id} audit={audit} />
            
            {/* Sekcja gotowego audytu */}
{/*            <div className={styles.aiSummary}>
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
            </div> */}
            
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

            {/* Sekcja wyświetlająca informacje o audycie automatycznym */}
            {automatedAuditMessage && (
              <div className={styles.automatedAuditInfo} style={{
                padding: '15px',
                marginBottom: '15px',
                borderRadius: '5px',
                backgroundColor: automatedAuditMessage.type === 'success' ? '#d4edda' : 
                                automatedAuditMessage.type === 'error' ? '#f8d7da' : '#cce5ff',
                color: automatedAuditMessage.type === 'success' ? '#155724' : 
                       automatedAuditMessage.type === 'error' ? '#721c24' : '#004085',
              }}>
                <p>{automatedAuditMessage.text}</p>
                <div style={{ marginTop: '10px' }}>
                  {automatedAuditMessage.type === 'info' && !showExistingAudit && (
                    <Button 
                      onClick={handleAutomatedAudit}
                      variant="primary"
                      disabled={isRunningAutomatedAudit}
                    >
                      {isRunningAutomatedAudit ? 'Uruchamianie...' : 'Uruchom audyt automatyczny'}
                    </Button>
                  )}
                  {(rawViolations || rawAiAnalysis) && (
                    <div style={{ 
                      display: 'inline-block',
                      marginLeft: (automatedAuditMessage.type === 'info' && !showExistingAudit) ? '10px' : '0' 
                    }}>
                      <Button 
                        onClick={() => setShowRawData(!showRawData)} 
                        variant="secondary"
                      >
                        {showRawData ? 'Ukryj surowe dane' : 'Pokaż surowe dane'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sekcja z surowymi danymi */}
            {showRawData && (
              <div className={styles.rawDataSection} style={{ marginBottom: '20px' }}>
                <h3>Surowe dane audytu automatycznego</h3>
                
                {rawViolations && (
                  <div className={styles.rawViolations} style={{ marginBottom: '15px' }}>
                    <h4>Violations (JSON)</h4>
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      padding: '10px',
                      borderRadius: '5px',
                      overflowX: 'auto',
                      border: '1px solid #dee2e6'
                    }}>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{rawViolations}</pre>
                    </div>
                  </div>
                )}
                
                {rawAiAnalysis && (
                  <div className={styles.rawAiAnalysis}>
                    <h4>AI Analysis (tekst)</h4>
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      padding: '10px',
                      borderRadius: '5px',
                      overflowX: 'auto',
                      border: '1px solid #dee2e6'
                    }}>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{rawAiAnalysis}</pre>
                    </div>
                  </div>
                )}
                
                {!rawViolations && !rawAiAnalysis && (
                  <p>Brak danych do wyświetlenia</p>
                )}
              </div>
            )}
            
            {/* Sekcja wyświetlająca istniejący audyt automatyczny */}
            {showExistingAudit && existingAudit && (
              <div className={styles.existingAuditSection} style={{ marginBottom: '20px', border: '1px solid #dee2e6', borderRadius: '5px', padding: '15px' }}>
                <h3>Wyniki istniejącego audytu automatycznego</h3>
                
                {existingAudit.results?.violations && existingAudit.results.violations.length > 0 ? (
                  <div>
                    <h4>Wykryte naruszenia (JSON): {existingAudit.results.violations.length}</h4>
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      padding: '10px',
                      borderRadius: '5px',
                      overflowX: 'auto',
                      border: '1px solid #dee2e6'
                    }}>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', maxHeight: '500px', overflowY: 'auto' }}>
                        {JSON.stringify(existingAudit.results.violations, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <p>Brak naruszeń lub dane są niekompletne</p>
                )}
                
                {existingAudit.aiAnalysis && (
                  <div style={{ marginTop: '15px' }}>
                    <h4>Analiza AI</h4>
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      padding: '10px',
                      borderRadius: '5px',
                      border: '1px solid #dee2e6'
                    }}>
                      <div style={{ whiteSpace: 'pre-line' }}>{existingAudit.aiAnalysis}</div>
                    </div>
                  </div>
                )}
                
                <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
                  <Button 
                    onClick={() => setShowExistingAudit(false)}
                    variant="secondary"
                  >
                    Ukryj szczegóły audytu automatycznego
                  </Button>
                  <Button 
                    onClick={handleAutomatedAudit}
                    variant="primary"
                  >
                    Uruchom nowy audyt automatyczny
                  </Button>
                </div>
                <div>
                  <h4>Istniejący audyt automatyczny</h4>
                  <pre className={styles.preformatted}>
                    {typeof existingAudit === 'string' ? existingAudit : JSON.stringify(existingAudit, null, 2)}
                  </pre>
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
              <div>
            <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Zapisywanie...' : 'Zapisz'}
              </button>
   
              <button 
                type="button" 
                className={styles.AIreviewBtn} 
                onClick={() => handleAIReview('basic')}
                disabled={isLoadingBasicSummary}
              >
                {isLoadingBasicSummary ? 'Generowanie...' : 'Wygeneruj raport AI'}
              </button>
              </div>
                          <div className={styles.saveSection}>
     
              <div className={styles.saveMessage}>{saveMessage?.text}</div>
            </div>
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
              <div>
                            <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Zapisywanie...' : 'Zapisz'}
              </button>
      
              <button 
                type="button" 
                className={styles.AIreviewBtn} 
                onClick={() => handleAIReview('intermediate')}
                disabled={isLoadingIntermediateSummary}
              >
                {isLoadingIntermediateSummary ? 'Generowanie...' : 'Wygeneruj raport AI'}
              </button>
              </div>
              <div className={styles.saveSection}>

              <div className={styles.saveMessage}>{saveMessage?.text}</div>
            </div>
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
              <div>
              <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Zapisywanie...' : 'Zapisz'}
              </button>

                <button 
                type="button" 
                className={styles.AIreviewBtn} 
                onClick={() => handleAIReview('advanced')}
                disabled={isLoadingAdvancedSummary}
              >
                {isLoadingAdvancedSummary ? 'Generowanie...' : 'Wygeneruj raport AI'}
              </button>
              </div>
              <div className={styles.saveSection}>

              <div className={styles.saveMessage}>{saveMessage?.text}</div>
            </div>
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
          
          

          </>
        ) : (
          <p>Nie znaleziono audytu o podanym ID.</p>
        )}
      </div>
    );
  }