import { cookies } from 'next/headers';
import * as jose from 'jose';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_TIMEOUT = 60 * 60 * 2; // 2h w sekundach

// Funkcja do pobierania i walidacji sekretu JWT
function getJwtSecret(): string {
  const secret = process.env.SESSION_SECRET;
  
  // KRYTYCZNE: SESSION_SECRET jest wymagany w każdym środowisku
  if (!secret) {
    throw new Error(
      'SESSION_SECRET jest wymagany! Ustaw go w pliku .env\n' +
      'Wygeneruj: openssl rand -base64 32'
    );
  }
  
  // Walidacja długości - minimum 32 znaki
  if (secret.length < 32) {
    throw new Error(
      `SESSION_SECRET jest za krótki (${secret.length} znaków). Wymagane minimum: 32 znaki\n` +
      'Wygeneruj nowy: openssl rand -base64 32'
    );
  }
  
  // Blokada domyślnych/słabych wartości
  const weakSecrets = ['dev-secret', 'secret', 'test', 'example', 'changeme', 'password'];
  if (weakSecrets.some(weak => secret.toLowerCase().includes(weak))) {
    throw new Error(
      'SESSION_SECRET nie może zawierać słabych wartości (dev-secret, test, example, etc.)\n' +
      'Wygeneruj silny sekret: openssl rand -base64 32'
    );
  }
  
  return secret;
}

// Lazy initialization - pobierz sekret tylko gdy jest potrzebny (runtime, nie build time)
let SESSION_SECRET: string | null = null;
function getSessionSecret(): string {
  if (!SESSION_SECRET) {
    SESSION_SECRET = getJwtSecret();
  }
  return SESSION_SECRET;
}

export async function createSession(payload: object = {}): Promise<string> {
  console.log('\x1b[32m🔑 [Session] Tworzenie nowej sesji administratora\x1b[0m');
  
  // Convert secret to Uint8Array for jose
  const secretKey = new TextEncoder().encode(getSessionSecret());
  
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
    const secretKey = new TextEncoder().encode(getSessionSecret());
    
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
