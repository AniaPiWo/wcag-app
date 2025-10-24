'use client';
import { useState, useRef } from 'react';
import styles from './FAQ.module.scss';
import { AnimatedReveal } from '@/components/atoms/AnimatedReveal/AnimatedReveal';

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
        // Only allow one expanded item at a time for better performance
        return [id];
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
/*     {
      "id": "faq-1",
      "question": "Jakie są korzyści z wdrożenia standardu WCAG na stronie internetowej?",
      "answer": "Wdrożenie WCAG to nie tylko obowiązek, ale realne korzyści. Dzięki dostępności docierasz do szerszego grona odbiorców – w Polsce to nawet 5 milionów osób z niepełnosprawnościami. Dodatkowo, strony zgodne ze standardem WCAG są lepiej pozycjonowane w Google, bardziej intuicyjne i łatwiejsze w obsłudze. To wszystko przekłada się na lepsze doświadczenia użytkowników i wyższe wskaźniki konwersji. A do tego budujesz wizerunek marki odpowiedzialnej społecznie."
    }, */
    {
      "id": "faq-1",
      "question": "Czy wdrożenie standardu WCAG jest obowiązkowe?",
      "answer": "Tak. Od 28 czerwca 2025 roku, zgodnie z European Accessibility Act (EAA), wszystkie strony internetowe i sklepy e-commerce w Polsce będą musiały spełniać WCAG 2.1 na poziomie AA. Z obowiązku mogą być zwolnione tylko mikroprzedsiębiorstwa, pod warunkiem że nie świadczą usług cyfrowych o charakterze publicznym."
    },
    {
      "id": "faq-2",
      "question": "Czy za brak dostępności WCAG można otrzymać karę finansową?",
      "answer": "Tak. Dla firm prywatnych kara może wynieść nawet 10% rocznego obrotu lub dziesięciokrotność przeciętnego wynagrodzenia. Dla instytucji publicznych – od 5 000 zł do 100 000 zł. Brak reakcji na zgłoszenie może skutkować postępowaniem przed organami nadzoru. Niedostępne produkty mogą zostać wycofane z rynku, a opinia o marce — poważnie nadszarpnięta."
    },
/*     {
      "id": "faq-3",
      "question": "Z jakimi technologiami internetowymi pracujesz?",
      "answer": "Pracuję zarówno z klasycznymi technologiami jak HTML, CSS, JavaScript, jak i z nowoczesnymi frameworkami – m.in. React, Next.js i innymi rozwiązaniami dopasowanymi do Twojego projektu. Wkrótce planuję również poszerzenie oferty o WordPress."
    }, */
    {
      "id": "faq-4",
      "question": "Dlaczego warto zadbać o zgodność z WCAG?",
      "answer": "Dostępna strona to większy zasięg – docierasz do dodatkowych 5 milionów Polaków z niepełnosprawnościami. To także lepsze pozycjonowanie w Google, bo wyszukiwarki preferują strony zgodne ze standardami dostępności. Zyskujesz wyższe wskaźniki konwersji dzięki lepszemu UX dla wszystkich użytkowników, nie tylko osób z niepełnosprawnościami. Budujesz pozytywny wizerunek marki odpowiedzialnej społecznie i unikasz kar finansowych – nawet do 10% rocznego obrotu. Zgodność z WCAG to inwestycja, która się zwraca."
    }
  
  ];

  return (
    <section className={styles.faqSection} id="faq" aria-labelledby="faq-heading">
      <div className={styles.container}>
        <div className={styles.leftColumn}>
          <AnimatedReveal direction="left" delay={0.1} distance={40}>
            <h2 id="faq-heading" className={styles.title}>FAQ</h2>
            <p className={styles.description}>
              Znajdź odpowiedzi na najczęściej zadawane pytania dotyczące naszych usług i dostępności cyfrowej.
            </p>
          </AnimatedReveal>
        </div>
        
        <div className={styles.rightColumn}>

          <ul className={styles.accordionList}>
            {faqItems.map((item, idx) => {
              const isExpanded = expandedIds.includes(item.id);
              
              return (
                <li key={item.id} className={styles.accordionItem}>
                  <AnimatedReveal direction="right" delay={0.3 + (idx * 0.1)} distance={30}>
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
                    >
                      <div 
                        className={styles.accordionAnswer}
                        ref={(el) => { answerRefs.current[item.id] = el; }}
                      >
                        {item.answer}
                      </div>
                    </div>
                  </AnimatedReveal>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
};
