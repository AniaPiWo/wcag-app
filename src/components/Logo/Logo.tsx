// Logo.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import styles from './Logo.module.scss';

interface LogoProps {
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  ariaLabel?: string;
  href?: string;
  scrollToTop?: boolean; // nowa prop
}

export const Logo: React.FC<LogoProps> = ({ 
  onClick,
  className = '',
  ariaLabel = 'Strona główna',
  href = '/',
  scrollToTop = false,
}) => {
  const logoContent = (
    <>
      <div className={styles.logoText}>
        WCAG
      </div>
      <p className={styles.logoIcon}>by Ania</p>
    </>
  );

  // Jeśli scrollToTop jest true, używamy button zamiast Link
  if (scrollToTop) {
    return (
      <button
        onClick={onClick}
        className={`${styles.logoContainer} ${className}`}
        aria-label={ariaLabel}
        type="button"
      >
        {logoContent}
      </button>
    );
  }

  // W przeciwnym razie używamy normalnego Link
  return (
    <Link 
      href={href}
      onClick={onClick}
      className={`${styles.logoContainer} ${className}`}
      aria-label={ariaLabel}
    >
      {logoContent}
    </Link>
  );
};