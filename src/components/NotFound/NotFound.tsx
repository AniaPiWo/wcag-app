'use client'
import React from 'react';
import styles from './NotFound.module.scss';
import { Button } from '@/components/atoms/Button/Button';

export const NotFound = () => {

  const handleBackBtnClick = () => {
    window.location.href = '/';
  }

  return (
    <div className={styles.notFoundWrap}>
      <div className={styles.notFoundBox}>
        <div className={styles.code}>404</div>
        <div className={styles.title}>Nie znaleziono strony</div>
        <div className={styles.desc}>
          Ups! Strona, której szukasz, nie istnieje lub została przeniesiona.<br />
        </div>
        <Button variant="primary" className={styles.backBtn} onClick={handleBackBtnClick}>
          Wróć na stronę główną
        </Button>
      </div>
    </div>
  );
}
