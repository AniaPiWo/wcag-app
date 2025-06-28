export const auditBasic = [
  {
    id: 1,
    title: 'Czy widać, który element jest aktywny przy nawigacji klawiaturą?',
    wcag: '2.4.7 AA',
    description: 'Sprawdź, czy fokus porusza się w kolejności zgodnej z układem treści (np. z góry na dół, z lewej na prawą).'
  },
  {
    id: 2,
    title: 'Czy wszystkie aktywne elementy są dostępne za pomocą klawiatury?',
    wcag: '2.1.1 A',
    description: 'Sprawdź, czy można obsłużyć wszystkie elementy jak linki, przyciski, formularze, multimedia, listy rozwijane itd.'
  },
  {
    id: 3,
    title: 'Czy przy niedostępnym odtwarzaczu multimediów jest alternatywa tekstowa?',
    wcag: '2.1.1 A',
    description: 'Sprawdź tylko, jeśli na stronie jest odtwarzacz niedostępny klawiaturą. Poszukaj pełnej wersji tekstowej treści multimediów (artykuł, dokument PDF itd.).'
  },
  {
    id: 4,
    title: 'Czy jest na stronie pułapka klawiaturowa?',
    wcag: '2.2.1',
    description: 'Przejdź całą stronę klawiaturą, aż wrócisz do paska adresu.'
  },
  {
    id: 5,
    title: 'Czy jest ostrzeżenie przed otwarciem nowego okna lub zakładki?',
    wcag: '2.4.4',
    description: 'Kliknij linki – jeśli otwierają nowe okno/zakładkę, sprawdź, czy jest o tym informacja (np. w treści, title, opisie).'
  },
  {
    id: 6,
    title: 'Czy nowe okno otwiera się automatycznie bez udziału użytkownika?',
    wcag: '2.4.4',
    description: 'Poruszaj się klawiaturą i myszką bez klikania. Zobacz, czy nie pojawi się automatycznie nowe okno/zakładka. Ocena negatywna, jeśli tak się dzieje.'
  },
  {
    id: 7,
    title: 'Czy na stronie jest mapa strony lub wyszukiwarka?',
    wcag: '2.4.5',
    description: 'Pozytywna – jest wyszukiwarka lub mapa strony, negatywna – brak obu.'
  },
  {
    id: 8,
    title: 'Czy wygląd i działanie menu jest takie same na wszystkich stronach?',
    wcag: '2.4.5, 3.2.3',
    description: 'Sprawdź, czy menu wygląda i działa identycznie na każdej podstronie.'
  },
  {
    id: 9,
    title: 'Czy nawigacja klawiaturą jest logiczna i zgodna z wyglądem strony?',
    wcag: '2.4.3',
    description: 'Sprawdź, czy fokus porusza się w kolejności zgodnej z układem treści (np. z góry na dół, z lewej na prawą).'
  },
  {
    id: 10,
    title: 'Czy są elementy błyskające na czerwono lub gwałtownie zmieniające jasność?',
    wcag: '2.3.1',
    description: 'Zwróć uwagę na elementy błyskające na czerwono. Policz błyski – 3+ na sekundę = problem. Sprawdź, czy zmiana jasności zajmuje >25% powierzchni ekranu.'
  },
  {
    id: 11,
    title: 'Czy po powiększeniu widoku strony do 200% widać całość informacji?',
    wcag: '1.4.4',
    description: 'Sprawdź, czy nie trzeba przewijać poziomo, czy nic się nie nakłada lub nie znika.'
  },
  {
    id: 12,
    title: 'Czy treści są dostępne niezależnie od orientacji ekranu?',
    wcag: '1.3.4',
    description: 'Sprawdź stronę na smartfonie/tablecie w pionie i poziomie. Ocena negatywna, jeśli występują problemy.'
  },
  {
    id: 13,
    title: 'Czy informacje są przekazywane tylko kolorem?',
    wcag: '1.3.1, 1.4.1',
    description: 'Sprawdź np. formularze z podświetleniem błędów lub kolorowe wykresy.'
  },
  {
    id: 14,
    title: 'Czy są instrukcje odnoszące się do koloru?',
    wcag: '1.4.1',
    description: 'Sprawdź, czy są sformułowania typu: „kliknij niebieski przycisk”.'
  },
  {
    id: 15,
    title: 'Czy informacja jest przekazywana tylko pozycją lub formą?',
    wcag: '1.3.3',
    description: 'Szukaj np. „kliknij w trójkąt” lub „u góry po prawej”.'
  },
  {
    id: 16,
    title: 'Czy jest automatycznie uruchamiany dźwięk, którego nie da się zatrzymać?',
    wcag: '1.4.2',
    description: 'Pozytywna – nie ma takiego dźwięku lub jest możliwość jego zatrzymania.'
  },
  {
    id: 17,
    title: 'Czy są migające lub poruszające się elementy, których nie da się zatrzymać?',
    wcag: '2.2.1, 2.2.2',
    description: 'Pozytywna – albo ich nie ma, albo da się je zatrzymać/ukryć.'
  },
  {
    id: 18,
    title: 'Czy są tytuły stron i czy mają poprawną strukturę?',
    wcag: '2.4.2',
    description: 'Każda strona powinna mieć unikalny tytuł ze strukturą „Szczegół – Ogólna nazwa serwisu”.'
  },
  {
    id: 19,
    title: 'Czy złożony element graficzny ma poszerzony opis?',
    wcag: '1.1.1',
    description: 'Sprawdź skomplikowane grafiki, infografiki, wykresy – czy mają opis obok lub link do opisu.'
  },
  {
    id: 20,
    title: 'Czy obok pól formularzy są jasne i zrozumiałe etykiety?',
    wcag: '3.3.2'
  },
  {
    id: 21,
    title: 'Czy informacja o błędzie jest zrozumiała i dostępna dla wszystkich?',
    wcag: '3.3.1',
    description: 'Sprawdź, czy komunikaty o błędach są tekstowe, precyzyjne, dostępne.'
  },
  {
    id: 22,
    title: 'Czy przy błędach są wskazówki, jak je naprawić?',
    wcag: '3.3.3',
    description: 'Po błędnym wypełnieniu pola – czy jest podpowiedź, np. „data powinna być w formacie dd‑mm‑rrrr”?'
  },
  {
    id: 23,
    title: 'Czy w formularzach prawnych/finansowych można sprawdzić i edytować dane przed wysłaniem?',
    wcag: '3.3.4',
    description: 'Sprawdź formularze takie jak zakupy, oświadczenia – czy użytkownik może sprawdzić i poprawić dane przed potwierdzeniem.'
  },
  {
    id: 24,
    title: 'Czy filmy/animacje/dźwięki mają opis tekstowy, jeśli nie są traktowane inaczej?',
    wcag: '1.1.1, 1.2.3',
    description: 'Sprawdź multimedia informacyjne – czy mają tytuł i transkrypcję (opis słów i obrazów)?'
  },
  {
    id: 25,
    title: 'Czy filmy/animacje ze ścieżką dźwiękową mają napisy dla niesłyszących?',
    wcag: '1.2.2',
    description: 'Sprawdź, czy istnieją napisy (włączające dźwięki tła, efekty).'
  },
  {
    id: 26,
    title: 'Czy filmy/animacje mają audiodeskrypcję?',
    wcag: '1.2.5',
    description: 'Sprawdź materiały ważne wizualnie – czy jest audiodeskrypcja (opis scen)?'
  },
  {
    id: 27,
    title: 'Czy link do dokumentu zawiera informacje o formacie, rozmiarze, języku?',
    wcag: '2.4.4',
    description: 'Link powinien mieć np. „(PDF, 120 KB, PL)”.'
  }
];