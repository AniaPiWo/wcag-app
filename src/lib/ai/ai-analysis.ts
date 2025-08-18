/* eslint-disable @typescript-eslint/no-unused-vars */
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

// Now takes both violations and summary for full context
import type { AuditSummary } from '@/app/api/audit/types';

export async function analyzeAccessibilityResults(
  violations: AccessibilityViolation[],
  summary: AuditSummary
) {


  const compactViolations = violations.map(v => ({
    description: v.description,
    occurrences: v.nodes?.length || 0
  }))
  
  console.log("\x1b[33m%s\x1b[0m", "compactViolations ====>", compactViolations);

    const prompt = `
Przeanalizuj wyniki automatycznego audytu dostępności strony internetowej i przygotuj raport w całości jedynie w JĘZYKU POLSKIM.

Jeśli nie wykryto żadnych naruszeń:
- Wyświetl komunikat: „Automatyczna analiza nie wykryła błędów na stronie – wygląda na to, że wszystko jest gotowe na nadchodzące zmiany w prawie!
Warto jednak pamiętać, że automat też może coś przeoczyć. Jeśli chcesz mieć pełną pewność, mogę przeprowadzić manualny test z wykorzystaniem profesjonalnych narzędzi.”

Jeśli wykryto naruszenia:
Użyj poniższych danych jako danych wejściowych:
${JSON.stringify(compactViolations, null, 2)}
 - nie dawaj tytułu (Raport z automatycznego audytu dostępności strony internetowej itp), tytuł jest już w treści maila przed twoim tekstem
 - użyj emotek podkreślenia wagi naruszenia (krytyczny-‼️, poważny-❗, umiarkowany-⚠️,  drobne - ⚡, zaliczony-✅), po emotce daj spacje.
 - opisz krótko PO POLSKU wykryte błędy w zbiorczym podsumowaniu 4-5 zdań, nie pokazuj kodu z błędami
 - nie używaj ozdobników **
 - jeśli wykryto 
 - nienachalnie zachęć do zakupu dokładniejszego testu manualnego.


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
       