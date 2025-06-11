import React from 'react';
import styles from './ProjectCard.module.scss';
import Image from 'next/image';
import Link from 'next/link';

interface ProjectCardProps {
  id: string;
  image: string;
  title: string;
  description: string;
  technologies?: string[];
  url?: string;
  isLink?: boolean;
  imageAlt?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  image,
  title,
  description,
  technologies = [],
  url,
  isLink = false,
  imageAlt,
}) => {
  // Jeśli nie podano URL, a isLink jest true, generujemy URL na podstawie tytułu
  const finalUrl = url || (isLink ? `/${title.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  
  // Zawartość karty projektu
  const cardContent = (
    <>
      <div className={styles.imageContainer}>
        <Image
          src={image}
          alt={imageAlt || `Zdjęcie projektu ${title}`}
          fill
          sizes="(max-width: 768px) 100vw, 300px"
          style={{ objectFit: 'cover' }}
          className={styles.image}
        />
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        {technologies.length > 0 && (
          <div className={styles.technologies}>
            {technologies.map((tech, index) => (
              <span key={`${id}-tech-${index}`} className={styles.technology}>
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );

  // Jeśli to ma być link, opakowujemy zawartość w komponent Link
  if (finalUrl) {
    return (
      <Link href={finalUrl} className={styles.card}>
        {cardContent}
      </Link>
    );
  }
  
  // W przeciwnym razie zwracamy zwykły div
  return <div className={styles.card}>{cardContent}</div>;
};
