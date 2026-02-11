'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useMemo } from 'react';

interface StreakDisplayProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animate?: boolean;
}

const STREAK_COLORS = {
  low: 'text-orange-500',
  medium: 'text-orange-400',
  high: 'text-orange-600',
  extreme: 'text-red-500',
};

export function StreakDisplay({
  streak,
  size = 'md',
  showLabel = false,
  animate = true,
}: StreakDisplayProps) {
  const colorClass = useMemo(() => {
    if (streak === 0) return STREAK_COLORS.low;
    if (streak < 7) return STREAK_COLORS.low;
    if (streak < 21) return STREAK_COLORS.medium;
    if (streak < 50) return STREAK_COLORS.high;
    return STREAK_COLORS.extreme;
  }, [streak]);

  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }[size];

  const flameCount = Math.min(Math.ceil(streak / 10), 3);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[...Array(flameCount)].map((_, i) => (
          <motion.div
            key={i}
            initial={animate ? { scale: 0, rotate: -10 } : false}
            animate={
              animate
                ? {
                    scale: 1,
                    rotate: 0,
                  }
                : false
            }
            transition={{
              type: 'spring',
              delay: i * 0.1,
              stiffness: 300,
              damping: 20,
            }}
          >
            <Flame
              className={`${sizeClass} ${colorClass}`}
              style={{
                animation: animate ? 'flicker 0.5s ease-in-out infinite alternate' : undefined,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          </motion.div>
        ))}
      </div>
      {streak > 0 && (
        <motion.span
          initial={animate ? { opacity: 0, y: 10 } : false}
          animate={animate ? { opacity: 1, y: 0 } : false}
          transition={{ delay: 0.3 }}
          className={`font-bold ${colorClass}`}
        >
          {streak}
        </motion.span>
      )}
      {showLabel && (
        <span className="text-sm text-muted-foreground">
          day{streak !== 1 ? 's' : ''} streak
        </span>
      )}
    </div>
  );
}

// Animated flame variants for confetti effect
export function StreakCelebration({ streak }: { streak: number }) {
  if (streak < 7) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <Flame className="w-24 h-24 text-orange-500 mx-auto" />
          <motion.h2
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="text-4xl font-bold text-orange-600 mt-4"
          >
            {streak} Day Streak!
          </motion.h2>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
