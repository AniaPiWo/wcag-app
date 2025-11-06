import styles from './page.module.scss';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Certyfikaty | WCAG by Ania',
  description: 'Moje certyfikaty i kwalifikacje w zakresie dostępności cyfrowej',
};

export default function CertPage() {
  const certificates = [

    'certyfikat_wcag1.jpg',
    'certyfikat_wcag3.jpg',
    'certyfikat_wcag2.jpg',
    'certyfikat_wcag4.jpg',
    'certyfikat_wcag5.jpg',
    'certyfikat_wcag6.jpg',
       'HYWinner.jpg',
    'GoIT.jpg'
  ];

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Moje Certyfikaty</h1>
        
        <div className={styles.certificatesGrid}>
          {certificates.map((file) => (
            <div key={file} className={styles.certificate}>
              <img 
                src={`/certificates/${file}`}
                alt={`Certyfikat ${file}`}
                className={styles.certificateImage}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
