/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import styles from './Footer.module.scss'
import {  CookiesConsent } from "@/components";
import { useState } from 'react';

export const Footer = () => {
  const currentYear = new Date().getFullYear()
  const [showCookiesBanner, setShowCookiesBanner] = useState(false);
  const [currentCookieStates, setCurrentCookieStates] = useState<{
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
  } | null>(null);

  const modifyCookies = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      // Odczytaj aktualne ustawienia ciasteczek
      const cookiesData = localStorage.getItem('wcagCookies');
      
      if (cookiesData) {
        const parsedData = JSON.parse(cookiesData);
        if (parsedData.preferences) {
          setCurrentCookieStates({
            necessary: true, 
            analytics: parsedData.preferences.analytics ?? false,
            marketing: parsedData.preferences.marketing ?? false
          });
        }
      } else {
        // Jeśli nie ma zapisanych ustawień, ustaw domyślne
        setCurrentCookieStates({
          necessary: true,
          analytics: false,
          marketing: false
        });
      }
      
      // Pokaż baner bez odświeżania strony
      setShowCookiesBanner(true);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Wystąpił problem przy wyświetlaniu ustawień cookies');
      }
    }
  };
  

  return (
    <footer className={styles.footer}>

        <p className={styles.copyright}>
          &copy; {currentYear} Seahorse. All rights reserved.
        </p>
        <button className={styles.cookieSettings} onClick={modifyCookies}>Zarządzaj ustawieniami cookies</button>
      
        {showCookiesBanner && (
        <div className={styles.cookiesBannerWrapper}>
          <CookiesConsent 
            fallback={null} 
            cookieStates={currentCookieStates || undefined}
            onAccept={() => setShowCookiesBanner(false)}
          />
        </div>
      )}
    </footer>
  )
}
