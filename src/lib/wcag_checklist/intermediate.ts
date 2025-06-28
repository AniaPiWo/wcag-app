export const auditIntermediate = [
  {
    id: 1,
    title: 'Czy na każdej stronie jest nagłówek <h1>, który opisuje/tytułuje zawartość danej strony?',
    wcag: '2.4.1',
    level: 'A',
    description: 'Sprawdź czy na stronie nie ma więcej nagłówków <h1> - jest to dopuszczalne tylko gdy na jednej stronie są całkowicie odrębne, niepowiązane ze sobą hierarchicznie i logiczne bloki treści.'
  },
  {
    id: 2,
    title: 'Czy nagłówki są zdefiniowane w kodzie strony, w odpowiedniej kolejności?',
    wcag: '1.3.1,2.4.6',
    level: 'A, AA',
    description: 'Nagłówki mają logicznie oddawać strukturę dokumentu. Sprawdź, czy na stronie nie ma treści, które tylko wizualnie są nagłówkami (bez h). Sprawdź, czy na stronie są elementy oznaczone niepotrzebnie w kodzie jako nagłówki.'
  },
  {
    id: 3,
    title: 'Czy listy elementów są zdefiniowane w kodzie strony?',
    wcag: '1.3.1',
    level: 'A',
    description: 'Sprawdź, czy wszystkie bloki tekstu wyglądające jak listy elementów zdefiniowane są jako takie w kodzie HTML.\nTabele'
  },
  {
    id: 4,
    title: 'Czy tabele prezentujące dane mają poprawnie zdefiniowane nagłówki połączone z danymi?',
    wcag: '1.3.1',
    level: 'A',
    description: 'Wszystkie nagłówki (kolumn lub linii) zdefiniowane są w znacznikach <th> i mają niepowtarzalne <id>\nOdpowiadające nagłówkom komórki tabel są połączone z nimi za pomocą atrybutu <headers> lub <scope>'
  },
  {
    id: 5,
    title: 'Czy tabela prezentująca dane ma tytuł <caption> i opis <summary>?',
    wcag: '1.3.1',
    level: 'A',
    description: ''
  },
  {
    id: 6,
    title: 'Czy jest tabela prezentująca dane, stworzona w inny sposób niż znacznikami tabel?',
    wcag: '1.3.1,1.3.2',
    level: 'A',
    description: 'Sprawdź, czy żadna tabela prezentująca dane nie jest stworzona „ręcznie" (np. liniami, czy znakami w edytorze tekstu) a nie za pomocą znaczników tabeli.'
  },
  {
    id: 7,
    title: 'Czy tabela będąca szkieletem strony ma jasno określoną rolę?',
    wcag: '1.3.1',
    level: 'A',
    description: 'Sprawdź, czy tabela będąca szkieletem strony (tzw. tabela layoutowa) ma zdefiniowaną rolę - role="presentation".\n Nie dotyczy (oznacz jeśli nie ma tego typu tabeli).'
  },
  {
    id: 8,
    title: 'Czy w tabeli będącej szkieletem strony są znaczniki tabeli prezentującej dane?',
    wcag: '1.3.1',
    level: 'A',
    description: 'Sprawdź, czy w tabeli będącej szkieletem strony są elementy: <th>, <caption>, <thead>, <tfoot>, <colgroup>, <scope>, <headers>, <axis>, <summary>\nMożliwe odpowiedzi:\nNegatywna (oznacz jeśli w tabeli szkieletowej jest którykolwiek z wymienionych elementów)\nPozytywna (oznacz jeśli w tabeli szkieletowej nie ma żadnego z wymienionych elementów)\nNie dotyczy (oznacz jeśli na badanych stronach nie ma tego typu tabeli)'
  },
  {
    id: 9,
    title: 'Czy struktura list definicji jest poprawna?',
    wcag: '1.3.1',
    level: 'A',
    description: 'Wszystkie <dd> mają odpowiadające <dt>, struktura logiczna.\n Nie dotyczy - Brak użycia <dl> w kodzie strony.\nZawartość i semantyka'
  },
  {
    id: 10,
    title: 'Czy znaczące informacje generowane poprzez arkusze stylów mają dostępną alternatywę?',
    wcag: '1.1.1,1.3.1',
    level: 'A',
    description: 'Sprawdź, czy w arkuszu stylów, we właściwości „content" są przekazywane znaczące informacje. Jeśli tak, sprawdź czy te informacje są dostępne również w inny sposób.'
  },
  {
    id: 11,
    title: 'Czy elementy HTML służące do uruchomienia akcji są poprawnie użyte?',
    wcag: '1.3.1,2.1.1,4.1.2',
    level: 'A',
    description: 'Jak to zbadać: Sprawdź, czy na stronie jest element, który po kliknięciu myszką lub przejęciu fokusu powoduje uruchomienie akcji (np. wyświetlenie informacji, zatwierdzenie formularza, przejście do innej strony, otwarcie nowego okna, generowanie treści itp.).\nJeśli tak, sprawdź czy jest to jeden z elementów z listy: a, area, button lub input type button, submit, reset, file, image, password, radio, checkbox, select'
  },
  {
    id: 12,
    title: 'Czy cytaty są poprawnie określone w kodzie HTML?',
    wcag: '1.3.1',
    level: 'A',
    description: 'Nie dotyczy - nie ma cytatów\n Cytaty są w znacznikach <q> lub <blockquote>'
  },
  {
    id: 13,
    title: 'Czy ramki na stronie mają tytuły?',
    wcag: '2.4.1,4.1.2',
    level: 'A',
    description: 'Nie dotyczy - nie ma ramek\n frame lub iframe ma poprawnie sformułowany atrybut „title" opisujący zawartość prezentowaną w ramce.'
  },
  {
    id: 14,
    title: 'Czy są powtarzające się treści/wartości powodujące efekt jąkania się czytnika ekranu?',
    wcag: '2.4.4,3.2.3,3.2.4',
    level: 'A, AAA',
    description: 'Sprawdź czy na badanej stronie nie ma sytuacji gdzie ta sama treść/wartość danego elementu jest podana (odczytywana przez czytnik) dwa lub więcej razy. Najczęściej wynika to z:\nPowtórzenia tej samej treści opisu alternatywnego i atrybutu <title> w linku graficznych\nPowtórzenie treści linku tekstowego w atrybucie <title> tego linku\nPowtórzenia etykiety pola/przycisku formularza w etykiecie i np. za pomocą dodatkowej etykiety ARIA\nPowtórzenia treści z toolbara/infobara w dodatkowej ukrytej treści połączonej z tym toolbarem/infobarem przez ARIA\nLinki'
  },
  {
    id: 15,
    title: 'Czy linki menu są zgrupowane w kodzie w listę?',
    wcag: '2.4.1',
    level: 'A',
    description: 'Jak to zbadać:\n<nav aria-label="Główne menu">\n  <ul id="main-menu">\n    <li><a href="/o-nas">O nas</a></li>\n    <li><a href="/uslugi">Usługi</a></li>\n    <li><a href="/kontakt">Kontakt</a></li>\n  </ul>\n</nav>'
  },
  {
    id: 16,
    title: 'Czy na stronie są puste linki?',
    wcag: '2.4.4',
    level: 'A',
    description: 'Sprawdź, czy na badanych stronach są linki, które nie mają żadnej zawartości pomiędzy znacznikami <a> i </a>.'
  },
  {
    id: 17,
    title: 'Czy funkcja linków o tej samej treści jest spójna w całym serwisie?',
    wcag: '2.4.4,3.2.3,3.2.4',
    level: 'A, AAA',
    description: 'Linki o takiej samej treści zawsze mają tę samą funkcję lub prowadzą do tego samego celu.'
  },
  {
    id: 18,
    title: 'Czy cel i działanie linku są łatwe do zrozumienia?',
    wcag: '2.4.4',
    level: 'A',
    description: 'Sprawdź, czy treści linków na stronie są łatwe do zrozumienia samodzielnie lub ze wsparciem treści z atrybutu <title> lub innej treści otaczającej link. Zwróć uwagę na linki typu „czytaj więcej", „pobierz" itp. Linki te są trudne do użycia przez osoby niewidome bo ich treść nie wskazuje precyzyjnie do czego prowadzą – sprawdź, czy te linki są uzupełnione o treść dojaśniającą (może być ukryta wizualnie, ale musi być dostępna dla czytników ekranu).\nElementy graficzne'
  },
  {
    id: 19,
    title: 'Czy element <img> przekazujący informacje ma poprawnie sformułowany atrybut <alt>?',
    wcag: '1.1.1,1.4.5',
    level: 'A, AAA',
    description: 'Sprawdź, czy na stronie element graficzny <img>, który obrazem przekazuje informacje (a nie jest wyłącznie dekoracyjny), ma poprawny alt.'
  },
  {
    id: 20,
    title: 'Czy wyłącznie dekoracyjny element <img> ma pusty atrybut <alt>?',
    wcag: '1.1.1',
    level: 'A',
    description: ''
  },
  {
    id: 21,
    title: 'Czy powtarzające się elementy graficzne mają zawsze taką samą alternatywę tekstową?',
    wcag: '3.2.4',
    level: 'AAA',
    description: 'Formularze'
  },
  {
    id: 22,
    title: 'Czy zabezpieczenie CAPTCHA jest dostępne cyfrowo? (pytanie kluczowe)',
    wcag: '1.1.1',
    level: 'A',
    description: 'Ma formę tekstową (np. proste zadanie matematyczne)\nOprócz zadania w formie graficznej ma alternatywę np. tekstową lub dźwiękową, która umożliwi obsłużenie go samodzielnie przez każdego użytkownika'
  },
  {
    id: 23,
    title: 'Czy wszystkie pola formularzy są poprawnie, jednoznacznie zidentyfikowane?',
    wcag: '1.1.1,1.3.1,2.4.6,3.3.2,4.1.2',
    level: 'A, AA',
    description: 'Każde pole formularza ma:\nUnikalne na stronie <id>\nOpis swojego przeznaczenia w atrybucie <title> lub etykiecie <label>\nAtrybut <title> lub etykieta <label> odpowiednio połączone z polem w kodzie HTML'
  },
  {
    id: 24,
    title: 'Czy pole formularza ma zrozumiałą informację o formacie danych do wprowadzenia i obowiązku wypełnienia pola?',
    wcag: '3.3.2',
    level: 'A',
    description: 'Jeśli na stronie są pola formularzy, które są obowiązkowe lub w które trzeba wpisać dane w jeden określony sposób (np. data w formacie rrrr-mm-dd), sprawdź czy informacje o tym są podane na początku formularza, w etykiecie pola lub w inny sposób, ale powiązany bezpośrednio z polem, do którego się odnoszą.'
  },
  {
    id: 25,
    title: 'Czy pola o podobnym znaczeniu są grupowane w formularzu za pomocą znaczników <fieldset> lub <optgroup>?',
    wcag: '1.3.1,3.3.2',
    level: 'A',
    description: 'Jeśli w formularzu są pola, które mają podobne znaczenie, są logicznie powiązane (np. radio, checkboxy, grupy pól tekstowych), to należy użyć <fieldset> z <legend> lub <optgroup> w <select>.\nPrzykład:\n<form>\n  <fieldset>\n    <legend>Dane osobowe</legend>\n    <label for="fname">Imię:</label>\n    <input type="text" id="fname" name="fname">\n    <label for="lname">Nazwisko:</label>\n    <input type="text" id="lname" name="lname">\n  </fieldset>\n\n  <label for="country">Wybierz kraj:</label>\n  <select id="country" name="country">\n    <optgroup label="Europa">\n      <option value="pl">Polska</option>\n      <option value="de">Niemcy</option>\n    </optgroup>\n  </select>\n</form>'
  },
  {
    id: 26,
    title: 'Czy do pól zgrupowanych przez <fieldset> dodany jest także opis grupy w znaczniku <legend>?',
    wcag: '1.3.1,3.3.2',
    level: 'A',
    description: ''
  },
  {
    id: 27,
    title: 'Czy do pól zgrupowanych przez <optgroup> dodany jest także opis grupy w znaczniku <label>?',
    wcag: '1.3.1',
    level: 'A',
    description: ''
  },
  {
    id: 28,
    title: 'Czy funkcja autouzupełnianie pola formularza działa poprawnie?',
    wcag: '1.3.5',
    level: 'AA',
    description: 'Treści'
  },
  {
    id: 29,
    title: 'Czy ustawienie odstępów pomiędzy liniami, akapitami, znakami i wyrazami powoduje utratę czytelności?',
    wcag: '1.4.12',
    level: 'AA',
    description: 'Sprawdź, czy:\nPowiększenie odstępów między liniami (line-height) do 1,5 wielkości czcionki\nPowiększenie odstępów między paragrafami do dwukrotności wielkości czcionki\nPowiększenie odstępów między literami (letter-spacing) do 0,12 wielkości czcionki\nPowiększenie odstępów między słowami (word-spacing) do 0,16 wielkości czcionki\nnie pogarsza czytelności tekstu.'
  },
  {
    id: 30,
    title: 'Czy na stronie nie ma słów pisanych literami oddzielonymi spacjami?',
    wcag: '1.3.2',
    level: 'A',
    description: ''
  },
  {
    id: 31,
    title: 'Czy na stronie są symbole typu ASCII-Art bez alternatywy tekstowej?',
    wcag: '1.1.1',
    level: 'A',
    description: 'Przykłady poprawnego oznaczenia:\n<figure aria-label="Kotek narysowany za pomocą znaków ASCII">\n<pre>\n  /\\_/\\\n ( o.o )\n  > ^ <\n</pre>\n<figcaption>Kotek złożony z symboli ASCII</figcaption>\n</figure>\n\n<pre aria-label="Kot narysowany znakami ASCII">\n  /\\_/\\\n ( o.o )\n  > ^ <\n</pre>'
  },
  {
    id: 32,
    title: 'Czy treści obcojęzyczne mają poprawnie zdefiniowany język?',
    wcag: '3.1.2',
    level: 'AA',
    description: 'Przykład:\n<p>To jest tekst po polsku, a tutaj <span lang="en">this part is in English</span>.</p>'
  },
  {
    id: 33,
    title: 'Czy rozmiar czcionek w elementach formularzy jest określany tylko w jednostkach względnych?',
    wcag: '1.4.4',
    level: 'AA',
    description: 'W kontekście dostępności ważne jest, aby rozmiary czcionek w elementach formularzy (takich jak <input>, <textarea>, <select>, <button>) były definiowane za pomocą jednostek względnych, które umożliwiają łatwe skalowanie tekstu przez użytkownika (np. w ustawieniach przeglądarki).'
  },
  {
    id: 34,
    title: 'Czy kolor elementu i kolor jego tła są zawsze wspólnie definiowane w arkuszu stylów?',
    wcag: '1.4.3,1.4.5',
    level: 'AA, AAA',
    description: 'W arkuszu stylów CSS powinny być zawsze określone obydwa: kolor tekstu (color) oraz kolor tła (background-color) dla elementów, które wyświetlają tekst lub inne ważne informacje. Te dwa style powinny być ZAWSZE w parze.\nWygląd'
  },
  {
    id: 35,
    title: 'Czy mniejsza szerokość lub wysokość widoku strony nie ogranicza treści ani funkcji i nie wymaga przesuwania widoku strony w poziomie?',
    wcag: '1.4.10',
    level: 'AA',
    description: 'Sprawdź, czy w tym układzie żadna treść ani funkcja na stronie nie znika i czy nie musisz używać do przewijania treści suwaka poziomego:\nW trybie pionowym o szerokości 320 pikseli\nW trybie poziomym o wysokości 256 pikseli'
  },
  {
    id: 36,
    title: 'Czy są na stronie znaczniki <blink>, <bgsound> lub <marquee>?',
    wcag: '1.4.2,2.2.1,2.2.2',
    level: 'A, AAA',
    description: 'Te elementy mogą powodować nieprzyjemne, rozpraszające animacje lub dźwięki, które mogą przeszkadzać osobom z różnymi niepełnosprawnościami (np. z nadwrażliwością na ruch lub dźwięki). Często nie można ich zatrzymać ani wyłączyć, co narusza zasady kontroli nad treścią (WCAG 2.2.1 – Sterowanie migotaniem i ruchomymi elementami). Mogą pogarszać czytelność i odbiór treści (WCAG 1.4.2 – Sterowanie migotaniem).'
  },
  {
    id: 37,
    title: 'Czy po wyłączeniu stylów CSS informacje na stronie są czytelne?',
    wcag: '1.3.2,2.4.3',
    level: 'A',
    description: 'Sprawdź, czy wszystkie informacje po wyłączeniu styli są nadal dostępne, czytelne i mają logiczną kolejność.'
  },
  {
    id: 38,
    title: 'Czy selektor CSS outline wyłącza fokus?',
    wcag: '1.4.1,2.4.7',
    level: 'AA',
    description: 'Selektor CSS outline ma wartości „0" lub none wyłączającej widoczność fokusu klawiatury.'
  },
  {
    id: 39,
    title: 'Czy kontrast tekstu w stosunku do tła wynosi co najmniej 4,5:1?',
    wcag: '1.4.3',
    level: 'AA',
    description: ''
  },
  {
    id: 40,
    title: 'Czy kontrast elementów interfejsu i grafik pozwalających na zrozumienie treści lub niosących ważne informacje w stosunku do tła wynosi co najmniej 3:1?',
    wcag: '1.4.11',
    level: 'AA',
    description: 'Kontrast elementów interfejsu (np. ramek pól formularza) i grafik pozwalających zrozumieć treści lub niosących ważne informacje (np. symbol wskazujący pole obowiązkowe formularza, ikoniczne przyciski w widoku mobilnym) do tła wynosi co najmniej 3:1.'
  },
  {
    id: 41,
    title: 'Czy linki są spójnie wyróżniane wizualnie, mają focus i hover?',
    wcag: '1.4.1',
    level: 'AA',
    description: 'Nawigacja'
  },
  {
    id: 42,
    title: 'Czy kontekst strony zmienia się po samym oznaczeniu elementu fokusem?',
    wcag: '3.2.1',
    level: 'A',
    description: ''
  },
  {
    id: 43,
    title: 'Czy kontekst strony zmienia się bez wyraźnego zatwierdzenia przez użytkownika lub bez uprzedzenia go o takiej zmianie?',
    wcag: '3.2.2',
    level: 'A',
    description: 'Użytkownik powinien zawsze zatwierdzić akcję, np. klikając przycisk\nJeśli zmiana następuje bez klikania — trzeba go o tym poinformować w etykiecie, opisie lub komunikacie\nAutomatyczne działania powinny być ograniczone, szczególnie dla użytkowników korzystających z czytników ekranu'
  },
  {
    id: 44,
    title: 'Czy jest mechanizm automatycznie odświeżający stronę?',
    wcag: '2.2.1,2.2.2',
    level: 'A, AAA',
    description: 'Sprawdź, czy strona lub jej elementy są automatycznie odświeżane. Jeśli tak, upewnij się że jest to absolutnie konieczne dla zrozumienia informacji lub funkcjonalności. Sprawdź czy użytkownik może zatrzymać i uruchomić to odświeżanie lub zmienić przedział czasowy pomiędzy odświeżeniami do ponad 20 godzin.\nMożliwe odpowiedzi:\nNegatywna (oznacz jeśli na badanych stronach jest mechanizm automatycznego odświeżania, którym użytkownik nie może zarządzać)\nPozytywna (oznacz jeśli na badanych stronach jest mechanizm automatycznego odświeżania, i użytkownik może nim zarządzać)\nNie dotyczy (oznacz jeśli na badanych stronach nie ma mechanizmu automatycznego odświeżania)'
  },
  {
    id: 45,
    title: 'Czy jest mechanizm automatycznie przekierowujący stronę do innego adresu?',
    wcag: '3.2.1',
    level: 'A',
    description: 'Jeśli widzisz przekierowanie typu <meta http-equiv="refresh"...>, uważaj — może to łamać WCAG.\nJeśli nie ma takich przekierowań lub użytkownik ma kontrolę → odpowiedź pozytywna\nJeśli przekierowanie zachodzi bez wiedzy i wpływu użytkownika → odpowiedź negatywna'
  },
  {
    id: 46,
    title: 'SKIPLINKI - Czy są linki do omijania powtarzających się bloków i czy działają one spójnie?',
    wcag: '2.4.1,3.2.2',
    level: 'A',
    description: 'Sprawdź obecność linku typu „Przejdź do treści":\nWciśnij Tab po załadowaniu strony – powinien się pojawić jako pierwszy\nW HTML szukaj np. <a href="#main-content">Przejdź do treści</a>\nSprawdź, czy link prowadzi do unikalnego ID:\nDocelowy element musi mieć np. id="main-content"\nSprawdź inne linki pomijające (np. „Przejdź do menu"):\nPowinny działać na tej samej zasadzie – kotwice z href="#..."\nSprawdź spójność na wszystkich podstronach:\nLink(i) powinny występować na każdej podstronie\nPowinny działać poprawnie i kierować do właściwych elementów\nSprawdź kolejność w kodzie HTML:\nLink skip link powinien być w tej samej pozycji w DOM (najczęściej zaraz po <body>)\nMożliwe odpowiedzi:\nPozytywna – jeśli link(i) istnieją, działają i są spójne\nNegatywna – jeśli brak linku lub działa źle\nNie dotyczy – jeśli strona jest bardzo prosta lub jednostronicowa'
  },
  {
    id: 47,
    title: 'Czy dodatkowe informacje, pojawiające się gdy kursor przemieszcza się nad elementem interfejsu lub gdy element interfejsu przyjmuje fokus, mogą być w pełni kontrolowane przez użytkownika?',
    wcag: '1.4.13',
    level: 'AA',
    description: 'Znajdź elementy, które pokazują dodatkowe informacje, gdy:\nNajeżdżasz kursorem (hover)\nElement ma fokus (np. po naciśnięciu Tab)\nSprawdź, czy dodatkowa zawartość:\nNie zasłania istotnych elementów interfejsu (np. przycisków, pól formularza)\nNie znika, gdy przenosisz kursor na nią\nMoże być zamknięta przez użytkownika bez poruszania kursorem/fokusem (np. przyciskiem „Zamknij")\nJest widoczna tak długo, jak wskaźnik lub fokus pozostaje nad elementem, albo do momentu działania użytkownika (np. kliknięcia poza nią), lub tak długo, jak ma to sens (np. tooltip z krótką informacją)\nMożliwe odpowiedzi:\nPozytywna – jeśli użytkownik ma kontrolę nad dodatkowymi informacjami\nNegatywna – jeśli informacje znikają zbyt szybko, zasłaniają interfejs lub nie da się ich zamknąć\nNie dotyczy – jeśli na stronie nie ma takich elementów (np. tooltipów, rozwijanych podpowiedzi, popupów na hover/fokus)'
  },
  {
    id: 48,
    title: 'Czy użytkownik może zarządzać jednoliterowymi skrótami klawiszowymi?',
    wcag: '2.1.4',
    level: 'A',
    description: "Sprawdź, czy na stronie są jednoliterowe skróty klawiszowe, np.:\nS – otwiera wyszukiwanie\nC – otwiera czat\nH – wraca do strony głównej\nW narzędziach deweloperskich (F12 → zakładka Sources lub Event Listeners) poszukaj nasłuchiwanych zdarzeń klawiaturowych:\nSzukaj document.addEventListener('keydown', ...) albo keypress\nSprawdź, czy jest tam warunek np. event.key === 's', event.key === 'm' itp.\nJeśli takie skróty istnieją, sprawdź, czy można:\nWyłączyć skrót (np. w ustawieniach strony)\nZamienić skrót na inny\nOgraniczyć jego działanie tylko do sytuacji, gdy fokus jest na powiązanym elemencie (np. skrót działa tylko, gdy aktywne jest pole wyszukiwania)\nMożliwe odpowiedzi:\nPozytywna – jeśli można wykonać przynajmniej jedno z powyższych działań\nNegatywna – jeśli skrót działa zawsze i nie można go wyłączyć ani zmienić\nNie dotyczy – jeśli na stronie nie ma jednoliterowych skrótów klawiszowych"
  },
  {
    id: 49,
    title: 'Czy funkcja dostępna za pomocą gestu złożonego jest dostępna również za pomocą gestu prostego?',
    wcag: '2.5.1',
    level: '',
    description: 'Użyj urządzenia z ekranem dotykowym (np. smartfon lub tablet).\nSprawdź, czy na stronie występują gesty złożone, takie jak:\nSzczypanie dwoma palcami (np. powiększanie mapy)\nObracanie dwoma palcami\nPrzeciąganie dwoma palcami jednocześnie\nJeśli tak – sprawdź, czy można wykonać te same funkcje w prostszy sposób, np.:\nPrzyciskiem + i – do zoomowania\nPrzyciskami do obracania lub przesuwania widoku\nJednopunktowym dotknięciem lub przesunięciem\nMożliwe odpowiedzi:\nPozytywna – jeśli funkcje dostępne za pomocą gestu złożonego da się wykonać też prostym gestem (np. kliknięciem przycisku)\nNegatywna – jeśli funkcje są dostępne tylko przez złożone gesty\nNie dotyczy – jeśli nie ma żadnych złożonych gestów na stronie\n💡 Wskazówka: Najczęściej dotyczy to interaktywnych map, galerii zdjęć lub aplikacji PWA.'
  },
  {
    id: 50,
    title: 'Czy można anulować działanie, którego uruchamia się poprzez gest punktowy lub wciśnięcie klawisza urządzenia wskazującego?',
    wcag: '2.5.2',
    level: '',
    description: 'Sprawdź czy na stronie jest działanie, które uruchamia się poprzez dotknięcia ekranu dotykowego lub wciśnięcia klawisza myszki. Sprawdź, czy przed zakończeniem gestu punktowego (przed podniesieniem palca lub zwolnieniem klawisza myszy) działanie może być anulowane.\nMożliwe odpowiedzi:\nNegatywna (oznacz jeśli na badanych stronach są działania uruchamiane gestem punktowym lub naciśnięcie klawisza myszki, których nie można anulować)\nPozytywna (oznacz jeśli na badanych stronach, działania uruchamiane gestem punktowym lub naciśnięcie klawisza myszki, można anulować przerywając ich wykonanie)\nNie dotyczy (oznacz, jeśli na badanych stronach nie ma działań uruchamianych gestem punktowym lub naciśnięcie klawisza myszki)\nJakość kodu'
  },
  {
    id: 51,
    title: 'Czy na stronie są błędy walidacji lub przestarzałe, nieużywane elementy HTML?',
    wcag: '4.1.1,4.1.2',
    level: 'A',
    description: 'Sprawdź badane strony walidatorem W3C. Sprawdź, czy walidator nie znalazł żadnego błędu lub przestarzałych, niewspieranych już znaczników i atrybutów.\nMożliwe odpowiedzi:\nNegatywna (oznacz jeśli walidacja wykazała błędy i/lub przestarzałe elementy kodu)\nPozytywna (oznacz jeśli walidacja nie wykazała żadnych błędów i przestarzałych elementów kodu)'
  },
  {
    id: 52,
    title: 'Czy każda strona/podstrona ma poprawną deklarację języka?',
    wcag: '3.1.1',
    level: 'A',
    description: ''
  },
  {
    id: 53,
    title: 'Czy w kodzie strony są elementy HTML służące prezentacji?',
    wcag: '1.3.1,1.4.5',
    level: 'A, AAA',
    description: 'Sprawdź, czy w kodzie HTML występują znaczniki: basefont, blink, center, font, marquee, s, strike, tt, u, align, alink, background, basefont, bgcolor, border, color, link, text, vlink\nMożliwe odpowiedzi:\nNegatywna (oznacz jeśli jest którykolwiek z tych znaczników)\nPozytywna (oznacz jeśli na badanych stronach nie ma żadnego z tych znaczników)'
  },
  {
    id: 54,
    title: 'Czy deklaracja DTD jest poprawnie sformułowana w kodzie strony?',
    wcag: '4.1.1',
    level: 'A',
    description: '<!DOCTYPE html>'
  },
  {
    id: 56,
    title: 'Czy dokumenty do pobrania są dostępne cyfrowo?',
    wcag: '1.1.1,1.3.1,1.3.2,3.1.1,4.1.2',
    level: 'A',
    description: 'Sprawdź czy na stronie są dokumenty do pobrania,\nJeśli tak, pobierz i przejrzyj te dokumenty pod kątem dostępności cyfrowej.\nW pierwszej kolejności sprawdź czy dokumenty nie mają formy skanów (bez rozpoznania czcionek).\nW dokładnym przeglądzie mogą Ci pomóc narzędzia automatyczne np.:\nw programach pakietu MS Office (od wersji 2010) – Inspektor dostępności,\nw programie Adobe Acrobat – narzędzie „Pełne sprawdzenie dostępności"\nprogram PDF Accessibility Checker do testowania plików w formacie PDF,\nJeśli pliki nie są dostępne cyfrowo, sprawdź czy na stronie z której można je pobrać jest dla nich dostępna cyfrowo alternatywa (np. treść dokumentu jest w artykule, pod którym jest plik do pobrania tego dokumentu)\nNegatywna (oznacz jeśli na badanych stronach są dokumenty niedostępne cyfrowo i bez alternatywy)\nPozytywna (oznacz jeśli na badanych stronach nie ma dokumentów niedostępnych cyfrowo lub mają one dostępną cyfrowo alternatywę)\nNie dotyczy (oznacz, jeśli na badanych stronach nie ma dokumentów do pobrania)'
  },
];
