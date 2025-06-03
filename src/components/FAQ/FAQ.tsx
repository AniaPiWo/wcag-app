'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './FAQ.module.scss';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ = () => {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [heights, setHeights] = useState<{[key: string]: number}>({});
  const answerRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  
  // Mierzenie wysokości zawartości odpowiedzi
  useEffect(() => {
    const newHeights: {[key: string]: number} = {};
    
    Object.keys(answerRefs.current).forEach(id => {
      const element = answerRefs.current[id];
      if (element) {
        // Tymczasowo usuwamy style ukrywające, aby zmierzyć rzeczywistą wysokość
        const originalHeight = element.style.height;
        const originalPosition = element.style.position;
        const originalVisibility = element.style.visibility;
        
        element.style.height = 'auto';
        element.style.position = 'absolute';
        element.style.visibility = 'hidden';
        
        // Mierzymy wysokość
        newHeights[id] = element.scrollHeight;
        
        // Przywracamy oryginalne style
        element.style.height = originalHeight;
        element.style.position = originalPosition;
        element.style.visibility = originalVisibility;
      }
    });
    
    setHeights(newHeights);
  }, []);
  
  const toggleAccordion = (id: string) => {
    setExpandedIds(prev => {
      // Sprawdzamy, czy ID jest już w tablicy rozwijanych elementów
      if (prev.includes(id)) {
        // Jeśli tak, usuwamy je (zwijamy)
        return prev.filter(itemId => itemId !== id);
      } else {
        // Jeśli nie, dodajemy je (rozwijamy)
        return [...prev, id];
      }
    });
  };

  const faqItems: FAQItem[] = [
    {
      id: 'faq-1',
      question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit?',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.'
    },
    {
      id: 'faq-2',
      question: 'Nullam auctor, nisl eget ultricies tincidunt?',
      answer: 'Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl.'
    },
    {
      id: 'faq-3',
      question: 'Eget ultricies nisl nisl eget nisl, lorem ipsum dolor sit amet?',
      answer: 'Eget ultricies nisl nisl eget nisl. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.'
    },
    {
      id: 'faq-4',
      question: 'Consectetur adipiscing elit, nullam auctor?',
      answer: 'Consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    },
    {
      id: 'faq-5',
      question: 'Nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl?',
      answer: 'Nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.'
    }
  ];

  return (
    <section className={styles.faqSection} id="faq" aria-labelledby="faq-heading">
      <div className={styles.container}>
        <div className={styles.leftColumn}>
          <h2 id="faq-heading" className={styles.title}>Często zadawane pytania</h2>
          <p className={styles.description}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, 
            nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt.
          </p>
          <p className={styles.description}>
            Nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Lorem ipsum dolor sit amet, consectetur 
            adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt.
          </p>
        </div>
        
        <div className={styles.rightColumn}>
          <ul className={styles.accordionList} aria-label="Lista często zadawanych pytań">
            {faqItems.map((item) => {
              const isExpanded = expandedIds.includes(item.id);
              const contentHeight = isExpanded ? heights[item.id] || 'auto' : 0;
              
              return (
                <li key={item.id} className={styles.accordionItem}>
                  <button
                    id={`${item.id}-button`}
                    className={styles.accordionButton}
                    onClick={() => toggleAccordion(item.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`${item.id}-content`}
                  >
                    {item.question}
                    <div className={`${styles.iconWrapper} ${isExpanded ? styles.expanded : ''}`}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M8 0V16M0 8H16" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </div>
                  </button>
                  
                  <div
                    id={`${item.id}-content`}
                    className={`${styles.accordionContent} ${isExpanded ? styles.expanded : ''}`}
                    role="region"
                    aria-labelledby={`${item.id}-button`}
                    style={{ 
                      height: typeof contentHeight === 'number' ? `${contentHeight}px` : contentHeight,
                      opacity: isExpanded ? 1 : 0,
                      visibility: isExpanded ? 'visible' : 'hidden',
                      transition: isExpanded 
                        ? 'height 0.3s ease-out, opacity 0.2s ease-out 0.1s, visibility 0s 0s' 
                        : 'height 0.3s ease-in, opacity 0.2s ease-in, visibility 0s 0.3s'
                    }}
                  >
                    <div 
                      className={styles.accordionAnswer}
                      ref={(el) => { answerRefs.current[item.id] = el; }}
                    >
                      {item.answer}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
};
