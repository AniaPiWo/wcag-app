import { createChatCompletion } from '@/lib/ai/ai-analysis';

export interface AuditDataItem {
  itemId: string;
  evaluation?: 'positive' | 'negative' | 'notApplicable' | string;
  notes?: string;
  title?: string;
  description?: string;
  wcag?: string;
  level?: string;
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
    notes: item.notes || '',
    title: item.title || '',
    description: item.description || '',
    wcag: item.wcag || '',
    level: item.level || ''
  }));
  
  // Log przykładowych negatywnych elementów do debugowania
  const negativeItems = formattedAuditData.filter(item => item.evaluation === 'negative');
  if (negativeItems.length > 0) {
    console.log(`Liczba negatywnych elementów w AI-summary: ${negativeItems.length}`);
    console.log('Przykładowy element negatywny:', JSON.stringify(negativeItems[0], null, 2));
  }

  // Create a different prompt based on whether this is a single level or consolidated report
  let prompt: string;
  
  if (level === 'consolidated' && selectedLevels && selectedLevels.length > 0) {
    prompt = `
    Przeanalizuj wyniki audytu manualnego dostępności strony internetowej dla WIELU poziomów: ${selectedLevels.join(', ')}.
    Dane wejściowe zawierają wyniki z wszystkich wybranych poziomów:
    ${JSON.stringify(formattedAuditData, null, 2)}
    
    Na podstawie tych danych odpowiedź przygotuj analize wyników audytu, odpowiedź zwróc w formacie JSON bez tytułu, wynik podziel na dwie czesci:
    1.  Wygeneruj opisową analizę pozytywnie zaliczonych kryteriów dostępności "summary". Nie podawaj ogólnego tytułu. Stwórz jeden spójny, ciągły tekst, w którym w naturalny sposób przedstawisz, które reguły zostały spełnione, na czym one polegają oraz co to oznacza dla użytkownika końcowego. W tekście uwzględnij nazwy ocenionych elementów (jeśli są dostępne), ale nie stosuj list punktowanych i numerów elementów na liście audytu. Utrzymaj długość tekstu na poziomie około 30 zdań. Nie opisuj reguł, które zostały ocenione negatywnie lub jako "not applicable". Jeśli występują "problems" to na końcu dopisz, że w kolejnej sekcji znajduje się lista głównych problemów dostępności.
    2. Wypisz WSZYSTKIE problemy dostępności "problems" - KAŻDY element oznaczony jako "negative" w ewaluacji musi być opisany jako problem. Dla każdego problemu dodaj: 
       - kategorie WCAG (sprawdź dokładnie pole "wcag" w danych elementu)
       - severity (krytyczny, poważny, umiarkowany, drobny - określ na podstawie opisu i kryterium WCAG)
       - opis problemu (na podstawie informacji zawartych w polach "title", "description" i "notes")
       - rekomendacje naprawy 
    
    BARDZO WAŻNE: Upewnij się, że każdy element, który ma evaluation="negative" jest uwzględniony w sekcji "problems". Nie pomijaj żadnego negatywnego wyniku, nawet jeśli wydaje się mało istotny.
    
    Odpowiedź przygotuj w języku polskim. Format odpowiedzi powinien być czytelny, z odpowiednimi nagłówkami dla każdej sekcji. Nie używaj * i # w nagłówkach. nie zaczynaj i nie kończ JSONA potrójnymi backtickami i slowem json.
    Pamiętaj, że jest to raport zbiorczy, więc powinien zawierać kompleksową analizę wszystkich poziomów.
    `;
  } else {
    prompt = `
    Przeanalizuj wyniki audytu manualnego dostępności strony internetowej dla poziomu "${level}".
    Dane wejściowe:
    ${JSON.stringify(formattedAuditData, null, 2)}
    
    Na podstawie tych danych:
    1. Przygotuj zwięzłe podsumowanie wyników (maks. 3-4 zdania)
    2. Wypisz główne problemy dostępności (jeśli występują) z podziałem na kategorie i do każdego problemu dodaj: kategorie WCAG, severity (krytyczny, poważny, umiarkowany, drobny), opis problemu i rekomendacje naprawy
    3. Dodaj krótką ocenę zgodności z WCAG 2.2 dla tego poziomu
    
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
      max_tokens: 4000, // Zwiększamy limit tokenów, aby uniknąć ucinania odpowiedzi
    });
    console.log("\x1b[33m%s\x1b[0m", "AI summary generation completed");
    return aiSummary || '';
  } catch (error) {
    console.error('Błąd generowania podsumowania AI:', error);
    throw new Error('Nie udało się wygenerować podsumowania AI');
  }
}