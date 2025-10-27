'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Lazy load AnimatedReveal z framer-motion (oszczędność ~80-100 kB)
const AnimatedReveal = dynamic(
  () => import('./AnimatedReveal').then(mod => ({ default: mod.AnimatedReveal })),
  {
    ssr: false,
    loading: () => <div style={{ opacity: 0 }} />
  }
);

type AnimationDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface LazyAnimatedRevealProps {
  children: React.ReactNode;
  direction?: AnimationDirection;
  delay?: number;
  duration?: number;
  className?: string;
  distance?: number;
  once?: boolean;
}

export const LazyAnimatedReveal: React.FC<LazyAnimatedRevealProps> = (props) => {
  return <AnimatedReveal {...props} />;
};
