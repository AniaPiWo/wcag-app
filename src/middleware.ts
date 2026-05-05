import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';
import crypto from 'crypto';

// Import session constants from admin-session module
import { SESSION_COOKIE_NAME } from '@/lib/auth/admin-session';

// ---------------------------------------------------------------------------
// Rate limiting
// Uwaga: Map jest per-instancja procesu. W środowisku serverless (Vercel)
// każda zimna instancja zaczyna od zera — rate limiting jest best-effort.
// Dla gwarancji produkcyjnych użyj zewnętrznego store (np. Upstash Redis).
// ---------------------------------------------------------------------------
const apiRequests = new Map<string, { count: number; timestamp: number }>();

const rateLimits: Record<string, { windowMs: number; max: number }> = {
  '/api/admin-login': { windowMs: 15 * 60 * 1000, max: 10 },
  '/api/queue-audit': { windowMs: 60 * 1000, max: 30 },
  '/api/audit':       { windowMs: 60 * 1000, max: 30 },
  default:            { windowMs: 60 * 1000, max: 60 },
};

function applyRateLimit(req: NextRequest): NextResponse | null {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const { pathname } = req.nextUrl;

  const limitConfig =
    Object.entries(rateLimits)
      .filter(([key]) => key !== 'default')
      .find(([key]) => pathname.startsWith(key))?.[1] ?? rateLimits.default;

  const key = `${ip}:${pathname}`;
  const now = Date.now();
  const data = apiRequests.get(key) ?? { count: 0, timestamp: now };

  if (now - data.timestamp > limitConfig.windowMs) {
    data.count = 1;
    data.timestamp = now;
  } else {
    data.count++;
  }
  apiRequests.set(key, data);

  if (data.count > limitConfig.max) {
    const retryAfter = Math.ceil((data.timestamp + limitConfig.windowMs - now) / 1000);
    const reset = Math.ceil((data.timestamp + limitConfig.windowMs) / 1000);
    return NextResponse.json(
      { error: 'Zbyt wiele zapytań. Spróbuj ponownie później.', retryAfter },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': limitConfig.max.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// JWT session validation
// ---------------------------------------------------------------------------
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error('SESSION_SECRET jest wymagany! Ustaw go w pliku .env');
  }

  if (secret.length < 32) {
    throw new Error(`SESSION_SECRET jest za krótki (${secret.length} znaków). Wymagane minimum: 32 znaki`);
  }

  if (secret === 'dev-secret' || secret.includes('example')) {
    throw new Error('SESSION_SECRET nie może być domyślną wartością');
  }

  return secret;
}

const SESSION_SECRET = getSessionSecret();

async function validateSessionInMiddleware(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return false;

  try {
    const secretKey = new TextEncoder().encode(SESSION_SECRET);
    await jose.jwtVerify(token, secretKey, { algorithms: ['HS256'] });
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rate limiting dla wszystkich ścieżek /api
  if (pathname.startsWith('/api/')) {
    const rateLimitResponse = applyRateLimit(req);
    if (rateLimitResponse) return rateLimitResponse;
  }

  // API Key dla /api/admin-audits
  if (pathname === '/api/admin-audits' || pathname.startsWith('/api/admin-audits/')) {
    const apiKey = req.headers.get('x-api-key');
    const expectedApiKey = process.env.API_SECRET_KEY;

    if (apiKey && expectedApiKey && apiKey.length === expectedApiKey.length) {
      const apiKeyBuffer = Buffer.from(apiKey);
      const expectedBuffer = Buffer.from(expectedApiKey);

      if (crypto.timingSafeEqual(apiKeyBuffer, expectedBuffer)) {
        return NextResponse.next();
      }
    }
  }

  // Ochrona panelu admina
  if (pathname === '/admin' || (pathname.startsWith('/admin/') && pathname !== '/admin/login')) {
    const isValid = await validateSessionInMiddleware(req);
    if (!isValid) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  // Przekierowanie zalogowanego admina z /admin/login do /admin
  if (pathname === '/admin/login') {
    const isValid = await validateSessionInMiddleware(req);
    if (isValid) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }

  // Nagłówki bezpieczeństwa
  const response = NextResponse.next();

  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://*.vercel-insights.com; frame-ancestors 'self';"
  );
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (pathname.startsWith('/api/')) {
    const { max } = Object.entries(rateLimits)
      .filter(([key]) => key !== 'default')
      .find(([key]) => pathname.startsWith(key))?.[1] ?? rateLimits.default;
    const key = `${req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'}:${pathname}`;
    const data = apiRequests.get(key);
    if (data) {
      response.headers.set('X-RateLimit-Limit', max.toString());
      response.headers.set('X-RateLimit-Remaining', Math.max(0, max - data.count).toString());
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/api/:path*',
  ],
};
