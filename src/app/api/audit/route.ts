import { NextRequest, NextResponse } from 'next/server';
import { chromium, Page } from 'playwright';
import { z } from 'zod';
import { queueAudit } from './queue';

// Maksymalna liczba prób uruchomienia Playwright
const MAX_PLAYWRIGHT_RETRIES = 3;

// Timeout dla operacji Playwright (30 sekund)
const PLAYWRIGHT_TIMEOUT = 30000;

/**
 * Podstawowe zasady dostępności do sprawdzenia, gdy axe-core nie może być wstrzyknięty
 */
const BASIC_ACCESSIBILITY_CHECKS = [
  { name: 'alt-text', description: 'Obrazy powinny mieć tekst alternatywny', wcag: 'WCAG 1.1.1' },
  { name: 'heading-order', description: 'Nagłówki powinny być w odpowiedniej kolejności', wcag: 'WCAG 1.3.1, 2.4.6' },
  { name: 'color-contrast', description: 'Tekst powinien mieć wystarczający kontrast', wcag: 'WCAG 1.4.3' },
  { name: 'form-labels', description: 'Pola formularzy powinny mieć etykiety', wcag: 'WCAG 1.3.1, 3.3.2' },
  { name: 'keyboard-accessibility', description: 'Elementy interaktywne powinny być dostępne z klawiatury', wcag: 'WCAG 2.1.1' },
  { name: 'aria-attributes', description: 'Atrybuty ARIA powinny być poprawnie użyte', wcag: 'WCAG 4.1.2' },
  { name: 'document-structure', description: 'Dokument powinien mieć poprawną strukturę', wcag: 'WCAG 1.3.1, 2.4.1' }
];

// Deklaracja typu dla window.axe
declare global {
  interface Window {
    axe?: unknown;
  }
}

// Schema for validating the request
const auditRequestSchema = z.object({
  url: z.string().url('Niepoprawny adres URL'),
  email: z.string().email('Niepoprawny adres email').optional(),
  name: z.string().min(2, 'Imię jest zbyt krótkie').optional(),
});

// Types for axe-core results
interface AxeViolation {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor' | null;
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary: string;
    "any": Array<{ id: string; message: string; data: unknown; relatedNodes: unknown[] }>;
    all: Array<{ id: string; message: string; data: unknown; relatedNodes: unknown[] }>;
    none: Array<{ id: string; message: string; data: unknown; relatedNodes: unknown[] }>;
    impact?: string;
    length?: number;
  }>;
}

interface AxeResults {
  violations: AxeViolation[];
  passes: Array<{
    id: string;
    impact: string | null;
    tags: string[];
    description: string;
    help: string;
    helpUrl: string;
    nodes: unknown[];
  }>;
  incomplete: Array<{
    id: string;
    impact: string | null;
    tags: string[];
    description: string;
    help: string;
    helpUrl: string;
    nodes: unknown[];
  }>;
  inapplicable: Array<{
    id: string;
    impact: string | null;
    tags: string[];
    description: string;
    help: string;
    helpUrl: string;
    nodes: unknown[];
  }>;
  timestamp: string;
  url: string;
  error?: string;
}

// Type for audit results summary
type AuditSummary = {
  url: string;
  totalIssuesCount: number;
  criticalCount: number;
  seriousCount: number;
  moderateCount: number;
  minorCount: number;
  passedRules: number;
  incompleteRules: number;
  timestamp: string;
};

/**
 * Runs an accessibility audit on the provided URL using axe-core and Playwright
 */
export async function POST(request: NextRequest) {
  // Dodanie nagłówków CORS dla obsługi żądań z różnych źródeł
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };

  // Obsługa preflight request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers });
  }

  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Błąd parsowania JSON:', parseError);
      return NextResponse.json(
        { error: 'Nieprawidłowy format JSON' },
        { status: 400, headers }
      );
    }
    
    // Validate the request data
    const validationResult = auditRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Nieprawidłowe dane wejściowe', details: validationResult.error.format() },
        { status: 400, headers }
      );
    }
    
    const { url, email, name } = validationResult.data;
    
    // Sprawdzenie czy URL jest dostępny przed uruchomieniem audytu
    try {
      // Ustawienie limitu czasu za pomocą AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Zwiększony timeout do 10 sekund
      
      // Próba GET zamiast HEAD - niektóre serwery nie obsługują HEAD poprawnie
      const urlCheckResponse = await fetch(url, { 
        method: 'GET', 
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      clearTimeout(timeoutId);
      
      // Akceptujemy szerszy zakres kodów odpowiedzi jako sukces
      // Niektóre strony mogą zwracać niestandardowe kody, ale nadal są dostępne
      const statusCode = urlCheckResponse.status;
      const isSuccess = statusCode >= 200 && statusCode < 500 && statusCode !== 404 && statusCode !== 403;
      
      if (!isSuccess) {
        return NextResponse.json(
          { error: `Podany URL nie jest dostępny. Kod odpowiedzi: ${statusCode}` },
          { status: 400, headers }
        );
      }
    } catch (urlError) {
      console.error('Błąd podczas sprawdzania URL:', urlError);
      const errorMessage = urlError instanceof Error && urlError.name === 'AbortError' 
        ? 'Przekroczono limit czasu podczas sprawdzania URL. Spróbuj ponownie później.' 
        : `Nie można połączyć się z podanym URL: ${urlError instanceof Error ? urlError.message : String(urlError)}`;
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400, headers }
      );
    }
    
    // Run the accessibility audit with queue management and retry logic
    // Dodajemy audyt do kolejki, co zapobiega przeciążeniu serwera przy wielu jednoczesnych żądaniach
    let auditResults;
    let retryCount = 0;
    let lastError;
    
    // Próbujemy uruchomić audyt kilka razy w przypadku błędów
    while (retryCount < MAX_PLAYWRIGHT_RETRIES) {
      try {
        auditResults = await queueAudit(url, runAccessibilityAudit);
        break; // Jeśli się udało, przerywamy pętlę
      } catch (error) {
        lastError = error;
        console.error(`Próba ${retryCount + 1}/${MAX_PLAYWRIGHT_RETRIES} nie powiodła się:`, error);
        retryCount++;
        
        // Krótkie opóźnienie przed kolejną próbą
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Jeśli wszystkie próby zawiodły, zwróć błąd
    if (!auditResults) {
      throw new Error(`Nie udało się przeprowadzić audytu po ${MAX_PLAYWRIGHT_RETRIES} próbach: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
    }
    
    // Return the audit results
    return NextResponse.json({
      success: true,
      url,
      email,
      name,
      results: auditResults,
    }, { headers });
  } catch (error) {
    console.error('Błąd podczas przeprowadzania audytu:', error);
    return NextResponse.json(
      { 
        error: 'Wystąpił błąd podczas przeprowadzania audytu', 
        details: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500, headers }
    );
  }
}

/**
 * Alternatywna metoda audytu dostępności dla stron z restrykcyjnymi ustawieniami CSP
 * Wykorzystuje podstawowe sprawdzenia dostępności bez użycia axe-core
 */
async function runBasicAccessibilityAudit(page: Page, url: string): Promise<{
  summary: AuditSummary;
  violations: AxeViolation[];
}> {
  console.log('Uruchamianie podstawowego audytu dostępności bez axe-core');
  
  // Tworzymy pustą listę naruszeń dostępności
  const violations: AxeViolation[] = [];
  
  try {
    // Sprawdzenie obrazków bez tekstu alternatywnego
    const imagesWithoutAlt = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images
        .filter(img => !img.hasAttribute('alt') || img.getAttribute('alt')?.trim() === '')
        .map(img => ({
          html: img.outerHTML,
          src: img.getAttribute('src') || 'brak źródła',
          location: img.getBoundingClientRect ? 
            `x: ${Math.round(img.getBoundingClientRect().x)}, y: ${Math.round(img.getBoundingClientRect().y)}` : 
            'nieznana lokalizacja'
        }));
    });
    
    if (imagesWithoutAlt.length > 0) {
      violations.push({
        id: 'images-without-alt',
        impact: 'serious',
        description: 'Obrazy bez tekstu alternatywnego',
        help: 'Dodaj atrybut alt do wszystkich obrazów',
        helpUrl: 'https://www.w3.org/WAI/tutorials/images/',
        nodes: imagesWithoutAlt.map(img => ({
          html: img.html,
          target: [img.src],
          failureSummary: `Obraz bez tekstu alternatywnego: ${img.src}`,
          any: [{ id: 'has-alt', message: 'Obraz nie ma tekstu alternatywnego', data: null, relatedNodes: [] }],
          all: [],
          none: []
        }))
      });
    }
    
    // Sprawdzenie nagłówków w niewłaściwej kolejności
    const headingsOrder = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const result = [];
      let previousLevel = 0;
      
      for (const heading of headings) {
        const level = parseInt(heading.tagName.charAt(1));
        const text = heading.textContent || 'Pusty nagłówek';
        
        // Nagłówek nie powinien przeskakiwać o więcej niż jeden poziom
        if (previousLevel > 0 && level > previousLevel && level - previousLevel > 1) {
          result.push({
            html: heading.outerHTML,
            text: text.trim(),
            level,
            previousLevel
          });
        }
        
        previousLevel = level;
      }
      
      return result;
    });
    
    if (headingsOrder.length > 0) {
      violations.push({
        id: 'heading-order',
        impact: 'moderate',
        description: 'Nagłówki nie są w odpowiedniej kolejności',
        help: 'Nagłówki powinny być uporządkowane hierarchicznie bez przeskakiwania poziomów',
        helpUrl: 'https://www.w3.org/WAI/tutorials/page-structure/headings/',
        nodes: headingsOrder.map(h => ({
          html: h.html,
          target: [`h${h.level}`],
          failureSummary: `Nagłówek poziomu ${h.level} po nagłówku poziomu ${h.previousLevel}`,
          any: [{ id: 'heading-order', message: `Przeskok z poziomu ${h.previousLevel} do ${h.level}`, data: null, relatedNodes: [] }],
          all: [],
          none: []
        }))
      });
    }
    
    // Sprawdzenie pól formularza bez etykiet
    const formFieldsWithoutLabels = await page.evaluate(() => {
      const formFields = Array.from(document.querySelectorAll('input, select, textarea'));
      return formFields
        .filter(field => {
          // Pomijamy ukryte pola, przyciski, itp.
          if (field.getAttribute('type') === 'hidden' || 
              field.getAttribute('type') === 'button' || 
              field.getAttribute('type') === 'submit' || 
              field.getAttribute('type') === 'reset' || 
              field.getAttribute('aria-hidden') === 'true') {
            return false;
          }
          
          const id = field.getAttribute('id');
          // Brak ID oznacza, że nie może być powiązane z etykietą
          if (!id) return true;
          
          // Sprawdzamy, czy istnieje etykieta powiązana z tym polem
          const hasLabel = document.querySelector(`label[for="${id}"]`) !== null;
          const hasAriaLabel = field.hasAttribute('aria-label');
          const hasAriaLabelledBy = field.hasAttribute('aria-labelledby');
          
          return !hasLabel && !hasAriaLabel && !hasAriaLabelledBy;
        })
        .map(field => ({
          html: field.outerHTML,
          type: field.getAttribute('type') || field.tagName.toLowerCase(),
          id: field.getAttribute('id') || 'brak id'
        }));
    });
    
    if (formFieldsWithoutLabels.length > 0) {
      violations.push({
        id: 'form-field-without-label',
        impact: 'critical',
        description: 'Pola formularza bez etykiet',
        help: 'Wszystkie pola formularza powinny mieć powiązane etykiety',
        helpUrl: 'https://www.w3.org/WAI/tutorials/forms/labels/',
        nodes: formFieldsWithoutLabels.map(field => ({
          html: field.html,
          target: [field.id],
          failureSummary: `Pole formularza typu ${field.type} bez etykiety`,
          any: [{ id: 'has-label', message: 'Pole nie ma powiązanej etykiety', data: null, relatedNodes: [] }],
          all: [],
          none: []
        }))
      });
    }
    
    // Obliczamy podsumowanie naruszeń
    let totalIssuesCount = 0;
    let criticalCount = 0;
    let seriousCount = 0;
    let moderateCount = 0;
    let minorCount = 0;
    
    violations.forEach(violation => {
      const nodeCount = violation.nodes.length;
      totalIssuesCount += nodeCount;
      
      switch(violation.impact) {
        case 'critical':
          criticalCount += nodeCount;
          break;
        case 'serious':
          seriousCount += nodeCount;
          break;
        case 'moderate':
          moderateCount += nodeCount;
          break;
        case 'minor':
          minorCount += nodeCount;
          break;
      }
    });
    
    // Tworzymy podsumowanie audytu
    const summary: AuditSummary = {
      url,
      totalIssuesCount,
      criticalCount,
      seriousCount,
      moderateCount,
      minorCount,
      passedRules: BASIC_ACCESSIBILITY_CHECKS.length - violations.length,
      incompleteRules: 0,
      timestamp: new Date().toISOString(),
    };
    
    return {
      summary,
      violations
    };
  } catch (error) {
    console.error('Błąd podczas wykonywania podstawowego audytu dostępności:', error);
    
    // Zwracamy minimalny raport w przypadku błędu
    return {
      summary: {
        url,
        totalIssuesCount: 0,
        criticalCount: 0,
        seriousCount: 0,
        moderateCount: 0,
        minorCount: 0,
        passedRules: 0,
        incompleteRules: BASIC_ACCESSIBILITY_CHECKS.length,
        timestamp: new Date().toISOString(),
      },
      violations: [{
        id: 'basic-audit-error',
        impact: 'serious',
        description: 'Błąd podczas wykonywania podstawowego audytu dostępności',
        help: 'Strona ma prawdopodobnie bardzo restrykcyjne ustawienia bezpieczeństwa',
        helpUrl: '',
        nodes: [{
          html: '<html>...</html>',
          target: [url],
          failureSummary: `Błąd: ${error instanceof Error ? error.message : String(error)}`,
          any: [{ id: 'audit-error', message: 'Błąd podczas audytu', data: null, relatedNodes: [] }],
          all: [],
          none: []
        }]
      }]
    };
  }
}

async function runAccessibilityAudit(url: string): Promise<{
  summary: AuditSummary;
  violations: AxeViolation[];
}> {
  let browser;
  try {
    // Launch Playwright z dodatkowymi opcjami dla środowiska Next.js API Routes
    browser = await chromium.launch({
      headless: true,
      // Argumenty dla lepszej kompatybilności z środowiskiem serverless
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      // Wyłączenie zapisywania plików tymczasowych
      downloadsPath: '/tmp',
      // Zmniejszenie zużycia pamięci
      chromiumSandbox: false
    });
    
    // Create a new context and page
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    
    // Navigate to the URL
    try {
      // Bardziej elastyczne ustawienia ładowania strony
      const response = await page.goto(url, { 
        waitUntil: 'domcontentloaded', // Zmiana z 'networkidle' na 'domcontentloaded' dla szybszego ładowania
        timeout: PLAYWRIGHT_TIMEOUT 
      });
      
      // Sprawdzamy status odpowiedzi, ale akceptujemy szerszy zakres kodów
      if (response) {
        const status = response.status();
        console.log(`Status odpowiedzi strony: ${status}`);
        
        // Akceptujemy kody 2xx, 3xx i niektóre 4xx (np. 404 dla części zasobów nie powinien przerywać audytu)
        const isServerError = status >= 500 || status === 404 || status === 403;
        
        if (isServerError) {
          throw new Error(`Nie udało się załadować strony: kod odpowiedzi ${status}`);
        }
      } else {
        console.warn('Brak obiektu odpowiedzi, ale kontynuujemy audyt');
      }
      
      // Dodatkowe oczekiwanie na załadowanie strony
      await page.waitForLoadState('load', { timeout: PLAYWRIGHT_TIMEOUT / 2 }).catch(err => {
        console.warn('Timeout podczas oczekiwania na pełne załadowanie strony, ale kontynuujemy:', err.message);
      });
      
    } catch (error) {
      console.error('Błąd podczas ładowania strony:', error);
      throw new Error(`Nie udało się załadować strony: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Scroll through the page to ensure all lazy-loaded elements are visible
    await autoScroll(page);
    
    // Wstrzykujemy axe-core bezpośrednio jako string zamiast ładować go z CDN
    // To pozwala ominąć problemy z Content Security Policy (CSP) na stronach
    try {
      // Pobieramy axe-core z CDN jako string
      const axeResponse = await fetch('https://unpkg.com/axe-core@4.10.3/axe.min.js');
      if (!axeResponse.ok) {
        throw new Error(`Nie udało się pobrać axe-core: ${axeResponse.status} ${axeResponse.statusText}`);
      }
      const axeScript = await axeResponse.text();
      
      // Próbujemy kilku metod wstrzykiwania axe-core, aby obejść CSP
      let axeLoaded = false;
      
      // Metoda 1: Standardowe wstrzykiwanie przez document.createElement
      try {
        await page.evaluate((axeScriptContent) => {
          try {
            const script = document.createElement('script');
            script.textContent = axeScriptContent;
            document.head.appendChild(script);
            return true;
          } catch (e) {
            console.error('Błąd podczas wstrzykiwania axe-core (metoda 1):', e);
            return false;
          }
        }, axeScript);
        
        // Sprawdzamy czy axe jest dostępny
        axeLoaded = await page.evaluate(() => {
          return typeof window['axe' as keyof Window] !== 'undefined';
        });
        
        if (axeLoaded) {
          console.log('Biblioteka axe-core została pomyślnie wstrzyknięta (metoda 1)');
        }
      } catch (e) {
        console.warn('Metoda 1 wstrzykiwania axe-core nie powiodła się:', e);
      }
      
      // Metoda 2: Wstrzykiwanie przez eval (jeśli metoda 1 nie zadziałała)
      if (!axeLoaded) {
        try {
          await page.evaluate((axeScriptContent) => {
            try {
              // Bezpośrednio wykonujemy kod axe-core
              eval(axeScriptContent);
              return true;
            } catch (e) {
              console.error('Błąd podczas wstrzykiwania axe-core (metoda 2):', e);
              return false;
            }
          }, axeScript);
          
          // Sprawdzamy czy axe jest dostępny
          axeLoaded = await page.evaluate(() => {
            return typeof window['axe' as keyof Window] !== 'undefined';
          });
          
          if (axeLoaded) {
            console.log('Biblioteka axe-core została pomyślnie wstrzyknięta (metoda 2)');
          }
        } catch (e) {
          console.warn('Metoda 2 wstrzykiwania axe-core nie powiodła się:', e);
        }
      }
      
      // Metoda 3: Wstrzykiwanie przez Function constructor (jeśli metody 1 i 2 nie zadziałały)
      if (!axeLoaded) {
        try {
          await page.evaluate((axeScriptContent) => {
            try {
              // Tworzymy nową funkcję z kodu axe-core i wykonujemy ją
              new Function(axeScriptContent)();
              return true;
            } catch (e) {
              console.error('Błąd podczas wstrzykiwania axe-core (metoda 3):', e);
              return false;
            }
          }, axeScript);
          
          // Sprawdzamy czy axe jest dostępny
          axeLoaded = await page.evaluate(() => {
            return typeof window['axe' as keyof Window] !== 'undefined';
          });
          
          if (axeLoaded) {
            console.log('Biblioteka axe-core została pomyślnie wstrzyknięta (metoda 3)');
          }
        } catch (e) {
          console.warn('Metoda 3 wstrzykiwania axe-core nie powiodła się:', e);
        }
      }
      
      // Jeśli żadna metoda wstrzykiwania axe-core nie zadziałała, próbujemy alternatywnej metody audytu
      if (!axeLoaded) {
        console.warn('Nie udało się wstrzyknąć axe-core - próbujemy alternatywnej metody audytu');
        
        // Wykonujemy podstawowy audyt dostępności bez axe-core
        return await runBasicAccessibilityAudit(page, url);
      }
    } catch (error) {
      console.error('Błąd podczas wstrzykiwania axe-core:', error);
      throw new Error(`Nie udało się wstrzyknąć biblioteki axe-core: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Run the accessibility audit
    const results = await page.evaluate(() => {
      return new Promise<AxeResults | { error: string }>((resolve) => {
        // @ts-expect-error - axe is injected at runtime
        window.axe.run(
          document,
          {
            runOnly: {
              type: 'tag',
              values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice', 'section508']
            }
          },
          (err: Error | null, results: AxeResults) => {
            if (err) {
              resolve({ error: err.toString() });
            } else {
              resolve(results);
            }
          }
        );
      });
    });
    
    // Process the results
    let totalIssuesCount = 0;
    let criticalCount = 0;
    let seriousCount = 0;
    let moderateCount = 0;
    let minorCount = 0;
    
    const axeResults = results as AxeResults;
    if (axeResults && axeResults.violations) {
      axeResults.violations.forEach((violation: AxeViolation) => {
        const nodeCount = violation.nodes.length;
        totalIssuesCount += nodeCount;
        
        switch(violation.impact) {
          case 'critical':
            criticalCount += nodeCount;
            break;
          case 'serious':
            seriousCount += nodeCount;
            break;
          case 'moderate':
            moderateCount += nodeCount;
            break;
          case 'minor':
            minorCount += nodeCount;
            break;
        }
      });
    }
    
    // Create the audit summary
    const summary: AuditSummary = {
      url,
      totalIssuesCount,
      criticalCount,
      seriousCount,
      moderateCount,
      minorCount,
      passedRules: axeResults?.passes?.length || 0,
      incompleteRules: axeResults?.incomplete?.length || 0,
      timestamp: new Date().toISOString(),
    };
    
    return {
      summary,
      violations: axeResults?.violations || [],
    };
  } catch (error) {
    console.error('Error running accessibility audit:', error);
    throw error;
  } finally {
    // Close the browser
    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        console.error('Błąd podczas zamykania przeglądarki:', error instanceof Error ? error.message : String(error));
      }
    }
  }
}

/**
 * Helper function to scroll through the page to ensure all lazy-loaded elements are visible
 * Z optymalizacją i obsługą błędów
 */
async function autoScroll(page: Page): Promise<void> {
  try {
    // Limit czasu przewijania (10 sekund)
    const scrollTimeoutMs = 10000;
    
    // Sprawdzenie, czy strona ma scrollowalny content
    const hasScrollableContent = await page.evaluate(() => {
      return document.body.scrollHeight > window.innerHeight;
    }).catch(() => true); // W razie błędu zakładamy, że strona jest scrollowalna
    
    if (!hasScrollableContent) {
      console.log('Strona nie wymaga przewijania - brak scrollowalnej zawartości');
      return;
    }
    
    // Bardziej zaawansowane przewijanie z obsługą różnych przypadków
    await page.evaluate(async (maxScrollTime) => {
      return new Promise<void>((resolve) => {
        const startTime = Date.now();
        let lastScrollTop = 0;
        let scrollStuckCount = 0;
        const maxScrollStuck = 5; // Ile razy możemy "utknąć" w tym samym miejscu
        
        const scrollInterval = setInterval(() => {
          // Sprawdź, czy czas przewijania nie przekroczył limitu
          if (Date.now() - startTime > maxScrollTime) {
            console.log('Osiągnięto limit czasu przewijania');
            clearInterval(scrollInterval);
            resolve();
            return;
          }
          
          // Pobierz aktualną pozycję przewijania
          const currentScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
          const scrollHeight = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.offsetHeight
          );
          
          // Sprawdź, czy jesteśmy na dole strony
          const isAtBottom = currentScrollTop + window.innerHeight >= scrollHeight - 50;
          
          // Sprawdź, czy przewijanie "utknęło" w tym samym miejscu
          if (Math.abs(currentScrollTop - lastScrollTop) < 10) {
            scrollStuckCount++;
            if (scrollStuckCount >= maxScrollStuck) {
              console.log('Przewijanie utknęło w tym samym miejscu');
              clearInterval(scrollInterval);
              resolve();
              return;
            }
          } else {
            scrollStuckCount = 0; // Resetuj licznik, jeśli przewijanie postępuje
          }
          
          // Zapisz ostatnią pozycję przewijania
          lastScrollTop = currentScrollTop;
          
          // Przewiń dalej
          window.scrollBy(0, 300);
          
          // Jeśli jesteśmy na dole strony, zakończ
          if (isAtBottom) {
            console.log('Osiągnięto koniec strony');
            clearInterval(scrollInterval);
            resolve();
          }
        }, 100);
      });
    }, scrollTimeoutMs);
    
    // Krótka pauza po przewijaniu, aby dać czas na załadowanie lazy-loaded elementów
    await page.waitForTimeout(500);
    
    // Przewiń z powrotem na górę strony
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    }).catch(e => console.warn('Nie udało się przewinąć na górę strony:', e));
    
  } catch (error) {
    console.error('Błąd podczas przewijania strony:', error);
    // Nie rzucamy wyjątku, pozwalamy kontynuować audyt
  }
}
