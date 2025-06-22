'use client';
import React from 'react';
import styles from './Logo.module.scss';

interface LogoProps {
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  onClick,
  className = '',
  ariaLabel = 'Strona główna'
}) => {
  return (
    <button 
      type="button"
      onClick={onClick}
      className={`${styles.logoContainer} ${className}`}
      aria-label={ariaLabel}
    >
      <div className={styles.logoText}>
        WCAG
      </div>
      <p className={styles.logoIcon}>by Ania</p>
    </button>
  );
};
