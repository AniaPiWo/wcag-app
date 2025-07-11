import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';

export async function POST(request: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers });
  }

  try {
    const { url } = await request.json();
    let normalizedUrl = url;
    
    // Dodaj protokół, jeśli nie został podany
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      normalizedUrl = 'https://' + url;
    }
    
    // Najpierw sprawdź podstawową dostępność URL
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); 
      
      const urlCheckResponse = await fetch(normalizedUrl, { 
        method: 'GET', 
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      clearTimeout(timeoutId);
      
      const statusCode = urlCheckResponse.status;
      const isAccessible = statusCode < 500;
      
      if (!isAccessible) {
        return NextResponse.json(
          { success: false, error: `Podany URL nie jest dostępny. Kod odpowiedzi: ${statusCode}` },
          { status: 400, headers }
        );
      }
    } catch (urlError) {
      return NextResponse.json(
        { success: false, error: `Nie można połączyć się z podanym URL: ${urlError instanceof Error ? urlError.message : String(urlError)}` },
        { status: 400, headers }
      );
    }
    
    // Następnie sprawdź, czy strona może być zaudytowana przez Playwright
    let browser = null;
    try {
      browser = await chromium.launch({ timeout: 30000 });
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Ustaw timeout na nawigację
      await page.goto(normalizedUrl, { timeout: 30000, waitUntil: 'domcontentloaded' });
      
      // Sprawdź, czy strona załadowała się poprawnie
      const title = await page.title();
      
      await browser.close();
      browser = null;
      
      return NextResponse.json({ 
        success: true, 
        url: normalizedUrl,
        title: title || 'Strona bez tytułu'
      }, { headers });
      
    } catch (playwrightError) {
      if (browser) await browser.close();
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Nie można przeprowadzić audytu dla tej strony: ${playwrightError instanceof Error ? playwrightError.message : String(playwrightError)}` 
        },
        { status: 400, headers }
      );
    }
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Wystąpił błąd podczas weryfikacji URL';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500, headers }
    );
  }
}
