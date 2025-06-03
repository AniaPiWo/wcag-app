import React from 'react';
import Image from 'next/image';
import styles from './OfferCard.module.scss';

type OfferCardProps = {
  image: string;
  title: string;
  alt: string;
  description: string;
  id?: string; // Dodanie id do identyfikacji karty z audytem
};

export const OfferCard = ({
  image,
  title,
  alt,
  description,
  id,
}: OfferCardProps) => {
  return (
    <div className={styles.card}>
      {id === '1' && (
        <div className={styles.priceBanner} aria-label="Cena 99 złotych netto">
          <div className={styles.priceWrapper}>
            <div className={styles.priceRow}>
              <span className={styles.priceAmount}>99</span>
              <span className={styles.priceCurrency}>PLN</span>
            </div>
            <span className={styles.priceType}>netto</span>
          </div>
        </div>
      )}
      <Image
        src={image}
        alt={alt}
        width={300}
        height={300}
        className={styles.image}
      />
      <div className={styles.text}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.descr}>{description}</p>
      </div>
    </div>
  );
};
