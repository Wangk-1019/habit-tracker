import { getDateDiff, isPast, getTodayStr } from './dateUtils';
import { Habit, StreakData } from '../types/habit';

/**
 * Calculate the current streak for a habit
 */
export function calculateCurrentStreak(habit: Habit): number {
  if (habit.completedDates.length === 0) return 0;

  const sortedDates = [...habit.completedDates].sort().reverse();
  const today = getTodayStr();

  let streak = 0;
  let currentDate = today;

  // Check if completed today first
  if (sortedDates[0] === today) {
    streak++;
    currentDate = getPrevDay(currentDate);
  } else {
    // If not completed today, check if completed yesterday to maintain streak
    const yesterday = getPrevDay(today);
    if (sortedDates[0] === yesterday) {
      currentDate = yesterday;
    } else {
      return 0;
    }
  }

  // Count consecutive days going back
  let dateIndex = sortedDates.indexOf(getNextDay(currentDate));
  while (dateIndex !== -1) {
    streak++;
    currentDate = sortedDates[dateIndex];
    dateIndex = sortedDates.indexOf(getPrevDay(currentDate));
  }

  return streak;
}

/**
 * Calculate the longest streak for a habit
 */
export function calculateLongestStreak(habit: Habit): number {
  if (habit.completedDates.length === 0) return 0;

  const sortedDates = [...habit.completedDates].sort();
  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = sortedDates[i - 1];
    const currDate = sortedDates[i];

    if (getDateDiff(currDate, prevDate) === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

/**
 * Get comprehensive streak data for a habit
 */
export function getStreakData(habit: Habit): StreakData {
  return {
    currentStreak: calculateCurrentStreak(habit),
    longestStreak: calculateLongestStreak(habit),
    streakStartDate: getStreakStartDate(habit),
  };
}

/**
 * Get the start date of the current streak
 */
export function getStreakStartDate(habit: Habit): string | undefined {
  const currentStreak = calculateCurrentStreak(habit);
  if (currentStreak === 0) return undefined;

  const sortedDates = [...habit.completedDates].sort().reverse();
  const today = getTodayStr();

  if (sortedDates[0] === today) {
    return sortedDates[sortedDates.length - currentStreak];
  } else {
    return sortedDates[sortedDates.length - currentStreak - 1];
  }
}

/**
 * Check if a streak is at risk of being broken
 */
export function isStreakAtRisk(habit: Habit): boolean {
  const currentStreak = calculateCurrentStreak(habit);
  const today = getTodayStr();
  const completedToday = habit.completedDates.includes(today);
  const completedYesterday = habit.completedDates.includes(getPrevDay(today));

  // If streak > 3 and not completed today, it's at risk
  if (currentStreak > 3 && !completedToday) {
    return completedYesterday;
  }

  return false;
}

/**
 * Get streak risk level for all habits
 */
export function getStreakRisks(habits: Habit[]): { habitId: string; riskLevel: 'low' | 'medium' | 'high' }[] {
  return habits
    .filter(h => h.active)
    .map(habit => {
      const streak = calculateCurrentStreak(habit);
      const today = getTodayStr();
      const completedToday = habit.completedDates.includes(today);

      if (completedToday) {
        return { habitId: habit.id, riskLevel: 'low' };
      }

      if (streak === 0) {
        return { habitId: habit.id, riskLevel: 'low' };
      }

      if (streak >= 14) {
        return { habitId: habit.id, riskLevel: 'high' };
      }

      if (streak >= 7) {
        return { habitId: habit.id, riskLevel: 'medium' };
      }

      return { habitId: habit.id, riskLevel: 'low' };
    });
}

/**
 * Get completion rate for a habit over the last N days
 */
export function getCompletionRate(habit: Habit, days: number): number {
  const today = new Date();
  let completedCount = 0;

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    if (habit.completedDates.includes(dateStr)) {
      completedCount++;
    }
  }

  return completedCount / days;
}

/**
 * Get the previous day's date string
 */
function getPrevDay(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

/**
 * Get the next day's date string
 */
function getNextDay(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}

/**
 * Calculate habit consistency score (0-100)
 */
export function calculateConsistencyScore(habit: Habit): number {
  if (habit.completedDates.length === 0) return 0;

  const daysSinceCreation = Math.max(
    1,
    getDateDiff(getTodayStr(), habit.createdAt)
  );

  const completionRate = habit.completedDates.length / daysSinceCreation;

  // Bonus for maintaining streaks
  const currentStreak = calculateCurrentStreak(habit);
  const streakBonus = Math.min(currentStreak * 0.02, 0.2);

  return Math.min(100, Math.round((completionRate + streakBonus) * 100));
}
