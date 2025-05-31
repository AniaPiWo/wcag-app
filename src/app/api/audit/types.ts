/**
 * Typy dla wyników audytu dostępności
 */

// Typy dla wyników axe-core
export interface AxeViolation {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor' | null;
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary: string;
    any: Array<{ id: string; message: string; data: unknown; relatedNodes: unknown[] }>;
    all: Array<{ id: string; message: string; data: unknown; relatedNodes: unknown[] }>;
    none: Array<{ id: string; message: string; data: unknown; relatedNodes: unknown[] }>;
    impact?: string;
    length?: number;
  }>;
}

export interface AxeResults {
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

// Typ dla podsumowania audytu
export interface AuditSummary {
  url: string;
  totalIssuesCount: number;
  criticalCount: number;
  seriousCount: number;
  moderateCount: number;
  minorCount: number;
  passedRules: number;
  incompleteRules: number;
  timestamp: string;
}
