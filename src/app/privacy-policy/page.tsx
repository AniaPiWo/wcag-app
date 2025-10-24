import React from 'react';
import type { Metadata } from 'next';
import styles from './page.module.scss';
import { GoBackBtn } from '@/components/GoBackBtn/GoBackBtn';

export const metadata: Metadata = {
  title: "Polityka Prywatności | WCAG.co",
  description: "Polityka prywatności serwisu wcag.co. Informacje o przetwarzaniu danych osobowych zgodnie z RODO, cookies, prawach użytkowników i bezpieczeństwie danych.",
  robots: {
    index: true,
    follow: true,
  },
};

const PrivacyPolicy = () => {
  return (
    <main className={`${styles.container} reduced-motion`}>
      <div className={styles.termsArticle}>
      <GoBackBtn href="/" text="Powrót" />
        <h1 className={styles.mainTitle}>Polityka Prywatności</h1>
        <p className={styles.paragraph} style={{fontStyle: 'italic', color: 'var(--foreground-secondary)'}}>Ostatnia aktualizacja: 24 października 2025</p>
        
        <section className={styles.section} aria-labelledby="general-info">
          <h2 id="general-info" className={styles.sectionTitle}>1. Postanowienia ogólne</h2>
          <p className={styles.paragraph}>
            Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych przekazanych przez Użytkowników 
            w związku z korzystaniem z usług dostępnych w serwisie internetowym <strong>wcag.co</strong>.
          </p>
          <p className={styles.paragraph}>
            Administratorem danych osobowych jest <strong>Anna Piotrowiak-Wołosiuk</strong>, prowadząca działalność gospodarczą, 
            kontakt: <a href="mailto:biuro@wcag.co" className={styles.link}>biuro@wcag.co</a>.
          </p>
          <p className={styles.paragraph}>
            Ochrona danych odbywa się zgodnie z wymogami powszechnie obowiązujących przepisów prawa, w tym Rozporządzenia 
            Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku 
            z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych (RODO).
          </p>
        </section>

        <section className={styles.section} aria-labelledby="data-scope">
          <h2 id="data-scope" className={styles.sectionTitle}>2. Zakres zbieranych danych</h2>
          <p className={styles.paragraph}>
            W ramach świadczonych usług zbieramy następujące dane osobowe:
          </p>
          <h3 className={styles.sectionTitle} style={{fontSize: '1.25rem', marginTop: '1.5rem'}}>2.1. Dane podawane dobrowolnie</h3>
          <ul className={styles.list}>
            <li><strong>Imię</strong> – w celu personalizacji komunikacji</li>
            <li><strong>Adres e-mail</strong> – w celu kontaktu i przesyłania raportów z audytu</li>
            <li><strong>Adres URL strony internetowej</strong> – w celu przeprowadzenia audytu dostępności</li>
            <li><strong>Treść wiadomości</strong> – w przypadku kontaktu przez formularz</li>
          </ul>
          <h3 className={styles.sectionTitle} style={{fontSize: '1.25rem', marginTop: '1.5rem'}}>2.2. Dane zbierane automatycznie</h3>
          <ul className={styles.list}>
            <li><strong>Adres IP</strong> – w celach technicznych i bezpieczeństwa</li>
            <li><strong>Typ przeglądarki i system operacyjny</strong> – w celu optymalizacji wyświetlania</li>
            <li><strong>Dane o aktywności na stronie</strong> – za pomocą Google Analytics (po wyrażeniu zgody)</li>
            <li><strong>Pliki cookies</strong> – szczegóły w sekcji 8</li>
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="legal-basis">
          <h2 id="legal-basis" className={styles.sectionTitle}>3. Podstawa prawna przetwarzania</h2>
          <p className={styles.paragraph}>
            Dane osobowe przetwarzane są na podstawie:
          </p>
          <ul className={styles.list}>
            <li><strong>Art. 6 ust. 1 lit. a RODO</strong> – zgoda osoby, której dane dotyczą (zgoda na cookies analityczne)</li>
            <li><strong>Art. 6 ust. 1 lit. b RODO</strong> – wykonanie umowy lub podjęcie działań przed zawarciem umowy (realizacja zamówienia audytu)</li>
            <li><strong>Art. 6 ust. 1 lit. f RODO</strong> – prawnie uzasadniony interes administratora (zapewnienie bezpieczeństwa, dochodzenie roszczeń)</li>
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="purposes">
          <h2 id="purposes" className={styles.sectionTitle}>4. Cele przetwarzania danych</h2>
          <p className={styles.paragraph}>
            Dane osobowe przetwarzane są w następujących celach:
          </p>
          <ul className={styles.list}>
            <li>Realizacja zamówionych usług audytu dostępności WCAG</li>
            <li>Wysyłka automatycznych raportów z audytu na wskazany adres e-mail</li>
            <li>Kontakt z użytkownikami i odpowiedzi na zapytania</li>
            <li>Prowadzenie korespondencji handlowej</li>
            <li>Analiza statystyk i optymalizacja strony (Google Analytics – po wyrażeniu zgody)</li>
            <li>Zapewnienie bezpieczeństwa i prawidłowego działania serwisu</li>
            <li>Dochodzenie ewentualnych roszczeń</li>
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="storage">
          <h2 id="storage" className={styles.sectionTitle}>5. Okres przechowywania danych</h2>
          <p className={styles.paragraph}>
            Dane osobowe przechowywane są:
          </p>
          <ul className={styles.list}>
            <li><strong>Dane z formularzy</strong> – bezterminowo w bazie danych do celów archiwalnych i statystycznych, 
            chyba że użytkownik zażąda ich usunięcia</li>
            <li><strong>Dane analityczne (Google Analytics)</strong> – 26 miesięcy od ostatniej aktywności</li>
            <li><strong>Pliki cookies</strong> – zgodnie z ustawieniami przeglądarki i zgodą użytkownika</li>
          </ul>
          <p className={styles.paragraph}>
            Użytkownik ma prawo w każdej chwili zażądać usunięcia swoich danych osobowych, kontaktując się pod adresem 
            <a href="mailto:biuro@wcag.co" className={styles.link}> biuro@wcag.co</a>.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="recipients">
          <h2 id="recipients" className={styles.sectionTitle}>6. Odbiorcy danych</h2>
          <p className={styles.paragraph}>
            Dane osobowe mogą być udostępniane następującym kategoriom odbiorców:
          </p>
          <ul className={styles.list}>
            <li><strong>CockroachDB</strong> – dostawca bazy danych (serwery mogą być zlokalizowane w UE i USA, 
            z zastosowaniem odpowiednich zabezpieczeń zgodnych z RODO)</li>
            <li><strong>Railway</strong> – dostawca hostingu aplikacji (zgodny z GDPR, oferuje DPA)</li>
            <li><strong>Google Analytics</strong> – narzędzie analityczne (tylko po wyrażeniu zgody przez użytkownika)</li>
            <li><strong>Nodemailer</strong> – narzędzie do wysyłki e-mail</li>
          </ul>
          <p className={styles.paragraph}>
            Wszystkie podmioty przetwarzające dane w naszym imieniu gwarantują stosowanie odpowiednich środków 
            bezpieczeństwa oraz przetwarzają dane wyłącznie zgodnie z naszymi poleceniami i obowiązującymi przepisami.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="user-rights">
          <h2 id="user-rights" className={styles.sectionTitle}>7. Prawa użytkowników</h2>
          <p className={styles.paragraph}>
            Zgodnie z RODO, każdy użytkownik ma prawo do:
          </p>
          <ul className={styles.list}>
            <li><strong>Dostępu do danych</strong> – uzyskania informacji o przetwarzanych danych osobowych</li>
            <li><strong>Sprostowania danych</strong> – poprawy nieprawidłowych lub niekompletnych danych</li>
            <li><strong>Usunięcia danych</strong> – żądania usunięcia danych (prawo do bycia zapomnianym)</li>
            <li><strong>Ograniczenia przetwarzania</strong> – ograniczenia sposobu wykorzystywania danych</li>
            <li><strong>Przenoszenia danych</strong> – otrzymania danych w ustrukturyzowanym formacie</li>
            <li><strong>Sprzeciwu</strong> – wniesienia sprzeciwu wobec przetwarzania danych</li>
            <li><strong>Cofnięcia zgody</strong> – wycofania zgody na przetwarzanie w dowolnym momencie</li>
            <li><strong>Wniesienia skargi</strong> – złożenia skargi do Prezesa Urzędu Ochrony Danych Osobowych</li>
          </ul>
          <p className={styles.paragraph}>
            W celu realizacji powyższych praw prosimy o kontakt: <a href="mailto:biuro@wcag.co" className={styles.link}>biuro@wcag.co</a>
          </p>
        </section>

        <section className={styles.section} aria-labelledby="cookies">
          <h2 id="cookies" className={styles.sectionTitle}>8. Pliki cookies</h2>
          <p className={styles.paragraph}>
            Nasza strona wykorzystuje pliki cookies (ciasteczka) w celu zapewnienia prawidłowego działania serwisu oraz analizy ruchu.
          </p>
          <h3 className={styles.sectionTitle} style={{fontSize: '1.25rem', marginTop: '1.5rem'}}>8.1. Rodzaje cookies</h3>
          <ul className={styles.list}>
            <li><strong>Cookies niezbędne</strong> – wymagane do prawidłowego działania strony (zapamiętywanie preferencji 
            dotyczących cookies, motywu kolorystycznego)</li>
            <li><strong>Cookies analityczne</strong> – Google Analytics, służące do analizy ruchu i optymalizacji strony 
            (wymagają zgody użytkownika)</li>
          </ul>
          <h3 className={styles.sectionTitle} style={{fontSize: '1.25rem', marginTop: '1.5rem'}}>8.2. Zarządzanie cookies</h3>
          <p className={styles.paragraph}>
            Użytkownik może w każdej chwili zmienić ustawienia cookies za pomocą bannera zgody dostępnego na stronie 
            lub w ustawieniach przeglądarki. Wyłączenie cookies może wpłynąć na funkcjonalność strony.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="google-analytics">
          <h2 id="google-analytics" className={styles.sectionTitle}>9. Google Analytics</h2>
          <p className={styles.paragraph}>
            Nasza strona wykorzystuje Google Analytics – narzędzie analityczne Google LLC. Google Analytics używa cookies 
            do analizy sposobu korzystania ze strony przez użytkowników.
          </p>
          <p className={styles.paragraph}>
            Informacje generowane przez cookies o korzystaniu ze strony (w tym adres IP) są przekazywane i przechowywane 
            przez Google na serwerach. Google wykorzystuje te informacje w celu analizy korzystania ze strony oraz tworzenia raportów.
          </p>
          <p className={styles.paragraph}>
            Więcej informacji: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className={styles.link}>Polityka prywatności Google</a>
          </p>
        </section>

        <section className={styles.section} aria-labelledby="security">
          <h2 id="security" className={styles.sectionTitle}>10. Bezpieczeństwo danych</h2>
          <p className={styles.paragraph}>
            Stosujemy odpowiednie środki techniczne i organizacyjne zapewniające bezpieczeństwo przetwarzanych danych osobowych:
          </p>
          <ul className={styles.list}>
            <li>Szyfrowanie połączenia SSL/TLS (HTTPS)</li>
            <li>Bezpieczne przechowywanie danych w bazie CockroachDB</li>
            <li>Regularne aktualizacje oprogramowania</li>
            <li>Ograniczony dostęp do danych osobowych</li>
            <li>Monitoring bezpieczeństwa systemów</li>
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="transfers">
          <h2 id="transfers" className={styles.sectionTitle}>11. Przekazywanie danych poza EOG</h2>
          <p className={styles.paragraph}>
            Niektóre dane mogą być przekazywane do państw spoza Europejskiego Obszaru Gospodarczego (EOG), 
            w szczególności w związku z korzystaniem z:
          </p>
          <ul className={styles.list}>
            <li><strong>Google Analytics</strong> – dane mogą być przekazywane do USA na podstawie standardowych klauzul umownych zatwierdzone przez Komisję Europejską</li>
            <li><strong>CockroachDB</strong> – w zależności od konfiguracji, dane mogą być przechowywane na serwerach w USA z zastosowaniem odpowiednich zabezpieczeń RODO</li>
          </ul>
          <p className={styles.paragraph}>
            Przekazywanie danych odbywa się z zachowaniem odpowiednich gwarancji bezpieczeństwa zgodnie z art. 46 RODO.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="changes">
          <h2 id="changes" className={styles.sectionTitle}>12. Zmiany w polityce prywatności</h2>
          <p className={styles.paragraph}>
            Zastrzegamy sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności. O wszelkich zmianach 
            będziemy informować użytkowników poprzez umieszczenie informacji na stronie głównej serwisu oraz aktualizację 
            daty "Ostatnia aktualizacja" na górze dokumentu.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="contact">
          <h2 id="contact" className={styles.sectionTitle}>13. Kontakt</h2>
          <p className={styles.paragraph}>
            W sprawach dotyczących ochrony danych osobowych oraz realizacji praw użytkowników prosimy o kontakt:
          </p>
          <address style={{fontStyle: 'normal', lineHeight: '1.7'}}>
            <strong>Anna Piotrowiak-Wołosiuk</strong><br />
            Email: <a href="mailto:biuro@wcag.co" className={styles.link}>biuro@wcag.co</a><br />
            Strona: <a href="https://wcag.co" className={styles.link}>wcag.co</a>
          </address>
        </section>
      </div>
    </main>
  );
};

export default PrivacyPolicy;