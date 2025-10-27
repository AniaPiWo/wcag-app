import { NextRequest, NextResponse } from 'next/server';
import { auditService } from '@/lib/db/audit-service';
import { queueAudit } from '../audit/queue';
import type { AxeViolation, AuditSummary } from '../audit/types';
import { MemoryMonitor } from '@/lib/monitoring/memory-monitor';

// Importujemy funkcję runAccessibilityAudit bezpośrednio z pliku
import { runAccessibilityAudit } from '../audit/route';

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
    await auditService.updateAuditRequestStatus(auditRequest.id, 'Audyt w kolejce', '', 'pending');
    
    // Dodanie do kolejki bez blokowania odpowiedzi HTTP
    // Używamy setTimeout, aby uruchomić proces w tle
    setTimeout(() => {
      // Rozpocznij monitorowanie pamięci
      const monitor = new MemoryMonitor();
      monitor.start();
      console.log(`[RAM Monitor] Rozpoczęto monitorowanie dla audytu ${auditRequest.id}`);
      
      auditService.updateAuditRequestStatus(auditRequest.id, 'Audyt w toku', '', 'in-progress')
        .then(() => {
          queueAudit(url, runAccessibilityAudit)
            .then((auditResults: { summary: AuditSummary; violations: AxeViolation[] }) => {
              auditService.saveAuditResults(auditRequest.id, auditResults)
                .then(() => {
                  console.log(`Audyt ${auditRequest.id} zakończony sukcesem`);
                  
                  // Uruchomienie analizy AI w tle
                  auditService.runAiAnalysisInBackground(
                    auditRequest.id, 
                    auditResults.violations, 
                    auditResults.summary
                  ).catch(aiError => {
                    console.error('Błąd analizy AI:', aiError);
                  }).finally(() => {
                    // Zatrzymaj monitorowanie i zapisz raport
                    const report = monitor.stop();
                    if (report) {
                      console.log(`[RAM Monitor] Audyt ${auditRequest.id} zakończony:`);
                      console.log(MemoryMonitor.formatReport(report));
                      
                      // Zapisz raport do pliku
                      MemoryMonitor.saveReport(report, `audit-${auditRequest.id}-${Date.now()}.json`)
                        .catch(err => console.error('Błąd zapisywania raportu RAM:', err));
                    }
                  });
                })
                .catch(saveError => {
                  console.error(`Błąd zapisywania wyników audytu ${auditRequest.id}:`, saveError);
                  auditService.recordFailedAudit(auditRequest.id, `Błąd zapisywania wyników: ${saveError.message}`);
                });
            })
            .catch(auditError => {
              console.error(`Błąd audytu ${auditRequest.id}:`, auditError);
              auditService.recordFailedAudit(auditRequest.id, `Błąd audytu: ${auditError.message}`);
            });
        })
        .catch(statusError => {
          console.error(`Błąd aktualizacji statusu audytu ${auditRequest.id}:`, statusError);
        });
    }, 0);
    
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
