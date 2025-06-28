import { NextResponse } from 'next/server';
import { auditService } from '@/lib/db/audit-service';

// Usuwamy walidację sesji, ponieważ jest już obsługiwana przez middleware
// Middleware w pliku middleware.ts już chroni ścieżki /admin/* i przekierowuje do strony logowania

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
