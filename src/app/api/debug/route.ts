import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Pobierz pierwszy rekord z tabeli AuditRequest
    const audit = await prisma.auditRequest.findFirst({
      where: { auditType: 'manual' }
    });
    
    // Sprawdź dostępne pola w rekordzie
    const fields = audit ? Object.keys(audit) : [];
    
    // Sprawdź czy pole consolidatedAuditAISummary istnieje
    const hasConsolidatedField = fields.includes('consolidatedAuditAISummary');
    
    return NextResponse.json({ 
      success: true, 
      fields,
      hasConsolidatedField,
      auditSample: audit
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
