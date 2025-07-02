import { NextResponse } from 'next/server';
import { auditService } from '@/lib/db/audit-service';
import { validateSession } from '@/lib/auth/admin-session';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Brak ID audytu' }, { status: 400 });
  }
  const audit = await auditService.getAuditRequest(id);
  if (!audit) {
    return NextResponse.json({ error: 'Nie znaleziono audytu' }, { status: 404 });
  }
  return NextResponse.json(audit);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  // Sprawdź sesję administratora
  const isAdmin = await validateSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Nieautoryzowany dostęp' }, { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Brak ID audytu' }, { status: 400 });
  }

  try {
    await auditService.deleteAuditRequest(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Błąd podczas usuwania audytu:', error);
    return NextResponse.json({ error: 'Nie udało się usunąć audytu' }, { status: 500 });
  }
}
