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
      alt: 'Certyfikat ukończenia szkolenia. Anna Piotrowiak-Wołosiuk ukończyła szkolenie e-learningowe ‘Moduł specjalistyczny – Samodzielna ocena dostępności cyfrowej strony internetowej’, zorganizowane przez Ministerstwo Cyfryzacji w ramach projektu dotyczącego dostępności cyfrowej stron jednostek samorządu terytorialnego. Data: 18 czerwca 2025, Warszawa. Na dole logotypy Funduszy Europejskich, Rzeczpospolitej Polskiej i Unii Europejskiej.'
    },
    {
      src: 'certyfikat_wcag3.jpg',
      alt: 'Certyfikat ukończenia szkolenia. Anna Piotrowiak-Wołosiuk ukończyła szkolenie e-learningowe „Moduł specjalistyczny – Tworzenie dokumentów tekstowych dostępnych cyfrowo”, zorganizowane przez Ministerstwo Cyfryzacji w ramach projektu dotyczącego dostępności cyfrowej stron jednostek samorządu terytorialnego – zasoby, szkolenia, walidatory. Data: 13 czerwca 2025, Warszawa. Na dole logotypy Funduszy Europejskich, Rzeczpospolitej Polskiej i Unii Europejskiej.'
    },
    {
      src: 'certyfikat_wcag2.jpg',
      alt: 'Certyfikat ukończenia szkolenia. Anna Piotrowiak-Wołosiuk ukończyła szkolenie e-learningowe „Moduł specjalistyczny – Publikowanie dostępnych cyfrowo treści w mediach społecznościowych”, zorganizowane przez Ministerstwo Cyfryzacji w ramach projektu dotyczącego dostępności cyfrowej stron jednostek samorządu terytorialnego – zasoby, szkolenia, walidatory. Data: 13 czerwca 2025, Warszawa. Na dole logotypy Funduszy Europejskich, Rzeczpospolitej Polskiej i Unii Europejskiej.'
    },
    {
      src: 'certyfikat_wcag4.jpg',
      alt: 'Certyfikat ukończenia szkolenia. Anna Piotrowiak-Wołosiuk ukończyła szkolenie e-learningowe „Moduł specjalistyczny – Redagowanie alternatyw tekstowych dla elementów graficznych”, zorganizowane przez Ministerstwo Cyfryzacji w ramach projektu dotyczącego dostępności cyfrowej stron jednostek samorządu terytorialnego – zasoby, szkolenia, walidatory. Data: 12 czerwca 2025, Warszawa. Na dole logotypy Funduszy Europejskich, Rzeczpospolitej Polskiej i Unii Europejskiej.'
    },
    {
      src: 'certyfikat_wcag5.jpg',
      alt: 'Certyfikat ukończenia szkolenia. Anna Piotrowiak-Wołosłuk ukończyła szkolenie e-learningowe „Moduł specjalistyczny – Tworzenie prezentacji dostępnych cyfrowo”, zorganizowane przez Ministerstwo Cyfryzacji w ramach projektu dotyczącego dostępności cyfrowej stron jednostek samorządu terytorialnego – zasoby, szkolenia, walidatory. Data: 5 czerwca 2025, Warszawa. Na dole znajdują się logotypy Funduszy Europejskich, Rzeczypospolitej Polskiej i Unii Europejskiej.'
    },
    {
      src: 'certyfikat_wcag6.jpg',
      alt: 'Certyfikat ukończenia szkolenia. Anna Piotrowiak-Wołosłuk ukończyła szkolenie e-learningowe „Moduł ogólny – Wprowadzenie do dostępności cyfrowej”, zorganizowane przez Ministerstwo Cyfryzacji w ramach projektu dotyczącego dostępności cyfrowej stron jednostek samorządu terytorialnego – zasoby, szkolenia, walidatory. Data: 5 czerwca 2025, Warszawa. Na dole znajdują się logotypy Funduszy Europejskich, Rzeczypospolitej Polskiej i Unii Europejskiej.'
    },
    {
      src: 'HYWinner.jpg',
      alt: 'Certyfikat zwycięstwa. Zespół "Prawe buty z Kalkuty" w składzie: Krystian Więcek, Michał Czajkowski, Anna Piotrowiak, Filip Wołosłuk, zdobył 3 miejsce (5 000 PLN) w kategorii "Symulator Emerytalny" na hackathonie HackYeah 2025. Projekt o nazwie "Symulator Emerytalny" został zgłoszony podczas 11. edycji największego stacjonarnego hackathonu w Europie, który odbył się w Tauron Arenie Kraków w dniach 4-5 października 2025 roku. Organizatorem wydarzenia była firma PRODDEA.'
    },
    {
      src: 'GoIT.jpg',
      alt: 'Certyfikat ukończenia kursu. Anna Piotrowiak-Wokosiuk ukończyła z powodzeniem kurs "FULLSTACK DEVELOPER" w szkole GoIT. Data: 21 maja 2024. Na dokumencie znajduje się unikalny identyfikator 27204, podpis CEO GoIT - Anton Chornyi oraz logo firmy GoIT.'
    }
  ];

  return (
    <main className={styles.page}>
      <div className={styles.container}>
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
