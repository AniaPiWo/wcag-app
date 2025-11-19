/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { chatbotKnowledgeBase } from '@/lib/data/chatbot-data'

interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatRequest {
  messages: Message[]
}

// ============================================
// FUNKCJE WALIDACYJNE
// ============================================

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validateAndCleanPhone(phone: string): { isValid: boolean; cleaned?: string } {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 9) {
    return { isValid: true, cleaned }
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('48')) {
    return { isValid: true, cleaned: cleaned.slice(2) }
  }
  
  return { isValid: false }
}

// ============================================
// EKSTRAKCJA IMIENIA
// ============================================

function extractUserNameFromMessages(messages: any[]): string | null {
  const commonPolishNames = ['Anna', 'Maria', 'Katarzyna', 'Małgorzata', 'Agnieszka', 'Barbara', 'Ewa', 'Elżbieta', 'Zofia', 'Jadwiga', 
    'Jan', 'Andrzej', 'Piotr', 'Krzysztof', 'Stanisław', 'Tomasz', 'Paweł', 'Józef', 'Marcin', 'Marek', 'Michał', 'Grzegorz', 'Jerzy']
  
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i]
    
    if (message.role === 'user' && message.content) {
      const messageText = message.content.trim()
      
      const namePatterns = [
        /^(?:mam na imi[eęeę]|nazywam się|jestem|to ja|zowię się|na imię mi|hej,? jestem|siemka,? jestem|cześć,? jestem|witam,? jestem)\s+([A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]{1,})(\s|$|,|\.)/i,
        /([A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]{2,})$/
      ]
      
      for (const pattern of namePatterns) {
        const match = messageText.match(pattern)
        if (match) {
          const name = match[1] || match[0]
          if (name && name.length >= 2 && name.length <= 20) {
            const normalizedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
            if (commonPolishNames.includes(normalizedName) || !/\s/.test(normalizedName)) {
              return normalizedName
            }
          }
        }
      }
    }
    
    if (message.role === 'assistant' && message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        if (toolCall.function.name === 'CONTACT_HUMAN') {
          try {
            const args = JSON.parse(toolCall.function.arguments)
            if (args.name) {
              return args.name
            }
          } catch (e) {}
        }
      }
    }
  }
  return null
}

// ============================================
// EKSTRAKCJA DANYCH KONTAKTOWYCH
// ============================================

function extractContactDataFromMessages(messages: any[]): { email?: string; phone?: string } | null {
  let email = ''
  let phone = ''
  
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i]
    
    if (message.role === 'user' && message.content) {
      const messageText = message.content.trim()
      
      if (!email) {
        const emailMatch = messageText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
        if (emailMatch && validateEmail(emailMatch[0])) {
          email = emailMatch[0]
        }
      }
      
      if (!phone) {
        const phoneMatch = messageText.match(/(?:\+48\s?)?(?:\d{3}[\s-]?\d{3}[\s-]?\d{3}|\d{9})/)
        if (phoneMatch) {
          const validation = validateAndCleanPhone(phoneMatch[0])
          if (validation.isValid) {
            phone = validation.cleaned!
          }
        }
      }
    }
    
    if (message.role === 'assistant' && message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        if (toolCall.function.name === 'CONTACT_HUMAN') {
          try {
            const args = JSON.parse(toolCall.function.arguments)
            if (args.email || args.phone) {
              return {
                email: args.email || email,
                phone: args.phone || phone
              }
            }
          } catch (e) {}
        }
      }
    }
  }
  
  if (email || phone) {
    return { email, phone }
  }
  
  return null
}

// ============================================
// SYSTEM PROMPT
// ============================================

function buildSystemPrompt(messages: any[] = []): string {
  const userName = extractUserNameFromMessages(messages)
  const contactData = extractContactDataFromMessages(messages)
  const { offers, promotions, contactInfo, businessInfo } = chatbotKnowledgeBase
  
  let userContext = ''
  
  if (userName) {
    userContext += `\n\n<KNOWN_USER_NAME>${userName}</KNOWN_USER_NAME>`
    userContext += `\n\n⚠️  **MUSISZ** używać imienia "${userName}" w KAŻDEJ odpowiedzi, zwracając się bezpośrednio do użytkownika!`
  }
  
  if (contactData) {
    userContext += `\n\n<KNOWN_CONTACT_DATA>`
    if (contactData.email) userContext += `\n- Email: ${contactData.email}`
    if (contactData.phone) userContext += `\n- Telefon: ${contactData.phone}`
    userContext += `\n</KNOWN_CONTACT_DATA>`
  }
  
  return `<system_role>
Masz na imie SeBot i jesteś asystentem AI dla firmy WCAG.co, specjalizującej się w dostępności cyfrowej.${userContext}
Pomagasz klientom w kwestiach związanych z WCAG 2.2, audytami dostępności i wdrożeniami.
</system_role>

<current_offers>
${offers.map(offer => `
• ${offer.title}: ${offer.price.amount} ${offer.price.currency}
  ${offer.description}
  Funkcje: ${offer.features.join(', ')}
`).join('')}
</current_offers>

<active_promotions>
${promotions.map(promo => `
🎉 ${promo.title}: ${promo.promotionalPrice} ${promo.currency} (zamiast ${promo.originalPrice})
${promo.description}
Warunki: ${promo.conditions.join(', ')}
${promo.validUntil ? `Ważne do: ${promo.validUntil}` : ''}
`).join('')}
</active_promotions>

<contact_information>
Strona: ${contactInfo.website}
Email: ${contactInfo.email}
Godziny pracy: ${contactInfo.workingHours}
Czas odpowiedzi: ${contactInfo.responseTime}
</contact_information>

<capabilities>
<knowledge>
- WCAG 2.2 (Web Content Accessibility Guidelines)
- Audyty dostępności stron internetowych
- Wdrożenia rozwiązań dostępności cyfrowej
- Technologie wspomagające (screen readery, nawigacja klawiaturą)
- Prawodawstwo dotyczące dostępności (Europejski Akt o Dostępności)
- Testowanie dostępności
- Optymalizacja UX dla osób z niepełnosprawnościami
- Narzędzia do testowania dostępności
</knowledge>

<specialization>
${businessInfo.specialization.join('\n- ')}
</specialization>
</capabilities>

<question_categorization>
WAŻNE: Analizuj pytania użytkownika i odpowiadaj TYLKO o konkretnej usłudze:

AUDYT - słowa kluczowe: "audyt", "analiza", "sprawdzenie", "ocena", "raport", "czy strona jest dostępna", "zbadanie", "kontrola", "przegląd", "diagnoza", "test dostępności", "weryfikacja"
→ Odpowiadaj TYLKO o "Manualny audyt dostępności" (599 zł netto)

DOSTOSOWANIE - słowa kluczowe: "dostosowanie", "poprawki", "naprawienie", "wdrożenie", "implementacja", "popraw dostępność", "ulepszenie", "modyfikacja", "aktualizacja", "optymalizacja", "dostosuj do WCAG"
→ Odpowiadaj TYLKO o "Dostosowanie do WCAG 2.2" (999 zł netto)

NOWA STRONA - słowa kluczowe: "nowa strona", "stworzenie", "wykonanie", "od podstaw", "nowy serwis", "budowa", "projekt", "tworzenie", "zrobienie", "aplikacja", "portal", "witryna"
→ Odpowiadaj TYLKO o "Tworzę dostępne rozwiązania" (1999 zł netto)

OGÓLNE - słowa kluczowe: "cennik", "wszystkie usługi", "oferta", "co oferujesz"
→ Wtedy możesz wymienić wszystkie usługi
</question_categorization>

<response_examples>
PRZYKŁAD - pytanie o audyt: "Ile kosztuje audyt?"
ODPOWIEDŹ: Informacje TYLKO o audycie (599 zł), jego funkcjach, czasie realizacji

PRZYKŁAD - pytanie o dostosowanie: "Chcę dostosować stronę do WCAG"
ODPOWIEDŹ: Informacje TYLKO o dostosowaniu (999 zł), procesie wdrożenia

PRZYKŁAD - pytanie o nową stronę: "Potrzebuję nową dostępną stronę"
ODPOWIEDŹ: Informacje TYLKO o tworzeniu nowych stron (1999 zł)

PRZYKŁAD - pytanie ogólne: "Jaki jest cennik?"
ODPOWIEDŹ: Wszystkie usługi z cenami
</response_examples>

<instructions>
1. **JEŚLI ZNASZ IMIĘ** (znajduje się w <KNOWN_USER_NAME>): UŻYWAJ GO W KAŻDEJ ODPOWIEDZI
2. **NAJPIERW** przeanalizuj pytanie i określ kategorię (audyt/dostosowanie/nowa strona/ogólne)
3. Odpowiadaj TYLKO o konkretnej usłudze zgodnie z kategoryzacją
4. Używaj prostego języka, wyjaśniaj terminy techniczne
5. Odwołuj się do konkretnych wytycznych WCAG 2.2
6. Oferuj praktyczne rozwiązania i porady
7. Zachęcaj do skorzystania z konkretnej usługi
8. Jeśli pytanie wykracza poza Twoją wiedzę, skieruj do kontaktu z ekspertem
9. Podkreślaj korzyści z dostępności cyfrowej
10. Wspominaj o promocjach tylko jeśli są związane z pytaną usługą
11. Podawaj konkretne ceny i warunki tylko dla pytanej usługi
12. NIE wymieniaj innych usług, chyba że pytanie jest ogólne o całą ofertę

<contact_flow>
KONTAKT Z CZŁOWIEKIEM - TYLKO gdy użytkownik WYRAŹNIE prosi o kontakt:

1. SPRAWDŹ <KNOWN_USER_NAME> i <KNOWN_CONTACT_DATA>
2. POSTĘPUJ ZGODNIE ZE SCENARIUSZEM:

SCENARIUSZ A - NIE ZNAM IMIENIA:
→ "Aby przekazać Twoją wiadomość, potrzebuję: • Twoje imię • Email i/lub telefon"

SCENARIUSZ B - ZNAM IMIĘ (np. "Ania") ALE NIE MAM KONTAKTU:
→ "Aniu, aby przekazać Twoją wiadomość, potrzebuję jeszcze: • Email i/lub telefon"

SCENARIUSZ C - ZNAM IMIĘ I MAM EMAIL/TELEFON:
→ "Aniu, mam Twoje dane: - Email: ania@example.com (jeśli masz) - Telefon: 660123456 (jeśli masz)
   Czy chcesz zmienić dane, czy napisać wiadomość?"

3. PO WYSŁANIU: POTWIERDŹ UŻYJĄC IMIENIA i WRÓĆ DO NORMALNEJ ROZMOWY
</contact_flow>
</instructions>`
}

// ============================================
// TOOLS
// ============================================

const tools = [
  {
    type: 'function',
    function: {
      name: 'CONTACT_HUMAN',
      description: 'Wysyła wiadomość kontaktową do człowieka TYLKO gdy użytkownik WYRAŹNIE prosi o kontakt z człowiekiem. NIE używaj tej funkcji dla zwykłych pytań o usługi.',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Imię użytkownika (minimum 2 znaki)'
          },
          email: {
            type: 'string',
            description: 'Adres email użytkownika (opcjonalny, ale wymagany jeśli nie podano telefonu)'
          },
          phone: {
            type: 'string',
            description: 'Numer telefonu użytkownika - DOKŁADNIE 9 CYFR (opcjonalny, ale wymagany jeśli nie podano emaila)'
          },
          message: {
            type: 'string',
            description: 'Treść wiadomości od użytkownika (minimum 5 znaków)'
          }
        },
        required: ['name', 'message']
      }
    }
  }
]

// ============================================
// EXECUTE TOOL
// ============================================

async function executeToolCall(toolName: string, args: any, baseUrl: string): Promise<any> {
  switch (toolName) {
    case 'CONTACT_HUMAN':
      try {
        // Walidacja imienia
        if (!args.name || typeof args.name !== 'string' || args.name.trim().length < 2) {
          return {
            success: false,
            error: 'Brak lub nieprawidłowe imię. Imię musi mieć co najmniej 2 znaki.'
          }
        }

        // Walidacja treści wiadomości
        if (!args.message || typeof args.message !== 'string' || args.message.trim().length < 5) {
          return {
            success: false,
            error: 'Treść wiadomości jest wymagana i musi mieć co najmniej 5 znaków.'
          }
        }

        // Sprawdź czy podano email lub telefon
        const hasEmail = args.email && typeof args.email === 'string' && args.email.trim().length > 0
        const hasPhone = args.phone && typeof args.phone === 'string' && args.phone.trim().length > 0
        
        if (!hasEmail && !hasPhone) {
          return {
            success: false,
            error: 'Podaj email lub telefon kontaktowy (telefon: 9 cyfr).'
          }
        }

        // Walidacja formatu email
        if (hasEmail) {
          if (!validateEmail(args.email)) {
            return {
              success: false,
              error: `Nieprawidłowy format emaila: "${args.email}". Popraw i spróbuj ponownie.`
            }
          }
        }

        // Walidacja i czyszczenie telefonu
        if (hasPhone) {
          const phoneValidation = validateAndCleanPhone(args.phone)
          if (!phoneValidation.isValid) {
            return {
              success: false,
              error: `Nieprawidłowy format telefonu: "${args.phone}". Podaj DOKŁADNIE 9 cyfr (np. 123456789).`
            }
          }
          // Zaktualizuj numer do czystej wersji
          args.phone = phoneValidation.cleaned
        }

        console.log('📧 [CONTACT_HUMAN] Wysyłanie nowej wiadomości kontaktowej:', {
          name: args.name,
          email: args.email || 'brak',
          phone: args.phone || 'brak',
          messageLength: args.message.length
        })

        const response = await fetch(`${baseUrl}/api/chat/contact`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...args,
            source: 'chatbot'
          }),
        })

        const data = await response.json()
        
        if (response.ok) {
          return {
            success: true,
            message: data.message
          }
        } else {
          return {
            success: false,
            error: data.error || 'Błąd wysyłania wiadomości'
          }
        }
      } catch (error) {
        console.error('Error in CONTACT_HUMAN tool:', error)
        return {
          success: false,
          error: 'Błąd połączenia z serwerem'
        }
      }

    default:
      return {
        success: false,
        error: 'Nieznana funkcja'
      }
  }
}

// ============================================
// MAIN API
// ============================================

export async function POST(request: NextRequest) {
	   const host = request.headers.get('host')
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`
  try {
    const { messages }: ChatRequest = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.error('OPENAI_API_KEY not configured')
      return NextResponse.json(
        {
          message: 'Przepraszam, asystent AI nie jest obecnie skonfigurowany. Skontaktuj się z administratorem.',
        },
        { status: 200 }
      )
    }

    // Przygotuj wiadomości z system promptem
    const systemPrompt = buildSystemPrompt(messages)
    const apiMessages = [{ role: 'system', content: systemPrompt }, ...messages]

    // Wywołanie OpenAI API z tools
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: apiMessages,
        tools: tools,
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 800,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      throw new Error('OpenAI API request failed')
    }

    const data = await response.json()
    const choice = data.choices[0]
    const assistantMessage = choice?.message

    if (!assistantMessage) {
      throw new Error('No response from OpenAI')
    }

    // Obsługa tool calls
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolCalls = assistantMessage.tool_calls
      const toolResults: any[] = []

      // Wykonaj wszystkie tool calls
      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name
        const functionArgs = JSON.parse(toolCall.function.arguments)

        console.log(`Executing tool: ${functionName}`, functionArgs)

        const result = await executeToolCall(functionName, functionArgs, baseUrl)
        toolResults.push({
          tool_call_id: toolCall.id,
          result: result,
        })
      }

      // Przygotuj follow-up message z instrukcją użycia imienia
      const userName = extractUserNameFromMessages(messages)
      const followUpInstruction = userName 
        ? `\n\nINSTRUKCJA: Po wysłaniu wiadomości kontaktowej wracasz do normalnej rozmowy. PAMIĘTAJ: Użytkownik podał imię "${userName}" - MUSISZ używać go w KAŻDEJ odpowiedzi. NIE wysyłaj więcej emaili, chyba że użytkownik ponownie poprosi o kontakt z człowiekiem.`
        : '\n\nINSTRUKCJA: Po wysłaniu wiadomości kontaktowej wracasz do normalnej rozmowy. NIE wysyłaj więcej emaili, chyba że użytkownik ponownie poprosi o kontakt z człowiekiem.'

      // Po wykonaniu tool call, poproś AI o wygenerowanie odpowiedzi
      const toolMessages = [
        ...apiMessages,
        {
          role: 'assistant',
          content: null,
          tool_calls: toolCalls
        },
        {
          role: 'tool',
          content: JSON.stringify(toolResults[0].result) + followUpInstruction,
          tool_call_id: toolCalls[0].id
        }
      ]

      // Wywołaj AI ponownie
      const followUpResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: toolMessages,
          temperature: 0.7,
          max_tokens: 800,
        }),
      })

      if (followUpResponse.ok) {
        const followUpData = await followUpResponse.json()
        const followUpMessage = followUpData.choices[0]?.message

        if (followUpMessage?.content) {
          return NextResponse.json({
            message: followUpMessage.content,
          })
        }
      }

      // Fallback
      if (toolResults.length > 0 && toolResults[0].result.success) {
        return NextResponse.json({
          message: toolResults[0].result.message,
        })
      } else {
        return NextResponse.json({
          message: toolResults[0]?.result?.error || 'Wystąpił błąd podczas przetwarzania żądania.',
        })
      }
    }

    // Zwróć odpowiedź tekstową
    return NextResponse.json({
      message: assistantMessage.content,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      {
        message: 'Przepraszam, wystąpił błąd podczas przetwarzania Twojego pytania. Spróbuj ponownie.',
      },
      { status: 200 }
    )
  }
}