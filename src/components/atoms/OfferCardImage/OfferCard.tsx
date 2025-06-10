import React from 'react';
import Image from 'next/image';
import styles from './OfferCard.module.scss';

type OfferCardProps = {
  image: string;
  title: string;
  alt: string;
  description: string;
  id?: string;
  price?: {
    amount: string;
    currency?: string;
    type?: string;
  };
};

export const OfferCard = ({
  image,
  title,
  alt,
  description,
  price,
}: OfferCardProps) => {
  return (
    <div className={styles.card}>
      {price && (
        <div className={styles.priceBanner} aria-label={`Cena ${price.amount} ${price.currency || 'PLN'} ${price.type || 'netto'}`}>
          <div className={styles.priceWrapper}>
            <div className={styles.priceRow}>
              <span className={styles.priceAmount}>{price.amount}</span>
              <span className={styles.priceCurrency}>{price.currency || 'PLN'}</span>
            </div>
            <span className={styles.priceType}>{price.type || 'netto'}</span>
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
