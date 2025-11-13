export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'pricing' | 'process' | 'technical' | 'legal';
  keywords: string[];
}

export const faqData: FAQItem[] = [
  {
    id: 'what-is-wcag',
    question: 'Czym jest WCAG 2.2?',
    answer: 'WCAG 2.2 (Web Content Accessibility Guidelines) to międzynarodowe wytyczne dotyczące dostępności treści internetowych. Określają one standardy, które sprawiają, że strony internetowe są dostępne dla osób z różnymi niepełnosprawnościami, w tym wzrokowymi, słuchowymi, ruchowymi i poznawczymi.',
    category: 'general',
    keywords: ['wcag', 'dostępność', 'standardy', 'wytyczne', 'niepełnosprawność']
  },
  {
    id: 'audit-duration',
    question: 'Ile trwa audyt dostępności?',
    answer: 'Czas trwania audytu zależy od wielkości i złożoności strony. Standardowy audyt do 5 podstron zajmuje 3-5 dni roboczych. Większe projekty mogą wymagać 1-2 tygodni.',
    category: 'process',
    keywords: ['audyt', 'czas', 'realizacja', 'termin', 'ile trwa']
  },
  {
    id: 'implementation-time',
    question: 'Jak długo trwa wdrożenie dostępności?',
    answer: 'Czas wdrożenia zależy od liczby wykrytych problemów i złożoności poprawek. Typowe wdrożenie zajmuje 1-4 tygodnie. Po audycie przedstawiam szczegółowy harmonogram.',
    category: 'process',
    keywords: ['wdrożenie', 'implementacja', 'czas', 'harmonogram', 'poprawki']
  },
  {
    id: 'pricing-factors',
    question: 'Od czego zależy cena usług?',
    answer: 'Cena zależy od: wielkości strony (liczba podstron), złożoności funkcjonalności, obecnego poziomu dostępności, wymaganego poziomu zgodności (A, AA, AAA) oraz terminów realizacji.',
    category: 'pricing',
    keywords: ['cena', 'wycena', 'koszt', 'od czego zależy', 'faktory']
  },
  {
    id: 'legal-requirements',
    question: 'Czy dostępność cyfrowa jest obowiązkowa?',
    answer: 'Tak, zgodnie z Europejskim Aktem o Dostępności i polskim prawem, podmioty publiczne muszą zapewnić dostępność swoich stron. Sektor prywatny również będzie objęty obowiązkami od 2025 roku.',
    category: 'legal',
    keywords: ['prawo', 'obowiązek', 'europejski akt', 'wymagania prawne', 'sektor publiczny']
  },
  {
    id: 'certificate-validity',
    question: 'Jak długo ważny jest certyfikat dostępności?',
    answer: 'Certyfikat dostępności cyfrowej jest ważny przez 12 miesięcy od daty wydania. Po tym czasie zalecam przeprowadzenie ponownego audytu, szczególnie jeśli wprowadzono zmiany na stronie.',
    category: 'technical',
    keywords: ['certyfikat', 'ważność', 'jak długo', 'odnowienie', 'audyt kontrolny']
  },
  {
    id: 'support-after-implementation',
    question: 'Czy oferujesz wsparcie po wdrożeniu?',
    answer: 'Tak, oferuję 3-miesięczne wsparcie po wdrożeniu w ramach ceny. Obejmuje ono pomoc w rozwiązywaniu problemów i odpowiedzi na pytania dotyczące utrzymania dostępności.',
    category: 'process',
    keywords: ['wsparcie', 'po wdrożeniu', 'pomoc', 'utrzymanie', 'gwarancja']
  },
  {
    id: 'tools-used',
    question: 'Jakich narzędzi używasz do testowania?',
    answer: 'Używam kombinacji automatycznych narzędzi (axe-core, WAVE, Lighthouse) oraz manualnych testów z technologiami wspomagającymi (screen readery, nawigacja klawiaturą). Najważniejsze są testy manualne.',
    category: 'technical',
    keywords: ['narzędzia', 'testowanie', 'screen reader', 'automatyczne', 'manualne']
  }
];

// Funkcje pomocnicze
export function getFAQByCategory(category: FAQItem['category']): FAQItem[] {
  return faqData.filter(item => item.category === category);
}

export function searchFAQ(query: string): FAQItem[] {
  const searchTerm = query.toLowerCase();
  return faqData.filter(item => 
    item.question.toLowerCase().includes(searchTerm) ||
    item.answer.toLowerCase().includes(searchTerm) ||
    item.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
  );
}
