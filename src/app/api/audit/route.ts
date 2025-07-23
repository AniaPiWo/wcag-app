/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { chromium, Page, Browser, BrowserContext } from 'playwright';
import { z } from 'zod';
import { queueAudit } from './queue';
import { auditService } from '@/lib/db/audit-service';
import fs from 'fs';
import path from 'path';

const MAX_PLAYWRIGHT_RETRIES = 3;
const PLAYWRIGHT_TIMEOUT = 300000;
const BASIC_ACCESSIBILITY_CHECKS = [
  { name: 'alt-text', description: 'Obrazy powinny mieć tekst alternatywny', wcag: 'WCAG 1.1.1' },
  { name: 'heading-order', description: 'Nagłówki powinny być w odpowiedniej kolejności', wcag: 'WCAG 1.3.1, 2.4.6' },
  { name: 'color-contrast', description: 'Tekst powinien mieć wystarczający kontrast', wcag: 'WCAG 1.4.3' },
  { name: 'form-labels', description: 'Pola formularzy powinny mieć etykiety', wcag: 'WCAG 1.3.1, 3.3.2' },
  { name: 'keyboard-accessibility', description: 'Elementy interaktywne powinny być dostępne z klawiatury', wcag: 'WCAG 2.1.1' },
  { name: 'aria-attributes', description: 'Atrybuty ARIA powinny być poprawnie użyte', wcag: 'WCAG 4.1.2' },
  { name: 'document-structure', description: 'Dokument powinien mieć poprawną strukturę', wcag: 'WCAG 1.3.1, 2.4.1' }
];

const auditRequestSchema = z.object({
  url: z.string().url('Niepoprawny adres URL'),
  email: z.string().email('Niepoprawny adres email').optional(),
  name: z.string().min(2, 'Imię jest zbyt krótkie').optional(),
});

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


export async function POST(request: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers });
  }

  try {

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
    
    const validationResult = auditRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Nieprawidłowe dane wejściowe', details: validationResult.error.format() },
        { status: 400, headers }
      );
    }
    
    const { url, email, name } = validationResult.data;
    
    let auditRequest;
    try {
      auditRequest = await auditService.createAuditRequest({
        url,
        email,
        name
      });
      console.log('Utworzono żądanie audytu:', auditRequest.id, auditRequest.url);
    } catch (dbError) {
      console.error('Błąd podczas tworzenia żądania audytu w bazie danych:', dbError);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); 
      
      // Próba GET zamiast HEAD - niektóre serwery nie obsługują HEAD poprawnie
      const urlCheckResponse = await fetch(url, { 
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

    let auditResults;
    let retryCount = 0;
    let lastError;
    
    while (retryCount < MAX_PLAYWRIGHT_RETRIES) {
      try {

        if (auditRequest) {
          await auditService.updateAuditRequestStatus(auditRequest.id, 'Audyt w toku', '', 'in-progress');
        }
        
        auditResults = await queueAudit(url, runAccessibilityAudit);
        break; 
      } catch (error) {
        lastError = error;
        console.error(`Próba ${retryCount + 1}/${MAX_PLAYWRIGHT_RETRIES} nie powiodła się:`, error);
        retryCount++;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!auditResults) {
      const errorMessage = `Nie udało się przeprowadzić audytu po ${MAX_PLAYWRIGHT_RETRIES} próbach: ${lastError instanceof Error ? lastError.message : String(lastError)}`;

      if (auditRequest) {
        await auditService.recordFailedAudit(auditRequest.id, errorMessage);
      }
      
      throw new Error(errorMessage);
    }
    
    if (auditRequest) {
      try {
        await auditService.saveAuditResults(auditRequest.id, auditResults);
        console.log('\x1b[32m%s\x1b[0m', 'Zapisano wyniki audytu dla żądania:', auditRequest.id);
        
        // Uruchomienie analizy AI w tle (bez oczekiwania na zakończenie)
        auditService.runAiAnalysisInBackground(auditRequest.id, auditResults.violations, auditResults.summary)
          .catch(aiError => {
            console.error('\x1b[31m%s\x1b[0m', 'Błąd podczas uruchamiania analizy AI:', aiError);
          });
      } catch (dbError) {
        console.error('\x1b[31m%s\x1b[0m', 'Błąd podczas zapisywania wyników audytu:', dbError);
      }
    }
    
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

// jesli nie mozemy uzyc axe-core - audyt podstawowy
async function runBasicAccessibilityAudit(page: Page, url: string): Promise<{
  summary: AuditSummary;
  violations: AxeViolation[];
}> {
  console.log('Uruchamianie podstawowego audytu dostępności bez axe-core');
  
  const violations: AxeViolation[] = [];
  
  try {

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
    

    
    const headingsOrder = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const result = [];
      let previousLevel = 0;
      
      for (const heading of headings) {
        const level = parseInt(heading.tagName.charAt(1));
        const text = heading.textContent || 'Pusty nagłówek';
        
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

// axe full audit
export async function runAccessibilityAudit(url: string): Promise<{
  summary: AuditSummary;
  violations: AxeViolation[];
}> {
  // Deklarujemy zmienne na poziomie funkcji i inicjalizujemy je jako null
  // aby zapewnić prawidłowy dostęp w bloku finally
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  
  // Dodajemy flagę do śledzenia, czy zasoby są gotowe do użycia
  // i czy nie zostały już zamknięte
  let resourcesInitialized = false;

  try {
    console.log('\x1b[33m%s\x1b[0m', `Rozpoczynam audyt dla URL: ${url}`);

    // Generujemy unikalny identyfikator dla tego audytu
    const auditId = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    console.log(`\x1b[34m%s\x1b[0m`, `ID audytu: ${auditId} dla URL: ${url}`);

    // Tworzenie nowej instancji przeglądarki dla każdego audytu
    // z pełną izolacją zasobu
    try {
      console.log(`\x1b[34m%s\x1b[0m`, `[${auditId}] Uruchamianie nowej instancji przeglądarki...`);
      
      browser = await chromium.launch({
        headless: true,
        chromiumSandbox: false, // w środowisku serverless może być potrzebne
        args: [
          '--disable-setuid-sandbox',
          '--no-sandbox', // dla containerów
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote', 
          '--single-process', // ważne dla stabilności
          '--disable-gpu',
          '--disable-extensions', // wyłączenie rozszerzeń
          '--disable-background-networking', // ograniczenie połączeń sieciowych w tle
          '--disable-default-apps', // wyłączenie aplikacji domyślnych
          '--disable-sync', // wyłączenie synchronizacji
          '--disable-translate', // wyłączenie tłumaczeń
          '--metrics-recording-only', // tylko podstawowe metryki
          '--mute-audio' // wyciszenie dźwięku
        ],
        // Dodajemy timeout przy uruchamianiu przeglądarki
        timeout: 60000, // zwiększamy timeout dla uruchomienia przeglądarki
        handleSIGINT: false, // wyłączenie obsługi SIGINT, aby uniknąć zamykania przeglądarki przez inne procesy
        handleSIGTERM: false, // wyłączenie obsługi SIGTERM z tego samego powodu
        handleSIGHUP: false // wyłączenie obsługi SIGHUP z tego samego powodu
      });
      
      if (!browser) {
        throw new Error('Przeglądarka nie została utworzona');
      }
    } catch (error) {
      console.error(`\x1b[31m%s\x1b[0m`, `[${auditId}] Błąd podczas uruchamiania przeglądarki:`, error);
      throw new Error(`Nie udało się uruchomić przeglądarki: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    console.log(`\x1b[32m%s\x1b[0m`, `[${auditId}] Przeglądarka uruchomiona pomyślnie`);
    
    // Używamy bardziej realistycznego user-agent
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
    
    try {
      // Sprawdzamy czy przeglądarka jest wciąż dostępna przed utworzeniem kontekstu
      if (!browser || browser.isConnected() === false) {
        throw new Error('Przeglądarka nie jest już dostępna, nie można utworzyć kontekstu');
      }
      
      console.log(`\x1b[34m%s\x1b[0m`, `[${auditId}] Tworzenie nowego kontekstu przeglądarki...`);
      
      // Tworzenie kontekstu z określonymi parametrami - izolowanego dla tego audytu
      context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: userAgent,
        // Dodajemy dodatkowe nagłówki dla wszystkich żądań
        extraHTTPHeaders: {
          'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'x-wcag-audit': 'true', // własny nagłówek dla identyfikacji że to nasz audyt
          'x-audit-id': auditId, // dodajemy unikalny identyfikator audytu
        },
        // Włączamy JavaScript i ciasteczka
        javaScriptEnabled: true,
        // Ignorujemy błędy HTTPS
        ignoreHTTPSErrors: true,
        // Ustawiamy locale
        locale: 'pl-PL',
        timezoneId: 'Europe/Warsaw',
        // Dodajemy dodatkowe parametry dla lepszej izolacji i stabilności
        bypassCSP: true, // pomijamy politykę CSP, która może blokować wstrzykiwanie skryptów
        permissions: ['clipboard-read', 'clipboard-write'], // ustawienia uprawnień
        colorScheme: 'light', // ustawienie jasnego motywu
        deviceScaleFactor: 1, // domyślne skalowanie urządzenia
        acceptDownloads: false, // wyłączamy pobieranie plików
        hasTouch: false, // wyłączamy funkcję dotykową
        isMobile: false, // nie emulujemy urządzenia mobilnego
        offline: false, // nie jesteśmy offline
        forcedColors: 'none', // bez wymuszania kolorów
        reducedMotion: 'no-preference', // bez ograniczania animacji
        screen: { width: 1920, height: 1080 } // ustawienia ekranu
      });
      
      if (!context) {
        throw new Error('Kontekst przeglądarki nie został utworzony');
      }
      
    } catch (error) {
      console.error(`\x1b[31m%s\x1b[0m`, `[${auditId}] Błąd podczas tworzenia kontekstu przeglądarki:`, error);
      throw new Error(`Nie udało się utworzyć kontekstu przeglądarki: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    console.log(`\x1b[32m%s\x1b[0m`, `[${auditId}] Dodano nagłówki audytu do kontekstu przeglądarki`);

    // Ustawienie obsługi zdarzeń kontekstu dla lepszego debugowania
    try {
      if (context) {
        context.on('close', () => {
          console.log(`\x1b[35m%s\x1b[0m`, `[${auditId}] Kontekst został zamknięty przez zewnętrzne źródło`);
        });
      }
    } catch (e) {
      // Ignorujemy błędy przy rejestrowaniu event handlera
      console.warn(`\x1b[33m%s\x1b[0m`, `[${auditId}] Nie można dodać obsługi zdarzeń kontekstu:`, e);
    }
    
    try {
      // Tworzenie nowej strony z obsługą błędów
      if (!context) {
        throw new Error('Kontekst przeglądarki nie został utworzony');
      }
      
      // Sprawdzamy czy kontekst nie został zamknięty
      try {
        // Test czy kontekst jest wciąż aktywny przez próbę dostania się do jego właściwości
        try {
          // Sprawdzamy czy możemy pobrać listę stron
          await context.pages();
        } catch (pageError) {
          throw new Error('Kontekst przeglądarki został zamknięty');
        }
      } catch (e) {
        throw new Error(`Kontekst przeglądarki nie jest już dostępny: ${e instanceof Error ? e.message : String(e)}`);
      }

      console.log(`\x1b[34m%s\x1b[0m`, `[${auditId}] Tworzenie nowej strony...`);
      page = await context.newPage().catch((e) => {
        throw new Error(`Nie można utworzyć strony: ${e instanceof Error ? e.message : String(e)}`);
      });
      
      if (!page) {
        throw new Error('Nie utworzono obiektu strony');
      }

      // Dodajemy obsługę zdarzeń dla strony
      try {
        page.on('crash', () => {
          console.error(`\x1b[31m%s\x1b[0m`, `[${auditId}] Strona uległa awarii`);
        });
        
        page.on('close', () => {
          console.log(`\x1b[35m%s\x1b[0m`, `[${auditId}] Strona została zamknięta`);
        });
      } catch (e) {
        // Ignorujemy błędy przy rejestrowaniu event handlerów
      }
      
      resourcesInitialized = true;
      console.log(`\x1b[32m%s\x1b[0m`, `[${auditId}] Utworzono nową stronę przeglądarki`);
    } catch (error) {
      console.error(`\x1b[31m%s\x1b[0m`, `[${auditId}] Błąd podczas tworzenia strony:`, error);
      throw new Error(`Nie udało się utworzyć strony: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    try {
      // Funkcja pomocnicza do weryfikacji czy strona, kontekst i przeglądarka są wciąż dostępne
      async function verifyResourcesAvailable() {
        // Weryfikacja przeglądarki
        if (!browser) {
          throw new Error('Brak inicjalizacji przeglądarki');
        }
        
        try {
          // Sprawdzamy czy przeglądarka jest wciąż połączona
          if (browser.isConnected() === false) {
            throw new Error('Przeglądarka nie jest już połączona');
          }
        } catch (e) {
          throw new Error(`Przeglądarka nie jest dostępna: ${e instanceof Error ? e.message : String(e)}`);
        }
        
        // Weryfikacja kontekstu
        if (!context) {
          throw new Error('Brak inicjalizacji kontekstu przeglądarki');
        }
        
        try {
          // Próba dostępu do właściwości kontekstu
          await context.pages();
        } catch (e) {
          throw new Error(`Kontekst przeglądarki nie jest już dostępny: ${e instanceof Error ? e.message : String(e)}`);
        }
        
        // Weryfikacja strony
        if (!page) {
          throw new Error('Brak inicjalizacji strony przeglądarki');
        }
        
        try {
          // Próba dostępu do właściwości strony (w sposób, który nie wpłynie na stan strony)
          // Najpierw sprawdzamy czy strona istnieje
          if (!page) {
            throw new Error('Strona nie jest zainicjalizowana');
          }
          
          // Bezpieczne pobranie URL z obsługą błędów
          try {
            const currentUrl = page.url();
            if (!currentUrl) {
              throw new Error('Nie można pobrać URL strony');
            }
          } catch (urlError) {
            throw new Error('Strona nie jest już dostępna');
          }
        } catch (e) {
          throw new Error(`Strona nie jest już dostępna: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
      
      // Funkcja pomocnicza do próby ominięcia zabezpieczeń 403
      async function tryBypassProtection() {
        console.log(`\x1b[34m%s\x1b[0m`, `[${auditId}] Próba ominięcia zabezpieczeń 403...`);
        
        // Sprawdzamy najpierw czy zasoby są dostępne
        await verifyResourcesAvailable();
        
        // Sprawdzanie czy page i context są dostępne
        if (!page) {
          throw new Error('Strona nie jest zainicjalizowana');
        }

        if (!context) {
          throw new Error('Kontekst przeglądarki nie jest zainicjalizowany');
        }
        
        // Próba 1: Dodanie referer
        await page.setExtraHTTPHeaders({
          'Referer': new URL(url).origin
        });
        
        // Próba 2: Dodanie cookie do domeny
        await context.addCookies([{
          name: 'wcag_audit_access',
          value: 'true',
          domain: new URL(url).hostname,
          path: '/',
        }]);
        
        // Próba 3: Zmiana nagłówków na bardziej przypominające przeglądarkę
        await page.setExtraHTTPHeaders({
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"'
        });
        
        // Próba 4: Emulacja interakcji użytkownika
        try {
          // Sprawdzamy ponownie czy strona jest dostępna
          if (!page) {
            throw new Error('Strona nie jest dostępna podczas emulacji interakcji');
          }
          
          // Próba kliknięcia w przyciski akceptacji cookie/terms
          const possibleSelectors = [
            'button:has-text("Akceptuj")', 
            'button:has-text("Accept")',
            'button:has-text("Zgadzam")',
            'button:has-text("Agree")',
            'button:has-text("OK")',
            'button:has-text("Continue")',
            'button:has-text("Kontynuuj")',
            'button:has-text("Dalej")',
            'button:has-text("Next")',
            'a:has-text("Akceptuj")',
            'a:has-text("Accept")',
            '.cookie-button',
            '.accept-button',
            '.consent-button',
            '#consent-button',
            '#accept-cookies'
          ];
          
          // Próbujemy kliknąć w każdy z możliwych elementów
          for (const selector of possibleSelectors) {
            const button = await page.$(selector);
            if (button) {
              console.log(`\x1b[34m%s\x1b[0m`, `[${auditId}] Znaleziono element ${selector}, próba kliknięcia...`);
              await button.click().catch((e: Error) => console.log(`Błąd kliknięcia: ${e.message}`));
              await page.waitForTimeout(500); // Krótkie opóźnienie po kliknięciu
            }
          }
          
          // Próba wykonania scrollowania strony
          if (page) { // Ponowne sprawdzenie page, ponieważ może zostać zamknięty podczas klikania
            await autoScroll(page);
          }
          
        } catch (e) {
          console.log(`\x1b[33m%s\x1b[0m`, `[${auditId}] Błąd podczas emulacji interakcji: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
      
      //console.log(`\x1b[34m%s\x1b[0m`, `[${auditId}] Przygotowanie do nawigacji na URL: ${url}`);
      
      // Sprawdzamy czy zasoby są dostępne przed nawigacją
      await verifyResourcesAvailable();
      
      //console.log(`\x1b[34m%s\x1b[0m`, `[${auditId}] Rozpoczynam nawigację do: ${url}`);
      
      // Próbujemy załadować stronę z bezpiecznym wrapperem z obsługą błędów
      let response = null;
      try {
        response = await page.goto(url, { 
          waitUntil: 'domcontentloaded', 
          timeout: PLAYWRIGHT_TIMEOUT 
        });
        //console.log(`\x1b[32m%s\x1b[0m`, `[${auditId}] Nawigacja zakończona pomyślnie`);
      } catch (navigationError) {
        //console.error(`\x1b[31m%s\x1b[0m`, `[${auditId}] Błąd podczas nawigacji:`, navigationError);
        
        // Sprawdzamy czy zasoby są nadal dostępne po błędzie nawigacji
        try {
          await verifyResourcesAvailable();
          throw new Error(`Błąd nawigacji: ${navigationError instanceof Error ? navigationError.message : String(navigationError)}`);
        } catch (resourceError) {
          throw new Error(`Zasoby przeglądarki zostały zamknięte podczas nawigacji: ${resourceError instanceof Error ? resourceError.message : String(resourceError)}`);
        }
      }
      
      // Jeśli otrzymaliśmy 403, próbujemy obejść zabezpieczenia
      if (response && response.status() === 403) {
        console.warn(`\x1b[33m%s\x1b[0m`, `[${auditId}] Otrzymano kod 403 (Forbidden), próbujemy obejść zabezpieczenia...`);
        
        // Próba ominięcia zabezpieczeń
        await tryBypassProtection();
        
        // Ponowna próba załadowania strony
        //console.log(`\x1b[34m%s\x1b[0m`, `[${auditId}] Ponowna próba załadowania strony po ominięciu zabezpieczeń...`);
        
        // Sprawdzamy ponownie czy zasoby są dostępne
        await verifyResourcesAvailable();
        
        try {
          response = await page.goto(url, { 
            waitUntil: 'domcontentloaded', 
            timeout: PLAYWRIGHT_TIMEOUT 
          });
          //console.log(`\x1b[32m%s\x1b[0m`, `[${auditId}] Ponowna nawigacja zakończona pomyślnie`);
        } catch (retryError) {
          //console.error(`\x1b[31m%s\x1b[0m`, `[${auditId}] Błąd podczas ponownej nawigacji:`, retryError);
          throw new Error(`Błąd podczas ponownej nawigacji: ${retryError instanceof Error ? retryError.message : String(retryError)}`);
        }
      }
      
      if (response) {
        const status = response.status();
        console.log(`\x1b[34m%s\x1b[0m`, `[${auditId}] Status odpowiedzi strony: ${status}`);
        
        // Sprawdzamy kody błędów serwera i strony nie znalezionej
        const isServerError = status >= 500 || status === 404;
        
        if (isServerError) {
          throw new Error(`Nie udało się załadować strony: kod odpowiedzi ${status}`);
        }
        
        // Jeśli kod to 403, kontynuujemy audyt mimo wszystko
        if (status === 403) {
          console.warn(`\x1b[33m%s\x1b[0m`, `[${auditId}] Otrzymano kod 403 (Forbidden) nawet po próbie ominięcia zabezpieczeń, ale kontynuujemy audyt`);
        }
      } else {
        console.warn(`\x1b[33m%s\x1b[0m`, `[${auditId}] Brak obiektu odpowiedzi, ale kontynuujemy audyt`);
      }
      
      // Dodajemy krótkie opóźnienie, aby strona miała czas się ustabilizować
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sprawdzamy ponownie czy zasoby są dostępne
      await verifyResourcesAvailable();
      
      // Czekamy na pełne załadowanie strony
      try {
        await page.waitForLoadState('load', { timeout: PLAYWRIGHT_TIMEOUT / 2 });
        //console.log(`\x1b[32m%s\x1b[0m`, `[${auditId}] Strona w pełni załadowana`);
      } catch (loadError) {
        console.warn(`\x1b[33m%s\x1b[0m`, `[${auditId}] Timeout podczas oczekiwania na pełne załadowanie strony, ale kontynuujemy:`, loadError);
      }
      
    } catch (error) {
      console.error(`\x1b[31m%s\x1b[0m`, `[${auditId}] Błąd podczas ładowania strony:`, error);
      throw new Error(`Nie udało się załadować strony: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    await autoScroll(page);
    
    try {
      const axeCorePath = path.resolve(process.cwd(), 'node_modules', 'axe-core', 'axe.min.js');
      let axeScript;
      
      try {
        // Zabezpieczenie przed path traversal
        const normalizedPath = path.normalize(axeCorePath);
        if (!normalizedPath.startsWith(process.cwd())) {
          throw new Error('Niedozwolona ścieżka do pliku');
        }
        
        axeScript = fs.readFileSync(normalizedPath, 'utf-8');
        console.log('\x1b[32m%s\x1b[0m', 'Wczytano axe-core');

      } catch (fsError) {
        console.error('\x1b[31m%s\x1b[0m', 'Błąd odczytu axe-core:', fsError);

        // Fallback do CDN
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const axeResponse = await fetch('https://unpkg.com/axe-core@4.10.3/axe.min.js', {
            signal: controller.signal,
            headers: { 'Accept': 'application/javascript' }
          });
          
          clearTimeout(timeoutId);
          
          if (!axeResponse.ok) {
            throw new Error(`Nie udało się pobrać axe-core z CDN: ${axeResponse.status}`);
          }
          
          axeScript = await axeResponse.text();
          console.log('\x1b[32m%s\x1b[0m', 'Użyto axe-core z CDN');
        } catch (fetchError) {
          console.error('\x1b[31m%s\x1b[0m', 'Błąd CDN:', fetchError);
          throw new Error(`Nie udało się pobrać axe-core: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
        }
      }
      
      // wstrzykiwanie axe-core (3 metody)
      let axeLoaded = false;
      
      // metoda 1: document.createElement
      try {
        await page.evaluate((axeScriptContent) => {
          try {
            const script = document.createElement('script');
            script.textContent = axeScriptContent;
            document.head.appendChild(script);
            return true;
          } catch (e) {
            console.error('Błąd metody 1:', e);
            return false;
          }
        }, axeScript);
        
        axeLoaded = await page.evaluate(() => {
          return typeof window['axe' as keyof Window] !== 'undefined';
        });
        
        if (axeLoaded) {
          console.log('\x1b[35m%s\x1b[0m', 'Wstrzyknięto axe-core (metoda 1)');

        }
      } catch (e) {
        console.warn('\x1b[33m%s\x1b[0m', 'Metoda 1 nie powiodła się:', e);
      }
      
      // Metoda 2: eval
      if (!axeLoaded) {
        try {
          await page.evaluate((axeScriptContent) => {
            try {
              eval(axeScriptContent);
              return true;
            } catch (e) {
              console.error('Błąd metody 2:', e);
              return false;
            }
          }, axeScript);
          
          axeLoaded = await page.evaluate(() => {
            return typeof window['axe' as keyof Window] !== 'undefined';
          });
          
          if (axeLoaded) {
            console.log('\x1b[35m%s\x1b[0m', 'Wstrzyknięto axe-core (metoda 2)');
          }
        } catch (e) {
          console.warn('\x1b[33m%s\x1b[0m', 'Metoda 2 nie powiodła się:', e);
        }
      }
      
      // Metoda 3: Function constructor
      if (!axeLoaded) {
        try {
          await page.evaluate((axeScriptContent) => {
            try {
              new Function(axeScriptContent)();
              return true;
            } catch (e) {
              console.error('Błąd metody 3:', e);
              return false;
            }
          }, axeScript);
          
          axeLoaded = await page.evaluate(() => {
            return typeof window['axe' as keyof Window] !== 'undefined';
          });
          
          if (axeLoaded) {
            console.log('\x1b[35m%s\x1b[0m', 'Wstrzyknięto axe-core (metoda 3)');
          }
        } catch (e) {
          console.warn('\x1b[33m%s\x1b[0m', 'Metoda 3 nie powiodła się:', e);
        }
      }
      
      // Fallback do podstawowego audytu
      if (!axeLoaded) {
        console.warn('Nie udało się wstrzyknąć axe-core - użycie audytu podstawowego');
        return await runBasicAccessibilityAudit(page, url);
      }
    } catch (error) {
      console.error('Błąd podczas wstrzykiwania axe-core:', error);
      throw new Error(`Nie udało się wstrzyknąć biblioteki axe-core: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // uruchomienie audytu z timeoutem
    const results = await Promise.race([
      page.evaluate(() => {
        return new Promise<AxeResults | { error: string }>((resolve) => {
          try {
            // @ts-expect-error - axe is injected at runtime
            window.axe.run(
              document,
              {
                runOnly: {
                  type: 'tag',
                  values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice', 'section508']
                },
                maxRules: 100,
                elementRef: false,
                selectors: false,
                resultTypes: ['violations', 'incomplete', 'passes'],
                reporter: 'v2'
              },
              (err: Error | null, results: AxeResults) => {
                if (err) {
                  resolve({ error: err.toString() });
                } else {
                  resolve(results);
                }
              }
            );
          } catch (e) {
            resolve({ error: `Błąd axe: ${e instanceof Error ? e.message : String(e)}` });
          }
        });
      }),
      new Promise<{ error: string }>((resolve) => {
        setTimeout(() => {
          resolve({ error: 'Timeout audytu' });
        }, PLAYWRIGHT_TIMEOUT - 5000);
      })
    ]);
    
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
    console.error('\x1b[31m%s\x1b[0m', 'Błąd podczas wykonywania audytu dostępności:', error);
    throw new Error(`Błąd podczas wykonywania audytu dostępności: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    //console.log('\x1b[33m%s\x1b[0m', 'Rozpoczynam bezpieczne zamykanie zasobów przeglądarki...');

    // Zamykanie zasobów w odwrotnej kolejności: strona -> kontekst -> przeglądarka
    // z odpowiednimi opóźnieniami i obsługą błędów

    // Funkcja do bezpiecznego zamykania z timeoutem
    const safeClose = async <T extends { close: () => Promise<void> }>(resource: T | null, name: string): Promise<void> => {
      if (!resource) return;
      
      try {
        // Dodajemy timeout aby nie czekać w nieskończoność
        const closePromise = resource.close();
        await Promise.race([
          closePromise,
          new Promise(resolve => setTimeout(resolve, 3000)) // 3s timeout
        ]);
        //console.log(`\x1b[32m%s\x1b[0m`, `Pomyślnie zamknięto: ${name}`);
      } catch (closeError) {
        console.error(`\x1b[31m%s\x1b[0m`, `Błąd podczas zamykania ${name}:`, 
          closeError instanceof Error ? closeError.message : String(closeError));
      }
    };

    try {
      // 1. Najpierw zamykamy stronę
      if (page) {
        await safeClose(page, 'strona');
      }
      
      // Dodajemy krótkie opóźnienie przed przejściem do kontekstu
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 2. Następnie zamykamy kontekst
      if (context) {
        await safeClose(context, 'kontekst przeglądarki');
      }
      
      // Dodajemy krótkie opóźnienie przed przejściem do przeglądarki
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 3. Na końcu zamykamy przeglądarkę
      if (browser) {
        await safeClose(browser, 'przeglądarka');
      }
    } catch (finallyError) {
      console.error('\x1b[31m%s\x1b[0m', 'Błąd podczas procedury zamykania zasobów:', 
        finallyError instanceof Error ? finallyError.message : String(finallyError));
    }
  }
}

/* Helper function to scroll through the page to ensure all lazy-loaded elements are visible */
async function autoScroll(page: Page): Promise<void> {
  try {
    const scrollTimeoutMs = 10000;
    
    const hasScrollableContent = await page.evaluate(() => {
      return document.body.scrollHeight > window.innerHeight;
    }).catch(() => true); 
    
    if (!hasScrollableContent) {
      return;
    }
    
    await page.evaluate(async (maxScrollTime) => {
      return new Promise<void>((resolve) => {
        const startTime = Date.now();
        let lastScrollTop = 0;
        let scrollStuckCount = 0;
        const maxScrollStuck = 5; 
        
        const scrollInterval = setInterval(() => {
          if (Date.now() - startTime > maxScrollTime) {
            clearInterval(scrollInterval);
            resolve();
            return;
          }
          
          const currentScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
          const scrollHeight = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.offsetHeight
          );
          
          const isAtBottom = currentScrollTop + window.innerHeight >= scrollHeight - 50;
          
          if (Math.abs(currentScrollTop - lastScrollTop) < 10) {
            scrollStuckCount++;
            if (scrollStuckCount >= maxScrollStuck) {
              clearInterval(scrollInterval);
              resolve();
              return;
            }
          } else {
            scrollStuckCount = 0; 
          }
        
          lastScrollTop = currentScrollTop;
          window.scrollBy(0, 300);
          
          if (isAtBottom) {
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
    //console.error('Błąd podczas przewijania strony:', error);
    // Nie rzucamy wyjątku, pozwalamy kontynuować audyt
  }
}
