import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_TIMEOUT = 60 * 60 * 2; // 2h w sekundach
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret';

export function createSession(payload: object = {}): string {
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
