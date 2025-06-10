import React from 'react';
import styles from './MyProjects.module.scss';
import { ProjectCard } from '../atoms/ProjectCard/ProjectCard';
import { Container } from '../atoms/Container/Container';


export const projects = [
  {
    id: '1',
    image: '/pug.jpg',
    title: 'Sklep internetowy z modą',
    description: 'Audyt dostępności i implementacja poprawek dla sklepu internetowego z branży modowej.',
    technologies: ['WCAG 2.2', 'Audyt', 'Implementacja']
  },
  {
    id: '2',
    image: '/pug.jpg',
    title: 'Portal informacyjny',
    description: 'Kompleksowy audyt WCAG 2.1 dla dużego portalu informacyjnego z wdrożeniem poprawek.',
    technologies: ['WCAG 2.1', 'Audyt', 'Konsultacje']
  },
  {
    id: '3',
    image: '/pug.jpg',
    title: 'Aplikacja bankowa',
    description: 'Konsultacje dostępności i testy z użytkownikami dla aplikacji bankowej.',
    technologies: ['Testy', 'UX', 'Konsultacje']
  },
  {
    id: '4',
    image: '/pug.jpg',
    title: 'Platforma edukacyjna',
    description: 'Projektowanie i wdrożenie dostępnej platformy edukacyjnej zgodnej z WCAG 2.2.',
    technologies: ['WCAG 2.2', 'Projektowanie', 'Wdrożenie']
  },
  {
    id: '5',
    image: '/pug.jpg',
    title: 'Platforma edukacyjna',
    description: 'Projektowanie i wdrożenie dostępnej platformy edukacyjnej zgodnej z WCAG 2.2.',
    technologies: ['WCAG 2.2', 'Projektowanie', 'Wdrożenie']
  },
  {
    id: '6',
    image: '/pug.jpg',
    title: 'Platforma edukacyjna',
    description: 'Projektowanie i wdrożenie dostępnej platformy edukacyjnej zgodnej z WCAG 2.2.',
    technologies: ['WCAG 2.2', 'Projektowanie', 'Wdrożenie']
  },
];

export const MyProjects = () => {
  return (
    <section id="projects" className={styles.wrapper}>
      <Container>
        <div className={styles.top}>
          <h2 className={styles.title}>Moje projekty</h2>
          <p className={styles.desc}>
            Poznaj wybrane projekty, przy których miałam przyjemność pracować. Każdy z nich to unikalne wyzwanie
            i możliwość zwiększenia dostępności cyfrowej dla wszystkich użytkowników.
          </p>
        </div>
        
        <div className={styles.projectsGrid}>
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              image={project.image}
              title={project.title}
              description={project.description}
              technologies={project.technologies}
            />
          ))}
        </div>
      </Container>
    </section>
  );
};
