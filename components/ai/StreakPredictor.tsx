'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Shield, Info } from 'lucide-react';
import { useHabitStore } from '@/lib/stores/habitStore';
import { calculateCurrentStreak, getStreakData } from '@/lib/utils/streakCalculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StreakPredictorProps {
  showDetails?: boolean;
}

export function StreakPredictor({ showDetails = false }: StreakPredictorProps) {
  const habits = useHabitStore((state) => state.habits);
  const getActiveHabits = useHabitStore((state) => state.getActiveHabits);

  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const streakRisks = useMemo(() => {
    const activeHabits = getActiveHabits();
    const today = new Date().toISOString().split('T')[0];

    return activeHabits
      .map(habit => {
        const streak = calculateCurrentStreak(habit);
        const completedToday = habit.completedDates.includes(today);
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const completedYesterday = habit.completedDates.includes(yesterday);

        let riskLevel: 'low' | 'medium' | 'high' = 'low';
        let confidence = 0.9;
        const factors: string[] = [];
        const suggestions: string[] = [];

        // High risk scenarios
        if (streak >= 14 && !completedToday && completedYesterday) {
          riskLevel = 'high';
          factors.push(`You have a ${streak}-day streak at risk`);
          suggestions.push('Complete this habit today to save your streak!');
          confidence = 0.95;
        } else if (streak >= 30 && !completedToday) {
          riskLevel = 'high';
          factors.push(`You have a ${streak}-day milestone streak`);
          suggestions.push('You\'ve built something special - protect it!');
          confidence = 0.9;
        }

        // Medium risk scenarios
        if (streak >= 7 && !completedToday && completedYesterday) {
          riskLevel = 'medium';
          factors.push(`Your ${streak}-day streak needs attention`);
          suggestions.push('Get back on track today');
        } else if (streak >= 5 && !completedToday) {
          riskLevel = 'medium';
          factors.push(`Your ${streak}-day streak is growing`);
          suggestions.push('Keep the momentum going!');
        }

        // Low risk
        if (completedToday) {
          riskLevel = 'low';
          factors.push('Completed today!');
          suggestions.push('You\'re on fire!');
        }

        return {
          habitId: habit.id,
          habitName: habit.name,
          currentStreak: streak,
          riskLevel,
          confidence,
          factors,
          suggestions,
        };
      })
      .filter(r => r.riskLevel !== 'low')
      .sort((a, b) => {
        const riskOrder = { high: 0, medium: 1, low: 2 };
        return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      });
  }, [habits, getActiveHabits]);

  const visibleRisks = streakRisks.filter(r => !dismissedIds.includes(r.habitId));

  const riskConfig = {
    high: {
      icon: <AlertTriangle className="w-5 h-5" />,
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      badgeColor: 'bg-rose-500 text-white',
      textColor: 'text-rose-700 dark:text-rose-400',
    },
    medium: {
      icon: <TrendingUp className="w-5 h-5" />,
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      badgeColor: 'bg-amber-500 text-white',
      textColor: 'text-amber-700 dark:text-amber-400',
    },
    low: {
      icon: <Shield className="w-5 h-5" />,
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      badgeColor: 'bg-emerald-500 text-white',
      textColor: 'text-emerald-700 dark:text-emerald-400',
    },
  };

  if (visibleRisks.length === 0) {
    return (
      <Card className={cn(
        'border-emerald-500/20 bg-emerald-500/5',
        showDetails ? 'w-full' : ''
      )}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                All streaks safe!
              </p>
              <p className="text-sm text-muted-foreground">
                Keep up the great work with your habits.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-3', showDetails ? 'w-full' : '')}>
      {visibleRisks.map((risk, index) => {
        const config = riskConfig[risk.riskLevel];

        return (
          <motion.div
            key={risk.habitId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={cn(config.bgColor, config.borderColor, 'border-2')}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', config.badgeColor)}>
                    {config.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{risk.habitName}</h4>
                      <Badge className={config.badgeColor} variant="default">
                        {risk.currentStreak} day streak
                      </Badge>
                    </div>
                    {risk.factors.length > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-3 h-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{risk.factors[0]}</p>
                      </div>
                    )}
                    {risk.suggestions.length > 0 && (
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{risk.suggestions[0]}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDismissedIds([...dismissedIds, risk.habitId])}
                          className="text-xs"
                        >
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {showDetails && visibleRisks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Streak Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {visibleRisks.map(risk => {
                const config = riskConfig[risk.riskLevel];
                return (
                  <div key={risk.habitId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{risk.habitName}</span>
                      <Badge variant="outline" className={config.badgeColor}>
                        {risk.riskLevel} risk
                      </Badge>
                    </div>
                    <div className="pl-4 space-y-1">
                      {risk.factors.map((factor, i) => (
                        <p key={i} className="text-sm text-muted-foreground">
                          • {factor}
                        </p>
                      ))}
                      {risk.suggestions.map((suggestion, i) => (
                        <p key={`s-${i}`} className="text-sm text-primary">
                          → {suggestion}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
