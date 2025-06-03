'use client';
import { useState, useRef } from 'react';
import styles from './FAQ.module.scss';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ = () => {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const answerRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  
  const toggleAccordion = (id: string) => {
    setExpandedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); 
      toggleAccordion(id);
    }
  };

  const faqItems: FAQItem[] = [
    {
      id: 'faq-1',
      question: 'Czy wdrożenie standardu WCAG jest obowiązkowe?',
      answer: 'Tak, wdrożenie standardu WCAG jest obowiązkowe. Od 28 czerwca 2025 roku, zgodnie z europejskim European Accessibility Act (EAA), wszystkie strony internetowe i sklepy e-commerce w Polsce będą musiały spełniać standard WCAG 2.1 na poziomie AA. Obowiązek ten dotyczy wszystkich firm z wyjątkiem mikroprzedsiębiorstw (do 9 pracowników). Dla podmiotów publicznych obowiązek ten wynika z ustawy z dnia 4 kwietnia 2019 roku o dostępności cyfrowej.'
    },
    {
      id: 'faq-2',
      question: 'Czy za brak dostępności WCAG można otrzymać karę finansową?',
      answer: 'Tak, za brak dostępności WCAG można otrzymać karę finansową. Dla firm prywatnych kara może wynosić do 10% rocznego obrotu lub do dziesięciokrotności przeciętnego wynagrodzenia. Dla podmiotów publicznych kary finansowe mogą wynosić od 5 000 zł do 100 000 zł. Dodatkowo, firmy mogą zostać zobowiązane do wycofania niedostępnych produktów z rynku. Klienci mogą również składać oficjalne skargi, a brak reakcji w ciągu 30 dni otwiera drogę do postępowania przed organami nadzoru.'
    },
    {
      id: 'faq-3',
      question: 'Jakie są korzyści z wdrożenia standardu WCAG na stronie internetowej?',
      answer: 'Wdrożenie standardu WCAG przynosi wiele korzyści, nie tylko prawnych. Przede wszystkim zwiększa grono odbiorców - w Polsce jest około 5 milionów osób z niepełnosprawnościami, które mogą stać się Twoimi klientami. Poprawia również pozycjonowanie w wyszukiwarkach, gdyż algorytmy Google preferują dostępne strony. Buduje pozytywny wizerunek marki jako odpowiedzialnej społecznie. Dodatkowo, dostępne strony są zazwyczaj bardziej intuicyjne i łatwiejsze w obsłudze dla wszystkich użytkowników, co przekłada się na lepsze doświadczenia użytkownika i wyższe wskaźniki konwersji.'
    }
  ];

  return (
    <section className={styles.faqSection} id="faq" aria-labelledby="faq-heading">
      <div className={styles.container}>
        <div className={styles.leftColumn}>
          <h2 id="faq-heading" className={styles.title}>FAQ</h2>
          <p className={styles.description}>
            Znajdź odpowiedzi na najczęściej zadawane pytania dotyczące naszych usług i dostępności cyfrowej.
       </p>
        </div>
        
        <div className={styles.rightColumn}>

          <ul className={styles.accordionList}>
            {faqItems.map((item) => {
              const isExpanded = expandedIds.includes(item.id);
              
              return (
                <li key={item.id} className={styles.accordionItem}>
                  <button
                    id={`${item.id}-button`}
                    className={styles.accordionButton}
                    onClick={() => toggleAccordion(item.id)}
                    onKeyDown={(e) => handleKeyDown(e, item.id)}
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
                    aria-hidden={!isExpanded}
                    style={{ 
                      height: isExpanded ? 'auto' : '0px',
        
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
