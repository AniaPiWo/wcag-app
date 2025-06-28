'use client'
import React, { useState } from 'react';
import styles from './page.module.scss';
import { Button, AuditForm } from '@/components';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auditBasic } from '@/lib/wcag_checklist/basic';
import { auditIntermediate } from '@/lib/wcag_checklist/intermediate';
import { auditAdvanced } from '@/lib/wcag_checklist/advanced';

type AuditLevel = 'podstawowy' | 'średni' | 'zaawansowany';

interface AuditResponse {
  itemId: number;
  evaluation: 'positive' | 'negative' | 'notApplicable';
  notes: string;
}

export default function NewManualAuditPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Form state
  const [url, setUrl] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<AuditLevel[]>([]);
  const [responses, setResponses] = useState<{
    basic: AuditResponse[];
    intermediate: AuditResponse[];
    advanced: AuditResponse[];
  }>({ basic: [], intermediate: [], advanced: [] });

  // Available audit levels
  const auditLevels = [
    { id: 'podstawowy', label: 'Podstawowy' },
    { id: 'średni', label: 'Średni' },
    { id: 'zaawansowany', label: 'Zaawansowany' }
  ];

  // Handle checkbox change
  const handleLevelChange = (levelId: AuditLevel) => {
    setSelectedLevels(prev => {
      if (prev.includes(levelId)) {
        return prev.filter(id => id !== levelId);
      } else {
        return [...prev, levelId];
      }
    });
  };
  
  // Handle responses from audit forms
  const handleBasicResponsesChange = (responses: AuditResponse[]) => {
    setResponses(prev => ({ ...prev, basic: responses }));
  };
  
  const handleIntermediateResponsesChange = (responses: AuditResponse[]) => {
    setResponses(prev => ({ ...prev, intermediate: responses }));
  };
  
  const handleAdvancedResponsesChange = (responses: AuditResponse[]) => {
    setResponses(prev => ({ ...prev, advanced: responses }));
  };



  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!url) {
      setErrorMessage('URL jest wymagany');
      return;
    }

    if (selectedLevels.length === 0) {
      setErrorMessage('Wybierz co najmniej jeden poziom audytu');
      return;
    }

    setFormSubmitted(true);
    setErrorMessage('');
  };
  
  // Handle saving the audit
  const handleSaveAudit = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Prepare the audit data
      const basicAuditData = selectedLevels.includes('podstawowy') ? JSON.stringify(responses.basic) : '';
      const intermediateAuditData = selectedLevels.includes('średni') ? JSON.stringify(responses.intermediate) : '';
      const advancedAuditData = selectedLevels.includes('zaawansowany') ? JSON.stringify(responses.advanced) : '';
      
      const response = await fetch('/api/manual-audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          basicAudit: basicAuditData,
          intermediateAudit: intermediateAuditData,
          advancedAudit: advancedAuditData,
          selectedLevels,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Audyt manualny został pomyślnie zapisany!');
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/admin/manual-audits');
        }, 2000);
      } else {
        setErrorMessage(data.error || 'Wystąpił błąd podczas zapisywania audytu');
      }
    } catch {
      setErrorMessage('Błąd sieci podczas zapisywania audytu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className={styles.page}>
        <Link href="/admin/manual-audits" className={styles.backLink}>
          &larr; Powrót 
        </Link>
        
        {!formSubmitted ? (
          <div className={styles.formContainer}>
            <h2 className={styles.subtitle}>Nowy audyt manualny</h2>
            
            <form className={styles.auditSetupForm} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="url" className={styles.label}>URL strony do audytu</label>
                <input
                  type="text"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className={styles.input}
                  placeholder="https://example.com"
                  required
                />
                {errorMessage && errorMessage.includes('URL') && (
                  <div className={styles.errorMessage}>{errorMessage}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Wybierz poziomy audytu</label>
                <div className={styles.checkboxGroup}>
                  {auditLevels.map((level) => (
                    <div key={level.id} className={styles.checkboxItem}>
                      <input
                        type="checkbox"
                        id={`level-${level.id}`}
                        checked={selectedLevels.includes(level.id as AuditLevel)}
                        onChange={() => handleLevelChange(level.id as AuditLevel)}
                        className={styles.checkbox}
                      />
                      <label htmlFor={`level-${level.id}`} className={styles.checkboxLabel}>
                        {level.label}
                      </label>
                    </div>
                  ))}
                </div>
                {errorMessage && errorMessage.includes('poziom') && (
                  <div className={styles.errorMessage}>{errorMessage}</div>
                )}
              </div>

              {errorMessage && !errorMessage.includes('URL') && !errorMessage.includes('poziom') && (
                <div className={styles.errorMessage}>{errorMessage}</div>
              )}

              <div className={styles.saveButtonContainer}>
                <Button 
                  type="submit" 
                  className={styles.saveButton}
                >
                  Rozpocznij audyt
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className={styles.auditFormsContainer}>
            {successMessage && (
              <div className={styles.successMessage}>{successMessage}</div>
            )}
            
            {selectedLevels.includes('podstawowy') && (
              <div className={styles.auditFormWrapper}>
                <AuditForm 
                  auditItems={auditBasic} 
                  auditType="podstawowy" 
                  domain={url} 
                  onResponsesChange={handleBasicResponsesChange}
                />
              </div>
            )}
            
            {selectedLevels.includes('średni') && (
              <div className={styles.auditFormWrapper}>
                <AuditForm 
                  auditItems={auditIntermediate} 
                  auditType="średni" 
                  domain={url} 
                  onResponsesChange={handleIntermediateResponsesChange}
                />
              </div>
            )}
            
            {selectedLevels.includes('zaawansowany') && (
              <div className={styles.auditFormWrapper}>
                <AuditForm 
                  auditItems={auditAdvanced} 
                  auditType="zaawansowany" 
                  domain={url} 
                  onResponsesChange={handleAdvancedResponsesChange}
                />
              </div>
            )}
            
            <div className={styles.saveButtonContainer}>
              <Button 
                onClick={handleSaveAudit} 
                className={styles.saveButton} 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Zapisywanie...' : 'Zapisz audyt'}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
}
