import React from 'react';
import styles from './Loader.module.scss';

export default function Loader() {
  return (
    <div className={styles.loaderWrap} role="status" aria-label="Ładowanie">
      <div className={styles.spinner}></div>
    </div>
  );
}
