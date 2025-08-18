/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import styles from './Footer.module.scss'
import {  CookiesConsent } from "@/components";
import { useState, useCallback } from 'react';
import { Logo } from '@/components/Logo/Logo';
import Link from 'next/link';

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
        setCurrentCookieStates({
          necessary: true,
          analytics: false,
          marketing: false
        });
      }
      
      setShowCookiesBanner(true);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Wystąpił problem przy wyświetlaniu ustawień cookies');
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContactClick = useCallback(() => {
    setTimeout(() => {
      const emailParts = ['biuro', 'wcag.co'];
  
      const subject = encodeURIComponent("Zapytanie o audyt WCAG");
      const body = encodeURIComponent(
        "Dzień dobry,\n\nProszę o kontakt w sprawie audytu dostępności mojej strony internetowej.\n\nAdres strony: \n\nPozdrawiam,\n"
      );
  
      window.location.href = `mailto:${emailParts[0]}@${emailParts[1]}?subject=${subject}&body=${body}`;
    }, 500);
  }, []);
  
  

  return (
    <footer className={styles.footer}>
 
        <div className={styles.footerContent}>
        <Logo ariaLabel="Logo WCAG by Ania - powrót na górę strony" className={styles.logoLink} onClick={scrollToTop} />

        <div className={styles.footerText}>

        <p className={styles.copyright}>
          &copy; {currentYear} Seahorse. All rights reserved.
        </p>
        <div className={styles.footerLinks}>
          <button className={styles.contactBtn} onClick={handleContactClick}>Kontakt</button>
          <Link href="/terms-of-use" className={styles.footerLink}>Regulamin</Link>
          <button className={styles.cookieSettings} onClick={modifyCookies}>Zarządzaj ustawieniami cookies</button>
        </div>
        </div>
        </div>
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
