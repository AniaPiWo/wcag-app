/* eslint-disable @typescript-eslint/no-unused-vars */
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
    console.log('📧 [contact-api] Rozpoczęcie przetwarzania żądania kontaktowego');
    
    const { name, email, phone, message, source }: ContactRequest = await request.json()
    
/*     console.log('📧 [contact-api] Otrzymane dane:', {
      name: name || 'BRAK',
      email: email || 'BRAK', 
      phone: phone || 'BRAK',
      messageLength: message?.length || 0,
      source: source || 'BRAK'
    }); */

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
      console.error('📧 [contact-api] BŁĄD: Brak RESEND_API_KEY w zmiennych środowiskowych');
      return NextResponse.json(
        { error: 'Konfiguracja serwera: brak klucza API do wysyłki emaili' }, 
        { status: 500 }
      );
    }
    
    console.log('📧 [contact-api] Konfiguracja Resend:', {
      hasApiKey: !!process.env.RESEND_API_KEY,
      fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      toEmail: process.env.RESEND_FROM_EMAIL || 'biuro@wcag.co'
    });

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
    console.log('📧 [contact-api] Inicjalizacja klienta Resend...');
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Przygotowanie parametrów emaila
    const emailParams = {
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: process.env.RESEND_FROM_EMAIL || 'biuro@wcag.co',
      subject: `🔔 Nowa wiadomość kontaktowa od ${name}`,
      text: emailContent,
      replyTo: email // Umożliwia odpowiedź bezpośrednio do użytkownika
    };
    
    console.log('📧 [contact-api] Parametry emaila:', {
      from: emailParams.from,
      to: emailParams.to,
      subject: emailParams.subject,
      replyTo: emailParams.replyTo,
      textLength: emailParams.text.length
    });

    // Wysyłka emaila przez Resend
    console.log('📧 [contact-api] Wysyłanie emaila przez Resend...');
    const { data, error } = await resend.emails.send(emailParams);
    
    if (error) {
      console.error('📧 [contact-api] BŁĄD Resend:', {
        error: error,
        errorMessage: error.message || 'Brak szczegółów błędu',
        errorName: error.name || 'Nieznany błąd',
        timestamp: new Date().toISOString()
      });
      return NextResponse.json(
        { error: 'Błąd wysyłania wiadomości. Spróbuj ponownie.' },
        { status: 500 }
      );
    }
    
    console.log('📧 [contact-api] ✅ E-mail wysłany pomyślnie przez Resend:', {
      messageId: data?.id,
      timestamp: new Date().toISOString(),
      recipient: emailParams.to
    });

    return NextResponse.json({
      success: true,
      message: 'Dziękuję za wiadomość! Odpowiem najszybciej jak mogę - zazwyczaj w ciągu 24 godzin.\n\nCzy mogę jeszcze w czymś pomóc? Możesz zadać pytanie o nasze usługi dostępności.'
    })

  } catch (error) {
    console.error('📧 [contact-api] KRYTYCZNY BŁĄD:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      type: typeof error,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    
    return NextResponse.json(
      {
        error: 'Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie.'
      },
      { status: 500 }
    )
  }
}
