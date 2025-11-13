import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

interface ContactRequest {
  name: string
  email: string
  phone?: string
  message: string
  source: 'chatbot'
}

export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { name, email, phone, message, source }: ContactRequest = await request.json()

    // Walidacja danych - wymagane: imię, wiadomość i przynajmniej email LUB telefon
    if (!name || !message) {
      return NextResponse.json(
        { error: 'Imię i wiadomość są wymagane' },
        { status: 400 }
      )
    }

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Podaj email lub telefon' },
        { status: 400 }
      )
    }

    // Walidacja email (tylko jeśli podany)
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Nieprawidłowy adres email' },
          { status: 400 }
        )
      }
    }

    // Walidacja klucza API Resend
    if (!process.env.RESEND_API_KEY) {
      console.error('📧 [contact] Brak RESEND_API_KEY w zmiennych środowiskowych');
      return NextResponse.json(
        { error: 'Konfiguracja serwera: brak klucza API do wysyłki emaili' }, 
        { status: 500 }
      );
    }

    // Przygotowanie treści emaila
    const emailContent = `
🔔 NOWA WIADOMOŚĆ KONTAKTOWA Z WCAG.co

👤 Dane kontaktowe:
Imię: ${name}
${email ? `Email: ${email}` : ''}
${phone ? `Telefon: ${phone}` : ''}

💬 Dokładna treść wiadomości od użytkownika:
${message}

---
📅 Wysłano: ${new Date().toLocaleString('pl-PL')}
🤖 Źródło: Chatbot WCAG.co
    `.trim()

    // Inicjalizacja klienta Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Wysyłka emaila przez Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: process.env.CONTACT_EMAIL || 'biuro@wcag.co', // Twój email
      subject: `🔔 Nowa wiadomość kontaktowa od ${name}`,
      text: emailContent,
      replyTo: email // Umożliwia odpowiedź bezpośrednio do użytkownika
    });
    
    if (error) {
      console.error('📧 [contact] Błąd Resend:', error);
      return NextResponse.json(
        { error: 'Błąd wysyłania wiadomości. Spróbuj ponownie.' },
        { status: 500 }
      );
    }
    
    console.log('📧 [contact] E-mail wysłany pomyślnie przez Resend:', data?.id);

    return NextResponse.json({
      success: true,
      message: 'Dziękuję za wiadomość! Odpowiem najszybciej jak mogę - zazwyczaj w ciągu 24 godzin.\n\nCzy mogę jeszcze w czymś pomóc? Możesz zadać pytanie o nasze usługi dostępności.'
    })

  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      {
        error: 'Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie.'
      },
      { status: 500 }
    )
  }
}
