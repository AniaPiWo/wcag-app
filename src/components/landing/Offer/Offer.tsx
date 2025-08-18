'use client';
import React, { useEffect, useRef } from 'react';
import styles from './Offer.module.scss';
import { OfferCard } from '@/components/atoms/OfferCard/OfferCard';
import { AnimatedReveal } from '@/components/atoms/AnimatedReveal/AnimatedReveal';


export const offers = [
  {
    id: '1',
    title: 'Manualny audyt dostępności',
    subtitle: 'Dla firm z istniejącą stroną internetową',
    description:
      'Szczegółowa analiza Twojej strony pod kątem zgodności z WCAG 2.2.',
    price: {
      amount: 'od 399',
      currency: 'zł netto',
      period: 'jednorazowo',
    },
    features: [
      'Manualny oraz automatyczny audyt dostępności',
      'Analiza kluczowych kryteriów dostępności wskazanych przez Ministerstwo Cyfryzacji',
      'Szczegółowy raport z wykrytymi problemami dostępności',
      'Dostępne poziomy auditu: podstawowy, średni i zaawansowany',
      'Praktyczne rekomendacje naprawcze',
      'Audyt dostępności do 5 podstron serwisu'
    ],
    emailSubject: 'Zapytanie o audyt dostępności',
    emailBody: `Dzień dobry,

Jestem zainteresowany/a zamówieniem audytu dostępności dla mojej strony internetowej.

Proszę o informacje dotyczące procesu i dostępnych pakietów.

Pozdrawiam,
`,
    buttonText: 'Zamów audyt'
  },
  {
    id: '2',
    title: 'Dostosowanie do WCAG 2.2',
    subtitle: 'Dla firm z istniejącą stroną internetową',
    description:
      'Dostosuję Twoją stronę lub aplikację do standardów WCAG 2.2.',
    price: {
      amount: 'od 999',
      currency: 'zł netto',
      period: 'projekt'
    },
    features: [
      'Manualny oraz automatyczny audyt dostępności',
      'Implementacja poprawek dostępności',
      'Testy dostępności',
      'Certyfikat dostępności cyfrowej',
      'Deklaracja dostępności strony',
      'Wsparcie po wdrożeniu dostępności'
    ],
    emailSubject: 'Zapytanie o dostosowanie strony do WCAG 2.2',
    emailBody: `Dzień dobry,

Jestem zainteresowany/a dostosowaniem mojej strony internetowej do standardów WCAG 2.2.

Proszę o wycenę oraz informacje o procesie dostosowania.

Pozdrawiam,
`,
    buttonText: 'Zapytaj o wycenę'
  },
  {
    id: '3',
    title: 'Tworzę dostępne rozwiązania',    
    subtitle: 'Dla firm potrzebujących nowej strony',
    description:
      'Tworzę dostępne serwisy i aplikacje od podstaw – zgodne z WCAG 2.2.',
    price: {
      amount: 'od 1999',
      currency: 'zł netto',
      period: 'projekt'
    },
    features: [
      'Przygotowanie projektu strony',
      'Wykonanie strony',
      'Pełna zgodność z WCAG 2.2',
      'Certyfikat dostępności cyfrowej',
      'Deklaracja dostępności strony',
      'Wsparcie techniczne'
    ],
    emailSubject: 'Zapytanie o stworzenie dostępnej strony',
    emailBody: `Dzień dobry,

Jestem zainteresowany/a stworzeniem nowej, w pełni dostępnej strony internetowej zgodnej z WCAG 2.2.

Proszę o wycenę oraz informacje o procesie tworzenia strony.

Pozdrawiam,
`,
    buttonText: 'Zapytaj o wycenę'
  },
];

export const Offer = () => {
  const cardsDesktopRef = useRef<HTMLDivElement>(null);
  const cardsMobileRef = useRef<HTMLDivElement>(null);

  // Function to equalize card heights
  const equalizeCardHeights = () => {
    // For desktop cards
    if (cardsDesktopRef.current && window.innerWidth > 768) {
      const cards = cardsDesktopRef.current.querySelectorAll(`.${styles.cardWrapper}`);
      
      // Reset heights first
      cards.forEach(card => {
        (card as HTMLElement).style.height = 'auto';
      });
      
      // Find the tallest card
      let maxHeight = 0;
      cards.forEach(card => {
        const height = (card as HTMLElement).offsetHeight;
        maxHeight = Math.max(maxHeight, height);
      });
      
      // Set all cards to the tallest height
      if (maxHeight > 0) {
        cards.forEach(card => {
          (card as HTMLElement).style.height = `${maxHeight}px`;
        });
      }
    }
    
    // Na mobilnych nie wyrównujemy wysokości kart, aby umożliwić dynamiczne rozwijanie
    // Usunięto wyrównywanie wysokości na mobile, aby umożliwić prawidłowe działanie rozwijanych szczegółów
  };

  // Run on initial render and window resize
  useEffect(() => {
    // Initial equalization
    equalizeCardHeights();
    
    // Add resize listener
    window.addEventListener('resize', equalizeCardHeights);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', equalizeCardHeights);
    };
  }, []);

  return (
    <section id="Offer" className={styles.wrapper}>
      <AnimatedReveal direction="up" delay={0.1}>
        <div className={styles.top}>
          <h2 className={styles.title}>Usługi dostępności cyfrowej WCAG 2.2</h2>
          <p className={styles.desc}>
            Oferuję profesjonalne rozwiązania w zakresie dostępności cyfrowej zgodne z WCAG 2.2. 
            Moje usługi zapewniają, że Twoje witryny i aplikacje internetowe będą dostępne dla wszystkich użytkowników, 
            w tym osób z niepełnosprawnościami wzroku, słuchu, ruchu i poznawczymi. Działam zgodnie z najnowszymi 
            standardami i regulacjami prawnymi dotyczącymi dostępności cyfrowej.
          </p>
        </div>
      </AnimatedReveal>
      {/*  desktop */}
      <div className={styles.cardsDesktop} ref={cardsDesktopRef}>
        {offers.map((card, idx) => (
          <AnimatedReveal 
            key={card.id} 
            direction="right" 
            delay={0.3 + (idx * 0.15)} 
            distance={60}
          >
            <div className={styles.cardWrapper}>
              <OfferCard
                title={card.title}
                subtitle={card.subtitle}
                description={card.description}
                price={card.price}
                features={card.features}
                buttonText={card.buttonText}
                emailSubject={card.emailSubject}
                emailBody={card.emailBody}
              />
            </div>
          </AnimatedReveal>
        ))}
      </div>

      {/*  mobile */}
      <div className={styles.cardsMobile} ref={cardsMobileRef}>
        {offers.map((card, idx) => (
          <AnimatedReveal 
            key={card.id} 
            direction="right" 
            delay={0.3 + (idx * 0.15)} 
            distance={60}
          >
            <div className={styles.cardItem}>
              <OfferCard
                title={card.title}
                subtitle={card.subtitle}
                description={card.description}
                price={card.price}
                features={card.features}
                buttonText={card.buttonText}
                emailSubject={card.emailSubject}
                emailBody={card.emailBody}
              />
            </div>
          </AnimatedReveal>
        ))}
      </div>
    </section>
  );
};
