
import React from 'react';
import styles from './POUR.module.scss'
import { PourWave } from '../atoms/PourWave/PourWave';


export const POUR = () => {


  return (
    <section id="POUR" className={styles.wrapper}>
      <div className={styles.top}>
        <h2 className={styles.title}>Zasady POUR - fundament dostępności cyfrowej</h2>
        <p className={styles.desc}>
          POUR to cztery podstawowe zasady dostępności cyfrowej zdefiniowane w standardzie WCAG 2.2. 
          Projektując zgodnie z tymi zasadami, tworzymy cyfrowy świat dostępny dla wszystkich, 
          niezależnie od rodzaju niepełnosprawności czy ograniczeń technicznych.
        </p>
      </div>
      <div className={styles.bottom}>
      <PourWave />
      </div>

    </section>
  );
};
