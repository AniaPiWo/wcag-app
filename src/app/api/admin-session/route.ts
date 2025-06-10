import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/admin-session';

export async function GET() {
  const isValid = await validateSession();
  return NextResponse.json({ valid: isValid });
}
