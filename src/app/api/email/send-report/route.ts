import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

/**
 * API endpoint for sending emails with PDF report attachments
 * This handles converting base64 PDF data to an attachment and sending via email
 * Uses Resend API for reliable email delivery (works on Railway and other PaaS platforms)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { auditId, recipient, subject, message, pdfData, filename } = body;
    
    // Validate required fields
    if (!recipient || !subject || !message || !pdfData) {
      return NextResponse.json(
        { message: 'Brakujące dane: wymagany adresat, temat, treść i dane PDF' }, 
        { status: 400 }
      );
    }

    // Validate Resend API key
    if (!process.env.RESEND_API_KEY) {
      console.error('📧 [send-report] Brak RESEND_API_KEY w zmiennych środowiskowych');
      return NextResponse.json(
        { message: 'Konfiguracja serwera: brak klucza API do wysyłki emaili' }, 
        { status: 500 }
      );
    }

    // Extract base64 data - remove data URL prefix if present
    let base64Content = pdfData;
    if (pdfData.includes('base64,')) {
      base64Content = pdfData.split('base64,')[1];
    }

    // Initialize Resend client
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send the email with Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: recipient,
      subject: subject,
      text: message,
      attachments: [
        {
          filename: filename || 'Raport_WCAG22.pdf',
          content: Buffer.from(base64Content, 'base64'),
        }
      ]
    });
    
    if (error) {
      console.error('📧 [send-report] Błąd Resend:', error);
      throw new Error(`Resend API error: ${error.message}`);
    }
    
    console.log('📧 [send-report] E-mail wysłany pomyślnie przez Resend:', data?.id);
    
    // Update audit record if auditId provided - mark it as completed and store timestamp in the status field
    if (auditId) {
      try {
        const emailInfo = `Email wysłany do: ${recipient} - ${new Date().toLocaleString('pl-PL')}`;
        
        await prisma.auditRequest.update({
          where: { id: auditId },
          data: { 
            updatedAt: new Date(),
            status: `completed_email_sent`,
            // Store email info in the clientReadyAudit field if it exists already
            clientReadyAudit: {
              set: await prisma.auditRequest.findUnique({
                where: { id: auditId },
                select: { clientReadyAudit: true }
              }).then(result => {
                if (!result?.clientReadyAudit) return JSON.stringify({emailInfo});
                
                try {
                  const existing = JSON.parse(result.clientReadyAudit);
                  return JSON.stringify({
                    ...existing,
                    emailInfo
                  });
                } catch {
                  return JSON.stringify({emailInfo});
                }
              })
            }
          }
        });
        console.log(`📧 [send-report] Zaktualizowano rekord audytu ${auditId}`);
      } catch (dbError) {
        console.error('📧 [send-report] Błąd aktualizacji rekordu audytu:', dbError);
        // Non-critical error, continue with success response
      }
    }

    return NextResponse.json(
      { message: 'Email wysłany pomyślnie', messageId: data?.id }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('📧 [send-report] Błąd wysyłania e-maila:', error);

    const errorDetails = {
      message: error instanceof Error ? error.message : 'Nieznany błąd',
      name: error instanceof Error ? error.name : 'Nieznany',
    };

    return NextResponse.json({ 
      message: 'Błąd wysyłania e-maila', 
      error: errorDetails.message 
    }, { status: 500 });
  }
}
