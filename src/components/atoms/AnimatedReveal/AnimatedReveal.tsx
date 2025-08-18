'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { motion, useAnimation, useInView, TargetAndTransition } from 'framer-motion';

type AnimationDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface AnimatedRevealProps {
  children: React.ReactNode;
  direction?: AnimationDirection;
  delay?: number;
  duration?: number;
  className?: string;
  distance?: number;
  once?: boolean;
}

export const AnimatedReveal: React.FC<AnimatedRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  className = '',
  distance = 50,
  once = true,

}) => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once });  // usuwamy threshold, bo nie jest obsługiwany w typach

  // Określ początkową pozycję na podstawie kierunku
  const getInitialPosition = useMemo((): Record<string, number | string> => {
    const initial: Record<string, number | string> = { opacity: 0 };

    switch (direction) {
      case 'up':
        initial.y = distance;
        break;
      case 'down':
        initial.y = -distance;
        break;
      case 'left':
        initial.x = distance;
        break;
      case 'right':
        initial.x = -distance;
        break;
      case 'none':
        // Tylko opacity, bez przesunięcia
        break;
    }

    return initial;
  }, [direction, distance]);

  // Określ końcową pozycję (widoczną)
  const getVisiblePosition = useMemo((): TargetAndTransition => {
    const visible: TargetAndTransition = { 
      opacity: 1,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1], // płynna, naturalna krzywa
      }
    };

    switch (direction) {
      case 'up':
      case 'down':
        visible.y = 0;
        break;
      case 'left':
      case 'right':
        visible.x = 0;
        break;
      case 'none':
        // Tylko opacity
        break;
    }

    return visible;
  }, [direction, duration, delay]);

  useEffect(() => {
    if (inView) {
      controls.start(getVisiblePosition);
    }
  }, [inView, controls, getVisiblePosition]);

  return (
    <motion.div
      ref={ref}
      initial={getInitialPosition}
      animate={controls}
      className={className}
    >
      {children}
    </motion.div>
  );
};
