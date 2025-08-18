import React from 'react';
import styles from './WhyWorth.module.scss';
import { AnimatedReveal } from '@/components/atoms/AnimatedReveal/AnimatedReveal';


const benefits = [
  {
    index: "1",
    headline: 'Bezpieczna zgodność z prawem',
    description: 'Wdrożenie standardów WCAG pozwala uniknąć wysokich kar finansowych za niedostępność strony, zapewniając spokój i bezpieczeństwo prawne Twojego biznesu.'
  },
  {
    index: "2",
    headline: 'Dla każdego użytkownika',
    description: 'Twoja strona będzie dostępna dla osób z niepełnosprawnościami, seniorów i użytkowników mobilnych – bez barier, bez wykluczenia.'
  },
  {
    index: "3",
    headline: 'Lepsze wyniki w Google',
    description: 'Dostępna strona ma lepszą strukturę kodu, co przekłada się na wyższe pozycje w wyszukiwarkach i większy ruch organiczny.'
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
      <AnimatedReveal direction="up" delay={0.1}>
        <div className={styles.top}>
          <h2 className={styles.title}>Dlaczego warto zadbać o dostępność cyfrową?</h2>
          <p className={styles.desc}>
            Dostępność cyfrowa to inwestycja, która pozwala dotrzeć do szerszego grona użytkowników, poprawia widoczność strony w Google, zwiększa użyteczność i zaufanie do marki, a jednocześnie zabezpiecza firmę przed przyszłymi wymogami prawnymi.
          </p>
        </div>
      </AnimatedReveal>
      
      {/* Desktop View */}
      <div className={styles.benefits}>
        {benefits.map((item, idx) => (
          <AnimatedReveal 
            key={item.index} 
            direction="up" 
            delay={0.2 + (idx * 0.1)} 
            distance={30}
          >
            <div className={styles.benefit}>
              <span className={styles.index}>{item.index}</span>
              <div className={styles.content}>
                <h3 className={styles.headline}>{item.headline}</h3>
                <p className={styles.description}>{item.description}</p>
              </div>
            </div>
          </AnimatedReveal>
        ))}
      </div>


    </section>
  );
};
