'use client';
import React from 'react';
import Link from 'next/link';
import styles from './Logo.module.scss';

interface LogoProps {
  href?: string;
  onClick?: () => void;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  href = '/', 
  onClick,
  className = ''
}) => {
  return (
    <Link 
      href={href} 
      className={`${styles.logoContainer} ${className}`}
      onClick={onClick}
      aria-label="WCAG Audyty - strona główna"

    >
      <div className={styles.logoText}>
        WCAG
      </div>
    </Link>
  );
};
