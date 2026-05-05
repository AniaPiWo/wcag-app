import { openai } from '../openai';
import type { AuditSummary, AxeViolation } from '@/app/api/audit/types';

export const defaultModelParams = {
  model: 'gpt-4o',
  temperature: 0.7,
  max_tokens: 2000,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};

export async function createChatCompletion(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: Partial<typeof defaultModelParams> = {}
) {
  try {
    const response = await openai.chat.completions.create({
      ...defaultModelParams,
      ...options,
      messages,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Błąd OpenAI:', error);
    throw new Error('Nie udało się uzyskać odpowiedzi od modelu AI');
  }
}

export async function analyzeAccessibilityResults(
  violations: AxeViolation[],
  summary: AuditSummary
) {
  const compactViolations = violations.map(v => ({
    description: v.description,
    occurrences: v.nodes?.length || 0
  }));

  const prompt = `
Przeanalizuj wyniki automatycznego audytu dostępności strony internetowej (WCAG) i przygotuj raport w **języku polskim**.

Dane wejściowe:
${JSON.stringify(compactViolations, null, 2)}

---

Jeśli nie wykryto żadnych naruszeń:
Zwróć tylko ten komunikat (bez żadnych dopisków):
„Automatyczna analiza nie wykryła błędów na stronie – wygląda na to, że wszystko jest w bardzo dobrej kondycji!
Warto jednak pamiętać, że test automatyczny nie jest w stanie ocenić wszystkich aspektów dostępności — dlatego zachęcamy do wykonania manualnego audytu, który sprawdza elementy wymagające ludzkiej oceny, takie jak kontrast wizualny, kolejność nawigacji czy zrozumiałość treści."

---

Jeśli wykryto naruszenia:
- Nie dodawaj tytułu raportu (jest już podany w innym miejscu).
- Styl: profesjonalny, zrozumiały, neutralny i uprzejmy.
- Napisz krótkie podsumowanie (2-3 zdań) ogólnie opisujące charakter wykrytych błędów dostępności, bez szczegółów technicznych.
- Nie wymieniaj konkretnych nazw atrybutów, selektorów ani kodu.
- Nie proponuj gotowych rozwiązań.
- Zaznacz, że automatyczny audyt ma ograniczenia i nie obejmuje wszystkich aspektów dostępności.
- Na końcu dodaj sekcję:
  „Elementy wymagające audytu manualnego:"
  - Wypisz w punktach (krótkimi opisami) elementy oznaczone jako wymagające audytu manualnego, np.:
    - „Sprawdzenie poprawności alternatywnych opisów obrazów"
    - „Ocena kolejności fokusu klawiatury"
    - „Weryfikacja kontrastu tekstu względem tła"
- Zakończ delikatnym zaproszeniem do zamówienia pełnego audytu manualnego, np.:
  „Pełny audyt manualny pozwoli dokładnie zidentyfikować problemy, których automaty nie są w stanie wykryć, oraz przygotować instrukcje naprawy dopasowane do Twojej strony."
`;

  try {
    const messages = [
      {
        role: 'system' as const,
        content: 'Jesteś ekspertem ds. dostępności stron internetowych. Twoje odpowiedzi są zwięzłe, techniczne i zawsze zawierają praktyczne przykłady kodu. Masz doskonałą wiedzę na temat zasad WCAG 2.2'
      },
      { role: 'user' as const, content: prompt }
    ];

    return await createChatCompletion(messages, {
      temperature: 0.5,
      max_tokens: 3000,
    });
  } catch (error) {
    console.error('Błąd analizy dostępności:', error);
    return 'Nie udało się przeprowadzić analizy wyników. Spróbuj ponownie później.';
  }
}
