import { createChatCompletion } from '@/lib/ai/ai-analysis';

export interface AuditDataItem {
  itemId: string;
  evaluation?: 'positive' | 'negative' | 'notApplicable' | string;
  notes?: string;
}

/**
 * Generates an AI summary for manual accessibility audit data
 * @param auditData Array of audit items with evaluation and notes
 * @param level The audit level (basic, intermediate, advanced, or consolidated)
 * @param selectedLevels Optional array of level names when level is 'consolidated'
 * @returns A formatted AI summary as string
 */
export async function generateManualAuditSummary(
  auditData: AuditDataItem[],
  level: string,
  selectedLevels?: string[]
): Promise<string> {
  console.log("\x1b[33m%s\x1b[0m", "AI summary generation started");
  
  // Format the audit data for the AI prompt
  const formattedAuditData = auditData.map(item => ({
    itemId: item.itemId,
    evaluation: item.evaluation || 'Not evaluated',
    notes: item.notes || ''
  }));

  // Create a different prompt based on whether this is a single level or consolidated report
  let prompt: string;
  
  if (level === 'consolidated' && selectedLevels && selectedLevels.length > 0) {
    prompt = `
    Przeanalizuj wyniki audytu manualnego dostępności strony internetowej dla WIELU poziomów: ${selectedLevels.join(', ')}.
    Dane wejściowe zawierają wyniki z wszystkich wybranych poziomów:
    ${JSON.stringify(formattedAuditData, null, 2)}
    
    Na podstawie tych danych:
    1. Przygotuj ZBIORCZĄ analizę wyników (maksymalnie 5-6 zdań)
    2. Wypisz główne problemy dostępności (jeśli występują) z podziałem na kategorie
    3. Zaproponuj 3-5 najważniejszych rekomendacji dla poprawy dostępności w kolejności priorytetów
    4. Dodaj kompleksową ocenę zgodności z WCAG 2.2 uwzględniając wszystkie przeanalizowane poziomy
    
    Odpowiedź przygotuj w języku polskim. Format odpowiedzi powinien być czytelny, z odpowiednimi nagłówkami dla każdej sekcji.
    Pamiętaj, że jest to raport zbiorczy, więc powinien zawierać kompleksową analizę wszystkich poziomów.
    `;
  } else {
    prompt = `
    Przeanalizuj wyniki audytu manualnego dostępności strony internetowej dla poziomu "${level}".
    Dane wejściowe:
    ${JSON.stringify(formattedAuditData, null, 2)}
    
    Na podstawie tych danych:
    1. Przygotuj zwięzłe podsumowanie wyników (maks. 3-4 zdania)
    2. Wypisz główne problemy dostępności (jeśli występują)
    3. Zaproponuj 2-3 najważniejsze rekomendacje dla poprawy dostępności
    4. Dodaj krótką ocenę zgodności z WCAG 2.2 dla tego poziomu
    
    Odpowiedź przygotuj w języku polskim. Format odpowiedzi powinien być czytelny, z odpowiednimi nagłówkami dla każdej sekcji.
    `;
  }

  const messages = [
    { 
      role: 'system' as const, 
      content: 'Jesteś ekspertem ds. dostępności stron internetowych. Specjalizujesz się w standardach WCAG 2.2 i potrafisz analizować wyniki audytów dostępności. Twoje odpowiedzi są zwięzłe, praktyczne i zawsze w języku polskim.' 
    },
    { role: 'user' as const, content: prompt }
  ];
  
  try {
    const aiSummary = await createChatCompletion(messages, {
      temperature: 0.5,
      max_tokens: 1500,
    });
    console.log("\x1b[33m%s\x1b[0m", "AI summary generation completed");
    return aiSummary || '';
  } catch (error) {
    console.error('Błąd generowania podsumowania AI:', error);
    throw new Error('Nie udało się wygenerować podsumowania AI');
  }
}