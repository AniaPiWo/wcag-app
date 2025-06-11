import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  //console.log('📧 [send-email] Rozpoczęcie przetwarzania żądania');
  try {
    const body = await req.json();
    const { to, subject, text } = body;
    console.log('📧 [send-email] Otrzymane dane:', { to, subject, textLength: text?.length });

    if (!to || !subject || !text) {
      //console.log('📧 [send-email] Błąd: Brakujące pola', { to: !!to, subject: !!subject, text: !!text });
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    //console.log('📧 [send-email] Konfiguracja transportera');
    const transporter = nodemailer.createTransport({
      host: 'ssl0.ovh.net',
      port: 465,
      secure: true,
      auth: {
        user: process.env.OVH_EMAIL,
        pass: process.env.OVH_PASSWORD ? '******' : undefined,
      },
    });
/*     console.log('📧 [send-email] Dane uwierzytelniające:', { 
      host: 'ssl0.ovh.net', 
      hasEmail: !!process.env.OVH_EMAIL,
      hasPassword: !!process.env.OVH_PASSWORD,
      emailFirstChars: process.env.OVH_EMAIL ? process.env.OVH_EMAIL.substring(0, 3) + '...' : undefined
    }); */

    console.log('📧 [send-email] Próba wysłania e-maila');
    const info = await transporter.sendMail({
      from: `"Nazwa Nadawcy" <${process.env.OVH_EMAIL}>`,
      to,
      subject,
      text,
    });
    console.log('📧 [send-email] E-mail wysłany pomyślnie:', info.messageId);

    return NextResponse.json({ message: 'Email sent', messageId: info.messageId }, { status: 200 });
  } catch (error) {
    //console.error('📧 [send-email] Błąd wysyłania e-maila:', error);
    // Dodajemy więcej szczegółów o błędzie
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack?.substring(0, 200) : undefined
    };
    //console.error('📧 [send-email] Szczegóły błędu:', errorDetails);
    
    return NextResponse.json({ 
      message: 'Error sending email', 
      error: errorDetails.message 
    }, { status: 500 });
  }
}
