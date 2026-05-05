import { NextRequest, NextResponse } from 'next/server';
import { auditService } from '@/lib/db/audit-service';
import { queueAudit } from '../audit/queue';
import type { AxeViolation, AuditSummary } from '../audit/types';

// Importujemy funkcję runAccessibilityAudit bezpośrednio z pliku
import { runAccessibilityAudit } from '../audit/route';

async function runAuditInBackground(auditId: string, url: string) {
  try {
    await auditService.updateAuditRequestStatus(auditId, '', 'in-progress');

    const auditResults = await queueAudit(url, runAccessibilityAudit) as { summary: AuditSummary; violations: AxeViolation[] };

    await auditService.saveAuditResults(auditId, auditResults);

    await auditService.runAiAnalysisInBackground(
      auditId,
      auditResults.violations,
      auditResults.summary
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Błąd audytu ${auditId}:`, message);
    await auditService.recordFailedAudit(auditId, message);
  }
}

export async function POST(request: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers });
  }

  try {
    const { url, email, name } = await request.json();
    
    // Tworzenie rekordu w bazie danych
    const auditRequest = await auditService.createAuditRequest({
      url,
      email,
      name
    });
    
    // Aktualizacja statusu na 'queued'
    await auditService.updateAuditRequestStatus(auditRequest.id, '', 'pending');
    
    // Uruchomienie audytu w tle bez blokowania odpowiedzi HTTP
    runAuditInBackground(auditRequest.id, url);
    
    return NextResponse.json({
      success: true,
      requestId: auditRequest.id,
      message: 'Audyt został dodany do kolejki.'
    }, { headers });
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Wystąpił błąd podczas dodawania audytu do kolejki.';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage
    }, { status: 500, headers });
  }
}
