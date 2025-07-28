import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

/**
 * API endpoint for sending emails with PDF report attachments
 * This handles converting base64 PDF data to an attachment and sending via email
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

    // Extract base64 data - remove data URL prefix if present
    let base64Content = pdfData;
    if (pdfData.includes('base64,')) {
      base64Content = pdfData.split('base64,')[1];
    }

    // Create PDF buffer from base64 string
    const pdfBuffer = Buffer.from(base64Content, 'base64');

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: 'ssl0.ovh.net',
      port: 465,
      secure: true,
      auth: {
        user: process.env.OVH_EMAIL,
        pass: process.env.OVH_PASSWORD,
      },
    });

    // Set up email data with attachment
    const emailData = {
      from: `"Anna Piotrowiak-Wołosiuk" <${process.env.OVH_EMAIL}>`,
      to: recipient,
      subject: subject,
      text: message,
      attachments: [
        {
          filename: filename || 'Raport_WCAG22.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    // Send the email
    const info = await transporter.sendMail(emailData);
    console.log('📧 [send-report] E-mail wysłany pomyślnie:', info.messageId);
    
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
      { message: 'Email wysłany pomyślnie', messageId: info.messageId }, 
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
