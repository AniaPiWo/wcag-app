import React from 'react';
import Image from 'next/image';
import styles from './OfferCard.module.scss';

type OfferCardProps = {
  image: string;
  title: string;
  alt: string;
  description: string;
};

export const OfferCard = ({
  image,
  title,
  alt,
  description,
}: OfferCardProps) => {
  return (
    <div className={styles.card}>
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
