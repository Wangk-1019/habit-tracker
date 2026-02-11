'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useMoodStore } from '@/lib/stores/moodStore';
import { MOOD_CONFIG, type MoodType } from '@/lib/types/mood';
import { getLastNDays } from '@/lib/utils/dateUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MoodChartProps {
  days?: number;
  compact?: boolean;
}

const MOOD_HEIGHTS: Record<MoodType, number> = {
  terrible: 20,
  bad: 40,
  neutral: 60,
  good: 80,
  excellent: 100,
};

const MOOD_COLORS: Record<MoodType, string> = {
  terrible: 'bg-rose-500',
  bad: 'bg-orange-500',
  neutral: 'bg-yellow-500',
  good: 'bg-emerald-500',
  excellent: 'bg-green-600',
};

export function MoodChart({ days = 7, compact = false }: MoodChartProps) {
  const getTodaysMood = useMoodStore((state) => state.getTodaysMood);
  const getRecentMoods = useMoodStore((state) => state.getRecentMoods);

  const chartData = useMemo(() => {
    const recentDates = getLastNDays(days);
    const recentMoods = getRecentMoods(days);

    return recentDates.map(date => {
      const dayMoods = recentMoods.filter(m => m.date === date);
      // Get the last mood entry for the day
      const lastMood = dayMoods.length > 0 ? dayMoods[dayMoods.length - 1] : null;
      return {
        date,
        mood: lastMood?.mood || null,
        isToday: date === new Date().toISOString().split('T')[0],
      };
    });
  }, [days, getRecentMoods]);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (compact) {
    return (
      <div className="flex items-end gap-1 h-16">
        {chartData.map((data, index) => {
          const config = data.mood ? MOOD_CONFIG.find(m => m.type === data.mood) : null;
          const height = data.mood ? MOOD_HEIGHTS[data.mood] : 8;

          return (
            <motion.div
              key={data.date}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: '100%', opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div className="w-full flex items-end justify-center h-full">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 0.2 + index * 0.05, duration: 0.4 }}
                  className={cn(
                    'w-full rounded-t-sm transition-all',
                    data.mood ? MOOD_COLORS[data.mood] : 'bg-muted',
                    data.isToday && 'ring-2 ring-primary/50'
                  )}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {dayNames[new Date(data.date).getDay()]}
              </span>
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Mood Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 flex items-end gap-2">
          {chartData.map((data, index) => {
            const config = data.mood ? MOOD_CONFIG.find(m => m.type === data.mood) : null;
            const height = data.mood ? MOOD_HEIGHTS[data.mood] : 8;

            return (
              <motion.div
                key={data.date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex-1 flex flex-col items-center gap-2 group"
              >
                {/* Bar */}
                <div className="flex-1 w-full flex items-end justify-center relative">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.2 + index * 0.05, duration: 0.4, type: 'spring' }}
                    className={cn(
                      'w-full rounded-t-md transition-all cursor-pointer hover:brightness-110',
                      data.mood ? MOOD_COLORS[data.mood] : 'bg-muted/30',
                      data.isToday && 'ring-2 ring-primary/50'
                    )}
                  />

                  {/* Emoji tooltip */}
                  {data.mood && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="text-2xl">{config?.emoji}</span>
                    </motion.div>
                  )}
                </div>

                {/* Day label */}
                <span
                  className={cn(
                    'text-xs font-medium',
                    data.isToday ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {dayNames[new Date(data.date).getDay()]}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Mood scale */}
        <div className="flex justify-between mt-4 text-xs text-muted-foreground">
          <span>😞 Low</span>
          <span>😐 Neutral</span>
          <span>😊 High</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Mood stats component
export function MoodStats({ days = 30 }: { days?: number }) {
  const getRecentMoods = useMoodStore((state) => state.getRecentMoods);
  const getAverageMoodScore = useMoodStore((state) => state.getAverageMoodScore);
  const getMoodTrend = useMoodStore((state) => state.getMoodTrend);

  const recentMoods = getRecentMoods(days);
  const averageScore = getAverageMoodScore(days);
  const trend = getMoodTrend(Math.min(days, 14));

  const moodDistribution = useMemo(() => {
    const distribution: Record<MoodType, number> = {
      terrible: 0,
      bad: 0,
      neutral: 0,
      good: 0,
      excellent: 0,
    };

    recentMoods.forEach(entry => {
      distribution[entry.mood]++;
    });

    return distribution;
  }, [recentMoods]);

  const total = recentMoods.length;
  const dominantMood = Object.entries(moodDistribution).sort((a, b) => b[1] - a[1])[0];

  const trendColors = {
    improving: 'text-emerald-500',
    declining: 'text-rose-500',
    stable: 'text-muted-foreground',
  };

  const trendIcons = {
    improving: '↑',
    declining: '↓',
    stable: '→',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground mb-2">Average Mood</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{averageScore.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">/ 5</span>
          </div>
          {total > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <span className={`text-lg ${trendColors[trend]}`}>
                {trendIcons[trend]}
              </span>
              <span className={`text-sm ${trendColors[trend]} capitalize`}>
                {trend}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground mb-2">Most Common</div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">
              {dominantMood
                ? MOOD_CONFIG.find(m => m.type === dominantMood[0] as MoodType)?.emoji
                : '-'}
            </span>
            {dominantMood && dominantMood[1] > 0 && (
              <span className="text-sm text-muted-foreground">
                ({Math.round((dominantMood[1] / total) * 100)}%)
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground mb-2">Entries</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{total}</span>
            <span className="text-sm text-muted-foreground">
              in {days} days
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
