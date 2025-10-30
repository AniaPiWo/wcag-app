/**
 * Walidator zmiennych środowiskowych
 * Sprawdza czy wszystkie wymagane zmienne są ustawione i mają poprawny format
 */

interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Sprawdza czy zmienna środowiskowa istnieje i nie jest pusta
 */
function checkRequired(name: string, value: string | undefined): string | null {
  if (!value || value.trim() === '') {
    return `Brakuje wymaganej zmiennej: ${name}`;
  }
  return null;
}

/**
 * Sprawdza czy SESSION_SECRET jest wystarczająco silny
 */
function validateSessionSecret(secret: string | undefined): string[] {
  const errors: string[] = [];
  
  if (!secret) {
    errors.push('SESSION_SECRET jest wymagany');
    return errors;
  }
  
  if (secret.length < 32) {
    errors.push(`SESSION_SECRET jest za krótki (${secret.length} znaków). Wymagane minimum: 32 znaki`);
  }
  
  if (secret === 'dev-secret' || secret.includes('example') || secret.includes('test')) {
    errors.push('SESSION_SECRET nie może być domyślną wartością (dev-secret, example, test)');
  }
  
  return errors;
}

/**
 * Sprawdza czy ADMIN_PASSWORD_HASH wygląda jak prawidłowy hash bcrypt
 */
function validatePasswordHash(hash: string | undefined): string[] {
  const warnings: string[] = [];
  
  if (!hash) {
    warnings.push('ADMIN_PASSWORD_HASH nie jest ustawiony - używasz plain text hasła?');
    return warnings;
  }
  
  // Bcrypt hash zaczyna się od $2a$, $2b$ lub $2y$ i ma ~60 znaków
  if (!hash.match(/^\$2[aby]\$\d{2}\$.{53}$/)) {
    warnings.push('ADMIN_PASSWORD_HASH nie wygląda jak prawidłowy hash bcrypt');
  }
  
  return warnings;
}

/**
 * Sprawdza czy DATABASE_URL jest prawidłowy
 */
function validateDatabaseUrl(url: string | undefined): string[] {
  const errors: string[] = [];
  
  if (!url) {
    errors.push('DATABASE_URL jest wymagany');
    return errors;
  }
  
  if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
    errors.push('DATABASE_URL musi zaczynać się od postgresql:// lub postgres://');
  }
  
  return errors;
}

/**
 * Waliduje wszystkie wymagane zmienne środowiskowe
 */
export function validateEnvVariables(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Wymagane zmienne
  const requiredVars = [
    'SESSION_SECRET',
    'ADMIN_LOGIN',
    'RESEND_API_KEY',
    'OPENAI_API_KEY',
    'DATABASE_URL'
  ];
  
  // Sprawdź czy wszystkie wymagane zmienne istnieją
  for (const varName of requiredVars) {
    const error = checkRequired(varName, process.env[varName]);
    if (error) {
      errors.push(error);
    }
  }
  
  // Walidacja SESSION_SECRET
  const sessionSecretErrors = validateSessionSecret(process.env.SESSION_SECRET);
  errors.push(...sessionSecretErrors);
  
  // Walidacja ADMIN_PASSWORD_HASH
  const passwordHashWarnings = validatePasswordHash(process.env.ADMIN_PASSWORD_HASH);
  warnings.push(...passwordHashWarnings);
  
  // Walidacja DATABASE_URL
  const databaseUrlErrors = validateDatabaseUrl(process.env.DATABASE_URL);
  errors.push(...databaseUrlErrors);
  
  // Sprawdź czy używa się starej zmiennej ADMIN_PASSWORD
  if (process.env.ADMIN_PASSWORD) {
    warnings.push('ADMIN_PASSWORD jest przestarzałe - użyj ADMIN_PASSWORD_HASH z bcrypt hash');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Waliduje zmienne środowiskowe i rzuca błąd jeśli są nieprawidłowe
 * Użyj przy starcie aplikacji
 */
export function validateEnvVariablesOrThrow(): void {
  const result = validateEnvVariables();
  
  if (result.warnings.length > 0) {
    console.warn('\n⚠️  ============================================');
    console.warn('⚠️  OSTRZEŻENIA DOTYCZĄCE ZMIENNYCH ŚRODOWISKOWYCH');
    console.warn('⚠️  ============================================\n');
    result.warnings.forEach(warning => {
      console.warn(`⚠️  ${warning}`);
    });
    console.warn('\n⚠️  ============================================\n');
  }
  
  if (!result.isValid) {
    console.error('\n🔴 ============================================');
    console.error('🔴 BŁĄD WALIDACJI ZMIENNYCH ŚRODOWISKOWYCH');
    console.error('🔴 ============================================\n');
    result.errors.forEach(error => {
      console.error(`❌ ${error}`);
    });
    console.error('\n📝 Sprawdź plik env.example dla przykładowej konfiguracji');
    console.error('🔴 ============================================\n');
    throw new Error('Nieprawidłowa konfiguracja zmiennych środowiskowych');
  }
  
  console.log('✅ Walidacja zmiennych środowiskowych zakończona pomyślnie\n');
}

/**
 * Wyświetla status zmiennych środowiskowych (dla debugowania)
 */
export function printEnvStatus(): void {
  console.log('\n📊 Status zmiennych środowiskowych:\n');
  
  const vars = [
    'SESSION_SECRET',
    'ADMIN_LOGIN',
    'ADMIN_PASSWORD_HASH',
    'RESEND_API_KEY',
    'OPENAI_API_KEY',
    'DATABASE_URL',
    'NODE_ENV'
  ];
  
  vars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    const display = value 
      ? (varName.includes('SECRET') || varName.includes('PASSWORD') || varName.includes('KEY')
          ? `${value.substring(0, 10)}...` 
          : value.substring(0, 30) + (value.length > 30 ? '...' : ''))
      : 'NIE USTAWIONE';
    
    console.log(`${status} ${varName}: ${display}`);
  });
  
  console.log('');
}
