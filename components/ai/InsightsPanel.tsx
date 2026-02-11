'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Award, Target, Calendar, Flame } from 'lucide-react';
import { useHabitStore } from '@/lib/stores/habitStore';
import { useMoodStore } from '@/lib/stores/moodStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { calculateConsistencyScore } from '@/lib/utils/streakCalculator';

interface InsightsPanelProps {
  days?: number;
}

export function InsightsPanel({ days = 30 }: InsightsPanelProps) {
  const habits = useHabitStore((state) => state.habits);
  const getActiveHabits = useHabitStore((state) => state.getActiveHabits);
  const getAverageMoodScore = useMoodStore((state) => state.getAverageMoodScore);
  const getMoodTrend = useMoodStore((state) => state.getMoodTrend);

  const insights = useMemo(() => {
    const activeHabits = getActiveHabits();
    const avgMood = getAverageMoodScore(days);
    const moodTrend = getMoodTrend(Math.min(days, 14));

    // Calculate overall completion rate
    const today = new Date().toISOString().split('T')[0];
    const completedToday = activeHabits.filter(h => h.completedDates.includes(today)).length;
    const completionRate = activeHabits.length > 0 ? completedToday / activeHabits.length : 0;

    // Find best and worst performing habits
    const habitScores = activeHabits.map(habit => ({
      habit,
      consistency: calculateConsistencyScore(habit),
      currentStreak: habit.completedDates.filter(d => d >= new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]).length,
    }));

    habitScores.sort((a, b) => b.consistency - a.consistency);
    const bestHabit = habitScores[0];
    const worstHabit = habitScores[habitScores.length - 1];

    return {
      completionRate,
      avgMood,
      moodTrend,
      bestHabit,
      worstHabit,
      totalHabits: activeHabits.length,
      totalStreak: activeHabits.reduce((sum, h) => {
        const streak = h.completedDates.length;
        // Simple streak calculation
        return sum + streak;
      }, 0),
    };
  }, [habits, getActiveHabits, getAverageMoodScore, getMoodTrend, days]);

  const trendIcon = {
    improving: <TrendingUp className="w-4 h-4" />,
    declining: <TrendingDown className="w-4 h-4" />,
    stable: <Minus className="w-4 h-4" />,
  };

  const trendColor = {
    improving: 'text-emerald-500',
    declining: 'text-rose-500',
    stable: 'text-muted-foreground',
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Completion Today"
          value={`${Math.round(insights.completionRate * 100)}%`}
          icon={<Target className="w-5 h-5" />}
          progress={insights.completionRate}
        />
        <SummaryCard
          title="Avg Mood"
          value={insights.avgMood.toFixed(1)}
          icon={trendIcon[insights.moodTrend]}
          iconColor={trendColor[insights.moodTrend]}
        />
        <SummaryCard
          title="Active Habits"
          value={insights.totalHabits.toString()}
          icon={<Target className="w-5 h-5" />}
        />
        <SummaryCard
          title="Total Entries"
          value={insights.totalStreak.toString()}
          icon={<Calendar className="w-5 h-5" />}
        />
      </div>

      {/* Performance insights */}
      <div className="grid md:grid-cols-2 gap-4">
        {insights.bestHabit && (
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <Award className="w-5 h-5" />
                Best Performer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-semibold">{insights.bestHabit.habit.name}</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Consistency score</span>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    {insights.bestHabit.consistency}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  You're doing great with this habit! Keep the momentum going.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {insights.worstHabit && insights.worstHabit !== insights.bestHabit && (
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Target className="w-5 h-5" />
                Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-semibold">{insights.worstHabit.habit.name}</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Consistency score</span>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                    {insights.worstHabit.consistency}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Consider breaking this into smaller steps or stacking it with an existing habit.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-primary" />
            Personalized Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {insights.completionRate < 0.5 && (
              <TipItem
                text="Start with just one habit today. Small wins build momentum!"
                priority="high"
              />
            )}
            {insights.moodTrend === 'declining' && insights.avgMood < 3 && (
              <TipItem
                text="Your mood has been trending down. Consider adding a quick mood-boosting habit like gratitude journaling."
                priority="medium"
              />
            )}
            {insights.totalHabits > 5 && insights.completionRate > 0.8 && (
              <TipItem
                text="You're doing great with many habits! Consider consolidating some to maintain focus."
                priority="low"
              />
            )}
            {insights.completionRate === 1 && insights.totalHabits > 0 && (
              <TipItem
                text="Perfect day! Celebrate your achievement - you earned it!"
                priority="celebration"
              />
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ title, value, icon, iconColor, progress }: {
  title: string;
  value: string;
  icon?: React.ReactNode;
  iconColor?: string;
  progress?: number;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-2">
          <span className="text-sm text-muted-foreground">{title}</span>
          {icon && <span className={iconColor}>{icon}</span>}
        </div>
        <div className="text-2xl font-bold mb-2">{value}</div>
        {progress !== undefined && (
          <Progress value={progress * 100} className="h-1" />
        )}
      </CardContent>
    </Card>
  );
}

function TipItem({ text, priority }: { text: string; priority: 'high' | 'medium' | 'low' | 'celebration' }) {
  const priorityColors = {
    high: 'border-rose-500/30 bg-rose-500/5',
    medium: 'border-amber-500/30 bg-amber-500/5',
    low: 'border-blue-500/30 bg-blue-500/5',
    celebration: 'border-emerald-500/30 bg-emerald-500/5',
  };

  const priorityBadges = {
    high: <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20">Important</Badge>,
    medium: <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Tip</Badge>,
    low: <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Suggestion</Badge>,
    celebration: <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">🎉</Badge>,
  };

  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn('flex gap-3 p-3 rounded-lg border', priorityColors[priority])}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          {priorityBadges[priority]}
        </div>
        <p className="text-sm">{text}</p>
      </div>
    </motion.li>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}
