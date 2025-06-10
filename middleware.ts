import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Import session constants
const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret';

// Validate session directly in middleware to avoid import issues
async function validateSessionInMiddleware(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return false;
  
  try {
    jwt.verify(token, SESSION_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
    // Protect /admin root and all subpages except /admin/login
  if ((pathname === '/admin' || (pathname.startsWith('/admin/') && pathname !== '/admin/login'))) {
    const isValid = await validateSessionInMiddleware(req);
    if (!isValid) {
      // Redirect to login page
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // If user is already authenticated and tries to access /admin/login, redirect to /admin
  if (pathname === '/admin/login') {
    const isValid = await validateSessionInMiddleware(req);
    if (isValid) {
      const adminUrl = new URL('/admin', req.url);
      return NextResponse.redirect(adminUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
  runtime: 'nodejs',
};
