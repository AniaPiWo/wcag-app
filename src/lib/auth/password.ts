import bcrypt from 'bcrypt';

/**
 * Liczba rund saltowania dla bcrypt
 * 10 = ~10 hashowań/sekundę (bezpieczne i wydajne)
 */
const SALT_ROUNDS = 10;

/**
 * Hashuje hasło używając bcrypt
 * @param password - Hasło w plain text
 * @returns Promise z hashem hasła
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || typeof password !== 'string') {
    throw new Error('Hasło musi być niepustym stringiem');
  }
  
  if (password.length < 8) {
    throw new Error('Hasło musi mieć co najmniej 8 znaków');
  }
  
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Weryfikuje hasło z hashem
 * @param password - Hasło w plain text do sprawdzenia
 * @param hash - Hash hasła z bazy danych
 * @returns Promise z boolean - czy hasło jest poprawne
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) {
    return false;
  }
  
  if (typeof password !== 'string' || typeof hash !== 'string') {
    return false;
  }
  
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Błąd weryfikacji hasła:', error);
    return false;
  }
}

/**
 * Funkcja pomocnicza do generowania hash hasła (dla setup)
 * Użyj: node -e "require('./dist/lib/auth/password').generatePasswordHash('twoje-haslo')"
 */
export async function generatePasswordHash(password: string): Promise<void> {
  try {
    const hash = await hashPassword(password);
    console.log('\n🔐 Hash hasła wygenerowany pomyślnie!\n');
    console.log('Skopiuj poniższą linię do pliku .env:\n');
    console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
    console.log('⚠️  WAŻNE: Usuń starą zmienną ADMIN_PASSWORD z .env!\n');
  } catch (error) {
    console.error('❌ Błąd generowania hash:', error);
  }
}
