import { prisma } from '../prisma';
import type { AuditSummary, AxeViolation } from '@/app/api/audit/types';
import { analyzeAccessibilityResults } from '../ai/ai-analysis';
import { sendAuditResults } from '../email/email-service';

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
  async updateAuditRequestStatus(id: string, errorMessage: string, status: 'pending' | 'in-progress' | 'completed' | 'failed') {
    return prisma.auditRequest.update({
      where: { id },
      data: { status, errorMessage },
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
  async getAuditRequests(filter?: { status?: string; email?: string; auditType?: string }) {
    const where: {
      status?: string;
      email?: string;
      auditType?: string;
    } = {};
    
    if (filter?.status) {
      where.status = filter.status;
    }
    
    if (filter?.email) {
      where.email = filter.email;
    }
    
    if (filter?.auditType) {
      where.auditType = filter.auditType;
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

  // uruchamia analizę AI w tle, zapisuje wyniki i wysyła email
  async runAiAnalysisInBackground(requestId: string, violations: AxeViolation[], summary: AuditSummary) {
    try {
      const auditRequest = await this.getAuditRequest(requestId);

      const aiAnalysis = await Promise.race([
        analyzeAccessibilityResults(violations, summary),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout analizy AI')), 30000)
        ),
      ]);

      await prisma.auditRequest.update({
        where: { id: requestId },
        data: { aiAnalysis },
      });

      if (auditRequest?.email) {
        try {
          await sendAuditResults({
            to: auditRequest.email,
            name: auditRequest.name ?? '',
            summary,
            aiAnalysis,
          });
        } catch (emailError) {
          // Email nie jest krytyczny — audyt jest już zapisany w bazie
          console.error(`Błąd wysyłki emaila dla audytu ${requestId}:`, emailError);
        }
      }

      return aiAnalysis;
    } catch (error) {
      console.error(`Błąd analizy AI dla audytu ${requestId}:`, error);
      return null;
    }
  },

  // usuwa audyt o podanym ID
  async deleteAuditRequest(id: string) {
    try {
      // Usuwamy audyt
      return await prisma.auditRequest.delete({
        where: { id }
      });
    } catch (error) {
      console.error(`Błąd podczas usuwania audytu ${id}:`, error);
      throw error;
    }
  },

  // znajduje audyty po URL
  async findAuditRequestsByUrl(url: string) {
    const normalizeUrl = (inputUrl: string) =>
      inputUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

    const base = normalizeUrl(url);
    const urlVariants = [
      `http://${base}`,
      `https://${base}`,
      `http://www.${base}`,
      `https://www.${base}`,
      `http://${base}/`,
      `https://${base}/`,
      `http://www.${base}/`,
      `https://www.${base}/`,
    ];

    return prisma.auditRequest.findMany({
      where: {
        status: 'completed',
        url: { in: urlVariants },
      },
      orderBy: { completedAt: 'desc' },
    });
  },
};
