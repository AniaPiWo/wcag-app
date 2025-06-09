import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'Brak adresu URL' },
        { status: 400 }
      );
    }

    // Upewnij się, że URL ma prawidłowy format
    let formattedUrl = url;
    if (!/^https?:\/\//.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    // Helper do fetch z timeoutem
    async function fetchWithTimeout(resource: string, options = {}, timeout = 10000) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await fetch(resource, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
      } catch (err) {
        clearTimeout(id);
        throw err;
      }
    }

    // Próbuj najpierw oryginalny adres, potem z www jeśli nie działa
    const urlsToTry = [formattedUrl];
    try {
      const urlObj = new URL(formattedUrl);
      if (!urlObj.hostname.startsWith('www.')) {
        const withWww = formattedUrl.replace('://' + urlObj.hostname, '://www.' + urlObj.hostname);
        urlsToTry.push(withWww);
      }
    } catch {}

    for (const tryUrl of urlsToTry) {
      try {
        let response = await fetchWithTimeout(tryUrl, {
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          redirect: 'follow',
        });

        // Jeśli serwer zwróci 449 lub 405, spróbuj GET
        if (response.status === 449 || response.status === 405) {
          response = await fetchWithTimeout(tryUrl, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            redirect: 'follow',
          });
        }

        if (response.ok) {
          return NextResponse.json({ exists: true });
        }
        // Jeśli 404 lub 449, próbuj kolejny wariant (np. z www)
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Timeout
          return NextResponse.json(
            { exists: false, error: 'Przekroczono czas oczekiwania na odpowiedź z serwera.' },
            { status: 408 }
          );
        }
        // Próbuj kolejny wariant
      }
    }

    // Jeśli żaden wariant nie zadziałał
    return NextResponse.json(
      {
        exists: false,
        error: 'Nie udało się połączyć ze stroną. Spróbuj z www.nazwadomeny.pl lub sprawdź poprawność adresu.'
      },
      { status: 404 }
    );
  } catch (error) {
    console.error('Błąd przetwarzania żądania:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas przetwarzania żądania' },
      { status: 500 }
    );
  }
}
