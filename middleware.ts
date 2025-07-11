import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Import session constants from admin-session module
import { SESSION_COOKIE_NAME } from '@/lib/auth/admin-session';

// Pobierz sekret JWT bezpośrednio z zmiennych środowiskowych
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret';

// Validate session directly in middleware to avoid import issues
async function validateSessionInMiddleware(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  
  // Dodaj szczegółowe debugowanie cookie
  console.log(`\x1b[35m📝 [Cookie Debug] Sprawdzanie cookie ${SESSION_COOKIE_NAME}: ${token ? token.substring(0, 10) + '...' : 'brak'}\x1b[0m`);
  
  // Wyświetl wszystkie cookies dla debugowania
  console.log('\x1b[35m📝 [Cookie Debug] Wszystkie cookies:\x1b[0m');
  req.cookies.getAll().forEach(cookie => {
    console.log(`\x1b[35m📝 [Cookie Debug] - ${cookie.name}: ${cookie.value.substring(0, 10)}...\x1b[0m`);
  });
  
  if (!token) {
    console.log('\x1b[31m❌ [Auth Debug] Brak tokenu w cookie\x1b[0m');
    return false;
  }
  
  try {
    const decoded = jwt.verify(token, SESSION_SECRET);
    console.log(`\x1b[32m✅ [Auth Debug] Token zweryfikowany pomyślnie: ${JSON.stringify(decoded)}\x1b[0m`);
    return true;
  } catch (error) {
    console.log(`\x1b[31m❌ [Auth Debug] Błąd weryfikacji tokenu: ${error}\x1b[0m`);
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  console.log(`\x1b[35m🔄 [Middleware] Przetwarzanie ścieżki: ${pathname}\x1b[0m`);
  
  // Protect /admin root and all subpages except /admin/login
  if ((pathname === '/admin' || (pathname.startsWith('/admin/') && pathname !== '/admin/login'))) {
    console.log('\x1b[33m🔍 [Auth Check] Sprawdzanie sesji dla ścieżki administracyjnej\x1b[0m');
    const isValid = await validateSessionInMiddleware(req);
    
    if (!isValid) {
      console.log('\x1b[31m❌ [Auth Fail] Sesja nieprawidłowa, przekierowanie do logowania\x1b[0m');
      // Redirect to login page
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
    
    console.log('\x1b[32m✅ [Auth Success] Sesja prawidłowa, kontynuacja\x1b[0m');
  }
  
  // If user is already authenticated and tries to access /admin/login, redirect to /admin
  if (pathname === '/admin/login') {
    console.log('\x1b[33m🔍 [Auth Check] Sprawdzanie sesji dla strony logowania\x1b[0m');
    const isValid = await validateSessionInMiddleware(req);
    
    if (isValid) {
      console.log('\x1b[32m✅ [Auth Success] Sesja prawidłowa, przekierowanie do panelu admina\x1b[0m');
      const adminUrl = new URL('/admin', req.url);
      return NextResponse.redirect(adminUrl);
    }
    
    console.log('\x1b[33mℹ️ [Auth Info] Sesja nieprawidłowa, pozostanie na stronie logowania\x1b[0m');
  }
  
  // Dodaj nagłówki bezpieczeństwa
  const response = NextResponse.next();
  
  // Content-Security-Policy - ogranicza źródła zasobów
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://*.vercel-insights.com; frame-ancestors 'self';"
  );
  
  // X-Content-Type-Options - zapobiega sniffing MIME
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // X-Frame-Options - zapobiega clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // X-XSS-Protection - dodatkowa warstwa ochrony XSS dla starszych przeglądarek
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer-Policy - kontroluje informacje referrer
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Strict-Transport-Security - wymusza HTTPS
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );
  
  // Permissions-Policy - kontroluje dostęp do funkcji przeglądarki
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  
  return response;
}

// Konfiguracja middleware - określa, które ścieżki mają być chronione
export const config = {
  matcher: [
    /*
     * Dopasuj wszystkie ścieżki administracyjne:
     * - /admin (strona główna panelu)
     * - /admin/* (wszystkie podstrony panelu)
     */
    '/admin',
    '/admin/:path*',
  ],
};
