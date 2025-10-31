import React from 'react';
import Image from 'next/image';
import styles from './AboutMe.module.scss';
import { AnimatedReveal } from '@/components/atoms/AnimatedReveal/AnimatedReveal';


export const AboutMe = () => {
  return (
    <section id="aboutMe" className={styles.wrapper}>

        <div className={styles.introduction}>

            <AnimatedReveal direction="left" delay={0.1} distance={40}>
              <div className={styles.left}>
                <div className={styles.imageWrapper}>
                  <Image
                    src="/Ania_Piotrowiak.png"
                    alt="Ania Piotrowiak-Wołosiuk, specjalista dostępności cyfrowej"
                    fill
                    sizes="max-width: 640px"
                    className={styles.imageMain}
                    priority
                  />
                </div>
                <div className={styles.name}>
                  <p>Ania Piotrowiak-Wołosiuk</p>
                  <p>Specjalista dostępności cyfrowej</p>
                </div>
              </div>
            </AnimatedReveal>

            <div className={styles.right}>
              <AnimatedReveal direction="right" delay={0.3} distance={40}>
                <div className={styles.titleSection}>
                  <h2 className={styles.title}>Kim jestem</h2>
                </div>
              </AnimatedReveal>
              
              <div className={styles.columnsContainer}>
                <AnimatedReveal direction="up" delay={0.5} distance={30}>
                  <div className={styles.column}>
                  <p className={styles.desc}>
    Jestem <strong>certyfikowanym specjalistą dostępności cyfrowej</strong> z ponad 15-letnim doświadczeniem w branży e-commerce oraz tworzeniu serwisów internetowych.  
    Ukończyłam <strong> państwowy kurs z zakresu dostępności cyfrowej prowadzony przez Ministerstwo Cyfryzacji</strong>, co potwierdza moją znajomość i stosowanie standardów WCAG w praktyce. 
   
  </p>
                    <p className={styles.desc}>
                    Pomagam tworzyć nowoczesne, szybkie i profesjonalnie wyglądające serwisy, które są dostępne dla wszystkich użytkowników, niezależnie od ich możliwości czy ograniczeń.
                    </p>
                  </div>
                </AnimatedReveal>

                <AnimatedReveal direction="up" delay={0.7} distance={30}>
                  <div className={styles.column}>
                    <p className={styles.desc}>
                      Jako freelancer nie utrzymuję działu HR, księgowości ani biura – dzięki temu mogę zaproponować 
                      <strong> niższą cenę</strong> bez utraty jakości.
                                 Nie przyjmuję nadmiaru zleceń – dzięki temu mogę zaoferować <strong>krótkie terminy realizacji</strong> i pełne 
                      zaangażowanie.
                       Skupiam się w 100% na Twoim projekcie, co oznacza 
                      bezpośredni kontakt i indywidualne podejście.
                    </p>
                    <p className={styles.desc}>
          
                    </p>
                  </div>
                </AnimatedReveal>
              </div>
            </div>

        </div>

    </section>
  );
};
