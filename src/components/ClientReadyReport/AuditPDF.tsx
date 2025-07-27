import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Logo } from '../Logo/Logo';

// Rejestracja czcionki z obsługą polskich znaków
Font.register({
  family: 'Geist',
  src: '/fonts/Geist/Geist-Regular.ttf',
});

Font.register({
  family: 'Geist',
  src: '/fonts/Geist/Geist-Bold.ttf',
  fontWeight: 'bold',
});

Font.register({
  family: 'Geist', 
  src: '/fonts/Geist/Geist-Italic.ttf',
  fontStyle: 'italic',
});

// Definicja stylów dla dokumentu PDF
const styles = StyleSheet.create({
  page: {
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 50,
    paddingBottom: 50,
    fontFamily: 'Geist',
  },
  section: {
    marginBottom: 10,
  },
titlePage: {
    padding: 30,
    fontFamily: 'Geist',
    display: 'flex',
    gap: 20,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    height: '100%',
  },

  titleMain: {
    fontSize: 26,
    textAlign: 'center',    
    marginBottom: 20,
    fontWeight: 'bold',
    backgroundColor: '#A985FF',
    color: '#fff',
    padding: 10,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'left',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  fieldContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  fieldValue: {
    fontSize: 12,
    marginLeft: 5,
  },
  text: {
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 10,
  },
  problem: {
    marginBottom: 15,
    paddingLeft: 5,
  },
  problemHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  problemContent: {
    marginLeft: 10,
    marginBottom: 5,
  },
  problemLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  problemText: {
    fontSize: 11,
    marginLeft: 5,
    marginTop: 3,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    fontSize: 10,
    textAlign: 'center',
  },
});

// Interfejs dla danych wejściowych audytu
interface AuditIssue {
  severity: string;
  description: string;
  recommendation: string;
}

interface AuditCategory {
  category: string;
  issues: AuditIssue[];
}

interface AuditContent {
  url: string;
  auditorName: string;
  auditGoal: string;
  auditScope: string;
  complianceLevel: string;
  summary: string;
  problems: AuditCategory[];
}

// Helper function to sort issues by severity
const getSeverityPriority = (severity: string): number => {
  const lowerSeverity = severity.toLowerCase();
  
  if (lowerSeverity.includes('krytyczny') || lowerSeverity.includes('critical')) return 1;
  if (lowerSeverity.includes('poważny') || lowerSeverity.includes('serious')) return 2;
  if (lowerSeverity.includes('średni') || lowerSeverity.includes('umiarkowany') || lowerSeverity.includes('moderate')) return 3;
  if (lowerSeverity.includes('lekki') || lowerSeverity.includes('minor') || lowerSeverity.includes('low')) return 4;
  if (lowerSeverity.includes('mało istotny')) return 5;
  
  return 6; // unknown severity goes last
};

const sortIssuesBySeverity = (issues: AuditIssue[]): AuditIssue[] => {
  return [...issues].sort((a, b) => {
    return getSeverityPriority(a.severity) - getSeverityPriority(b.severity);
  });
};

// Komponent PDF
const AuditPDF: React.FC<{ data: AuditContent }> = ({ data }) => (
  <Document>

    {/* Strona tytułowa */}
    <Page size="A4" style={styles.titlePage}>
      <Text style={styles.titleMain}>Raport z audytu dostępności cyfrowej WCAG 2.2</Text>
      
      <View style={styles.section}>
        
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>URL audytowanej strony:</Text>
          <Text style={styles.fieldValue}>{data.url || ''}</Text>
        </View>
        
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Imię i nazwisko audytora:</Text>
          <Text style={styles.fieldValue}>{data.auditorName || ''}</Text>
        </View>
        
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Cel audytu:</Text>
          <Text style={styles.fieldValue}>{data.auditGoal || ''}</Text>
        </View>
        
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Cel audytu:</Text>
          <Text style={styles.fieldValue}>{data.auditScope || ''}</Text>
        </View>
        
      </View>



      <View style={styles.fieldContainer}>
          <Text style={styles.title}>Poziom zgodności: {data.complianceLevel || ''}</Text>
        </View>
      
      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
        `Raport dostępności cyfrowej dla ${data.url || ''} | Strona ${pageNumber} / ${totalPages}`
      )} />
    </Page>

    {/* Strona z podsumowaniem */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.subtitle}>Raport podsumowujący audyt dostępności cyfrowej</Text>
      
      <View style={styles.section}>
        <Text style={styles.text}>{data.summary || ''}</Text>
      </View>
      
      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
        `Raport dostępności cyfrowej dla ${data.url || ''} | Strona ${pageNumber} / ${totalPages}`
      )} />
    </Page>

    {/* Strona z listą problemów */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.subtitle}>Obszary wymagające poprawy</Text>
      
      {data.problems.map((category, categoryIndex) => (
        <View key={`category-${categoryIndex}`} style={styles.section}>
          {sortIssuesBySeverity(category.issues).map((issue, issueIndex) => {
            const problemNumber = issueIndex + 1;
            return (
              <View key={`issue-${categoryIndex}-${issueIndex}`} style={styles.problem}>
                <Text style={styles.problemHeader}>
                  {problemNumber}. Kryterium: {category.category} | Błąd {issue.severity.toLowerCase()}
                </Text>
                
                <View style={styles.problemContent}>
                  <Text style={styles.problemLabel}>Obserwacja:</Text>
                  <Text style={styles.problemText}>{issue.description}</Text>
                </View>
                
                <View style={styles.problemContent}>
                  <Text style={styles.problemLabel}>Rekomendacja:</Text>
                  <Text style={styles.problemText}>{issue.recommendation}</Text>
                </View>
              </View>
            );
          })}
        </View>
      ))}
      
      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
        `${pageNumber} / ${totalPages}`
      )} />
    </Page>

    {/* Strona z oświadczeniem końcowym */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.subtitle}>Oświadczenie</Text>
      
      <View style={styles.section}>
        <Text style={styles.text}>
          Audyt został przeprowadzony manualnie oraz przy pomocy narzędzi automatycznych zgodnie z wytycznymi WCAG 2.2 na poziomie AA. 
          Raport nie stanowi certyfikatu zgodności, lecz dokumentuje aktualny stan dostępności oraz kierunki poprawy.
        </Text>
      </View>
      
      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
        `${pageNumber} / ${totalPages}`
      )} />
    </Page>
  </Document>
);

export default AuditPDF;
