import { openai } from '../openai';

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
    
    // Logowanie informacji o liczbie tokenów
    console.log('\x1b[36m%s\x1b[0m', '📊 Informacje o tokenach:');
    console.log('\x1b[36m%s\x1b[0m', `   - Tokeny wejściowe: ${response.usage?.prompt_tokens || 'brak danych'}`);
    console.log('\x1b[36m%s\x1b[0m', `   - Tokeny wyjściowe: ${response.usage?.completion_tokens || 'brak danych'}`);
    console.log('\x1b[36m%s\x1b[0m', `   - Łącznie tokenów: ${response.usage?.total_tokens || 'brak danych'}`);
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Błąd OpenAI:', error);
    throw new Error('Nie udało się uzyskać odpowiedzi od modelu AI');
  }
}

// Definicja typu dla naruszeń dostępności
// Kompatybilny z AxeViolation z @/app/api/audit/types
export interface AccessibilityViolation {
  id: string;
  impact?: 'critical' | 'serious' | 'moderate' | 'minor' | null;
  description?: string;
  help?: string;
  helpUrl?: string;
  nodes?: Array<{
    html?: string;
    target?: string[];
    failureSummary?: string;
    impact?: string;
    any?: Array<{ id: string; message: string; data: unknown; relatedNodes: unknown[] }>;
    all?: Array<{ id: string; message: string; data: unknown; relatedNodes: unknown[] }>;
    none?: Array<{ id: string; message: string; data: unknown; relatedNodes: unknown[] }>;
  }>;
  [key: string]: unknown;
}

export async function analyzeAccessibilityResults(violations: AccessibilityViolation[]) {
  //console.log(violations);
  try {
    // Upraszczamy dane, skupiając się tylko na najważniejszych informacjach
    const simplifiedViolations = violations.map(violation => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      // Tylko liczba wystąpień (ilość elementów w tablicy nodes)
      occurrencesCount: violation.nodes?.length || 0
    }));

    const prompt = `
Przeanalizuj następujące naruszenia dostępności stron internetowych i przygotuj raport w języku polskim.

Jeśli nie wykryto żadnych naruszeń:
- Wyświetl komunikat: „Automatyczna analiza nie wykryła błędów na stronie – wygląda na to, że wszystko jest gotowe na nadchodzące zmiany w prawie!
Warto jednak pamiętać, że automat też może coś przeoczyć. Jeśli chcesz mieć pełną pewność, mogę przeprowadzić manualny test z wykorzystaniem profesjonalnych narzędzi.”

Jeśli wykryto naruszenia:
- Wypisz je jako wypunktowaną listę (bez numerowania).
- użyj emotek podkreślenia wagi naruszenia (krytyczny-‼️, poważny-❗, umiarkowany-⚠️), po emotce daj spacje.
- zacznij od najważniejszych i kończ najmniej ważnymi.
- Dla każdego naruszenia zastosuj format:
  Błąd waga – krótkie streszczenie problemu
  Opis problemu: krótki opis
  Liczba wystąpień: liczba

Nie dodawaj żadnych oznaczeń takich jak ** oraz nie podawaj żadnego kodu źródłowego.
Nie pisz w formie maila – ma to być czysty raport.

Użyj poniższych danych jako danych wejściowych:
${JSON.stringify(simplifiedViolations, null, 2)}

`;
    
    const messages = [
      { 
        role: 'system' as const, 
        content: 'Jesteś ekspertem ds. dostępności stron internetowych. Twoje odpowiedzi są zwięzłe, techniczne i zawsze zawierają praktyczne przykłady kodu. Masz doskonałą wiedzę na temat WCAG 2.2' 
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
