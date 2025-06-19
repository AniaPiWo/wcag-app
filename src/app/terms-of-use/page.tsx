import React from 'react';
import styles from './page.module.scss';

const TermsOfUse = () => {
  return (
    <main className={`${styles.container} reduced-motion`}>
      <div className={styles.termsArticle}>
        <h1 className={styles.mainTitle}>Warunki korzystania ze strony internetowej wcag.co</h1>
        
        <section className={styles.section} aria-labelledby="general-info">
          <h2 id="general-info" className={styles.sectionTitle}>1. Informacje ogólne</h2>
          <p className={styles.paragraph}>
            Strona internetowa dostępna pod adresem wcag.co prowadzona jest przez Annę Piotrowiak-Wołosiuk i ma charakter informacyjno-usługowy. 
            Korzystając ze strony, akceptujesz poniższe warunki.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="services">
          <h2 id="services" className={styles.sectionTitle}>2. Zakres usług</h2>
          <p className={styles.paragraph}>
            Za pośrednictwem strony użytkownik może:
          </p>
          <ul className={styles.list}>
            <li>zamówić bezpłatny audyt automatyczny dostępności cyfrowej swojej strony internetowej,</li>
            <li>zamówić audyt manualny, który uwzględnia aspekty niedostępne dla narzędzi automatycznych,</li>
            <li>zamówić wdrożenie zaleceń wynikających z audytu,</li>
            <li>zlecić wykonanie nowej strony internetowej zgodnej z WCAG 2.2.</li>
          </ul>
          <p className={styles.paragraph}>
            Strona nie umożliwia zakładania konta użytkownika.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="contact-form">
          <h2 id="contact-form" className={styles.sectionTitle}>3. Formularz kontaktowy i dane użytkownika</h2>
          <p className={styles.paragraph}>
            Użytkownik może dobrowolnie podać:
          </p>
          <ul className={styles.list}>
            <li>imię,</li>
            <li>adres e-mail,</li>
            <li>adres URL swojej strony.</li>
          </ul>
          <p className={styles.paragraph}>
            Dane te są wykorzystywane wyłącznie w celu realizacji audytu (automatycznego lub manualnego), 
            przedstawienia wyceny wdrożenia lub kontaktu w sprawie stworzenia nowej strony. 
            Komunikacja odbywa się za pośrednictwem narzędzia Nodemailer, a dane są przechowywane 
            w bazie danych na serwerach CockroachDB.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="data-processing">
          <h2 id="data-processing" className={styles.sectionTitle}>4. Przetwarzanie danych osobowych</h2>
          <p className={styles.paragraph}>
            Administratorem danych osobowych jest Anna Piotrowiak-Wołosiuk, kontakt: 
            <a href="mailto:biuro@wcag.co" className={styles.link}>biuro@wcag.co</a>.
          </p>
          <p className={styles.paragraph}>
            Dane są przetwarzane zgodnie z art. 6 ust. 1 lit. b i f RODO – w celu realizacji 
            zgłoszenia przesłanego przez użytkownika oraz w prawnie uzasadnionym interesie 
            administratora (prowadzenie dokumentacji, zapewnienie jakości usług).
          </p>
          <p className={styles.paragraph}>
            Dane nie są wykorzystywane do marketingu ani profilowania, nie są również przekazywane 
            stronom trzecim do niezależnego przetwarzania.
          </p>
          <p className={styles.paragraph}>
            Użytkownik ma prawo do:
          </p>
          <ul className={styles.list}>
            <li>dostępu do swoich danych,</li>
            <li>ich sprostowania, ograniczenia przetwarzania lub usunięcia,</li>
            <li>wniesienia sprzeciwu wobec przetwarzania,</li>
            <li>wniesienia skargi do Prezesa UODO.</li>
          </ul>
          <p className={styles.paragraph}>
            W celu realizacji tych praw można skontaktować się pod adresem 
            <a href="mailto:biuro@wcag.co" className={styles.link}>biuro@wcag.co</a>.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="external-services">
          <h2 id="external-services" className={styles.sectionTitle}>5. Usługi zewnętrzne</h2>
          <p className={styles.paragraph}>
            Na stronie wykorzystywane są narzędzia analityczne Google Analytics, które mogą gromadzić 
            anonimowe dane statystyczne dotyczące korzystania z serwisu. Dane te nie pozwalają na 
            identyfikację konkretnego użytkownika i służą wyłącznie do analizy i optymalizacji strony.
          </p>
          <p className={styles.paragraph}>
            Więcej informacji znajdziesz w <a href="/privacy-policy" className={styles.link}>Polityce prywatności</a>.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="copyright">
          <h2 id="copyright" className={styles.sectionTitle}>6. Prawa autorskie</h2>
          <p className={styles.paragraph}>
            Wszystkie treści opublikowane na stronie – w tym teksty, grafiki i materiały – są chronione 
            prawem autorskim i stanowią własność Anny Piotrowiak-Wołosiuk lub odpowiednich licencjodawców. 
            Zabrania się ich kopiowania, powielania lub rozpowszechniania bez pisemnej zgody.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="changes">
          <h2 id="changes" className={styles.sectionTitle}>7. Zmiany warunków</h2>
          <p className={styles.paragraph}>
            Warunki korzystania mogą zostać zmienione w dowolnym momencie. Aktualna wersja zawsze 
            znajduje się na stronie <a href="https://wcag.co" className={styles.link}>wcag.co</a>.
          </p>
        </section>
      </div>
    </main>
  );
};

export default TermsOfUse;