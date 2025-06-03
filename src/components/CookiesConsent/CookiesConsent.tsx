/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './CookiesConsent.module.scss';
import { Button } from '../atoms/Button/Button';

interface CookiesConsentProps {
  fallback?: React.ReactNode;
  cookieStates?: {
    necessary?: boolean;
    analytics?: boolean;
    marketing?: boolean;
  };

  onAccept?: () => void;
}

export const CookiesConsent: React.FC<CookiesConsentProps> = ({ fallback, cookieStates, onAccept }) => {
  const [isVisible, setIsVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  

  // Użyj wartości z props, jeśli zostały przekazane, w przeciwnym razie użyj wartości domyślnych
  const [necessaryCookies, setNecessaryCookies] = useState(cookieStates?.necessary ?? true); // always enabled
  const [analyticsCookies, setAnalyticsCookies] = useState(cookieStates?.analytics ?? false);
  const [marketingCookies, setMarketingCookies] = useState(cookieStates?.marketing ?? false);
  
  useEffect(() => {
    if (cookieStates) {
      setIsVisible(true);
      return;
    }

    try {
      const cookiesData = localStorage.getItem('WcagCookies');
      
      if (!cookiesData) {
        setIsVisible(true);
      } else {
        const parsedData = JSON.parse(cookiesData);
        
        if (parsedData.consented) {
          // Ustaw zapisane preferencje
          if (parsedData.preferences) {
            if (parsedData.preferences.analytics !== undefined) {
              setAnalyticsCookies(parsedData.preferences.analytics);
            }
            if (parsedData.preferences.marketing !== undefined) {
              setMarketingCookies(parsedData.preferences.marketing);
            }
          }
        } else {
          setIsVisible(true);
        }
      }
    } catch (error) {
      setIsVisible(true);
    }
  }, [cookieStates]);
  
  useEffect(() => {
    if (isVisible && dialogRef.current) {

      dialogRef.current.focus();
      
      // przechwytywanie tab po zaladowaniu
      const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [isVisible]);

  const handleAccept = () => {
    try {

      const cookiesData = {
        consented: true,
        consentDate: new Date().toISOString(),
        preferences: {
          necessary: true, 
          analytics: analyticsCookies,
          marketing: marketingCookies
        }
      };
      
  
      localStorage.setItem('WcagCookies', JSON.stringify(cookiesData));

      if (onAccept) {
        onAccept();
      }
      
      setIsVisible(false);
    } catch (error) {
      setIsVisible(false);
      
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Wystąpił problem przy zapisywaniu preferencji cookies');
      }
    }
  };

  const handleModify = () => {
    try {
      setAnalyticsCookies(prev => !prev);
      setMarketingCookies(prev => !prev);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Wystąpił problem przy modyfikacji ustawień cookies');
      }
    }
  };

  const handleSwitchChange = (type: string, value: boolean) => {
    switch(type) {
      case 'analytics':
        setAnalyticsCookies(value);
        break;
      case 'marketing':
        setMarketingCookies(value);
        break;
      default:
        break;
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent, type: string, currentValue: boolean) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handleSwitchChange(type, !currentValue);
    }
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
        tabIndex={-1}
        aria-modal="true"
      >
        <div className={styles.cookiesContent}>
          <h2 id="cookies-title" className={styles.cookiesTitle}><span className={styles.srOnly}>Wcag - </span>Ustawienia cookies </h2>
          <div id="cookies-description" className={styles.cookiesText}>
          <p>
          Korzystając ze strony zgadzasz się na użycie plików cookies.</p>  <p> Możesz przeczytać więcej w <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className={styles.privacyLink}>Polityce prywatności</a>.</p>
          </div>
          <div className={styles.switchesGroup}>
    
            <div className={styles.switchItem}>
              <div className={styles.switchLabel}>
                <span className={styles.switchTitle} id="necessary-label">Niezbędne</span>
             
              </div>
              <label className={styles.switch} htmlFor="necessary-cookies">
                <input 
                  id="necessary-cookies"
                  type="checkbox" 
                  checked={necessaryCookies} 
                  disabled={true}
                  aria-labelledby="necessary-label"
                  tabIndex={-1} 
                  aria-disabled="true"
                  role="switch"
                  aria-checked={necessaryCookies}
                />
                <span className={styles.slider}></span>
                <span className={styles.srOnly}>Niezbędne pliki cookie (zawsze włączone)</span>
              </label>
            </div>
            

            <div className={styles.switchItem}>
              <div className={styles.switchLabel}>
                <span className={styles.switchTitle} id="analytics-label">Analityczne</span>
            
              </div>
              <label className={styles.switch} htmlFor="analytics-cookies">
                <input 
                  id="analytics-cookies"
                  type="checkbox" 
                  checked={analyticsCookies} 
                  onChange={(e) => handleSwitchChange('analytics', e.target.checked)}
                  onKeyDown={(e) => handleKeyDown(e, 'analytics', analyticsCookies)}
                  aria-labelledby="analytics-label"
                  role="switch"
                  aria-checked={analyticsCookies}
                  tabIndex={0}
                />
                <span className={styles.slider}></span>
                <span className={styles.srOnly}>Analityczne pliki cookie</span>
              </label>
            </div>
            
    
     {/*        <div className={styles.switchItem}>
              <div className={styles.switchLabel}>
                <span className={styles.switchTitle} id="marketing-label">Marketingowe</span>
        
              </div>
              <label className={styles.switch} htmlFor="marketing-cookies">
                <input 
                  id="marketing-cookies"
                  type="checkbox" 
                  checked={marketingCookies} 
                  onChange={(e) => handleSwitchChange('marketing', e.target.checked)}
                  onKeyDown={(e) => handleKeyDown(e, 'marketing', marketingCookies)}
                  aria-labelledby="marketing-label"
                  role="switch"
                  aria-checked={marketingCookies}
                  tabIndex={0}
                />
                <span className={styles.slider}></span>
                <span className={styles.srOnly}>Marketingowe pliki cookie</span>
              </label>
            </div> */}
          </div>
          <div className={styles.buttonGroup}>
            <Button 
              variant="primary"
              onClick={handleAccept}

            >
              Akceptuję
            </Button>
            <Button 
              variant="secondary"
              onClick={handleModify}
            >
              Dostosuj
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};


