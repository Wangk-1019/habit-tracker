'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedLayoutProps {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function AnimatedLayout({ children, className }: AnimatedLayoutProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className={cn('w-full', className)}
    >
      {children}
    </motion.div>
  );
}

// Wrapper for list items that should animate in sequence
export function AnimatedList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={staggerChildren}
      initial="initial"
      animate="animate"
      className={cn('space-y-4', className)}
    >
      {children}
    </motion.div>
  );
}

// Individual animated item
export function AnimatedItem({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

// Page transition wrapper
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={typeof window !== 'undefined' ? window.location.pathname : 'default'}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Slide in from left
export function SlideInLeft({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      {children}
    </motion.div>
  );
}

// Slide in from right
export function SlideInRight({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      {children}
    </motion.div>
  );
}

// Fade in with scale
export function FadeInScale({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay, type: 'spring' }}
    >
      {children}
    </motion.div>
  );
}

// Shimmer effect for loading states
export function Shimmer({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn('bg-muted/50 rounded-lg', className)}
      animate={{
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// Skeleton card
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border bg-card p-6 space-y-4', className)}>
      <Shimmer className="h-4 w-1/3 rounded" />
      <Shimmer className="h-4 w-2/3 rounded" />
      <Shimmer className="h-20 w-full rounded" />
    </div>
  );
}
