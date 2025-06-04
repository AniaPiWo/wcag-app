import { prisma } from '../prisma';
import type { AuditSummary, AxeViolation } from '@/app/api/audit/types';
import { analyzeAccessibilityResults, AccessibilityViolation } from '../ai/ai-analysis';

export const auditService = {

  // tworzy zadanie audytu
  async createAuditRequest({ url, name = '', email = '' }: { url: string; name?: string; email?: string }) {
    return prisma.auditRequest.create({
      data: {
        url,
        name,
        email,
      },
    });
  },


  // aktualizuje status audytu
  async updateAuditRequestStatus(id: string, p0: string, errorMessage: string, status: 'pending' | 'in-progress' | 'completed' | 'failed') {
    return prisma.auditRequest.update({
      where: { id },
      data: { status },
    });
  },

  // zapisuje wyniki audytu
  async saveAuditResults(
    requestId: string,
    results: {
      summary: AuditSummary;
      violations: AxeViolation[];
    }
  ) {
    // Serializacja naruszeń do formatu JSON
    const violationsJson = JSON.stringify(results.violations);
    
  
    // Aktualizacja istniejącego rekordu AuditRequest
    const updatedAudit = await prisma.auditRequest.update({
      where: { id: requestId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        totalIssuesCount: results.summary.totalIssuesCount,
        criticalCount: results.summary.criticalCount,
        seriousCount: results.summary.seriousCount,
        moderateCount: results.summary.moderateCount,
        minorCount: results.summary.minorCount,
        passedRules: results.summary.passedRules,
        incompleteRules: results.summary.incompleteRules,
        timestamp: results.summary.timestamp,
        violations: violationsJson,
      },
    });

    return updatedAudit;
  },

  // pobiera audyt
  async getAuditRequest(id: string) {
    const request = await prisma.auditRequest.findUnique({
      where: { id }
    });
    
    if (request && request.violations) {
      // Parsowanie naruszeń z JSON, jeśli istnieją
      try {
        const parsedViolations = JSON.parse(request.violations) as AxeViolation[];
        
        return {
          ...request,
          parsedViolations
        };
      } catch (error) {
        console.error('Błąd parsowania naruszeń JSON:', error);
      }
    }
    
    return request;
  },

  // audyty według email
  async getAuditRequestsByEmail(email: string) {
    return prisma.auditRequest.findMany({
      where: { email },
      orderBy: { createdAt: 'desc' }
    });
  },

  // filtruje audyty
  async getAuditRequests(filter?: { status?: string; email?: string }) {
    const where: {
      status?: string;
      email?: string;
    } = {};
    
    if (filter?.status) {
      where.status = filter.status;
    }
    
    if (filter?.email) {
      where.email = filter.email;
    }
    
    return prisma.auditRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  },

  // rejestruje niepowodzenie
  async recordFailedAudit(requestId: string, errorMessage: string) {
    return prisma.auditRequest.update({
      where: { id: requestId },
      data: {
        status: 'failed',
        completedAt: new Date(),
        errorMessage: errorMessage
      },
    });
  },

  // uruchamia analizę AI w tle i zapisuje wyniki do bazy danych
  async runAiAnalysisInBackground(requestId: string, violations: AxeViolation[]) {
    try {
      console.log('\x1b[36m%s\x1b[0m', `⚙️ Rozpoczynam analizę AI dla audytu ${requestId}...`);
      // Konwertujemy violations na typ AccessibilityViolation
      const accessibilityViolations = violations as unknown as AccessibilityViolation[];
      const aiAnalysisPromise = analyzeAccessibilityResults(accessibilityViolations);
      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout analizy AI')), 30000);
      });
      const aiAnalysis = await Promise.race([aiAnalysisPromise, timeoutPromise]);
      console.log('\x1b[32m%s\x1b[0m', `✅ Analiza AI dla audytu ${requestId} zakończona`);
      console.log(aiAnalysis);

      // Zapisujemy analizę AI do bazy danych za pomocą bezpośredniego zapytania SQL
      try {
        await prisma.$executeRaw`UPDATE "AuditRequest" SET "aiAnalysis" = ${aiAnalysis} WHERE id = ${requestId}`;
        console.log('\x1b[32m%s\x1b[0m', `✅ Zapisano analizę AI do bazy danych dla audytu ${requestId}`);
      } catch (dbError) {
        console.error('\x1b[31m%s\x1b[0m', `❌ Błąd podczas zapisywania analizy AI do bazy danych:`, dbError);
        // Kontynuujemy mimo błędu zapisu do bazy - analiza została już wygenerowana
      }

      return aiAnalysis;
    } catch (error) {
      console.error('\x1b[31m%s\x1b[0m', `❌ Błąd podczas analizy AI dla audytu ${requestId}:`, error);
      return null;
    }
  },
};
