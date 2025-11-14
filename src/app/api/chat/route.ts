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

function buildSystemPrompt(messages: any[] = []): string {
	const userName = extractUserNameFromMessages(messages);
	const contactData = extractContactDataFromMessages(messages);
	const { offers, promotions, contactInfo, businessInfo } = chatbotKnowledgeBase;
	
	let userContext = '';
	if (userName) {
		userContext += `\n\nPAMIĘTAJ: Użytkownik podał swoje imię: ${userName}. Zwracaj się do niego po imieniu w rozmowie.`;
	}
	if (contactData) {
		userContext += `\n\nDANE KONTAKTOWE: Użytkownik wcześniej podał: ${contactData.email ? `email: ${contactData.email}` : ''}${contactData.email && contactData.phone ? ', ' : ''}${contactData.phone ? `telefon: ${contactData.phone}` : ''}. Przy kolejnym kontakcie poproś o potwierdzenie tych danych.`;
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
1. JEŚLI ZNASZ IMIĘ UŻYTKOWNIKA - ZAWSZE zwracaj się do niego po imieniu w każdej odpowiedzi
2. NAJPIERW przeanalizuj pytanie i określ kategorię (audyt/dostosowanie/nowa strona/ogólne)
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

KONTAKT Z CZŁOWIEKIEM:
Jeśli użytkownik WYRAŹNIE chce kontakt z człowiekiem (np. "chcę kontakt z człowiekiem", "napisz do człowieka", "chcę porozmawiać z człowiekiem", "kontakt" itp):

PIERWSZY KONTAKT (użytkownik nie podawał wcześniej danych):
ETAP 1 - PIERWSZA WIADOMOŚĆ: Zapytaj o imię i dane kontaktowe w jednej wiadomości:
"Aby przekazać Twoją wiadomość do naszego eksperta, potrzebuję:
• Twoje imię
• Email i/lub telefon"

ETAP 2 - DRUGA WIADOMOŚĆ: Po otrzymaniu imienia i kontaktu, poproś o treść:
"Dziękuję [IMIĘ]! Teraz napisz treść swojej wiadomości:"

KOLEJNY KONTAKT (użytkownik już wcześniej podawał dane):
JEDNA WIADOMOŚĆ: Zapytaj o aktualizację danych lub od razu o treść:
"[IMIĘ], mam Twój adres e-mail: [email] / mam Twój telefon: [telefon].
Czy chcesz go zmienić lub uzupełnić?
Jeśli nie, możesz od razu wpisać treść wiadomości."

PRZYKŁADY:
Pierwszy kontakt:
User: "kontakt" → AI: "Aby przekazać Twoją wiadomość do naszego eksperta, potrzebuję: • Twoje imię • Email i/lub telefon"
User: "Anna, anna@test.com" → AI: "Dziękuję Anna! Teraz napisz treść swojej wiadomości:"

Kolejny kontakt:
User: "kontakt" → AI: "Anna, mam Twój adres e-mail: anna@test.com.
Czy chcesz go zmienić lub uzupełnić?
Jeśli nie, możesz od razu wpisać treść wiadomości."

Następnie wyślij dane używając funkcji CONTACT_HUMAN z wszystkimi zebranymi informacjami.

WAŻNE: 
- Po zebraniu danych kontaktowych ZAWSZE zwracaj się do użytkownika po imieniu w dalszej rozmowie
- Treść wiadomości przekazuj DOKŁADNIE jak użytkownik napisał - NIE zmieniaj, nie poprawiaj, nie dodawaj nic
- Po wysłaniu wiadomości kontaktowej WRACASZ do normalnej rozmowy o usługach WCAG (ale pamiętaj imię!)
- NIE wysyłaj kolejnych wiadomości emailem, chyba że użytkownik ponownie poprosi o kontakt z człowiekiem
- Funkcji CONTACT_HUMAN używaj TYLKO gdy użytkownik wyraźnie chce kontakt z człowiekiem
</instructions>`
}

// Definicja dostępnych tools/functions
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
						description: 'Imię użytkownika'
					},
					email: {
						type: 'string',
						description: 'Adres email użytkownika'
					},
					phone: {
						type: 'string',
						description: 'Numer telefonu użytkownika (opcjonalny)'
					},
					message: {
						type: 'string',
						description: 'Treść wiadomości od użytkownika'
					}
				},
				required: ['name', 'message']
			}
		}
	}
]

// Funkcja pomocnicza do wyciągania imienia z historii rozmowy
function extractUserNameFromMessages(messages: any[]): string | null {
	// Szukaj w historii wiadomości czy użytkownik już podawał imię
	for (let i = messages.length - 1; i >= 0; i--) {
		const message = messages[i];
		
		// Szukaj w treści wiadomości asystenta czy wspomina imię użytkownika
		if (message.role === 'assistant' && message.content) {
			// Szukaj wzorców typu "Dziękuję [Imię]" lub "Cześć [Imię]"
			const nameMatch = message.content.match(/(?:Dziękuję|Cześć|Witaj|Hej)\s+([A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+)[!,\s]/i);
			if (nameMatch && nameMatch[1]) {
				return nameMatch[1];
			}
		}
		
		// Szukaj w tool calls (dla przyszłych implementacji)
		if (message.role === 'assistant' && message.tool_calls) {
			for (const toolCall of message.tool_calls) {
				if (toolCall.function.name === 'CONTACT_HUMAN') {
					try {
						const args = JSON.parse(toolCall.function.arguments);
						if (args.name) {
							return args.name;
						}
					} catch (e) {
						// Ignoruj błędy parsowania
					}
				}
			}
		}
	}
	return null;
}

// Funkcja pomocnicza do wyciągania danych kontaktowych z historii rozmowy
function extractContactDataFromMessages(messages: any[]): { email?: string, phone?: string } | null {
	// Szukaj w historii wiadomości czy użytkownik już podawał dane kontaktowe
	for (let i = messages.length - 1; i >= 0; i--) {
		const message = messages[i];
		
		// Szukaj w tool calls
		if (message.role === 'assistant' && message.tool_calls) {
			for (const toolCall of message.tool_calls) {
				if (toolCall.function.name === 'CONTACT_HUMAN') {
					try {
						const args = JSON.parse(toolCall.function.arguments);
						if (args.email || args.phone) {
							return {
								email: args.email,
								phone: args.phone
							};
						}
					} catch (e) {
						// Ignoruj błędy parsowania
					}
				}
			}
		}
	}
	return null;
}

// Wykonanie tool call
async function executeToolCall(toolName: string, args: any): Promise<any> {
	switch (toolName) {
		case 'CONTACT_HUMAN':
			try {
				// Dodatkowa walidacja danych kontaktowych
				if (!args.name || !args.message) {
					return {
						success: false,
						error: 'Brak wymaganych danych. Poproś użytkownika o podanie imienia i treści wiadomości.'
					}
				}

				if (!args.email && !args.phone) {
					return {
						success: false,
						error: 'Brak danych kontaktowych. Poproś użytkownika o podanie emaila i / lub telefonu.'
					}
				}

				console.log('📧 [CONTACT_HUMAN] Wysyłanie nowej wiadomości kontaktowej:', {
					name: args.name,
					email: args.email || 'brak',
					phone: args.phone || 'brak',
					messageLength: args.message?.length || 0
				});

				const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/contact`, {
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

// Chat API z obsługą tools

export async function POST(request: NextRequest) {
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
					message:
						'Przepraszam, asystent AI nie jest obecnie skonfigurowany. Skontaktuj się z administratorem.',
				},
				{ status: 200 }
			)
		}

		// Przygotuj wiadomości z system promptem dla WCAG.co
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

		// Sprawdź czy model chce wywołać funkcję
		if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
			const toolCalls = assistantMessage.tool_calls
			const toolResults: any[] = []

			// Wykonaj wszystkie tool calls
			for (const toolCall of toolCalls) {
				const functionName = toolCall.function.name
				const functionArgs = JSON.parse(toolCall.function.arguments)

				console.log(`Executing tool: ${functionName}`, functionArgs)

				const result = await executeToolCall(functionName, functionArgs)
				toolResults.push({
					tool_call_id: toolCall.id,
					result: result,
				})
			}

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
					content: JSON.stringify(toolResults[0].result) + `\n\nINSTRUKCJA: Po wysłaniu wiadomości kontaktowej wracasz do normalnej rozmowy o usługach WCAG. PAMIĘTAJ: Użytkownik podał swoje imię (${toolCalls[0].function.arguments ? JSON.parse(toolCalls[0].function.arguments).name : 'nieznane'}) - zwracaj się do niego po imieniu w dalszej rozmowie. NIE wysyłaj więcej emaili, chyba że użytkownik ponownie poprosi o kontakt z człowiekiem.`,
					tool_call_id: toolCalls[0].id
				}
			]

			// Wywołaj AI ponownie aby wygenerował odpowiedź po tool call
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

			// Fallback - zwróć wynik tool call
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
