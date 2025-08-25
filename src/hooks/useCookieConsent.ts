'use client';
import { useState, useEffect, useCallback } from 'react';

export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  // marketing: boolean;
}

export interface CookieConsentData {
  consented: boolean;
  consentDate: string;
  preferences: CookieConsent;
}

const defaultConsent: CookieConsent = {
  necessary: true,
  analytics: false,
  // marketing: false,
};

export const useCookieConsent = () => {
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent);
  const [hasConsented, setHasConsented] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sprawdź czy zgoda jest aktualna (max 13 miesięcy)
  const isConsentValid = useCallback((consentDate: string): boolean => {
    const consent = new Date(consentDate);
    const now = new Date();
    const monthsDiff = (now.getTime() - consent.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsDiff < 13;
  }, []);

  // Załaduj zgodę z localStorage
  const loadConsent = useCallback(() => {
    try {
      const cookiesData = localStorage.getItem('wcagCookies');
      if (cookiesData) {
        const parsedData: CookieConsentData = JSON.parse(cookiesData);
        
        // Sprawdź czy zgoda jest aktualna
        if (parsedData.consented && isConsentValid(parsedData.consentDate)) {
          setConsent(parsedData.preferences);
          setHasConsented(true);
        } else {
          // Zgoda wygasła - resetuj
          localStorage.removeItem('wcagCookies');
          setConsent(defaultConsent);
          setHasConsented(false);
        }
      }
    } catch (error) {
      console.warn('Error loading cookie consent:', error);
      setConsent(defaultConsent);
      setHasConsented(false);
    } finally {
      setIsLoading(false);
    }
  }, [isConsentValid]);

  // Zapisz zgodę
  const saveConsent = useCallback((newConsent: CookieConsent) => {
    try {
      const cookiesData: CookieConsentData = {
        consented: true,
        consentDate: new Date().toISOString(),
        preferences: newConsent,
      };

      localStorage.setItem('wcagCookies', JSON.stringify(cookiesData));
      setConsent(newConsent);
      setHasConsented(true);

      // Wyślij custom event dla innych komponentów
      window.dispatchEvent(new CustomEvent('cookieConsentChanged', {
        detail: { consent: newConsent }
      }));

    } catch (error) {
      console.error('Error saving cookie consent:', error);
    }
  }, []);

  // Aktualizuj konkretną kategorię
  const updateConsent = useCallback((category: keyof CookieConsent, value: boolean) => {
    const newConsent = { ...consent, [category]: value };
    saveConsent(newConsent);
  }, [consent, saveConsent]);

  // Akceptuj wszystkie cookies
  const acceptAll = useCallback(() => {
    const allConsent: CookieConsent = {
      necessary: true,
      analytics: true,
      // marketing: true,
    };
    saveConsent(allConsent);
  }, [saveConsent]);

  // Odrzuć wszystkie opcjonalne cookies
  const rejectAll = useCallback(() => {
    saveConsent(defaultConsent);
  }, [saveConsent]);

  // Wycofaj zgodę
  const revokeConsent = useCallback(() => {
    try {
      localStorage.removeItem('wcagCookies');
      setConsent(defaultConsent);
      setHasConsented(false);

      // Wyślij event o wycofaniu zgody
      window.dispatchEvent(new CustomEvent('cookieConsentRevoked'));
    } catch (error) {
      console.error('Error revoking consent:', error);
    }
  }, []);

  // Załaduj zgodę przy inicjalizacji
  useEffect(() => {
    loadConsent();
  }, [loadConsent]);

  return {
    consent,
    hasConsented,
    isLoading,
    updateConsent,
    saveConsent,
    acceptAll,
    rejectAll,
    revokeConsent,
    loadConsent,
  };
};
