'use client'
import React, { useState, FormEvent } from 'react';
import styles from './SitemapFetcher.module.scss';
import { Button } from '../atoms/Button/Button';

interface SitemapLink {
  url: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

interface SitemapLocation {
  url: string;
  source: string;
}

export const SitemapFetcher = () => {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [links, setLinks] = useState<SitemapLink[]>([]);
  const [foundSitemaps, setFoundSitemaps] = useState<SitemapLocation[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('input'); // 'input', 'select', 'results'

  // Normalizuje URL, dodając protokół jeśli brakuje i usuwając końcowe /
  const normalizeUrl = (inputUrl: string): string => {
    let normalizedUrl = inputUrl.trim();
    
    // Usuń ewentualne protokoły wpisane przez użytkownika
    normalizedUrl = normalizedUrl.replace(/^(https?:\/\/)?/, '');
    
    // Usuń ewentualne "www." na początku
    normalizedUrl = normalizedUrl.replace(/^www\./, '');
    
    // Usuń końcowe /
    while (normalizedUrl.endsWith('/')) {
      normalizedUrl = normalizedUrl.slice(0, -1);
    }
    
    // Dodaj protokół https://
    normalizedUrl = 'https://' + normalizedUrl;
    
    return normalizedUrl;
  };

  // Pobiera i parsuje mapę witryny z podanego URL
  const parseSitemap = async (sitemapUrl: string): Promise<SitemapLink[]> => {
    console.log('Parsing sitemap from:', sitemapUrl);
    
    const response = await fetch(`/api/proxy?url=${encodeURIComponent(sitemapUrl)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${response.statusText}`);
    }

    const xmlText = await response.text();
    console.log('Received XML length:', xmlText.length);
    
    // Check if the response is valid XML
    if (!xmlText || xmlText.trim() === '') {
      throw new Error('Received empty response');
    }
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      console.error('XML parsing error:', parserError.textContent);
      throw new Error('Failed to parse XML: Invalid format');
    }
    
    // Check if it's a sitemap index
    const sitemapNodes = xmlDoc.getElementsByTagName('sitemap');
    console.log('Found sitemap nodes:', sitemapNodes.length);
    
    if (sitemapNodes.length > 0) {
      // Handle sitemap index
      const sitemapLinks = Array.from(sitemapNodes).map(node => {
        const locNode = node.getElementsByTagName('loc')[0];
        return locNode ? locNode.textContent : null;
      }).filter(Boolean) as string[];
      
      console.log('Extracted sitemap links:', sitemapLinks);
      return sitemapLinks.map(url => ({ url }));
    } else {
      // Handle regular sitemap
      const urlNodes = xmlDoc.getElementsByTagName('url');
      console.log('Found URL nodes:', urlNodes.length);
      
      if (urlNodes.length === 0) {
        // Try alternative approach - some sitemaps might not follow standard format
        // Look for any loc tags directly
        const locNodes = xmlDoc.getElementsByTagName('loc');
        console.log('Looking for alternative loc nodes:', locNodes.length);
        
        if (locNodes.length > 0) {
          const extractedLinks = Array.from(locNodes).map(node => {
            return { url: node.textContent || '' };
          }).filter(link => link.url);
          
          console.log('Extracted alternative links:', extractedLinks.length);
          return extractedLinks;
        }
      }
      
      const extractedLinks = Array.from(urlNodes).map(node => {
        const link: SitemapLink = { url: '' };
        
        const locNode = node.getElementsByTagName('loc')[0];
        if (locNode && locNode.textContent) {
          link.url = locNode.textContent;
        }
        
        const lastmodNode = node.getElementsByTagName('lastmod')[0];
        if (lastmodNode && lastmodNode.textContent) {
          link.lastmod = lastmodNode.textContent;
        }
        
        const changefreqNode = node.getElementsByTagName('changefreq')[0];
        if (changefreqNode && changefreqNode.textContent) {
          link.changefreq = changefreqNode.textContent;
        }
        
        const priorityNode = node.getElementsByTagName('priority')[0];
        if (priorityNode && priorityNode.textContent) {
          link.priority = priorityNode.textContent;
        }
        
        return link;
      }).filter(link => link.url);
      
      console.log('Extracted standard links:', extractedLinks.length);
      return extractedLinks;
    }
  };

  // Szuka map witryn w typowych lokalizacjach
  const findSitemaps = async (baseUrl: string): Promise<SitemapLocation[]> => {
    const normalizedUrl = normalizeUrl(baseUrl);
    const domain = new URL(normalizedUrl).hostname;
    
    console.log('Finding sitemaps for domain:', domain);
    
    const commonSitemapPaths = [
      '/sitemap.xml',
      '/sitemap_index.xml',
      '/sitemap/',
      '/sitemaps/',
      '/sitemap/sitemap.xml',
    ];
    
    const potentialSitemaps: SitemapLocation[] = [];
    
    // Najpierw sprawdź robots.txt
    try {
      const robotsUrl = `${normalizedUrl}/robots.txt`;
      console.log('Checking robots.txt at:', robotsUrl);
      
      const robotsResponse = await fetch(`/api/proxy?url=${encodeURIComponent(robotsUrl)}`);
      
      if (robotsResponse.ok) {
        const robotsText = await robotsResponse.text();
        const sitemapMatches = robotsText.match(/Sitemap:\s*(.+)/gi);
        
        if (sitemapMatches) {
          console.log('Found sitemap references in robots.txt:', sitemapMatches);
          
          sitemapMatches.forEach(match => {
            const sitemapUrl = match.replace(/Sitemap:\s*/i, '').trim();
            potentialSitemaps.push({
              url: sitemapUrl,
              source: 'robots.txt'
            });
          });
        }
      }
    } catch (error) {
      console.log('Error checking robots.txt:', error);
      // Kontynuuj mimo błędu
    }
    
    // Sprawdź typowe lokalizacje
    for (const path of commonSitemapPaths) {
      const sitemapUrl = `${normalizedUrl}${path}`;
      potentialSitemaps.push({
        url: sitemapUrl,
        source: 'common location'
      });
    }
    
    console.log('Potential sitemap locations:', potentialSitemaps);
    return potentialSitemaps;
  };

  // Główna funkcja do wyszukiwania i pobierania map witryn
  const fetchSitemap = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setLinks([]);
    setFoundSitemaps([]);
    
    try {
      const normalizedUrl = normalizeUrl(url);
      console.log('Normalized URL:', normalizedUrl);
      
      // Znajdź potencjalne lokalizacje map witryn
      const potentialSitemaps = await findSitemaps(normalizedUrl);
      
      if (potentialSitemaps.length === 0) {
        throw new Error('Nie znaleziono map witryn dla podanej strony');
      }
      
      setFoundSitemaps(potentialSitemaps);
      
      // Sprawdź każdą potencjalną mapę witryn
      for (const sitemap of potentialSitemaps) {
        try {
          console.log('Trying sitemap at:', sitemap.url);
          const links = await parseSitemap(sitemap.url);
          
          if (links && links.length > 0) {
            console.log('Successfully found links in sitemap:', sitemap.url);
            setLinks(links);
            setCurrentStep('results');
            return;
          }
        } catch (error) {
          console.log(`Error with sitemap ${sitemap.url}:`, error);
          // Kontynuuj z następną mapą witryn
        }
      }
      
      // Jeśli dotarliśmy tutaj, to nie znaleźliśmy działającej mapy witryn
      throw new Error('Nie znaleziono działającej mapy witryn');
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd');
      setCurrentStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  // Renderowanie różnych kroków interfejsu użytkownika
  const renderContent = () => {
    switch (currentStep) {
      case 'select':
        return (
          <div className={styles.selectContainer}>
            <h3>Znaleziono {foundSitemaps.length} potencjalnych map witryn:</h3>
            <ul className={styles.linksList}>
              {foundSitemaps.map((sitemap, index) => (
                <li key={index} className={styles.linkItem}>
                  <button 
                    onClick={() => parseSitemap(sitemap.url).then(setLinks)}
                    className={styles.link}
                  >
                    {sitemap.url}
                  </button>
                  <span> (Źródło: {sitemap.source})</span>
                </li>
              ))}
            </ul>
          </div>
        );
      
      case 'results':
      case 'input':
      default:
        return (
          <>
            <form onSubmit={fetchSitemap} className={styles.form}>
              <input
                type="text"
                className={styles.input}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="google.pl"
                required
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Wyszukiwanie...' : 'Znajdź mapę witryny'}
              </Button>
            </form>
            
            {error && (
              <div className={styles.errorMessage}>
                <p>Błąd: {error}</p>
              </div>
            )}
            
            {links.length > 0 && (
              <div className={styles.resultsContainer}>
                <h3>Znaleziono {links.length} adresów URL:</h3>
                <ul className={styles.linksList}>
                  {links.map((link, index) => (
                    <li key={index} className={styles.linkItem}>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                        {link.url}
                      </a>
                      {link.lastmod && <span> (Ostatnia modyfikacja: {link.lastmod})</span>}
                      {link.priority && <span> (Priorytet: {link.priority})</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className={styles.container}>
      <h2>Wyszukiwarka map witryn</h2>
      <p>Wprowadź adres strony, aby automatycznie znaleźć i przeanalizować jej mapę witryny</p>
      
      {renderContent()}
    </div>
  );
};
