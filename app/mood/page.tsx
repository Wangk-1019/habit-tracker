'use client';

import { MoodSelector } from '@/components/mood/MoodSelector';
import { MoodChart, MoodStats } from '@/components/mood/MoodChart';
import { MoodDisplay } from '@/components/mood/MoodSelector';
import { useMoodStore } from '@/lib/stores/moodStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp, Smile } from 'lucide-react';
import { formatDate } from '@/lib/utils/dateUtils';

export default function MoodPage() {
  const moodHistory = useMoodStore((state) => state.moodHistory);
  const getTodaysMood = useMoodStore((state) => state.getTodaysMood);
  const getMoodsForDateRange = useMoodStore((state) => state.getMoodsForDateRange);
  const deleteMood = useMoodStore((state) => state.deleteMood);

  const todaysMood = getTodaysMood();

  // Get recent moods for history display
  const recentMoods = [...moodHistory]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 20);

  return (
    <div className="min-h-screen pb-24 px-4">
      <div className="container mx-auto max-w-2xl py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold mb-1">Mood Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Track how you're feeling each day
          </p>
        </div>

        {/* Today's mood */}
        <Card className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent border-indigo-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Today</span>
                </div>
                <h3 className="text-lg font-semibold">
                  {formatDate(new Date().toISOString().split('T')[0])}
                </h3>
              </div>
              <MoodSelector
                trigger={
                  todaysMood ? (
                    <button className="text-5xl hover:scale-110 transition-transform">
                      <MoodDisplay mood={todaysMood.mood} size="lg" />
                    </button>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
                      <Smile className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )
                }
              />
            </div>
            {todaysMood?.note && (
              <p className="mt-4 text-sm text-muted-foreground italic">
                "{todaysMood.note}"
              </p>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <MoodStats days={30} />

        {/* Mood chart */}
        <MoodChart days={7} />

        {/* Recent history */}
        {recentMoods.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recent History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMoods.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0 text-2xl">
                      <MoodDisplay mood={entry.mood} size="md" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium capitalize">
                          {entry.mood}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(entry.date)}
                        </span>
                      </div>
                      {entry.note && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {entry.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {moodHistory.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Smile className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No mood entries yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start tracking your mood to discover patterns and insights.
              </p>
              <MoodSelector />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
