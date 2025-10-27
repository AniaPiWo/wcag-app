import { prisma } from '../prisma';
import type { AuditSummary, AxeViolation } from '@/app/api/audit/types';
import { analyzeAccessibilityResults, AccessibilityViolation } from '../ai/ai-analysis';
import { Resend } from 'resend';

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

  // uruchamia analizę AI w tle, zapisuje wyniki do bazy danych i wysyła email z wynikami
  async runAiAnalysisInBackground(requestId: string, violations: AxeViolation[], summary: AuditSummary) {
    try {
      console.log('\x1b[36m%s\x1b[0m', `⚙️ Rozpoczynam analizę AI dla audytu ${requestId}...`);
      
      // Pobieramy dane audytu, aby uzyskać adres email
      const auditRequest = await this.getAuditRequest(requestId);
      if (!auditRequest || !auditRequest.email) {
        console.log('\x1b[33m%s\x1b[0m', `⚠️ Brak adresu email dla audytu ${requestId}, nie będzie możliwe wysłanie wyników`);
      }
      
      // Konwertujemy violations na typ AccessibilityViolation
      const accessibilityViolations = violations as unknown as AccessibilityViolation[];
      const aiAnalysisPromise = analyzeAccessibilityResults(accessibilityViolations, summary);
      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout analizy AI')), 30000);
      });
      const aiAnalysis = await Promise.race([aiAnalysisPromise, timeoutPromise]);
      //console.log(aiAnalysis);
      //console.log('\x1b[32m%s\x1b[0m', `✅ Analiza AI dla audytu ${requestId} zakończona`);
      
      // Zapisujemy analizę AI do bazy danych za pomocą bezpośredniego zapytania SQL
      try {
        await prisma.$executeRaw`UPDATE "AuditRequest" SET "aiAnalysis" = ${aiAnalysis} WHERE id = ${requestId}`;
        console.log('\x1b[32m%s\x1b[0m', `✅ Zapisano analizę AI do bazy danych dla audytu ${requestId}`);
      } catch (dbError) {
        console.error('\x1b[31m%s\x1b[0m', `❌ Błąd podczas zapisywania analizy AI do bazy danych:`, dbError);
 
      }
      
      // Wysyłamy wyniki audytu na email, jeśli adres email jest dostępny
      if (auditRequest && auditRequest.email) {
        console.log('\x1b[32m%s\x1b[0m', `Wysyłanie wyników audytu na email ${auditRequest.email}...`);
        try {
          const emailSubject = `Wyniki audytu dostępności dla strony ${summary.url}`;
          //⏰ Data i czas audytu: ${summary.timestamp}
   
          const emailContent = `
            Witaj ${auditRequest.name || 'Użytkowniku'},

            Poniżej znajdują się wyniki audytu dostępności dla strony ${summary.url}:

            Podsumowanie audytu:
            Liczba wszystkich problemów: ${summary.totalIssuesCount}
            ‼️Krytyczne: ${summary.criticalCount}
            ❗Poważne: ${summary.seriousCount}
            ⚠️ Umiarkowane: ${summary.moderateCount}
            ⚡ Drobne: ${summary.minorCount}
            ✅ Liczba zaliczonych reguł: ${summary.passedRules}
            ❌ Wymaga audytu manualnego: ${summary.incompleteRules}

           ${aiAnalysis}   
  
            Dziękujemy za skorzystanie z naszego narzędzia!

            --
Pozdrawiam serdecznie,  
Anna Piotrowiak  
Specjalista dostępności cyfrowej  

🌐 https://wcag.co  
✉️ ${process.env.RESEND_FROM_EMAIL || 'biuro@wcag.co'}

          `.trim().replace(/^ +/gm, '');
          
          // Validate Resend API key
          if (!process.env.RESEND_API_KEY) {
            console.error('📧 [audit-service] Brak RESEND_API_KEY w zmiennych środowiskowych');
            throw new Error('Brak klucza API do wysyłki emaili');
          }

          // Initialize Resend client
          const resend = new Resend(process.env.RESEND_API_KEY);
          const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
          
          // Wysyłamy email bezpośrednio
          const { error: sendError } = await resend.emails.send({
            from: `Audyt Dostępności <${fromEmail}>`,
            to: auditRequest.email,
            subject: emailSubject,
            text: emailContent,
          });

          if (sendError) {
            console.error('📧 [audit-service] Błąd Resend przy wysyłce do użytkownika:', sendError);
            throw new Error(`Resend API error: ${sendError.message}`);
          }

          // Wysyłamy kopię do biura (jeśli użytkownik nie jest z biura)
          if (auditRequest.email !== "biuro@wcag.co") {
            const { error: copyError } = await resend.emails.send({
              from: `Audyt Dostępności <${fromEmail}>`,
              to: "biuro@wcag.co",
              subject: `Kopia: ${emailSubject}`,
              text: emailContent,
            });

            if (copyError) {
              console.warn('📧 [audit-service] Błąd przy wysyłce kopii do biura:', copyError);
              // Nie rzucamy błędem - kopia to nie jest krytyczne
            }
          }

          console.log('\x1b[32m%s\x1b[0m', `✅ Wysłano wyniki audytu na adres ${auditRequest.email}`);
        } catch (emailError) {
          console.error('\x1b[31m%s\x1b[0m', `❌ Błąd podczas wysyłania wyników audytu na email:`, emailError);
          // Kontynuujemy mimo błędu wysyłania emaila - analiza została już wygenerowana i zapisana w bazie
        }
      }

      return aiAnalysis;
    } catch (error) {
      console.error('\x1b[31m%s\x1b[0m', `❌ Błąd podczas analizy AI dla audytu ${requestId}:`, error);
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
    // Normalizacja URL - usunięcie protokołu, www i trailing slash
    const normalizeUrl = (inputUrl: string) => {
      let normalized = inputUrl.toLowerCase();
      normalized = normalized.replace(/^https?:\/\//, '');
      normalized = normalized.replace(/^www\./, '');
      normalized = normalized.replace(/\/$/, '');
      return normalized;
    };

    const normalizedSearchUrl = normalizeUrl(url);
    
    // Pobieramy wszystkie audyty i filtrujemy po znormalizowanym URL
    const allAudits = await prisma.auditRequest.findMany({
      where: {
        status: 'completed' // Szukamy tylko ukończonych audytów
      },
      orderBy: { completedAt: 'desc' }
    });

    // Filtrujemy audyty, które mają ten sam znormalizowany URL
    const matchingAudits = allAudits.filter(audit => {
      if (!audit.url) return false;
      return normalizeUrl(audit.url) === normalizedSearchUrl;
    });

    return matchingAudits;
  },
};
