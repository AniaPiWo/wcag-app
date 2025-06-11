import React from 'react';
import styles from './Offer.module.scss';
import { OfferCard } from '../atoms/OfferCard/OfferCard';


export const offers = [
  {
    id: '1',
    title: 'Manualny audyt dostępności',
    subtitle: 'Dla firm z istniejącą stroną internetową',
    description:
      'Szczegółowa analiza Twojej strony pod kątem zgodności z WCAG 2.2.',
    price: {
      amount: '99',
      currency: 'zł',
      period: 'jednorazowo',
    },
    features: [
      'Manualny audyt dostępności',
      'Raport z wykrytymi problemami',
      'Rekomendacje naprawy',
      'Konsultacja online',
      'Do 5 podstron'
    ],
    buttonText: 'Zamów audyt'
  },
  {
    id: '2',
    title: 'Dostosowanie do WCAG 2.2',
    subtitle: 'Dla firm z istniejącą stroną internetową',
    description:
      'Dostosuję Twoją stronę lub aplikację do standardów WCAG 2.2.',
    price: {
      amount: 'od 500',
      currency: 'zł',
      period: 'projekt'
    },
    features: [
      'Manualny audyt dostępności',
      'Implementacja poprawek',
      'Testy z użytkownikami',
      'Dokumentacja techniczna',
      'Wsparcie po wdrożeniu'
    ],
    buttonText: 'Zapytaj o wycenę'
  },
  {
    id: '3',
    title: 'Tworzę dostępne rozwiązania',    
    subtitle: 'Dla firm potrzebujących nowej strony',
    description:
      'Tworzę dostępne serwisy i aplikacje od podstaw – zgodne z WCAG 2.2.',
    price: {
      amount: 'od 1000',
      currency: 'zł',
      period: 'projekt'
    },
    features: [
      'Projekt UX/UI',
      'Implementacja frontend i backend',
      'Pełna zgodność z WCAG 2.2',
      'Testy z użytkownikami',
      'Wsparcie techniczne'
    ],
    buttonText: 'Zapytaj o wycenę'
  },
];

export const Offer = () => {
  return (
    <section id="Offer" className={styles.wrapper}>
      <div className={styles.top}>
        <h2 className={styles.title}>Usługi dostępności cyfrowej WCAG 2.2</h2>
        <p className={styles.desc}>
          Oferuję profesjonalne rozwiązania w zakresie dostępności cyfrowej zgodne z WCAG 2.2. 
          Moje usługi zapewniają, że Twoje witryny i aplikacje internetowe będą dostępne dla wszystkich użytkowników, 
          w tym osób z niepełnosprawnościami wzroku, słuchu, ruchu i poznawczymi. Działam zgodnie z najnowszymi 
          standardami i regulacjami prawnymi dotyczącymi dostępności cyfrowej.
        </p>
      </div>
      {/*  desktop */}
      <div className={styles.cardsDesktop}>
        {offers.map((card) => (
          <OfferCard
            key={card.id}
            title={card.title}
            subtitle={card.subtitle}
            description={card.description}
            price={card.price}
            features={card.features}
            buttonText={card.buttonText}
          />
        ))}
      </div>

      {/*  mobile */}
      <div className={styles.cardsMobile}>
        {offers.map((card) => (
          <div key={card.id} className={styles.cardItem}>
            <OfferCard
              title={card.title}
              subtitle={card.subtitle}
              description={card.description}
              price={card.price}
              features={card.features}
              buttonText={card.buttonText}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
