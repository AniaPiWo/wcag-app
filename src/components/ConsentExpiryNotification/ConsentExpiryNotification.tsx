'use client';
import { useEffect, useState } from 'react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { Button } from '../atoms/Button/Button';
import styles from './ConsentExpiryNotification.module.scss';

interface ConsentExpiryNotificationProps {
  warningDays?: number; // Ile dni przed wygaśnięciem pokazać ostrzeżenie
}

export const ConsentExpiryNotification: React.FC<ConsentExpiryNotificationProps> = ({ 
  warningDays = 30 
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [daysUntilExpiry, setDaysUntilExpiry] = useState(0);
  const { hasConsented, loadConsent } = useCookieConsent();

  useEffect(() => {
    if (!hasConsented) return;

    const checkExpiryWarning = () => {
      try {
        const cookiesData = localStorage.getItem('wcagCookies');
        if (cookiesData) {
          const parsedData = JSON.parse(cookiesData);
          if (parsedData.consented && parsedData.consentDate) {
            const consentDate = new Date(parsedData.consentDate);
            const now = new Date();
            const expiryDate = new Date(consentDate);
            expiryDate.setMonth(expiryDate.getMonth() + 13); // 13 miesięcy od zgody
            
            const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysUntilExpiry <= warningDays && daysUntilExpiry > 0) {
              setDaysUntilExpiry(daysUntilExpiry);
              setShowWarning(true);
            } else if (daysUntilExpiry <= 0) {
              // Zgoda wygasła - wymuś ponowną zgodę
              localStorage.removeItem('wcagCookies');
              loadConsent();
            }
          }
        }
      } catch (error) {
        console.warn('Error checking consent expiry:', error);
      }
    };

    checkExpiryWarning();
    
    // Sprawdzaj codziennie
    const interval = setInterval(checkExpiryWarning, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [hasConsented, warningDays, loadConsent]);

  const handleDismiss = () => {
    setShowWarning(false);
    // Zapisz informację o odrzuceniu ostrzeżenia na dziś
    localStorage.setItem('consentWarningDismissed', new Date().toDateString());
  };

  const handleRenewConsent = () => {
    setShowWarning(false);
    // Wymuś ponowne wyświetlenie bannera cookies
    localStorage.removeItem('wcagCookies');
    loadConsent();
  };

  // Sprawdź czy ostrzeżenie zostało już odrzucone dzisiaj
  useEffect(() => {
    const dismissedDate = localStorage.getItem('consentWarningDismissed');
    if (dismissedDate === new Date().toDateString()) {
      setShowWarning(false);
    }
  }, []);

  if (!showWarning) return null;

  return (
    <div className={styles.expiryNotification} role="alert" aria-live="polite">
      <div className={styles.content}>
        <div className={styles.icon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,17A1.5,1.5 0 0,1 10.5,15.5A1.5,1.5 0 0,1 12,14A1.5,1.5 0 0,1 13.5,15.5A1.5,1.5 0 0,1 12,17M12,10A1,1 0 0,1 13,11V14A1,1 0 0,1 12,15A1,1 0 0,1 11,14V11A1,1 0 0,1 12,10Z" />
          </svg>
        </div>
        <div className={styles.message}>
          <h3>Odnawianie zgody na cookies</h3>
          <p>
            Twoja zgoda na używanie cookies wygaśnie za {daysUntilExpiry} {daysUntilExpiry === 1 ? 'dzień' : 'dni'}. 
            Aby kontynuować korzystanie z analityki strony, odnów swoją zgodę.
          </p>
        </div>
        <div className={styles.actions}>
          <Button 
            variant="primary" 
            onClick={handleRenewConsent}
            className={styles.renewButton}
          >
            Odnów zgodę
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleDismiss}
            className={styles.dismissButton}
          >
            Przypomnij później
          </Button>
        </div>
      </div>
    </div>
  );
};
