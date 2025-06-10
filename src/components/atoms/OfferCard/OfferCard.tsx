'use client';
import React from 'react';
import styles from './OfferCard.module.scss';
import { Button } from '../Button/Button';

type OfferCardProps = {
  title: string;
  subtitle?: string;
  description?: string;
  price?: {
    amount: string;
    period?: string;
    currency?: string;
    limit?: string;
  };
  features?: string[];
  buttonText?: string;
  buttonUrl?: string;
};

export const OfferCard = ({
  title,
  subtitle,
  description,
  price,
  features = [],
  buttonText = 'Dowiedz się więcej',
  buttonUrl = '#',
}: OfferCardProps) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      
      {price && (
        <div className={styles.priceSection}>
          <div className={styles.priceRow}>
            <span className={styles.priceAmount}>{price.amount}</span>
            <div className={styles.priceDetails}>
              <span className={styles.priceCurrency}>{price.currency || 'PLN'}</span>
              {price.period && <span className={styles.pricePeriod}>/{price.period}</span>}
            </div>
          </div>
          {price.limit && <p className={styles.priceLimit}>{price.limit}</p>}
        </div>
      )}
      
      {buttonText && (
        <div className={styles.buttonWrapper}>
          <Button 
            variant="primary" 
            onClick={() => { if (buttonUrl) window.location.href = buttonUrl; }}
          >
            {buttonText}
          </Button>
        </div>
      )}
      
      {description && <p className={styles.description}>{description}</p>}
      
      {features.length > 0 && (
        <div className={styles.featuresSection}>
          <p className={styles.featuresTitle}>Zawiera:</p>
          <ul className={styles.featuresList}>
            {features.map((feature, index) => (
              <li key={`feature-${index}`} className={styles.featureItem}>
                <span className={styles.checkmark}>+</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
