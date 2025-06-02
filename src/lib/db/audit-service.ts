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
    
    
    // Grupowanie naruszeń według typu i zliczanie wystąpień
    const violationCounts: Record<string, { count: number, details: Omit<AxeViolation, 'nodes'> & { nodesCount: number } }> = {};
    
    results.violations.forEach(violation => {
      const { id, impact, description, help, helpUrl, nodes } = violation;
      
      if (!violationCounts[id]) {
        violationCounts[id] = {
          count: 0,
          details: {
            id,
            impact,
            description,
            help,
            helpUrl,
            nodesCount: 0
          }
        };
      }
      
      violationCounts[id].count++;
      violationCounts[id].details.nodesCount += nodes.length;
    });
    
    // Grupowanie naruszeń według poziomu ważności (impact)
    const impactGroups: Record<string, { count: number, types: string[] }> = {
      critical: { count: 0, types: [] },
      serious: { count: 0, types: [] },
      moderate: { count: 0, types: [] },
      minor: { count: 0, types: [] }
    };
    
    Object.entries(violationCounts).forEach(([id, data]) => {
      const impact = data.details.impact || 'unknown';
      if (impactGroups[impact]) {
        impactGroups[impact].count += data.details.nodesCount;
        impactGroups[impact].types.push(`${id} (${data.details.description})`);
      }
    });
    
    const totalIssuesCount = Object.values(violationCounts).reduce((sum, data) => sum + data.details.nodesCount, 0);
    
    console.log('\n==== WYNIKI AUDYTU ====');
    console.log(`Znalazłem łącznie ${totalIssuesCount} problemów, w tym:`);
    
    if (impactGroups.critical.count > 0) {
      console.log(`- ${impactGroups.critical.count} krytycznych: ${impactGroups.critical.types.join(', ')}`);
    }
    
    if (impactGroups.serious.count > 0) {
      console.log(`- ${impactGroups.serious.count} poważnych: ${impactGroups.serious.types.join(', ')}`);
    }
    
    if (impactGroups.moderate.count > 0) {
      console.log(`- ${impactGroups.moderate.count} umiarkowanych: ${impactGroups.moderate.types.join(', ')}`);
    }
    
    if (impactGroups.minor.count > 0) {
      console.log(`- ${impactGroups.minor.count} drobnych: ${impactGroups.minor.types.join(', ')}`);
    }
    
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
};
