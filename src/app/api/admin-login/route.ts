import { NextRequest, NextResponse } from 'next/server';
import { createSession, SESSION_COOKIE_NAME } from '@/lib/auth/admin-session';

// Mapa do śledzenia prób logowania
const loginAttempts = new Map();

export async function POST(req: NextRequest) {
  try {
    // Pobierz IP klienta
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Sprawdź limity zapytań
    const currentAttempts = loginAttempts.get(ip) || 0;
    
    // Jeśli przekroczono 5 nieudanych prób, wprowadź opóźnienie
    if (currentAttempts >= 5) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 sekunda opóźnienia
    }
    
    // Jeśli przekroczono 10 nieudanych prób, zablokuj na 15 minut
    if (currentAttempts >= 10) {
      return NextResponse.json(
        { success: false, error: 'Zbyt wiele nieudanych prób logowania. Spróbuj ponownie za 15 minut.' },
        { status: 429 }
      );
    }
    
    const { login, password } = await req.json();
    
    // Sprawdź dane logowania
    const adminLogin = process.env.ADMIN_LOGIN;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (login === adminLogin && password === adminPassword) {
      // Utwórz token sesji
      const sessionId = await createSession();
      
      // Resetuj licznik prób dla tego IP
      loginAttempts.delete(ip);
      
      // Ustaw cookie sesji
      const response = NextResponse.json({ success: true });
      response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 2, // 2h
      });
      
      // Dodaj nagłówki informujące o limitach
      response.headers.set('X-RateLimit-Limit', '10');
      response.headers.set('X-RateLimit-Remaining', `${10 - currentAttempts}`);
      
      return response;
    } else {
      // Zwiększ licznik nieudanych prób
      loginAttempts.set(ip, currentAttempts + 1);
      
      // Ustaw timer do usunięcia blokady po 15 minutach
      if (currentAttempts + 1 >= 10) {
        setTimeout(() => {
          loginAttempts.delete(ip);
        }, 15 * 60 * 1000); // 15 minut
      }
      
      return NextResponse.json(
        { success: false, error: 'Nieprawidłowy login lub hasło' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Błąd logowania:', error);
    return NextResponse.json(
      { success: false, error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}
