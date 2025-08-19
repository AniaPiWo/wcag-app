/**
 * AuditLevel interface defining the structure of audit level objects
 */
export interface AuditLevel {
  id: string;
  label: string;
}

/**
 * Interface for audit question items used across all audit levels
 */
interface AuditQuestion {
  id: number;
  title: string;
  description: string;
  wcag: string;
}

/**
 * Basic level audit questions focusing on essential accessibility requirements
 */
export const auditBasic: AuditQuestion[] = [
  {
    id: 1,
    title: "Alternatywne teksty dla grafik",
    description: "Czy wszystkie znaczące grafiki posiadają alternatywne teksty opisujące ich zawartość lub funkcję?",
    wcag: "1.1.1"
  },
  {
    id: 2,
    title: "Dostępność z klawiatury",
    description: "Czy wszystkie funkcjonalności strony są dostępne przy użyciu samej klawiatury?",
    wcag: "2.1.1"
  },
  {
    id: 3,
    title: "Odpowiedni kontrast tekstu",
    description: "Czy kontrast między tekstem a tłem jest wystarczający (minimum 4,5:1 dla tekstu normalnego, 3:1 dla dużego tekstu)?",
    wcag: "1.4.3"
  },
  {
    id: 4,
    title: "Powiększanie tekstu",
    description: "Czy strona pozwala na powiększenie tekstu do 200% bez utraty treści lub funkcjonalności?",
    wcag: "1.4.4"
  },
  {
    id: 5,
    title: "Struktura nagłówków",
    description: "Czy strona ma poprawną hierarchiczną strukturę nagłówków (h1-h6)?",
    wcag: "1.3.1"
  }
];

/**
 * Intermediate level audit questions for more detailed accessibility evaluation
 */
export const auditIntermediate: AuditQuestion[] = [
  {
    id: 1,
    title: "Etykiety formularzy",
    description: "Czy wszystkie pola formularzy mają odpowiednie i powiązane etykiety?",
    wcag: "1.3.1, 3.3.2"
  },
  {
    id: 2,
    title: "Komunikaty o błędach",
    description: "Czy komunikaty o błędach są jasne, precyzyjne i wskazują jak naprawić błąd?",
    wcag: "3.3.1, 3.3.3"
  },
  {
    id: 3,
    title: "Dostępność z klawiatury - pułapki",
    description: "Czy użytkownik nie zostaje uwięziony w żadnym elemencie podczas nawigacji klawiaturą?",
    wcag: "2.1.2"
  },
  {
    id: 4,
    title: "Napisy dla treści audio/wideo",
    description: "Czy nagrania audio i wideo mają dostępne napisy lub transkrypcję?",
    wcag: "1.2.2"
  },
  {
    id: 5,
    title: "ARIA landmarks",
    description: "Czy strona używa odpowiednich znaczników ARIA landmarks do oznaczenia sekcji?",
    wcag: "1.3.1, 4.1.2"
  },
  {
    id: 6,
    title: "Pomijanie bloków",
    description: "Czy istnieje możliwość pominięcia powtarzających się bloków treści (np. skip to content)?",
    wcag: "2.4.1"
  },
  {
    id: 7,
    title: "Zrozumiałe linki",
    description: "Czy linki mają zrozumiałe teksty opisujące ich cel (unikanie 'kliknij tutaj')?",
    wcag: "2.4.4"
  }
];

/**
 * Advanced level audit questions for comprehensive accessibility compliance
 */
export const auditAdvanced: AuditQuestion[] = [
  {
    id: 1,
    title: "Wyszukiwanie i nawigacja",
    description: "Czy strona posiada funkcjonalności ułatwiające wyszukiwanie i nawigację?",
    wcag: "2.4.5"
  },
  {
    id: 2,
    title: "Wiele dróg dostępu",
    description: "Czy do ważnych sekcji strony można dotrzeć na więcej niż jeden sposób?",
    wcag: "2.4.5"
  },
  {
    id: 3,
    title: "Obsługa gestów",
    description: "Czy funkcjonalności sterowane gestami mają alternatywne sterowanie bez gestów?",
    wcag: "2.5.1"
  },
  {
    id: 4,
    title: "Język strony i części",
    description: "Czy język strony oraz zmiany języka w treści są prawidłowo oznaczone?",
    wcag: "3.1.1, 3.1.2"
  },
  {
    id: 5,
    title: "Spójność nawigacji",
    description: "Czy elementy nawigacyjne są prezentowane w spójny sposób na wszystkich stronach?",
    wcag: "3.2.3"
  },
  {
    id: 6,
    title: "Kompatybilność z technologiami wspomagającymi",
    description: "Czy strona jest w pełni kompatybilna z czytnikami ekranu i innymi technologiami wspomagającymi?",
    wcag: "4.1.2"
  },
  {
    id: 7,
    title: "Dostosowanie czasu",
    description: "Czy użytkownik może kontrolować lub wyłączyć limity czasowe w interakcjach?",
    wcag: "2.2.1"
  },
  {
    id: 8,
    title: "Animacje i ruch",
    description: "Czy użytkownik może zatrzymać, wstrzymać lub ukryć animacje i automatycznie zmieniającą się treść?",
    wcag: "2.2.2"
  },
  {
    id: 9,
    title: "Tryb wysokiego kontrastu",
    description: "Czy strona zachowuje funkcjonalność i czytelność w trybie wysokiego kontrastu?",
    wcag: "1.4.3, 1.4.6"
  },
  {
    id: 10,
    title: "Responsywność i orientacja",
    description: "Czy strona jest w pełni dostępna i funkcjonalna na różnych rozmiarach ekranu i orientacjach?",
    wcag: "1.3.4"
  }
];
