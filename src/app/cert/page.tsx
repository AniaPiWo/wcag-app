import { GoBackBtn } from '@/components/GoBackBtn/GoBackBtn';
import styles from './page.module.scss';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Certyfikaty | WCAG by Ania',
  description: 'Moje certyfikaty i kwalifikacje w zakresie dostępności cyfrowej',
};

export default function CertPage() {

const certificates = [
  {
    src: 'certyfikat_wcag1.jpg',
    alt: 'Certyfikat Ministerstwa Cyfryzacji: Samodzielna ocena dostępności cyfrowej strony internetowej.'
  },
  {
    src: 'certyfikat_wcag3.jpg',
    alt: 'Certyfikat Ministerstwa Cyfryzacji: Tworzenie dokumentów tekstowych dostępnych cyfrowo.'
  },
  {
    src: 'certyfikat_wcag2.jpg',
    alt: 'Certyfikat Ministerstwa Cyfryzacji: Publikowanie treści dostępnych cyfrowo w mediach społecznościowych.'
  },
  {
    src: 'certyfikat_wcag4.jpg',
    alt: 'Certyfikat Ministerstwa Cyfryzacji: Redagowanie alternatyw tekstowych dla elementów graficznych.'
  },
  {
    src: 'certyfikat_wcag5.jpg',
    alt: 'Certyfikat Ministerstwa Cyfryzacji: Tworzenie prezentacji dostępnych cyfrowo.'
  },
  {
    src: 'certyfikat_wcag6.jpg',
    alt: 'Certyfikat Ministerstwa Cyfryzacji: Wprowadzenie do dostępności cyfrowej.'
  },
  {
    src: 'HYWinner.jpg',
    alt: 'Certyfikat zdobycia 3. miejsca w kategorii Symulator Emerytalny na HackYeah 2025.'
  },
  {
    src: 'GoIT.jpg',
    alt: 'Certyfikat ukończenia kursu Fullstack Developer w GoIT.'
  }
];


  return (
    <main className={styles.page}>

      <div className={styles.container}>
              <GoBackBtn href={'/'} text={'Powrót do strony głównej'} />
        <h1 className={styles.title}>Moje Certyfikaty</h1>
        
        <div className={styles.certificatesGrid}>
          {certificates.map((file) => (
            <div key={file.src} className={styles.certificate}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={`/certificates/${file.src}`}
                alt={file.alt}
                className={styles.certificateImage}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
