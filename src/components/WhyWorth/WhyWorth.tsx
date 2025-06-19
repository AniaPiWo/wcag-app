import React from 'react';
import styles from './WhyWorth.module.scss';


export const WhyWorth = () => {
  return (
    <section id="WhyWorth" className={styles.wrapper}>
      <div className={styles.top}>
        <h2 className={styles.title}>Dlaczego warto zadbać o dostępność cyfrową?</h2>
        <p className={styles.desc}>
        Dostępność cyfrowa to inwestycja, która pozwala dotrzeć do szerszego grona użytkowników, poprawia widoczność strony w Google, zwiększa użyteczność i zaufanie do marki, a jednocześnie zabezpiecza firmę przed przyszłymi wymogami prawnymi.
        </p>
      </div>
      {/*  desktop */}
      <div className={styles.cardsDesktop}>
        worth
      </div>

      {/*  mobile */}
      <div className={styles.cardsMobile}>
     mobile
      </div>
    </section>
  );
};
