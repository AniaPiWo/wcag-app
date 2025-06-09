import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/admin-session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Chroń tylko podstrony admina, ale NIE /admin (root)
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const isValid = await validateSession();
    if (!isValid) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/admin';
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
  runtime: 'nodejs',
};
