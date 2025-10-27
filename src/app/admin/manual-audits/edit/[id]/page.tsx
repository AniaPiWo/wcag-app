'use client';
import dynamic from 'next/dynamic';
import { use } from 'react';
import styles from "./page.module.scss"
import { GoBackBtn } from '@/components/GoBackBtn/GoBackBtn';

// Lazy load ManualAuditForm - największy komponent (oszczędność ~300-400 kB)
const ManualAuditForm = dynamic(
  () => import('@/components').then(mod => ({ default: mod.ManualAuditForm })),
  { 
    loading: () => (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p>Ładowanie formularza audytu...</p>
      </div>
    ),
    ssr: false 
  }
);

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className={styles.page}>
      <GoBackBtn href="/admin" text="Powrót" />
      <ManualAuditForm id={id} />
    </div>
  );
}