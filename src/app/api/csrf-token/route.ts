import { generateCsrfTokenResponse } from '@/lib/csrf';

export async function GET() {
  try {
    return generateCsrfTokenResponse();
  } catch (error) {
    console.error('Błąd generowania tokenu CSRF:', error);
    return Response.json(
      { error: 'Nie udało się wygenerować tokenu CSRF' },
      { status: 500 }
    );
  }
}
