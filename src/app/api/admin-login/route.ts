import { NextRequest, NextResponse } from 'next/server';
import { createSession, SESSION_COOKIE_NAME } from '@/lib/auth/admin-session';
import { verifyPassword } from '@/lib/auth/password';

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
    
    // 🔒 INPUT VALIDATION
    if (!login || !password) {
      return NextResponse.json(
        { success: false, error: 'Login i hasło są wymagane' },
        { status: 400 }
      );
    }
    
    if (typeof login !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Nieprawidłowy format danych' },
        { status: 400 }
      );
    }
    
    if (login.length > 100 || password.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Dane wejściowe za długie' },
        { status: 400 }
      );
    }
    
    // Sprawdź dane logowania
    const adminLogin = process.env.ADMIN_LOGIN;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    
    if (!adminPasswordHash) {
      console.error('\x1b[31m⚠️ [Security Error] ADMIN_PASSWORD_HASH nie jest ustawiony!\x1b[0m');
      return NextResponse.json(
        { success: false, error: 'Błąd konfiguracji serwera' },
        { status: 500 }
      );
    }
    
    // 🔒 TIMING-SAFE COMPARISON dla loginu + bcrypt dla hasła
    const isValidLogin = login === adminLogin;
    const isValidPassword = isValidLogin ? await verifyPassword(password, adminPasswordHash) : false;
    
    if (isValidLogin && isValidPassword) {
      // Utwórz token sesji
      const sessionId = await createSession();
      
      // Resetuj licznik prób dla tego IP
      loginAttempts.delete(ip);
      
      console.log('\x1b[32m✅ [Login Success] Pomyślne logowanie administratora\x1b[0m');
      
      // Ustaw cookie sesji
      const response = NextResponse.json({ success: true });
      
      // Dodaj szczegółowe debugowanie cookie
      console.log(`\x1b[35m📝 [Cookie Debug] Ustawianie cookie ${SESSION_COOKIE_NAME} z wartością: ${sessionId.substring(0, 10)}...\x1b[0m`);
      
      response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Tylko w produkcji wymagaj HTTPS
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 2, // 2h
      });
      
      // Sprawdź czy cookie zostało ustawione
      const setCookieHeader = response.headers.get('Set-Cookie');
      console.log(`\x1b[35m📝 [Cookie Debug] Nagłówek Set-Cookie: ${setCookieHeader ? 'ustawiony' : 'brak'}\x1b[0m`);
      
      // Dodaj nagłówki informujące o limitach
      response.headers.set('X-RateLimit-Limit', '10');
      response.headers.set('X-RateLimit-Remaining', `${10 - currentAttempts}`);
      
      return response;
    } else {
      // Zwiększ licznik nieudanych prób
      loginAttempts.set(ip, currentAttempts + 1);
      
      console.log(`\x1b[31m❌ [Login Failed] Nieudana próba logowania (${currentAttempts + 1}/10)\x1b[0m`);
      
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
    console.error(`\x1b[31m⚠️ [Login Error] ${error}\x1b[0m`);
    return NextResponse.json(
      { success: false, error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}
