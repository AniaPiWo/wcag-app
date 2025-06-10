import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const CSRF_TOKEN_EXPIRY = 24 * 60 * 60; // 24 godziny w sekundach

/**
 * Generuje token CSRF i zwraca odpowiedź z ustawionym ciasteczkiem
 * @returns Odpowiedź z tokenem CSRF i ustawionym ciasteczkiem
 */
export function generateCsrfTokenResponse(): NextResponse {
  // Generuj losowy token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Utwórz odpowiedź z tokenem
  const response = NextResponse.json({ token });
  
  // Ustaw ciasteczko CSRF
  response.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: CSRF_TOKEN_EXPIRY,
  });
  
  return response;
}

/**
 * Waliduje token CSRF z żądania
 * @param req Obiekt żądania Next.js
 * @returns Czy token CSRF jest prawidłowy
 */
export function validateCsrfToken(req: NextRequest): boolean {
  // Pobierz token z nagłówka
  const headerToken = req.headers.get(CSRF_HEADER_NAME);
  
  // Pobierz token z ciasteczka
  const cookieToken = req.cookies.get(CSRF_COOKIE_NAME)?.value;
  
  // Jeśli brakuje tokenu w nagłówku lub ciasteczku, walidacja nie powiedzie się
  if (!headerToken || !cookieToken) {
    return false;
  }
  
  // Porównaj tokeny
  return headerToken === cookieToken;
}

/**
 * Middleware do ochrony przed atakami CSRF
 * @param req Obiekt żądania Next.js
 * @returns Czy żądanie przeszło walidację CSRF
 */
export function csrfMiddleware(req: NextRequest): boolean {
  // Sprawdź, czy to jest żądanie modyfikujące dane (POST, PUT, DELETE, PATCH)
  const method = req.method.toUpperCase();
  const modifyingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  
  // Jeśli to nie jest żądanie modyfikujące, pomiń walidację CSRF
  if (!modifyingMethods.includes(method)) {
    return true;
  }
  
  // Waliduj token CSRF
  return validateCsrfToken(req);
}

export { CSRF_HEADER_NAME, CSRF_COOKIE_NAME };
