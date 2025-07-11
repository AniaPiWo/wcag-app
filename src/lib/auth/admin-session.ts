import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_TIMEOUT = 60 * 60 * 2; // 2h w sekundach

// Funkcja do pobierania i walidacji sekretu JWT
function getJwtSecret(): string {
  const secret = process.env.SESSION_SECRET;
  
  // W środowisku produkcyjnym wymagamy silnego sekretu
  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret.length < 32) {
      console.error('\x1b[31m⚠️ [Security Warning] SESSION_SECRET powinien być ustawiony w produkcji i mieć co najmniej 32 znaki\x1b[0m');
    }
  }
  
  // W środowisku deweloperskim ostrzegamy, ale pozwalamy na użycie domyślnego sekretu
  if (!secret) {
    console.warn('\x1b[33m⚠️ [Security Warning] Używanie domyślnego sekretu JWT. To jest niebezpieczne w produkcji!\x1b[0m');
    return 'dev-secret';
  }
  
  return secret;
}

const SESSION_SECRET = getJwtSecret();

export function createSession(payload: object = {}): string {
  console.log('\x1b[32m🔑 [Session] Tworzenie nowej sesji administratora\x1b[0m');
  const token = jwt.sign({ ...payload }, SESSION_SECRET, { expiresIn: SESSION_TIMEOUT });
  return token;
}

export async function validateSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    jwt.verify(token, SESSION_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function destroySession() {
  // Usunięcie ciasteczka po stronie klienta następuje przez ustawienie przeszłej daty
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', { maxAge: 0, path: '/' });
}

export { SESSION_COOKIE_NAME };
