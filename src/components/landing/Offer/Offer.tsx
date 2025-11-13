'use client';
import React, { useEffect, useRef } from 'react';
import styles from './Offer.module.scss';
import { OfferCard } from '@/components/atoms/OfferCard/OfferCard';
import { AnimatedReveal } from '@/components/atoms/AnimatedReveal/AnimatedReveal';
import { offers } from '@/lib/data/offers';

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
        {offers.map((card, idx) => {
          const colors: ('cyan' | 'lime' | 'purple')[] = ['cyan', 'lime', 'purple'];
          const cardColor = colors[idx % colors.length];
          
          return (
            <AnimatedReveal 
              key={card.id} 
              direction="up" 
              delay={0.2 + (idx * 0.1)} 
              distance={40}
            >
              <div className={styles.cardWrapper}>
                <OfferCard
                  title={card.title}
                  description={card.description}
                  price={card.price}
                  features={card.features}
                  buttonText={card.buttonText}
                  emailSubject={card.emailSubject}
                  emailBody={card.emailBody}
                  color={cardColor}
                />
              </div>
            </AnimatedReveal>
          );
        })}
      </div>

      {/*  mobile */}
      <div className={styles.cardsMobile} ref={cardsMobileRef}>
        {offers.map((card, idx) => {
          const colors: ('cyan' | 'lime' | 'purple')[] = ['cyan', 'lime', 'purple'];
          const cardColor = colors[idx % colors.length];
          
          return (
            <div key={card.id} className={styles.cardItem}>
              <OfferCard
                title={card.title}
                description={card.description}
                price={card.price}
                features={card.features}
                buttonText={card.buttonText}
                emailSubject={card.emailSubject}
                emailBody={card.emailBody}
                color={cardColor}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};
