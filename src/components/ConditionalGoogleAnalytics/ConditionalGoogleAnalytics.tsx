'use client';
import { useEffect, useState, useCallback } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';

interface ConditionalGoogleAnalyticsProps {
  gaId: string;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const ConditionalGoogleAnalytics: React.FC<ConditionalGoogleAnalyticsProps> = ({ gaId }) => {
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState(false);
  const [isGALoaded, setIsGALoaded] = useState(false);

  // Funkcja do wyłączania Google Analytics
  const disableGoogleAnalytics = useCallback(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      // Wyłącz Google Analytics
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
      
      // Usuń cookies Google Analytics
      const cookiesToDelete = [
        '_ga',
        '_ga_' + gaId.substring(2),
        '_gid',
        '_gat',
        '_gat_gtag_' + gaId
      ];
      
      cookiesToDelete.forEach(cookieName => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      
      console.log('Google Analytics disabled and cookies cleared');
    }
  }, [gaId]);

  // Funkcja do włączania Google Analytics
  const enableGoogleAnalytics = useCallback(() => {
    if (typeof window !== 'undefined') {
      if (window.gtag) {
        // Włącz Google Analytics jeśli już jest załadowany
        window.gtag('consent', 'update', {
          'analytics_storage': 'granted'
        });
        console.log('Google Analytics enabled');
      } else {
        // Załaduj Google Analytics dynamicznie
        setIsGALoaded(true);
        console.log('Google Analytics loading...');
      }
    }
  }, []);

  useEffect(() => {
    const checkConsent = () => {
      try {
        const cookiesData = localStorage.getItem('wcagCookies');
        if (cookiesData) {
          const parsedData = JSON.parse(cookiesData);
          const hasConsent = parsedData.consented && parsedData.preferences?.analytics;
          
          if (hasConsent !== hasAnalyticsConsent) {
            setHasAnalyticsConsent(hasConsent);
            
            if (hasConsent) {
              enableGoogleAnalytics();
            } else {
              disableGoogleAnalytics();
            }
          }
        } else {
          // Brak danych o zgodzie - wyłącz GA
          if (hasAnalyticsConsent) {
            setHasAnalyticsConsent(false);
            disableGoogleAnalytics();
          }
        }
      } catch (error) {
        console.warn('Error checking analytics consent:', error);
        if (hasAnalyticsConsent) {
          setHasAnalyticsConsent(false);
          disableGoogleAnalytics();
        }
      }
    };

    // Sprawdź zgodę przy załadowaniu
    checkConsent();

    // Nasłuchuj zmian w localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'wcagCookies') {
        checkConsent();
      }
    };

    // Nasłuchuj custom event dla zmian zgody
    const handleConsentChange = () => {
      checkConsent();
    };

    // Nasłuchuj wycofanie zgody
    const handleConsentRevoked = () => {
      setHasAnalyticsConsent(false);
      setIsGALoaded(false);
      disableGoogleAnalytics();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cookieConsentChanged', handleConsentChange);
    window.addEventListener('cookieConsentRevoked', handleConsentRevoked);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cookieConsentChanged', handleConsentChange);
      window.removeEventListener('cookieConsentRevoked', handleConsentRevoked);
    };
  }, [hasAnalyticsConsent, gaId, disableGoogleAnalytics, enableGoogleAnalytics]);

  // Renderuj Google Analytics tylko jeśli użytkownik wyraził zgodę
  if (hasAnalyticsConsent && isGALoaded) {
    return <GoogleAnalytics gaId={gaId} />;
  }

  return null;
};
