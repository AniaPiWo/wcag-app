'use client';
import React, { useState } from 'react'
import styles from './page.module.scss'
import { AuditForm, AuditItem, Button } from '@/components';
import { auditBasic } from '@/lib/wcag_checklist/basic';
import { auditIntermediate } from '@/lib/wcag_checklist/intermediate';
import { auditAdvanced } from '@/lib/wcag_checklist/advanced';

const auditItemsBasic: AuditItem[] = auditBasic;
const auditItemsIntermediate: AuditItem[] = auditIntermediate;
const auditItemsAdvanced: AuditItem[] = auditAdvanced;

type AuditLevel = 'podstawowy' | 'średni' | 'zaawansowany';

const Page = () => {
  const [domain, setDomain] = useState<string>('');
  const [selectedAuditLevels, setSelectedAuditLevels] = useState<AuditLevel[]>([]);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDomain(e.target.value);
  };

  const handleAuditLevelChange = (level: AuditLevel) => {
    setSelectedAuditLevels(prev => {
      if (prev.includes(level)) {
        return prev.filter(l => l !== level);
      } else {
        return [...prev, level];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain && selectedAuditLevels.length > 0) {
      setFormSubmitted(true);
    }
  };

  const renderAuditForms = () => {
    return (
      <>
        {selectedAuditLevels.includes('podstawowy') && (
          <AuditForm auditItems={auditItemsBasic} auditType='podstawowy' domain={domain} />
        )}
        {selectedAuditLevels.includes('średni') && (
          <AuditForm auditItems={auditItemsIntermediate} auditType='średni' domain={domain} />
        )}
        {selectedAuditLevels.includes('zaawansowany') && (
          <AuditForm auditItems={auditItemsAdvanced} auditType='zaawansowany' domain={domain} />
        )}
      </>
    );
  };

  return (
    <div className={styles.page}>
      {!formSubmitted ? (
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Audyt WCAG</h1>
          <form onSubmit={handleSubmit} className={styles.auditSetupForm}>
            <div className={styles.formGroup}>
              <label htmlFor="domain" className={styles.label}>Podaj nazwę domeny do audytu:</label>
              <input
                type="text"
                id="domain"
                value={domain}
                onChange={handleDomainChange}
                placeholder="np. example.com"
                required
                className={styles.input}
              />
            </div>
            
            <div className={styles.formGroup}>
              <p className={styles.label}>Wybierz poziom(y) audytu:</p>
              <div className={styles.checkboxGroup}>
                <div className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    id="basic"
                    checked={selectedAuditLevels.includes('podstawowy')}
                    onChange={() => handleAuditLevelChange('podstawowy')}
                    className={styles.checkbox}
                  />
                  <label htmlFor="basic" className={styles.checkboxLabel}>Podstawowy</label>
                </div>
                
                <div className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    id="intermediate"
                    checked={selectedAuditLevels.includes('średni')}
                    onChange={() => handleAuditLevelChange('średni')}
                    className={styles.checkbox}
                  />
                  <label htmlFor="intermediate" className={styles.checkboxLabel}>Średni</label>
                </div>
                
                <div className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    id="advanced"
                    checked={selectedAuditLevels.includes('zaawansowany')}
                    onChange={() => handleAuditLevelChange('zaawansowany')}
                    className={styles.checkbox}
                  />
                  <label htmlFor="advanced" className={styles.checkboxLabel}>Zaawansowany</label>
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={!domain || selectedAuditLevels.length === 0}
              className={styles.submitButton}
            >
              Rozpocznij audyt
            </Button>
          </form>
        </div>
      ) : (
        renderAuditForms()
      )}
    </div>
  )
}

export default Page