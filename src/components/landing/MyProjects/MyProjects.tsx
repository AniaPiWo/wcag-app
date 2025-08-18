import React from 'react';
import styles from './MyProjects.module.scss'
import { ProjectCard } from '../../atoms/ProjectCard/ProjectCard';
import { Container } from '../../atoms/Container/Container';
import { AnimatedReveal } from '../../atoms/AnimatedReveal/AnimatedReveal';


export const projects = [
  {
    id: '1',
    image: '/images/bruxa.png',
    imageAlt: 'Strona główna sklepu bruxa.co z minimalistycznym designem i elegancką typografią',
    title: 'bruxa.co',
    description: 'Strona została przygotowana zgodnie z dostarczonym projektem, z dużą dbałością o każdy szczegół wizualny i funkcjonalny. Implementacja złożonych animacji była wymagającym, ale satysfakcjonującym etapem pracy. Efektem końcowym jest szybki, nowoczesny i w pełni dostępny serwis, który wiernie oddaje założenia projektu i zapewnia komfort użytkowania niezależnie od urządzenia czy ograniczeń użytkownika.',
    technologies: ['WCAG 2.2', 'NextJS', 'TypeScript', 'React', 'SEO'],
    url: 'https://bruxa.co',
    isLink: true
  },
  {
    id: '2',
    image: '/images/devhunting.png',
    imageAlt: 'Strona główna portalu devhunting.co z nowoczesnym designem i czytelną nawigacją',
    title: 'devhunting.co',
    description: 'Projekt został zrealizowany w zespole, którego pracami miałam przyjemność kierować, jednocześnie aktywnie uczestnicząc w tworzeniu wybranych elementów interfejsu. Przygotowałam m.in. nagłówek, stopkę, sekcję opinii oraz FAQ. Zadbałam o zgodność z wytycznymi dostępności oraz dobre praktyki SEO, dzięki czemu strona jest nie tylko estetyczna i funkcjonalna, ale też w pełni przyjazna dla wszystkich użytkowników.',
    technologies: ['WCAG 2.2', 'NextJS', 'TypeScript', 'React', 'SEO'],
    url: 'https://devhunting.co',
    isLink: true
  },
  {
    id: '3',
    image: '/images/akg.png',
    title: 'akg-sosnowiec.pl',
    description: 'Punktem wyjścia była klarowna wizja klienta, którą z przyjemnością przełożyłam na działającą stronę – w pełni oddając jej założenia i nadając jej życie w formie nowoczesnej wizytówki online. Wykorzystując klasyczny stack HTML, CSS i JavaScript, stworzyłam lekką, estetyczną i funkcjonalną stronę. Projekt jest zgodny ze standardami dostępności (WCAG 2.2) i zoptymalizowany pod kątem SEO, co gwarantuje komfort użytkowania i dobrą widoczność w sieci.',
    technologies: ['WCAG 2.2', 'HTML', 'CSS', 'JavaScript', 'SEO'],
    url: 'https://akg-sosnowiec.pl',
    isLink: true
  },
  {
    id: '4',
    image: '/images/wcag.jpg',
    title: 'wcag.co',
    imageAlt: 'Strona główna portalu wcag.co z nowoczesnym designem i czytelną nawigacją',
    description: 'To ta strona – mój najnowszy projekt 🙂 Przejrzysta, estetyczna i w pełni dostępna strona główna, pod którą kryje się narzędzie do automatycznego wykrywania niezgodności z wytycznymi dostępności cyfrowej. Umożliwia przetestowanie dowolnej domeny i otrzymanie szczegółowego raportu na wskazany adres e-mail. Wyniki audytu są interpretowane przez podłączoną AI, która przekształca je w zrozumiały i praktyczny raport wysyłany bezpośrednio do użytkownika.',
    technologies: ['WCAG 2.2', 'NextJS', 'TypeScript', 'SEO', "AI"],
    url: 'https://wcag.co',
    isLink: true
  },

];

export const MyProjects = () => {
  return (
    <section id="projects" className={styles.wrapper}>
      <Container>
        <AnimatedReveal direction="up" delay={0.1} distance={30}>
          <div className={styles.top}>
            <h2 className={styles.title}>Moje ostatnie projekty</h2>
            <p className={styles.desc}>
            Pracując nad tymi projektami, zadbałam o każdy szczegół — od zgodności z wytycznymi dostępności (WCAG), przez optymalizację wydajności, aż po dopracowane SEO. To realizacje, w których liczy się nie tylko wygląd, ale przede wszystkim funkcjonalność, szybkość działania i komfort użytkownika – niezależnie od jego urządzenia czy możliwości.
            </p>
          </div>
        </AnimatedReveal>
        
        <div className={styles.projectsGrid}>
          {projects.map((project, idx) => (
            <AnimatedReveal 
              key={project.id}
              direction={idx % 2 !== 0 ? "left" : "right"} 
              delay={0.3 + (idx * 0.1)} 
              distance={40}
            >
              <ProjectCard
                id={project.id}
                image={project.image}
                title={project.title}
                description={project.description}
                technologies={project.technologies}
                url={project.url}
                isLink={project.isLink}
                imageAlt={project.imageAlt}
              />
            </AnimatedReveal>
          ))}
        </div>
      </Container>
    </section>
  );
};
