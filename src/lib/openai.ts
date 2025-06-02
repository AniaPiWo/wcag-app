import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANIZATION,
  dangerouslyAllowBrowser: false,
});

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

// Definicja typu dla naruszeń dostępności
interface AccessibilityViolation {
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
  }>;
  [key: string]: unknown;
}

export async function analyzeAccessibilityResults(violations: AccessibilityViolation[]) {
  try {
    const prompt = `
      Przeanalizuj następujące naruszenia dostępności stron internetowych i zaproponuj konkretne rozwiązania:
      ${JSON.stringify(violations, null, 2)}
      
      Dla każdego naruszenia podaj:
      1. Wymien wszytskie naruszenia jako liste, dodaj oznaczenia dla każdego naruszenia w formacie "1. [impact] [description] z ikoną oznaczającą wagę problemu"
      2. Dla każdego naruszenia podaj:
      - Opis problemu
      - Ilość wystąpień problemu
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
