import { NextResponse } from 'next/server';
import { auditService } from '@/lib/db/audit-service';

export async function GET() {
  try {
    const audits = await auditService.getAuditRequests({ auditType: 'automated' });
    return NextResponse.json(audits);
  } catch (error) {
    console.error('Błąd podczas pobierania audytów automatycznych:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas pobierania audytów automatycznych' },
      { status: 500 }
    );
  }
}
