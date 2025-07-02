'use client'
import Image from 'next/image';
import styles from './Hero.module.scss';
import { Button } from '@/components/atoms/Button/Button';
import { useCallback, useState } from 'react';

export const Hero = () => {
  const [isContactLoading, setIsContactLoading] = useState(false);

  const handleAuditClick = useCallback(() => {
    const formSection = document.getElementById('form');
    if (formSection) {

      const formRect = formSection.getBoundingClientRect();
      const formTop = formRect.top + window.pageYOffset;
      
      const windowHeight = window.innerHeight;
      const formHeight = formRect.height;
      const centerPosition = formTop - (windowHeight / 2 - formHeight / 2);
      
      window.scrollTo({
        top: centerPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  // spam protection
  const handleContactClick = useCallback(() => {
    setIsContactLoading(true);
    setTimeout(() => {
      const emailParts = ['biuro', 'wcag.co'];
      window.location.href = `mailto:${emailParts[0]}@${emailParts[1]}`;
      setTimeout(() => {
        setIsContactLoading(false);
      }, 2000);
    }, 500);
  }, []);
  
  return (
    <section id="hero" className={styles.wrapper}>
       <div className={styles.bottom}>
        <div className={styles.imageContainer}>
          <Image
            src="/pug.jpg"
            alt="Mops jako symbol dostępności"
            fill
            fetchPriority="high"
            loading="eager"
            className={styles.image}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
      <div className={styles.top}>

<h1 className={styles.title}>Popraw dostępność, zwiększ sprzedaż i widoczność – dzięki WCAG 2.2</h1>
<p>
  Zadbam o to, by Twoja strona była naprawdę dostępna – dla wszystkich klientów i dla wyszukiwarek. 
  Przeprowadzę audyt, wdrożę poprawki i pomogę Ci stworzyć miejsce, które działa lepiej, sprzedaje więcej i nie wyklucza nikogo.
</p>


        <div className={styles.buttonContainer}>
          <Button variant="primary" onClick={handleAuditClick}>Bezpłatny audyt strony</Button>
          <Button 
            variant="secondary" 
            onClick={handleContactClick}
            isLoading={isContactLoading}
            aria-label="Wyślij email"
          >
            Kontakt
          </Button>
        </div>
      </div>
     
    </section>
  );
};
