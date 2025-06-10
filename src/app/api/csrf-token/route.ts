import { generateCsrfTokenResponse } from '@/lib/csrf';

// Endpoint do generowania tokenu CSRF
export async function GET() {
  try {
    // Generuj nowy token CSRF i od razu zwróć odpowiedź z ciasteczkiem
    return generateCsrfTokenResponse();
  } catch (error) {
    console.error('Błąd generowania tokenu CSRF:', error);
    return Response.json(
      { error: 'Nie udało się wygenerować tokenu CSRF' },
      { status: 500 }
    );
  }
}
