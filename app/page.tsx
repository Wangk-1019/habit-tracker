'use client';

import { useHabitStore } from '@/lib/stores/habitStore';
import { useMoodStore } from '@/lib/stores/moodStore';
import { HabitCard } from '@/components/habits/HabitCard';
import { HabitForm } from '@/components/habits/HabitForm';
import { MoodSelector, MoodDisplay } from '@/components/mood/MoodSelector';
import { StreakPredictor } from '@/components/ai/StreakPredictor';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, Plus, Sparkles } from 'lucide-react';
import { getTodayStr } from '@/lib/utils/dateUtils';
import { calculateCurrentStreak } from '@/lib/utils/streakCalculator';

export default function HomePage() {
  const getTodayHabits = useHabitStore((state) => state.getTodayHabits);
  const getTodaysMood = useMoodStore((state) => state.getTodaysMood);
  const today = getTodayStr();

  const habits = getTodayHabits();
  const todaysMood = getTodaysMood();

  const completedToday = habits.filter(h => h.completedDates.includes(today));
  const totalStreak = habits.reduce((sum, h) => sum + calculateCurrentStreak(h), 0);

  const moodTrigger = todaysMood ? (
    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 hover:bg-muted transition-colors">
      <MoodDisplay mood={todaysMood.mood} />
      <span className="text-sm text-muted-foreground">Logged</span>
    </button>
  ) : (
    <Button variant="outline" size="sm" className="gap-2">
      <Sparkles className="w-4 h-4" />
      How are you?
    </Button>
  );

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent px-4 py-8 sm:px-6">
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Good morning!
              </h1>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <MoodSelector trigger={moodTrigger} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-muted-foreground">Total Streak</span>
                </div>
                <div className="text-2xl font-bold">{totalStreak}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Plus className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Completed Today</span>
                </div>
                <div className="text-2xl font-bold">{completedToday.length}/{habits.length}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto max-w-2xl px-4 py-6 space-y-6">
        {/* Streak warnings */}
        {habits.length > 0 && (
          <StreakPredictor />
        )}

        {/* Habits */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Today's Habits</h2>
            <HabitForm trigger={
              <Button size="sm" variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            } />
          </div>

          {habits.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">No habits yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start building better habits today. Add your first habit to begin tracking.
                </p>
                <HabitForm />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  streak={calculateCurrentStreak(habit)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
