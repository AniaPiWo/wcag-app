import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: NextRequest) {
  console.log('📧 [send-email] Rozpoczęcie przetwarzania żądania');
  try {
    const body = await req.json();
    const { to, subject, text } = body;
    console.log('📧 [send-email] Otrzymane dane:', { to, subject, textLength: text?.length });

    if (!to || !subject || !text) {
      //console.log('📧 [send-email] Błąd: Brakujące pola', { to: !!to, subject: !!subject, text: !!text });
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    // Validate Resend API key
    if (!process.env.RESEND_API_KEY) {
      console.error('📧 [send-email] Brak RESEND_API_KEY w zmiennych środowiskowych');
      return NextResponse.json(
        { message: 'Server configuration error: missing email API key' }, 
        { status: 500 }
      );
    }

    //console.log('📧 [send-email] Inicjalizacja Resend klienta');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to,
      subject,
      text,
    });

    if (error) {
      console.error('📧 [send-email] Błąd Resend:', error);
      throw new Error(`Resend API error: ${error.message}`);
    }

    console.log('📧 [send-email] E-mail wysłany pomyślnie przez Resend:', data?.id);

    return NextResponse.json({ message: 'Email sent', messageId: data?.id }, { status: 200 });
  } catch (error) {
    console.error('📧 [send-email] Błąd wysyłania e-maila:', error);

    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack?.substring(0, 200) : undefined
    };

    
    return NextResponse.json({ 
      message: 'Error sending email', 
      error: errorDetails.message 
    }, { status: 500 });
  }
}
