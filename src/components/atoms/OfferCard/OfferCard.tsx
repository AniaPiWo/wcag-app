'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './OfferCard.module.scss';
import { Button } from '../Button/Button';

type PriceType = {
  amount: string;
  period?: string;
  limit?: string;
  currency?: string;
};

type OfferCardProps = {
  title: string;
  subtitle?: string;
  description?: string;
  price?: PriceType;
  features: string[];
  buttonText?: string;
  buttonUrl?: string;
  emailSubject?: string;
  emailBody?: string;
  popular?: boolean;
  className?: string;
};

export const OfferCard = ({
  title,
  subtitle,
  description,
  price,
  features = [],
  buttonText = 'Dowiedz się więcej',
  buttonUrl = '#',
  emailSubject = '',
  emailBody = '',
}: OfferCardProps) => {
  const [showFeatures, setShowFeatures] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const featuresSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Sprawdź przy pierwszym renderowaniu
    checkIfMobile();
    
    // Dodaj nasłuchiwanie na zmiany rozmiaru okna
    window.addEventListener('resize', checkIfMobile);
    
    // Usuń nasłuchiwanie przy odmontowaniu komponentu
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  const toggleFeatures = () => {
    setShowFeatures(!showFeatures);
    
    // Delay update of parent card height to allow animation to start
    setTimeout(() => {
      updateCardHeight();
    }, 50);
  };
  
  // Function to update the card height based on content
  const updateCardHeight = useCallback(() => {
    if (isMobile && cardRef.current && featuresSectionRef.current) {
      // Jeśli karta jest rozwinięta, ustaw wyraźnie wysokość na auto
      if (showFeatures) {
        // Ustaw wysokość karty, aby pomieściła całą zawartość
        cardRef.current.style.height = 'auto';
        cardRef.current.style.minHeight = 'auto';
        cardRef.current.style.maxHeight = 'none';
        cardRef.current.style.overflow = 'visible';
      } else {
        // Jeśli karta jest zwinięta, pozwól CSS kontrolować wysokość
        cardRef.current.style.height = '';
        cardRef.current.style.overflow = '';
      }
    }
  }, [isMobile, showFeatures]);
  
  // Effect to adjust card height when features visibility changes
  useEffect(() => {
    if (isMobile && showFeatures) {
      updateCardHeight();
    }
  }, [showFeatures, isMobile, updateCardHeight]);
  return (
    <div className={`${styles.card} ${showFeatures ? styles.expanded : ''}`} ref={cardRef}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      
      {price && (
        <div className={styles.priceSection}>
          <div className={styles.priceRow}>
            <span className={styles.priceAmount}>{price.amount}</span>
            <div className={styles.priceDetails}>
              <span className={styles.priceCurrency}>{price.currency || 'PLN'}</span>
              {price.period && <span className={styles.pricePeriod}>/{price.period}</span>}
            </div>
          </div>
          {price.limit && <p className={styles.priceLimit}>{price.limit}</p>}
        </div>
      )}
      
      {buttonText && (
        <div className={styles.buttonWrapper}>
          <Button 
            variant="primary" 
            onClick={() => {
              // Sprawdź, czy mamy dane emaila
              if (emailSubject && emailBody) {
                // Utworzenie poprawnego linku mailto z encodowanym tytułem i treścią
                const mailtoUrl = `mailto:biuro@wcag.co?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
                window.location.href = mailtoUrl;
              } else if (buttonUrl) {
                // Fallback do zwykłego URL
                window.location.href = buttonUrl;
              }
            }}
          >
            {buttonText}
          </Button>
        </div>
      )}
      
      {description && <p className={styles.description}>{description}</p>}
      
      {features.length > 0 && (
        <>
          {isMobile && (
            <div className={styles.detailsButtonWrapper}>
              <button 
              className={styles.button}
                onClick={toggleFeatures}
                aria-expanded={showFeatures}
                aria-controls={`features-${title.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <span className={styles.buttonText}>
                  {showFeatures ? 'Ukryj szczegóły' : 'Zobacz szczegóły'}
                </span>
                <span className={styles.buttonIcon} aria-hidden="true">
                  {showFeatures ? '▲' : '▼'}
                </span>
              </button>
            </div>
          )}
          
          {isMobile ? (
            <div 
              id={`features-${title.replace(/\s+/g, '-').toLowerCase()}`}
              className={`${styles.featuresSection} ${showFeatures ? styles.featuresVisible : ''}`}
              ref={featuresSectionRef}
              style={{ 
                maxHeight: showFeatures ? '1000px' : '0',
                overflow: 'hidden',
                transition: showFeatures 
                  ? 'max-height 0.5s ease, padding 0.3s ease, opacity 0.3s ease' 
                  : 'max-height 0.2s ease, padding 0.2s ease, opacity 0.2s ease',
                padding: showFeatures ? '1.5rem 1rem' : '0 1rem',
                opacity: showFeatures ? 1 : 0
              }}
              aria-hidden={!showFeatures}
              onTransitionEnd={updateCardHeight}
            >
              <ul className={styles.featuresList}>
                {features.map((feature, index) => (
                  <li key={`feature-${index}`} className={styles.featureItem}>
                    <span className={styles.checkmark} aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 0V16M0 8H16" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className={styles.featuresSection}>
              <ul className={styles.featuresList}>
                {features.map((feature, index) => (
                  <li key={`feature-${index}`} className={styles.featureItem}>
                    <span className={styles.checkmark} aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 0V16M0 8H16" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};
