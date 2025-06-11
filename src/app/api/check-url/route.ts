/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { chromium } from 'playwright'; // NIE używamy `@playwright/test`, tylko `playwright`

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'Brak adresu URL' }, { status: 400 });
    }

    let formattedUrl = url;
    if (!/^https?:\/\//.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

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
        const browser = await chromium.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const context = await browser.newContext();
        const page = await context.newPage();

        const response = await page.goto(tryUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 15000
        });

        const htmlTagName = await page.evaluate(() => document.documentElement.tagName);
        const title = await page.title();

        await browser.close();

        if (htmlTagName === 'HTML') {
          return NextResponse.json({ exists: true, title });
        }

        return NextResponse.json({ exists: false, error: 'Niepoprawny dokument HTML' }, { status: 422 });

      } catch (err: unknown) {
        console.warn(`Playwright error for ${tryUrl}:`, err);
        if (err instanceof Error && err.message.includes('Timeout')) {
          return NextResponse.json({ exists: false, error: 'Timeout strony' }, { status: 408 });
        }
      }
    }

    return NextResponse.json(
      { exists: false, error: 'Nie udało się połączyć ze stroną' },
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
