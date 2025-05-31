import { prisma } from '../prisma';
import type { AuditSummary, AxeViolation } from '@/app/api/audit/types';

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
  async updateAuditRequestStatus(id: string, status: 'pending' | 'in-progress' | 'completed' | 'failed') {
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
    
    // Parsowanie naruszeń z JSON, jeśli istnieją
    if (request && request.violations) {
      try {
        const parsedViolations = JSON.parse(request.violations);
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
};
