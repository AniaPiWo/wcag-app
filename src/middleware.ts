import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Import session constants
const SESSION_COOKIE_NAME = 'admin_session';

// Funkcja do pobierania i walidacji sekretu JWT
function getJwtSecret(): string {
  const secret = process.env.SESSION_SECRET;
  
  // W środowisku produkcyjnym wymagamy silnego sekretu
  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret.length < 32) {
      console.error('OSTRZEŻENIE: SESSION_SECRET powinien być ustawiony w produkcji i mieć co najmniej 32 znaki');
    }
  }
  
  // W środowisku deweloperskim ostrzegamy, ale pozwalamy na użycie domyślnego sekretu
  if (!secret) {
    console.warn('\x1b[33m%s\x1b[0m', 'OSTRZEŻENIE: Używanie domyślnego sekretu JWT. To jest niebezpieczne w produkcji!');
    return 'dev-secret';
  }
  
  return secret;
}

const SESSION_SECRET = getJwtSecret();

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
    '/admin/(.*)',
  ],
};
