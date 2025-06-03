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
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    try {
      // Próba pobrania nagłówków strony, aby sprawdzić czy istnieje
      const response = await fetch(formattedUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        redirect: 'follow',
      });

      if (response.ok) {
        return NextResponse.json({ exists: true });
      } else {
        return NextResponse.json(
          { 
            exists: false, 
            error: `Strona zwróciła kod błędu: ${response.status}` 
          },
          { status: response.status }
        );
      }
    } catch (error) {
      console.error('Błąd podczas sprawdzania URL:', error);
      return NextResponse.json(
        { 
          exists: false, 
          error: 'Strona o podanym adresie nie istnieje' 
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Błąd przetwarzania żądania:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas przetwarzania żądania' },
      { status: 500 }
    );
  }
}
