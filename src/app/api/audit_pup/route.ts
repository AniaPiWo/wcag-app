import { NextRequest, NextResponse } from 'next/server';
import puppeteer, { Page } from 'puppeteer';
import { z } from 'zod';

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
 * Runs an accessibility audit on the provided URL using axe-core and Puppeteer
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate the request data
    const validationResult = auditRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Nieprawidłowe dane wejściowe', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { url, email, name } = validationResult.data;
    
    // Run the accessibility audit
    const auditResults = await runAccessibilityAudit(url);
    
    // Return the audit results
    return NextResponse.json({
      success: true,
      url,
      email,
      name,
      results: auditResults,
    });
  } catch (error) {
    console.error('Błąd podczas przeprowadzania audytu:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas przeprowadzania audytu', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Runs an accessibility audit on the provided URL using axe-core and Puppeteer
 */
async function runAccessibilityAudit(url: string): Promise<{
  summary: AuditSummary;
  violations: AxeViolation[];
}> {
  let browser;
  try {
    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    // Create a new page
    const page = await browser.newPage();
    
    // Set viewport and user agent for realistic rendering
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Scroll through the page to ensure all lazy-loaded elements are visible
    await autoScroll(page);
    
    // Inject and run axe-core - używamy CDN, ponieważ w środowisku Next.js App Router
    // nie możemy łatwo uzyskać dostępu do plików node_modules
    await page.addScriptTag({
      url: 'https://unpkg.com/axe-core@4.10.3/axe.min.js'
    });
    
    // Upewniamy się, że axe jest załadowany
    await page.waitForFunction(() => typeof window.axe !== 'undefined');
    
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
          (err: Error, results: AxeResults) => {
            if (err) resolve({ error: err.message });
            resolve(results);
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
    if (browser) await browser.close();
  }
}

/**
 * Helper function to scroll through the page to ensure all lazy-loaded elements are visible
 */
async function autoScroll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
