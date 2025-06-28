'use client';
import React from 'react';
import styles from './page.module.scss';
import { Button } from '@/components';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();

  const handleAutoAuditsClick = () => {
    router.push('/admin/auto-audits');
  };

  const handleManualAuditsClick = () => {
    router.push('/admin/manual-audits');
  };

  return (
    <div className={styles.page}>
      <div className={styles.dashboardContainer}>
        <h1 className={styles.title}>Panel Administratora</h1>
        <p className={styles.greeting}>Dzień dobry Ania!</p>
        
        <div className={styles.optionsContainer}>
          <Button 
            onClick={handleAutoAuditsClick}
            className={styles.optionButton}
          >
            Przejrzyj audyty automatyczne
          </Button>
          
          <Button 
            onClick={handleManualAuditsClick}
            className={styles.optionButton}
          >
            Przejrzyj audyty manualne
          </Button>
        </div>
      </div>
    </div>
  );
}
