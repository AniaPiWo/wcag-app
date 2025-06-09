import { NextResponse } from 'next/server';
import { auditService } from '@/lib/db/audit-service';

export async function GET() {
  const audits = await auditService.getAuditRequests();
  return NextResponse.json(audits);
}
