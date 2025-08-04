import { cookies } from 'next/headers';
import * as jose from 'jose';

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

export async function createSession(payload: object = {}): Promise<string> {
  console.log('\x1b[32m🔑 [Session] Tworzenie nowej sesji administratora\x1b[0m');
  
  // Convert secret to Uint8Array for jose
  const secretKey = new TextEncoder().encode(SESSION_SECRET);
  
  // Create JWT token with jose
  const token = await new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_TIMEOUT)
    .sign(secretKey);
    
  return token;
}

export async function validateSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return false;
  
  try {
    // Convert secret to Uint8Array for jose
    const secretKey = new TextEncoder().encode(SESSION_SECRET);
    
    // Verify token using jose
    await jose.jwtVerify(token, secretKey);
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
