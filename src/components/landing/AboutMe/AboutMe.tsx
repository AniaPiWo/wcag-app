import React from 'react';
import Image from 'next/image';
import styles from './AboutMe.module.scss';


export const AboutMe = () => {
  return (
    <section id="aboutMe" className={styles.wrapper}>

        <div className={styles.introduction}>

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

            <div className={styles.right}>
              <div className={styles.titleSection}>
                <h2 className={styles.title}>Kim jestem</h2>
              </div>
              
              <div className={styles.columnsContainer}>
                <div className={styles.column}>
                  <p className={styles.desc}>
                   Jestem <strong>certyfikowanym specjalistą dostępności cyfrowej</strong> z ponad 15-letnim doświadczeniem w branży e-commerce i tworzeniu stron internetowych. Pomagam budować skuteczne, 
                    nowoczesne i dostępne serwisy, które działają szybko, wyglądają profesjonalnie i są zgodne 
                    z aktualnymi standardami. Dbam zarówno o <strong>dostępność WCAG</strong>, jak i optymalizację SEO.
                  </p>
                  <p className={styles.desc}>
                    Specjalizuję się w <strong>adaptacji istniejących stron</strong> do standardów dostępności <strong>WCAG 2.2</strong>. 
                    Tworzę również nowe, w pełni dostępne strony od podstaw. Sprawiam, że witryny są dostępne dla 
                    wszystkich użytkowników, niezależnie od ich możliwości czy ograniczeń.
                  </p>
                </div>

                <div className={styles.column}>
                  <p className={styles.desc}>
                    Jako freelancer nie utrzymuję działu HR, księgowości ani biura – dzięki temu mogę zaproponować 
                    <strong> niższą cenę</strong> bez utraty jakości. Skupiam się w 100% na Twoim projekcie, co oznacza 
                    bezpośredni kontakt i indywidualne podejście.
                  </p>
                  <p className={styles.desc}>
                    Nie przyjmuję nadmiaru zleceń – dzięki temu mogę zaoferować <strong>krótkie terminy realizacji</strong> i pełne 
                    zaangażowanie. Każdy projekt traktuję kompleksowo – łącząc dostępność WCAG z optymalizacją SEO, 
                    co zapewnia nie tylko zgodność z przepisami, ale również lepszą widoczność w wyszukiwarkach.
                  </p>
                </div>
              </div>
            </div>

        </div>

    </section>
  );
};
