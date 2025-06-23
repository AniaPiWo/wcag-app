'use client';
import React from 'react';
import Link from 'next/link';
import styles from './Logo.module.scss';

interface LogoProps {
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  href?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  onClick,
  className = '',
  ariaLabel = 'Strona główna',
  href
}) => {
  const logoContent = (
    <>
      <div className={styles.logoText}>
        WCAG
      </div>
      <p className={styles.logoIcon}>by Ania</p>
    </>
  );

  if (href) {
    return (
      <Link 
        href={href}
        className={`${styles.logoContainer} ${className}`}
        aria-label={ariaLabel}
      >
        {logoContent}
      </Link>
    );
  }

  return (
    <button 
      type="button"
      onClick={onClick}
      className={`${styles.logoContainer} ${className}`}
      aria-label={ariaLabel}
    >
      {logoContent}
    </button>
  );
};
