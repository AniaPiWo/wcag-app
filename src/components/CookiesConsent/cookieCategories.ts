export interface CookieCategory {
  title: string;
  description: string;
  purpose: string;
  retention: string;
  thirdParties: string[];
  required: boolean;
}

export const cookieCategories: Record<string, CookieCategory> = {
  necessary: {
    title: "Niezbędne",
    description: "Wymagane do działania strony.",
    purpose: "Funkcjonalność, bezpieczeństwo",
    retention: "Sesja - 1 rok",
    thirdParties: [],
    required: true
  },
  analytics: {
    title: "Analityczne", 
    description: "Anonimowe statystyki ruchu na stronie.",
    purpose: "Analiza ruchu, optymalizacja UX",
    retention: "26 miesięcy",
    thirdParties: ["Google Analytics"],
    required: false
  },
  // marketing: {
  //   title: "Marketingowe",
  //   description: "Służą do wyświetlania spersonalizowanych reklam i śledzenia skuteczności kampanii reklamowych.",
  //   purpose: "Personalizacja reklam, remarketing, analiza kampanii",
  //   retention: "Do 24 miesięcy", 
  //   thirdParties: ["Google Ads", "Facebook Pixel"],
  //   required: false
  // }
};

export const legalInfo = {
  dataController: "WCAG.co",
  contact: "kontakt@wcag.co",
  legalBasis: "Art. 6 ust. 1 lit. a RODO (zgoda użytkownika)",
  rights: [
    "wycofanie zgody w dowolnym momencie",
    "dostęp do swoich danych osobowych", 
    "sprostowanie nieprawidłowych danych",
    "usunięcie danych osobowych",
    "ograniczenie przetwarzania",
    "przenoszenie danych"
  ],
  supervisoryAuthority: "Urząd Ochrony Danych Osobowych (UODO)",
  privacyPolicyUrl: "/polityka-prywatnosci",
  termsUrl: "http://localhost:3000/terms-of-use"
};
