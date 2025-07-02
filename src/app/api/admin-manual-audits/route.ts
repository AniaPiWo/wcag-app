import { NextResponse } from 'next/server';
import { auditService } from '@/lib/db/audit-service';

export async function GET() {
  try {
    const audits = await auditService.getAuditRequests({ auditType: 'manual' });
    return NextResponse.json(audits);
  } catch (error) {
    console.error('Błąd podczas pobierania audytów manualnych:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas pobierania audytów manualnych' },
      { status: 500 }
    );
  }
}
