'use client';

import { InsightsPanel } from '@/components/ai/InsightsPanel';
import { StreakPredictor } from '@/components/ai/StreakPredictor';
import { useHabitStore } from '@/lib/stores/habitStore';
import { useMoodStore } from '@/lib/stores/moodStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Calendar, Target, TrendingUp } from 'lucide-react';
import { calculateCurrentStreak, calculateLongestStreak, calculateConsistencyScore } from '@/lib/utils/streakCalculator';

export default function InsightsPage() {
  const habits = useHabitStore((state) => state.habits);
  const moodHistory = useMoodStore((state) => state.moodHistory);

  const activeHabits = habits.filter(h => h.active);

  // Calculate stats
  const totalHabits = habits.length;
  const activeHabitsCount = activeHabits.length;
  const totalCompletions = habits.reduce((sum, h) => sum + h.completedDates.length, 0);

  const bestStreak = activeHabits.reduce((max, h) => {
    const streak = calculateLongestStreak(h);
    return streak > max ? streak : max;
  }, 0);

  const bestHabit = activeHabits.reduce((best, h) => {
    const score = calculateConsistencyScore(h);
    if (!best || calculateConsistencyScore(best) < score) {
      return h;
    }
    return best;
  }, null as typeof activeHabits[0] | null);

  // Mood stats
  const moodDistribution = {
    terrible: moodHistory.filter(m => m.mood === 'terrible').length,
    bad: moodHistory.filter(m => m.mood === 'bad').length,
    neutral: moodHistory.filter(m => m.mood === 'neutral').length,
    good: moodHistory.filter(m => m.mood === 'good').length,
    excellent: moodHistory.filter(m => m.mood === 'excellent').length,
  };

  const dominantMood = Object.entries(moodDistribution)
    .sort((a, b) => b[1] - a[1])[0];
  const moodEntries = moodHistory.length;

  return (
    <div className="min-h-screen pb-24 px-4">
      <div className="container mx-auto max-w-2xl py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold mb-1">Insights</h1>
          <p className="text-sm text-muted-foreground">
            Your habit and mood analytics
          </p>
        </div>

        {/* Overview stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Total Habits</span>
              </div>
              <div className="text-2xl font-bold">{totalHabits}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {activeHabitsCount} active
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Total Check-ins</span>
              </div>
              <div className="text-2xl font-bold">{totalCompletions}</div>
              <div className="text-xs text-muted-foreground mt-1">
                all time
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">Best Streak</span>
              </div>
              <div className="text-2xl font-bold">{bestStreak}</div>
              <div className="text-xs text-muted-foreground mt-1">
                days
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-muted-foreground">Mood Entries</span>
              </div>
              <div className="text-2xl font-bold">{moodEntries}</div>
              {dominantMood[1] > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  Most: {dominantMood[0]}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Streak predictor */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Streak Alerts</h2>
          <StreakPredictor showDetails />
        </div>

        {/* AI insights */}
        <div>
          <h2 className="text-lg font-semibold mb-3">AI Insights</h2>
          <InsightsPanel days={30} />
        </div>

        {/* Best habit highlight */}
        {bestHabit && (
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader>
              <CardTitle className="text-emerald-700 dark:text-emerald-400 text-lg">
                Star Performer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{bestHabit.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {bestHabit.description || 'No description'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-600">
                    {calculateConsistencyScore(bestHabit)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    consistency
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Current streak:</span>
                  <span className="ml-2 font-medium">{calculateCurrentStreak(bestHabit)} days</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Best streak:</span>
                  <span className="ml-2 font-medium">{calculateLongestStreak(bestHabit)} days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {totalHabits === 0 && moodEntries === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No data yet</h3>
              <p className="text-sm text-muted-foreground">
                Start tracking your habits and moods to see insights and analytics.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
