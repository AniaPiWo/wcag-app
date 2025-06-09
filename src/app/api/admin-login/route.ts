import { NextRequest, NextResponse } from 'next/server';
import { createSession, SESSION_COOKIE_NAME } from '@/lib/auth/admin-session';

export async function POST(req: NextRequest) {
  const { login, password } = await req.json();
  const adminLogin = process.env.ADMIN_LOGIN;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (login === adminLogin && password === adminPassword) {
    // Tworzymy bezpieczną sesję
    const sessionId = await createSession();
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 2, // 2h
    });
    return response;
  } else {
    return NextResponse.json({ success: false, error: 'Nieprawidłowy login lub hasło' }, { status: 401 });
  }
}
