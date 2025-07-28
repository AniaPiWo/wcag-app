import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

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
    paddingLeft: 40,
    paddingRight: 40,
    paddingTop: 50,
    paddingBottom: 50,
    fontFamily: 'Geist',
  },
  section: {
    width: '100%',
  },
  complianceSection: {
    width: '100%',
    paddingTop: 30,
    paddingBottom: 30,
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#f9f4ff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#A985FF',
    fontWeight: 'bold',
    fontSize: 24,
  },
  complianceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A985FF',
    marginTop: 0,
  },
  complianceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  sectionWithMargin: {
    width: '100%',
  },
  logo: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  headerMain: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  titlePage: {
    paddingLeft: 40,
    paddingRight: 40,
    paddingTop: 50,
    paddingBottom: 50,
    fontFamily: 'Geist',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: '100%',
  },
  reviewPage: {
    paddingLeft: 40,
    paddingRight: 40,
    paddingTop: 50,
    paddingBottom: 50,
    fontFamily: 'Geist',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 20,
    height: '100%',
  },
  titleMain: {
    fontSize: 26,
    textAlign: 'center',    
    fontWeight: 'bold',
    color: '#A985FF',
  },
  titleMainBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexGrow: 1,
    marginTop: 200,
    marginBottom: 100,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#A985FF',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'left',
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 15,
    color: '#A985FF',
    borderBottom: '1pt solid #A985FF',
    width: '100%',
    paddingBottom: 5,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    marginTop: 20,
    fontWeight: 'bold',
    color: '#555555',
  },
  fieldContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    width: '100%',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    minWidth: 100,
    paddingRight: 0,
  },
  fieldValue: {
    fontSize: 12,
    marginLeft: 0,
    flexGrow: 1,
    flexShrink: 1,
    flexWrap: 'wrap',
    maxWidth: '75%',
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
    marginLeft: 5,
    marginBottom: 5,
  },
  problemLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  problemText: {
    fontSize: 12,
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
  updatedAt: string;
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

const sanitizeUrl = (input: string): string => {
    try {
      const url = new URL(input.includes("://") ? input : "http://" + input);
      return url.hostname.replace(/^www\./, "");
    } catch {
      return "Błędny adres URL";
    }
  };

// Funkcja do renderowania stopki strony
const PageFooter = ({ url }: { url: string }) => (
  <Text
    style={styles.pageNumber}
    fixed
    render={({ pageNumber, totalPages }) => (
      `Raport dostępności cyfrowej dla ${sanitizeUrl(url || '')} | Strona ${pageNumber} / ${totalPages}`
    )}
  />
);

const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };


// Komponent PDF
const AuditPDF: React.FC<{ data: AuditContent }> = ({ data }) => {
  return (
    <Document>
              {/* Strona tytułowa */}
      <Page size="A4" style={styles.titlePage}>
        <View style={styles.headerMain}>
          <Text style={styles.logo}>WCAG by Ania</Text>
          <Text style={styles.text}>Sosnowiec, {formatDate(data.updatedAt)}</Text>
        </View>

        <View style={styles.titleMainBox}>
          <Text style={styles.titleMain}>Raport z audytu</Text>
          <Text style={styles.titleMain}>dostępności cyfrowej WCAG 2.2</Text>
          <Text style={styles.titleMain}>dla {sanitizeUrl(data.url || '')}</Text>
        </View>
      </Page>
      
      {/* Strona oceny */}
      <Page size="A4" style={styles.reviewPage}>
        <View style={{ width: '100%' }}>
          <Text style={styles.subtitle}>Informacje ogólne</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>URL strony:</Text>
            <Text style={styles.fieldValue}>{sanitizeUrl(data.url || '')}</Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Data:</Text>
            <Text style={styles.fieldValue}>{formatDate(data.updatedAt)}</Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Audytor:</Text>
            <Text style={styles.fieldValue}>{data.auditorName || ''}</Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Poziom oceny:</Text>
            <Text style={styles.fieldValue}>Podstawowy poziom WCAG 2.2 – poziom AA</Text>
          </View>
        </View>

        <View style={styles.complianceSection}>
          <Text style={styles.complianceTitle}>Uzyskany poziom dostępności WCAG:</Text>
          <Text style={styles.complianceValue}>{data.complianceLevel || ''}</Text>
        </View>

        <View style={styles.sectionWithMargin}>
          <Text style={styles.subtitle}>Metodologia badania</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Metoda:</Text>
            <Text style={styles.fieldValue}>Audyt automatyczny, manualny oraz analiza kodu źródłowego</Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Narzędzia:</Text>
            <Text style={styles.fieldValue}>Audyt przy pomocy narzędzi (axe-core, NDVA, LightHouse, WAVE) oraz manualny audyt wg checklisty WCAG</Text>
          </View>
        </View>
        
        <View style={styles.sectionWithMargin}>
          <Text style={styles.subtitle}>Zakres i cel audytu</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Cel:</Text>
            <Text style={styles.fieldValue}>{data.auditGoal || ''}</Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Zakres:</Text>
            <Text style={styles.fieldValue}>{data.auditScope || ''}</Text>
          </View>
        </View>
                
        <PageFooter url={data.url} />
      </Page>

      {/* Strona z podsumowaniem */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.subtitle}>Raport podsumowujący audyt dostępności cyfrowej</Text>
        
        <View style={styles.section}>
          <Text style={styles.text}>{data.summary || ''}</Text>
        </View>
        
        <PageFooter url={data.url} />
      </Page>

      {/* Strona z listą problemów */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.subtitle}>Obszary wymagające poprawy</Text>
        
        {/* Iteracja po kategoriach problemów */}
        {data.problems.map((category, categoryIndex) => {
          // Obliczanie liczby problemów w poprzednich kategoriach
          const previousIssuesCount = data.problems
            .slice(0, categoryIndex)
            .reduce((count, cat) => count + cat.issues.length, 0);
            
          return (
            <View key={`category-${categoryIndex}`} style={styles.section}>
              {/* Sortowanie problemów według ważności */}
              {sortIssuesBySeverity(category.issues).map((issue, issueIndex) => {
                // Ciągła numeracja problemów
                const problemNumber = previousIssuesCount + issueIndex + 1;
                
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
          );
        })}
        
        <Text style={styles.subtitle}>Oświadczenie</Text>
        
        <View style={styles.section}>
          <Text style={styles.text}>
            Audyt został przeprowadzony manualnie oraz przy pomocy narzędzi automatycznych zgodnie z wytycznymi WCAG 2.2 na poziomie AA. 
            Raport nie stanowi certyfikatu zgodności, lecz dokumentuje aktualny stan dostępności oraz kierunki poprawy.
          </Text>
        </View>
        
        <PageFooter url={data.url} />
      </Page>
    </Document>
  );
};

export default AuditPDF;
