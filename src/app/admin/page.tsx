'use client';
import React from 'react';
import styles from './page.module.scss';
import Link from 'next/link';
import { FaClipboardList, FaEdit, FaUser } from 'react-icons/fa';

export default function AdminDashboard() {
  const currentDate = new Date().toLocaleDateString('pl-PL', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            <FaUser />
          </div>
          <div className={styles.userDetails}>
            <p className={styles.userName}>Ania Piotrowiak</p>
            <p className={styles.date}>{currentDate}</p>
          </div>
        </div>
      </div>
      
      <div className={styles.dashboardContent}>
        <div className={styles.cardGrid}>
          <Link href="/admin/auto-audits" className={styles.card}>
            <div className={styles.cardIcon}>
              <FaClipboardList />
            </div>
            <div className={styles.cardContent}>
              <h2>Audyty Automatyczne</h2>
              <p>Przeglądaj i zarządzaj automatycznie wygenerowanymi audytami</p>
            </div>
          </Link>
          
          <Link href="/admin/manual-audits" className={styles.card}>
            <div className={styles.cardIcon}>
              <FaEdit />
            </div>
            <div className={styles.cardContent}>
              <h2>Audyty Manualne</h2>
              <p>Przeglądaj i zarządzaj ręcznie utworzonymi audytami</p>
            </div>
          </Link>
          
        </div>
        
      </div>
    </div>
  );
}
