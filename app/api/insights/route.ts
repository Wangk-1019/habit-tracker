import { NextRequest, NextResponse } from 'next/server';

// Generate insights from habit and mood data
export async function POST(request: NextRequest) {
  try {
    const { habits, moodHistory, timeRange = 30 } = await request.json();

    const insights = generateInsights(habits, moodHistory, timeRange);

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Insights API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

function generateInsights(habits: any[], moodHistory: any[], timeRange: number) {
  const today = new Date();
  const pastDate = new Date(today.getTime() - timeRange * 24 * 60 * 60 * 1000);
  const pastDateStr = pastDate.toISOString().split('T')[0];

  // Filter for recent data
  const recentHabits = habits.filter((h: any) => h.createdAt >= pastDateStr);
  const recentMoods = moodHistory.filter((m: any) => m.date >= pastDateStr);

  // Calculate metrics
  const activeHabits = habits.filter((h: any) => h.active);
  const todayStr = today.toISOString().split('T')[0];

  const completionToday = activeHabits.filter((h: any) =>
    h.completedDates.includes(todayStr)
  ).length;

  const completionRate = activeHabits.length > 0
    ? completionToday / activeHabits.length
    : 0;

  // Mood analysis
  const moodScores: Record<string, number> = {
    terrible: 1,
    bad: 2,
    neutral: 3,
    good: 4,
    excellent: 5,
  };

  const avgMood = recentMoods.length > 0
    ? recentMoods.reduce((sum: number, m: any) => sum + moodScores[m.mood], 0) / recentMoods.length
    : 0;

  // Find patterns
  const patterns = [];
  const achievements = [];
  const suggestions = [];

  // Completion patterns
  if (completionRate === 1 && activeHabits.length > 0) {
    patterns.push({
      type: 'positive',
      title: 'Perfect Day!',
      description: 'You completed all your habits today!',
    });
    achievements.push('Perfect completion day');
  } else if (completionRate >= 0.75) {
    patterns.push({
      type: 'positive',
      title: 'Great Progress',
      description: `You completed ${Math.round(completionRate * 100)}% of habits today.`,
    });
  } else if (completionRate < 0.5 && activeHabits.length > 0) {
    patterns.push({
      type: 'negative',
      title: 'Room for Improvement',
      description: 'Try focusing on just one or two key habits today.',
    });
    suggestions.push('Start with just one habit to build momentum');
  }

  // Streak achievements
  const streakAchievements = activeHabits.filter((h: any) => {
    const completedDays = h.completedDates.filter((d: string) => d >= pastDateStr);
    return completedDays.length >= 7;
  });

  if (streakAchievements.length > 0) {
    achievements.push(`Maintained 7+ day streak on ${streakAchievements.length} habit(s)`);
  }

  // Mood patterns
  if (recentMoods.length >= 5) {
    const recentMoodScores = recentMoods.slice(-5).map((m: any) => moodScores[m.mood]);
    const trend = recentMoodScores[recentMoodScores.length - 1] - recentMoodScores[0];

    if (trend > 0.5) {
      patterns.push({
        type: 'positive',
        title: 'Improving Mood',
        description: 'Your mood has been trending upward recently!',
      });
    } else if (trend < -0.5) {
      patterns.push({
        type: 'negative',
        title: 'Mood Awareness',
        description: 'Your mood has been trending down. Consider self-care activities.',
      });
      suggestions.push('Take time for yourself - a break can help reset your mood');
    }
  }

  // Generate suggestions
  if (activeHabits.length === 0) {
    suggestions.push('Start by adding one simple habit to track');
  } else if (activeHabits.length > 7) {
    suggestions.push('You have many habits - consider consolidating to maintain focus');
  }

  if (recentMoods.length < 3) {
    suggestions.push('Track your mood regularly to discover patterns');
  }

  return {
    summary: {
      completionRate: Math.round(completionRate * 100),
      avgMood: Math.round(avgMood * 10) / 10,
      activeHabits: activeHabits.length,
      moodEntries: recentMoods.length,
    },
    patterns,
    achievements,
    suggestions,
    generatedAt: new Date().toISOString(),
  };
}
