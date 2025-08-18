/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
//import Image from 'next/image';
import styles from './Hero.module.scss';
import { Button } from '@/components/atoms/Button/Button';
import { useCallback, useEffect } from 'react';
import { Threads } from '@/components/atoms/Threads/Threads.jsx';
import { motion, useAnimation, Variants } from 'framer-motion';

export const Hero = () => {
  //const [isContactLoading, setIsContactLoading] = useState(false);
  const controls = useAnimation();

  // Definicje animacji
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.2 
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 60, 
        damping: 12 
      }
    }
  };

  const buttonVariants: Variants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        delay: 0.5
      }
    },
    hover: { 
      scale: 1.05,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    },
    tap: { scale: 0.98 }
  };

  // Uruchamianie animacji po załadowaniu
  useEffect(() => {
    controls.start('visible');
  }, [controls]);

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
      <div className={styles.threadsContainer}>
        <Threads 
          amplitude={1.6}
          distance={0.5}
          enableMouseInteraction={true}
          className={styles.threads}
          color={[0.5, 0.5, 0.5]}
        />
      </div>

      <motion.div 
        className={styles.top}
        initial="hidden"
        animate={controls}
        variants={containerVariants}
      >
        <motion.h1 
          className={styles.title} 
          variants={itemVariants}
        >
          Popraw dostępność, zwiększ sprzedaż i widoczność – dzięki WCAG 2.2
        </motion.h1>
        
        <motion.p 
          className={styles.desc}
          variants={itemVariants}
        >
          Zadbam o to, by Twoja strona była naprawdę dostępna – pomogę Ci stworzyć miejsce, które działa lepiej, sprzedaje więcej i nie wyklucza nikogo.
        </motion.p>


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

      </motion.div>
     
    </section>

  );
};
