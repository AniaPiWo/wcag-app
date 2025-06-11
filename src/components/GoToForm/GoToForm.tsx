'use client';
import React from 'react';
import styles from './GoToForm.module.scss';
import { Button } from '../atoms/Button/Button';

export const GoToForm = () => {
  // Funkcja do przewijania do formularza
  const scrollToForm = () => {
    const formElement = document.getElementById('form');
    if (formElement) {
      const elementRect = formElement.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
  
      const offset = 50; // np. wysokość nagłówka lub bufor
      window.scrollTo({
        top: absoluteElementTop - offset,
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
            Wykonaj bezpłatny audyt zgodności z WCAG 2.2 i sprawdź, czy Twoja strona jest dostępna dla wszystkich użytkowników.
          </p>
          <div className={styles.buttonWrapper}>
            <Button 
              onClick={scrollToForm}
              aria-label="Przejdź do formularza audytu"
              variant="primary"
            >
              Sprawdź dostępność
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
