import type { AuditSummary } from '@/app/api/audit/types';

interface AuditEmailData {
  name: string;
  summary: AuditSummary;
  aiAnalysis: string | null;
}

export function buildAuditResultsEmail({ name, summary, aiAnalysis }: AuditEmailData): string {
  const greeting = name ? `Witaj ${name},` : 'Witaj,';

  return `${greeting}

Poniżej znajdują się wyniki audytu dostępności dla strony ${summary.url}:

Podsumowanie audytu:
Liczba wszystkich problemów: ${summary.totalIssuesCount}
Krytyczne: ${summary.criticalCount}
Poważne: ${summary.seriousCount}
Umiarkowane: ${summary.moderateCount}
Drobne: ${summary.minorCount}
Liczba zaliczonych reguł: ${summary.passedRules}
Wymaga audytu manualnego: ${summary.incompleteRules}

${aiAnalysis ?? ''}

Dziękujemy za skorzystanie z naszego narzędzia!

--
Pozdrawiam serdecznie,
Anna Piotrowiak
Specjalista dostępności cyfrowej

https://wcag.co
${process.env.RESEND_FROM_EMAIL ?? 'biuro@wcag.co'}`;
}

export function buildAuditResultsSubject(url: string): string {
  return `Wyniki audytu dostępności dla strony ${url}`;
}
