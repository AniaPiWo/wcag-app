'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './CookiesConsent.module.scss';
import { Button } from '../atoms/Button/Button';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { cookieCategories, legalInfo } from './cookieCategories';

interface CookiesConsentProps {
  fallback?: React.ReactNode;
  onAccept?: () => void;
  forceShow?: boolean;
}

export const CookiesConsent: React.FC<CookiesConsentProps> = ({ fallback, onAccept, forceShow = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  
  const { consent, hasConsented, isLoading, updateConsent, acceptAll, rejectAll, saveConsent } = useCookieConsent();
  
  // Obsługa akceptacji wszystkich cookies
  const handleAcceptAll = useCallback(() => {
    acceptAll();
    if (onAccept) {
      onAccept();
    }
    setIsVisible(false);
  }, [acceptAll, onAccept]);

  // Obsługa zapisania wybranych preferencji
  const handleSavePreferences = useCallback(() => {
    saveConsent(consent);
    if (onAccept) {
      onAccept();
    }
    setIsVisible(false);
  }, [consent, saveConsent, onAccept]);

  // Obsługa odrzucenia opcjonalnych cookies
  const handleRejectAll = useCallback(() => {
    rejectAll();
    if (onAccept) {
      onAccept();
    }
    setIsVisible(false);
  }, [rejectAll, onAccept]);
  
  useEffect(() => {
    // Pokaż banner tylko jeśli dane są załadowane i użytkownik nie wyraził jeszcze zgody
    // lub jeśli forceShow jest true (wywołane z footer)
    if (!isLoading) {
      if (!hasConsented || forceShow) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }
  }, [hasConsented, isLoading, forceShow]);
  
  useEffect(() => {
    if (isVisible && dialogRef.current) {
      dialogRef.current.focus();
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          handleRejectAll();
          return;
        }
        
        if (e.key === 'Tab' && dialogRef.current) {
          const focusableElements = dialogRef.current.querySelectorAll(
            'button, [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements.length > 0) {
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
            
            if (e.shiftKey && document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible, handleRejectAll]);

  const handleSwitchChange = (type: 'necessary' | 'analytics' /* | 'marketing' */, value: boolean) => {
    updateConsent(type, value);
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };
  
  

  if (!isVisible) {
    return fallback || null;
  }

  return (
    <>
      <div className={styles.cookiesOverlay}></div>
      <div 
        ref={dialogRef}
        className={styles.cookiesContainer} 
        role="dialog" 
        aria-labelledby="cookies-title" 
        aria-describedby="cookies-description"
        aria-label="Ustawienia cookies strony"
        lang="pl"
        tabIndex={0}
        aria-modal="true"
      >
        <div className={styles.cookiesContent}>
          <h2 id="cookies-title" className={styles.cookiesTitle}><span className={styles.srOnly}>Wcag - </span>Ustawienia cookies </h2>
          <div id="cookies-description" className={styles.cookiesText}>
            <p>Używamy plików cookies, aby zapewnić najlepsze doświadczenia na naszej stronie. Możesz wybrać, które kategorie cookies chcesz zaakceptować.</p>
            {!showDetails && (
              <button 
                onClick={toggleDetails}
                className={styles.detailsButton}
                type="button"
              >
                Pokaż szczegóły kategorii
              </button>
            )}
          </div>
          
          <div className={styles.switchesGroup}>
            {Object.entries(cookieCategories).map(([key, category]) => (
              <div key={key} className={styles.switchItem}>
                <div className={styles.switchLabel}>
                  <span className={styles.switchTitle} id={`${key}-label`}>{category.title}</span>
                  {showDetails && (
                    <div className={styles.categoryDetails}>
                      <p className={styles.categoryDescription}>{category.description}</p>
                      <div className={styles.categoryInfo}>
                        <p><strong>Cel:</strong> {category.purpose}</p>
                        <p><strong>Okres przechowywania:</strong> {category.retention}</p>
                        {category.thirdParties.length > 0 && (
                          <p><strong>Dostawcy zewnętrzni:</strong> {category.thirdParties.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <label className={styles.switch} htmlFor={`${key}-cookies`}>
                  <input 
                    id={`${key}-cookies`}
                    type="checkbox" 
                    checked={consent[key as keyof typeof consent]} 
                    disabled={category.required}
                    onChange={(e) => handleSwitchChange(key as 'necessary' | 'analytics' /* | 'marketing' */, e.target.checked)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        if (!category.required) {
                          handleSwitchChange(key as 'necessary' | 'analytics' /* | 'marketing' */, !consent[key as keyof typeof consent]);
                        }
                      }
                    }}
                    aria-labelledby={`${key}-label`}
                    tabIndex={category.required ? -1 : 0}
                    aria-disabled={category.required}
                    role="switch"
                    aria-checked={consent[key as keyof typeof consent]}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            ))}
          </div>
          
          <div className={styles.buttonGroup}>
            <Button 
              className={styles.button}
              variant="primary"
              onClick={handleAcceptAll}
            >
              Akceptuj wszystkie
            </Button>
            <Button 
              className={styles.button}
              variant="secondary"
              onClick={handleSavePreferences}
            >
              Akceptuj wybrane
            </Button>
          </div>
          <div className={styles.privacyLinkContainer}>
            <p>Więcej informacji w <a href={legalInfo.privacyPolicyUrl} className={styles.privacyLink}>Polityce prywatności</a> i <a href={legalInfo.termsUrl} className={styles.privacyLink}>Regulaminie</a>.</p>
            <p className={styles.legalInfo}>Administrator danych: {legalInfo.dataController} | Kontakt: {legalInfo.contact}</p>
          </div>
        </div>
      </div>
    </>
  );
};


