import React from 'react';
import styles from './ProjectCard.module.scss';
import Image from 'next/image';

interface ProjectCardProps {
  id: string;
  image: string;
  title: string;
  description: string;
  technologies?: string[];
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  image,
  title,
  description,
  technologies = [],
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <Image
          src={image}
          alt=""
          aria-hidden="true"
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
    </div>
  );
};
