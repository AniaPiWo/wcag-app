'use client'
//import Image from 'next/image';
import styles from './Hero.module.scss';
import { Button } from '@/components/atoms/Button/Button';
import { useCallback, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// 🚀 PERFORMANCE: Dynamic import - ładuje WebGL tylko gdy potrzebny
const Threads = dynamic(
  () => import('@/components/atoms/Threads/Threads.jsx'),
  { 
    ssr: false, // Wyłącz SSR dla WebGL
    loading: () => null // Brak loadera
  }
);

export const Hero = () => {
  const [showThreads, setShowThreads] = useState(false);

  useEffect(() => {
    // 🚀 PERFORMANCE: Ładuj Threads dopiero po interakcji użytkownika lub po 2s
    const loadThreads = () => {
      setShowThreads(true);
      // Usuń listenery po załadowaniu
      window.removeEventListener('scroll', loadThreads);
      window.removeEventListener('mousemove', loadThreads);
      window.removeEventListener('touchstart', loadThreads);
    };

    // Ładuj po pierwszej interakcji ALBO po 2000ms (zwiększone z 100ms)
    const timer = setTimeout(() => setShowThreads(true), 2000);
    
    window.addEventListener('scroll', loadThreads, { once: true, passive: true });
    window.addEventListener('mousemove', loadThreads, { once: true, passive: true });
    window.addEventListener('touchstart', loadThreads, { once: true, passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', loadThreads);
      window.removeEventListener('mousemove', loadThreads);
      window.removeEventListener('touchstart', loadThreads);
    };
  }, []);

  const handleAuditClick = useCallback(() => {
    const formSection = document.getElementById('form');
    if (formSection) {
      const formRect = formSection.getBoundingClientRect();
      const formTop = formRect.top + window.pageYOffset;
      
      const windowHeight = window.innerHeight;
      const formHeight = formRect.height;
      const centerPosition = formTop - (windowHeight / 2 - formHeight / 2 + 35);
      
      window.scrollTo({
        top: centerPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  // spam protection
/*   const handleContactClick = useCallback(() => {
    setIsContactLoading(true);
    setTimeout(() => {
      const emailParts = ['biuro', 'wcag.co'];
      window.location.href = `mailto:${emailParts[0]}@${emailParts[1]}`;
      setTimeout(() => {
        setIsContactLoading(false);
      }, 2000);
    }, 500);
  }, []); */
  
  return (
    <section id="hero" className={styles.wrapper}>
      {showThreads && (
        <div className={styles.threadsContainer}>
          <Threads 
            amplitude={1.6}
            distance={0.5}
            enableMouseInteraction={true}
            className={styles.threads}
            color={[0.5, 0.5, 0.5]}
          /> 
        </div>
      )}

      <div className={styles.top}>
        <h1 className={styles.title}>
          Popraw dostępność, zwiększ sprzedaż i widoczność – dzięki WCAG 2.2
        </h1>
        
        <p className={styles.desc}>
          Zadbam o to, by Twoja strona była naprawdę dostępna – pomogę Ci stworzyć miejsce, które działa lepiej, sprzedaje więcej i nie wyklucza nikogo.
        </p>


            <Button 
              variant="primary" 
              onClick={handleAuditClick}
            >
              Bezpłatny audyt strony
            </Button>
          
{/*           <motion.div
            variants={buttonVariants}
            whileTap="tap"
          >
            <Button 
              variant="secondary" 
              onClick={handleContactClick}
              isLoading={isContactLoading}
              aria-label="Wyślij email"
            >
              Kontakt
            </Button>
          </motion.div> */}

      </div>
     
    </section>

  );
};
