export interface OfferPrice {
  amount: string;
  currency: string;
  period: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  price: OfferPrice;
  features: string[];
  emailSubject: string;
  emailBody: string;
  buttonText: string;
}

export const offers: Offer[] = [
  {
    id: '1',
    title: 'Manualny audyt dostępności',
    description:
      'Szczegółowa analiza Twojej strony pod kątem zgodności z WCAG 2.2.',
    price: {
      amount: 'od 599',
      currency: 'zł netto',
      period: 'jednorazowo',
    },
    features: [
      'Manualny oraz automatyczny audyt dostępności',
      'Analiza kluczowych kryteriów dostępności wskazanych przez Ministerstwo Cyfryzacji',
      'Szczegółowy raport z wykrytymi problemami dostępności',
      'Praktyczne rekomendacje naprawcze',
      'Audyt dostępności do 5 podstron serwisu'
    ],
    emailSubject: 'Zapytanie o audyt dostępności',
    emailBody: `Dzień dobry,

Jestem zainteresowany/a zamówieniem audytu dostępności dla mojej strony internetowej.

Proszę o informacje dotyczące procesu i dostępnych pakietów.

Pozdrawiam,
`,
    buttonText: 'Zamów audyt'
  },
  {
    id: '2',
    title: 'Dostosowanie do WCAG 2.2',
    description:
      'Dostosuję Twoją stronę lub aplikację do standardów WCAG 2.2.',
    price: {
      amount: 'od 999',
      currency: 'zł netto',
      period: 'projekt'
    },
    features: [
      'Manualny oraz automatyczny audyt dostępności',
      'Implementacja poprawek dostępności',
      'Testy dostępności',
      'Certyfikat dostępności cyfrowej',
      'Deklaracja dostępności strony',
      'Wsparcie po wdrożeniu dostępności'
    ],
    emailSubject: 'Zapytanie o dostosowanie strony do WCAG 2.2',
    emailBody: `Dzień dobry,

Jestem zainteresowany/a dostosowaniem mojej strony internetowej do standardów WCAG 2.2.

Proszę o wycenę oraz informacje o procesie dostosowania.

Pozdrawiam,
`,
    buttonText: 'Zapytaj o wycenę'
  },
  {
    id: '3',
    title: 'Tworzę dostępne rozwiązania',
    description:
      'Tworzę dostępne serwisy i aplikacje od podstaw – zgodne z WCAG 2.2.',
    price: {
      amount: 'od 1999',
      currency: 'zł netto',
      period: 'projekt'
    },
    features: [
      'Przygotowanie projektu strony',
      'Wykonanie strony',
      'Pełna zgodność z WCAG 2.2',
      'Certyfikat dostępności cyfrowej',
      'Deklaracja dostępności strony',
      'Wsparcie techniczne'
    ],
    emailSubject: 'Zapytanie o stworzenie dostępnej strony',
    emailBody: `Dzień dobry,

Jestem zainteresowany/a stworzeniem nowej, w pełni dostępnej strony internetowej zgodnej z WCAG 2.2.

Proszę o wycenę oraz informacje o procesie tworzenia strony.

Pozdrawiam,
`,
    buttonText: 'Zapytaj o wycenę'
  },
];
