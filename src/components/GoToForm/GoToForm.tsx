'use client';
import React from 'react';
import styles from './GoToForm.module.scss';
import { Button } from '../atoms/Button/Button';

export const GoToForm = () => {
  // Funkcja do przewijania do formularza
  const scrollToForm = () => {
    const formElement = document.getElementById('form');
    if (formElement) {
      // Obliczanie pozycji, aby formularz był na środku ekranu
      const elementRect = formElement.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const middle = absoluteElementTop - (window.innerHeight / 2) + (elementRect.height / 2);
      
      // Przewijanie do obliczonej pozycji
      window.scrollTo({
        top: middle,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={styles.fullBackground}>
      <div className={styles.gridBackground} />
      <div className={styles.wrapper}>
        <div className={styles.text}>
          <h2 className={styles.title}>
            Sprawdź dostępność swojej strony
          </h2>
          <p className={styles.desc}>
            Wykonaj audyt zgodności z WCAG 2.2 i dowiedz się, czy Twoja strona jest dostępna dla wszystkich użytkowników.
          </p>
          <div className={styles.buttonWrapper}>
            <Button 
              onClick={scrollToForm}
              aria-label="Przejdź do formularza audytu"
              variant="primary"
            >
              Zamów audyt
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
