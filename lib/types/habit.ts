export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  createdAt: string;
  targetDays?: number; // e.g., 7 for daily, specific days for weekly
  completedDates: string[]; // ISO date strings
  category?: 'health' | 'productivity' | 'mindfulness' | 'social' | 'other';
  active: boolean;
}

export interface HabitCompletion {
  habitId: string;
  date: string;
  completed: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  streakStartDate?: string;
}
