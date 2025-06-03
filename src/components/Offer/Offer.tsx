import React from 'react';
import styles from './Offer.module.scss';
import { OfferCard } from '../atoms/OfferCard/OfferCard';


export const offers = [
  {
    id: '1',
    image: '/pug.jpg',
    title: 'Audyt dostępności WCAG',
    alt: 'Ikona symbolizująca audyt dostępności',
    description:
      'Szczegółowa analiza Twojej strony pod kątem zgodności z WCAG 2.2. Otrzymasz ode mnie praktyczny raport z rekomendacjami dotyczącymi naprawy problemów zgodności.',
  },
  {
    id: '2',
    image: '/pug.jpg',
    title: 'Dostosowanie do WCAG 2.2',
    alt: 'Ikona symbolizująca dostosowanie strony',
    description:
      'Dostosuję Twoją stronę lub aplikację do standardów WCAG 2.2, poprawiając jej dostępność i użyteczność dla wszystkich użytkowników.',
  },
  {
    id: '3',
    image: '/pug.jpg',
    title: 'Tworzę dostępne rozwiązania',    
    alt: 'Ikona symbolizująca projektowanie dostępnych rozwiązań',
    description:
      'Tworzę dostępne serwisy i aplikacje od podstaw – zgodne z WCAG 2.2, przyjazne dla użytkownika i zaprojektowane zgodnie z zasadami dobrego UX.',
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
            id={card.id}
            image={card.image}
            alt={card.alt}
            title={card.title}
            description={card.description}
          />
        ))}
      </div>

      {/*  mobile */}
      <div className={styles.cardsMobile}>
        {offers.map((card) => (
          <div key={card.id} className={styles.cardItem}>
            <OfferCard
              id={card.id}
              image={card.image}
              alt={card.alt}
              title={card.title}
              description={card.description}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
