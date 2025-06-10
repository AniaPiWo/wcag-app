import { NextRequest, NextResponse } from 'next/server';
import { csrfMiddleware } from '@/lib/csrf';

// Mapa do śledzenia zapytań API
const apiRequests = new Map<string, { count: number, timestamp: number }>();

// Limity zapytań dla różnych endpointów
const rateLimits: Record<string, { windowMs: number, max: number }> = {
  default: { windowMs: 60 * 1000, max: 60 }, // 60 zapytań na minutę domyślnie
  '/api/admin-login': { windowMs: 15 * 60 * 1000, max: 10 }, // 10 zapytań na 15 minut dla logowania
  '/api/audit': { windowMs: 60 * 1000, max: 30 }, // 30 zapytań na minutę dla audytów
};

export async function middleware(req: NextRequest) {
  // Pobierz IP klienta
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const path = req.nextUrl.pathname;
  
  // Wybierz odpowiedni limit dla danego endpointu
  const limit = Object.entries(rateLimits).find(([key]) => path.startsWith(key))?.[1] || rateLimits.default;
  
  // Utwórz klucz dla mapy (IP + ścieżka)
  const key = `${ip}:${path}`;
  
  // Pobierz aktualne dane o zapytaniach
  const now = Date.now();
  const requestData = apiRequests.get(key) || { count: 0, timestamp: now };
  
  // Sprawdź, czy minął okres okna czasowego
  if (now - requestData.timestamp > limit.windowMs) {
    // Resetuj licznik, jeśli minął okres okna
    requestData.count = 1;
    requestData.timestamp = now;
  } else {
    // Zwiększ licznik zapytań
    requestData.count++;
  }
  
  // Zapisz zaktualizowane dane
  apiRequests.set(key, requestData);
  
  // Sprawdź, czy przekroczono limit
  if (requestData.count > limit.max) {
    // Oblicz czas do resetowania limitu
    const resetTime = new Date(requestData.timestamp + limit.windowMs);
    
    // Zwróć odpowiedź 429 Too Many Requests
    return NextResponse.json(
      { 
        error: 'Zbyt wiele zapytań. Spróbuj ponownie później.',
        retryAfter: Math.ceil((requestData.timestamp + limit.windowMs - now) / 1000)
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((requestData.timestamp + limit.windowMs - now) / 1000).toString(),
          'X-RateLimit-Limit': limit.max.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(resetTime.getTime() / 1000).toString()
        }
      }
    );
  }
  
  // Sprawdź ochronę CSRF dla żądań modyfikujących dane
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    // Sprawdź token CSRF dla żądań modyfikujących dane
    const isValidCsrf = csrfMiddleware(req);
    
    if (!isValidCsrf) {
      return NextResponse.json(
        { error: 'Nieprawidłowy token CSRF lub brak tokenu' },
        { status: 403 }
      );
    }
  }

  // Kontynuuj przetwarzanie zapytania
  const response = NextResponse.next();
  
  // Dodaj nagłówki informujące o limitach
  response.headers.set('X-RateLimit-Limit', limit.max.toString());
  response.headers.set('X-RateLimit-Remaining', (limit.max - requestData.count).toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil((requestData.timestamp + limit.windowMs) / 1000).toString());
  
  return response;
}

// Konfiguracja middleware - uruchamiaj tylko dla ścieżek API
export const config = {
  matcher: '/api/:path*',
};
