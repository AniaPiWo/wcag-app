import { Resend } from 'resend';
import type { AuditSummary } from '@/app/api/audit/types';
import { buildAuditResultsEmail, buildAuditResultsSubject } from './templates/audit-results';

function getResendClient(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('Brak RESEND_API_KEY w zmiennych środowiskowych');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
}

export async function sendAuditResults({
  to,
  name,
  summary,
  aiAnalysis,
}: {
  to: string;
  name: string;
  summary: AuditSummary;
  aiAnalysis: string | null;
}): Promise<void> {
  const resend = getResendClient();
  const subject = buildAuditResultsSubject(summary.url);
  const text = buildAuditResultsEmail({ name, summary, aiAnalysis });
  const from = `Audyt Dostępności <${getFromEmail()}>`;

  const { error } = await resend.emails.send({ from, to, subject, text });
  if (error) {
    throw new Error(`Resend API error: ${error.message}`);
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? 'biuro@wcag.co';
  if (to !== adminEmail) {
    const { error: copyError } = await resend.emails.send({
      from,
      to: adminEmail,
      subject: `Kopia: ${subject}`,
      text,
    });
    if (copyError) {
      // Kopia do biura nie jest krytyczna — logujemy i kontynuujemy
      console.warn('Błąd przy wysyłce kopii do biura:', copyError);
    }
  }
}
