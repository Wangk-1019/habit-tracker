import { NextRequest, NextResponse } from 'next/server';

// Predict streak outcomes
export async function POST(request: NextRequest) {
  try {
    const { habits } = await request.json();

    const predictions = generateStreakPredictions(habits);

    return NextResponse.json(predictions);
  } catch (error) {
    console.error('Prediction API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate predictions' },
      { status: 500 }
    );
  }
}

function generateStreakPredictions(habits: any[]) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return habits
    .filter((h) => h.active)
    .map((habit) => {
      const completedDates = habit.completedDates || [];
      const completedToday = completedDates.includes(today);
      const completedYesterday = completedDates.includes(yesterday);

      // Calculate current streak
      let currentStreak = 0;
      const sortedDates = [...completedDates].sort().reverse();

      if (sortedDates.length > 0) {
        if (sortedDates[0] === today) {
          currentStreak = 1;
          let checkDate = getPrevDay(today);
          let dateIndex = sortedDates.indexOf(checkDate);

          while (dateIndex !== -1) {
            currentStreak++;
            checkDate = getPrevDay(checkDate);
            dateIndex = sortedDates.indexOf(checkDate);
          }
        } else if (sortedDates[0] === yesterday) {
          currentStreak = 1;
          let checkDate = getPrevDay(yesterday);
          let dateIndex = sortedDates.indexOf(checkDate);

          while (dateIndex !== -1) {
            currentStreak++;
            checkDate = getPrevDay(checkDate);
            dateIndex = sortedDates.indexOf(checkDate);
          }
        }
      }

      // Calculate risk level and confidence
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      let confidence = 0.9;
      const factors: string[] = [];
      const suggestions: string[] = [];

      // High risk scenarios
      if (currentStreak >= 14 && !completedToday && completedYesterday) {
        riskLevel = 'high';
        confidence = 0.95;
        factors.push(`You have a ${currentStreak}-day streak at risk`);
        suggestions.push('Complete this habit today to save your streak!');
      } else if (currentStreak >= 30 && !completedToday) {
        riskLevel = 'high';
        confidence = 0.9;
        factors.push(`You have a ${currentStreak}-day milestone streak`);
        suggestions.push('You\'ve built something special - protect it!');
      } else if (currentStreak >= 7 && !completedToday && completedYesterday) {
        riskLevel = 'medium';
        confidence = 0.85;
        factors.push(`Your ${currentStreak}-day streak needs attention`);
        suggestions.push('Get back on track today');
      } else if (currentStreak >= 5 && !completedToday) {
        riskLevel = 'medium';
        confidence = 0.8;
        factors.push(`Your ${currentStreak}-day streak is growing`);
        suggestions.push('Keep the momentum going!');
      } else if (completedToday) {
        riskLevel = 'low';
        factors.push('Completed today!');
        suggestions.push('You\'re on fire!');
      }

      // Calculate continuation probability based on historical data
      const last30Days = getLast30Days();
      const completedInLast30 = completedDates.filter((d: string) => last30Days.includes(d)).length;
      const historicalRate = completedInLast30 / 30;

      const continuationProbability = Math.min(0.95, Math.max(0.3,
        historicalRate + (currentStreak > 0 ? 0.1 : 0) + (completedToday ? 0.1 : 0)
      ));

      return {
        habitId: habit.id,
        habitName: habit.name,
        currentStreak,
        longestStreak: calculateLongestStreak(completedDates),
        riskLevel,
        confidence: Math.round(confidence * 100),
        continuationProbability: Math.round(continuationProbability * 100),
        factors,
        suggestions,
        completedToday,
        historicalCompletionRate: Math.round(historicalRate * 100),
      };
    })
    .sort((a, b) => {
      const riskOrder = { high: 0, medium: 1, low: 2 };
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    });
}

function getPrevDay(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

function getLast30Days(): string[] {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
}

function calculateLongestStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;

  const sorted = [...completedDates].sort();
  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000));

    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
}
