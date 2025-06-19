import React from 'react';
import styles from './WhyWorth.module.scss';

const benefits = [
  {
    index: "1",
    headline: 'Dla każdego użytkownika',
    description: 'Twoja strona będzie dostępna dla osób z niepełnosprawnościami, seniorów i użytkowników mobilnych – bez barier, bez wykluczenia.'
  },
  {
    index: "2",
    headline: 'Lepsze wyniki w Google',
    description: 'Dostępna strona ma lepszą strukturę kodu, co przekłada się na wyższe pozycje w wyszukiwarkach i większy ruch organiczny.'
  },
  {
    index: "3",
    headline: 'Intuicyjność i czytelność',
    description: 'WCAG poprawia czytelność, kontrast, nawigację i UX – co docenią nie tylko osoby z trudnościami, ale każdy użytkownik.'
  },
  {
    index: "4",
    headline: 'Wiarygodność marki',
    description: 'Pokażesz, że jesteś odpowiedzialny społecznie i dbasz o wszystkich klientów – co wzmacnia zaufanie i profesjonalny wizerunek.'
  }
];

export const WhyWorth = () => {

  return (
    <section id="WhyWorth" className={styles.wrapper}>
      <div className={styles.top}>
        <h2 className={styles.title}>Dlaczego warto zadbać o dostępność cyfrową?</h2>
        <p className={styles.desc}>
          Dostępność cyfrowa to inwestycja, która pozwala dotrzeć do szerszego grona użytkowników, poprawia widoczność strony w Google, zwiększa użyteczność i zaufanie do marki, a jednocześnie zabezpiecza firmę przed przyszłymi wymogami prawnymi.
        </p>
      </div>
      
      {/* Desktop View */}
      <div className={styles.benefits}>
        {benefits.map((item) => (
          <div key={item.index} className={styles.benefit}>
            <span className={styles.index}>{item.index}</span>
            <div className={styles.content}>
              <h3 className={styles.headline}>{item.headline}</h3>
              <p className={styles.description}>{item.description}</p>
            </div>
          </div>
        ))}
      </div>


    </section>
  );
};
