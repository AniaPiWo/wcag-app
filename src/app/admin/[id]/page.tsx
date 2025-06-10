/* eslint-disable @typescript-eslint/no-unused-vars */
import { notFound } from 'next/navigation';
import { auditService } from '@/lib/db/audit-service';
import styles from './page.module.scss';
import Link from 'next/link';

type ViolationNode = {
  html: string;
  target: string[];
  failureSummary?: string;
};

type Violation = {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor' | string;
  description: string;
  help: string;
  helpUrl?: string;
  tags: string[];
  nodes: ViolationNode[];
};

type AuditWithViolations = {
  id: string;
  url: string;
  email: string;
  name: string;
  status: string;
  createdAt: string | null;
  completedAt: string | null;
  totalIssuesCount: number | null;
  criticalCount: number | null;
  seriousCount: number | null;
  moderateCount: number | null;
  minorCount: number | null;
  parsedViolations: Violation[];
  errorMessage: string | null;
};

export default async function Page({ params }: { params: { id: string } }) {
  // Extract the ID from the Promise
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const audit = await auditService.getAuditRequest(id) as unknown as AuditWithViolations;
  if (!audit) return notFound();
  
  if (!audit.parsedViolations) {
    audit.parsedViolations = [];
  } else {
    audit.parsedViolations = audit.parsedViolations.map(violation => {
      if (!violation.nodes) violation.nodes = [];
      return violation;
    });
  }

  const getImpactClass = (impact: string) => {
    switch (impact?.toLowerCase()) {
      case 'critical': return styles.impactCritical;
      case 'serious': return styles.impactSerious;
      case 'moderate': return styles.impactModerate;
      case 'minor': return styles.impactMinor;
      default: return '';
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
      <Link href="/admin" className={styles.backLink}>
  <span className={styles.arrow}>&larr;</span>
  <span className={styles.text}>Powrót do listy</span>
</Link>


        <h1>Szczegóły audytu</h1>
      </div>
      
      <div className={styles.auditInfo}>
        <div className={styles.infoCard}>
          <h2>Informacje podstawowe</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email:</span>
              <span className={styles.infoValue}>{audit.email || 'Brak'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>URL:</span>
              <span className={styles.infoValue}>
                <a href={audit.url} target="_blank" rel="noopener noreferrer" className={styles.urlLink}>
                  {audit.url}
                </a>
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Status:</span>
              <span className={`${styles.infoValue} ${audit.status === 'completed' ? styles.statusComplete : audit.status === 'failed' ? styles.statusFailed : styles.statusIncomplete}`}>
                {audit.status === 'completed' ? 'Zakończony' : 
                 audit.status === 'failed' ? 'Nieudany' : 
                 audit.status === 'pending' ? 'Oczekujący' : 
                 audit.status === 'in-progress' ? 'W trakcie' : 
                 audit.status}
              </span>
            </div>
            {audit.status === 'failed' && audit.errorMessage && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Błąd:</span>
                <span className={`${styles.infoValue} ${styles.errorDetails}`}>
                  {audit.errorMessage}
                </span>
              </div>
            )}
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Data utworzenia:</span>
              <span className={styles.infoValue}>
                {audit.createdAt ? new Date(audit.createdAt).toLocaleString('pl-PL') : 'Brak danych'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Data zakończenia:</span>
              <span className={styles.infoValue}>
                {audit.completedAt ? new Date(audit.completedAt).toLocaleString('pl-PL') : 'Brak danych'}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.infoCard}>
          <h2>Podsumowanie wyników</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Wszystkie problemy</span>
              <span className={styles.statValue}>{audit.totalIssuesCount || 0}</span>
            </div>
            <div className={`${styles.statBox} ${styles.statCritical}`}>
              <span className={styles.statLabel}>Krytyczne</span>
              <span className={styles.statValue}>{audit.criticalCount || 0}</span>
            </div>
            <div className={`${styles.statBox} ${styles.statSerious}`}>
              <span className={styles.statLabel}>Poważne</span>
              <span className={styles.statValue}>{audit.seriousCount || 0}</span>
            </div>
            <div className={`${styles.statBox} ${styles.statModerate}`}>
              <span className={styles.statLabel}>Umiarkowane</span>
              <span className={styles.statValue}>{audit.moderateCount || 0}</span>
            </div>
            <div className={`${styles.statBox} ${styles.statMinor}`}>
              <span className={styles.statLabel}>Drobne</span>
              <span className={styles.statValue}>{audit.minorCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <h2 className={styles.violationsTitle}>Szczegółowe wyniki audytu</h2>
      
      {audit.parsedViolations && audit.parsedViolations.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.violationsTable}>
            <thead>
              <tr>
                <th>Reguła</th>
                <th>Opis</th>
                <th>Ważność</th>
                <th>Wystąpienia</th>
              </tr>
            </thead>
            <tbody>
              {[...audit.parsedViolations]
                .sort((a, b) => {

                  const getImpactWeight = (impact: string): number => {
                    switch (impact?.toLowerCase()) {
                      case 'critical': return 4;
                      case 'serious': return 3;
                      case 'moderate': return 2;
                      case 'minor': return 1;
                      default: return 0;
                    }
                  };
                  
      
                  return getImpactWeight(b.impact) - getImpactWeight(a.impact);
                })
                .map((violation: Violation, idx: number) => (
                <tr key={idx} className={styles.violationRow}>
                  <td className={styles.ruleCell}>
                    <div className={styles.ruleId}>{violation.id}</div>
                    <div className={styles.ruleStandard}>{violation.tags.join(', ')}</div>
                  </td>
                  <td className={styles.descriptionCell}>
                    <div className={styles.violationTitle}>{violation.description}</div>
                    <div className={styles.violationHelp}>{violation.help}</div>
                    <details className={styles.violationDetails}>
                      <summary>Wszystkie przypadki ({violation.nodes?.length || 0})</summary>
                      {violation.nodes && violation.nodes.length > 0 ? (
                        <div className={styles.nodesList}>
                          {violation.nodes.map((node, nodeIdx) => (
                            <div key={nodeIdx} className={styles.nodeItem}>
                              <div className={styles.nodeNumber}>Wystąpienie {nodeIdx + 1}:</div>
                              
                
                              {node.target && node.target.length > 0 && (
                                <div className={styles.nodeTarget}>
                                  <span className={styles.nodeLabel}>Selektor:</span> 
                                  {node.target.join(', ')}
                                </div>
                              )}
                              
        
                              {node.failureSummary && (
                                <div className={styles.nodeFailure}>
                                  <span className={styles.nodeLabel}>Problem:</span> 
                                  {node.failureSummary}
                                </div>
                              )}
                              
    
                              {node.html && (
                                <div className={styles.nodeHtml}>
                                  <pre className={styles.codeSnippet}>{node.html}</pre>
                                </div>
                              )}
                              
                              {!node.target?.length && !node.failureSummary && !node.html && (
                                <div className={styles.noDetails}>Brak szczegółowych danych dla tego wystąpienia</div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={styles.noNodes}>Brak szczegółowych danych o wystąpieniach</div>
                      )}
                    </details>
                  </td>
                  <td className={`${styles.impactCell} ${getImpactClass(violation.impact)}`}>
                    {violation.impact || 'Nieznana'}
                  </td>
                  <td className={styles.nodesCell}>
                    {violation.nodes?.length || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.noViolations}>Brak błędów lub brak danych.</div>
      )}
    </div>
  );
}
