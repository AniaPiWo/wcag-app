
export const auditAdvanced = [
    {
      id: 1,
      title: "Czy każdy element graficzny ma przypisaną poprawnie alternatywę tekstową?",
      wcag: "1.1.1",
      level: "A",
      description: "Sprawdź, czy elementy takie jak aplet, object, embed, kod JS generujący którykolwiek z powyższych mają odpowiedni, poprawnie sformułowany opis w atrybucie <alt>, <noembed> lub inny jednoznaczny i dostępny opis zawartości znajdujący się bezpośrednio obok elementu."
    },
    {
      id: 2,
      title: "Czy widoczna etykieta jest zgodna z etykietą dostępną dla technologii asystujących?",
      wcag: "2.5.3",
      level: "A",
      description: "Sprawdź, czy widoczna etykieta każdego komponentu ma taką samą treść, jak etykieta zgłaszana przez technologie asystujące (np. czytniki ekranu)."
    },
    {
      id: 3,
      title: "Czy komunikaty o statusie lub błędach są dostępne dla technologii wspomagających bez konieczności przemieszczania fokusa?",
      wcag: "4.1.3",
      level: "AA",
      description: "Sprawdź, czy komunikaty o statusie lub błędach (np. o postępie działań w tle, błędach w formularzach) są przekazywane automatycznie bez oznaczania ich fokusem."
    },
    {
      id: 4,
      title: "Czy skrypty lub elementy programowalne w inny sposób są dostępne dla technologii asystujących?",
      wcag: "4.1.2",
      level: "A",
      description: "Sprawdź, czy elementy object, embed, aplet, kod JS generujący powyższe są dostępne np. dla czytników ekranu i programów zmieniających kontrast. Jeśli wymagana jest transkrypcja tekstowa - sprawdź, czy ją dodano."
    },
    {
      id: 5,
      title: "Czy skrypt zmieniający zawartość nietekstową zmienia także jej alternatywę?",
      wcag: "1.1.1, 4.1.2",
      level: "A",
      description: "Sprawdź, czy skrypty zmieniające zawartość nietekstową (np. obrazy, ikony, wykresy) zmieniają również alternatywę tekstową."
    },
    {
      id: 6,
      title: "Czy atrybuty zarządzania zdarzeniami myszki mają swój odpowiednik dla klawiatury i na odwrót?",
      wcag: "2.1.1",
      level: "A",
      description: "Sprawdź elementy z onclick, onkeypress, onmousedown, onmouseup, onmouseover, onmouseout, onfocus, onblur, onkeydown, onkeyup, lub JS obsługujący te zdarzenia. Upewnij się, że każde zdarzenie jest możliwe do obsłużenia zarówno myszką, jak i klawiaturą."
    },
    {
      id: 7,
      title: "Czy treść generowana przez skrypt pojawia się bezpośrednio po elemencie ją wywołującym?",
      wcag: "2.4.3",
      level: "A",
      description: "Jeśli po kliknięciu, najechaniu itp. pojawia się nowa treść (menu, tooltip, podpowiedź), powinna być w DOM tuż po elemencie ją wywołującym."
    },
    {
      id: 8,
      title: "Czy ramka fokusa jest usuwana za pomocą skryptu?",
      wcag: "2.1.1, 2.4, 3.2.1",
      level: "A",
      description: "Sprawdź, czy na stronie występuje outline: none / 0 w CSS lub JS."
    },
    {
      id: 9,
      title: "Czy wszystkie elementy generowane dynamicznie są dostępne dla technologii asystujących?",
      wcag: "4.1.2",
      level: "A",
      description: "Sprawdź, czy elementy generowane dynamicznie mają role ARIA (np. role=\"dialog\"), nazwy (np. aria-label), są dodawane do DOM-u, a zmiany są ogłaszane przez aria-live, aria-expanded, itp."
    }
  ];