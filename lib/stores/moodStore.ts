import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MoodEntry, MoodType } from '../types/mood';
import { getTodayStr, getLastNDays } from '../utils/dateUtils';

interface MoodStore {
  moodHistory: MoodEntry[];
  addMood: (mood: MoodType, note?: string, activities?: string[]) => string;
  updateMood: (id: string, updates: Partial<MoodEntry>) => void;
  deleteMood: (id: string) => void;
  getMoodById: (id: string) => MoodEntry | undefined;
  getTodaysMood: () => MoodEntry | undefined;
  getMoodsForDate: (date: string) => MoodEntry[];
  getMoodsForDateRange: (startDate: string, endDate: string) => MoodEntry[];
  getRecentMoods: (days: number) => MoodEntry[];
  getAverageMoodScore: (days?: number) => number;
  getMoodTrend: (days: number) => 'improving' | 'declining' | 'stable';
  resetStore: () => void;
}

const initialMoodHistory: MoodEntry[] = [];

export const useMoodStore = create<MoodStore>()(
  persist(
    (set, get) => ({
      moodHistory: initialMoodHistory,

      addMood: (mood, note, activities) => {
        const now = new Date();
        const todayStr = getTodayStr();

        const newEntry: MoodEntry = {
          id: `mood_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          date: todayStr,
          time: now.toISOString(),
          mood,
          note,
          activities,
        };

        set((state) => ({
          moodHistory: [...state.moodHistory, newEntry],
        }));

        return newEntry.id;
      },

      updateMood: (id, updates) => {
        set((state) => ({
          moodHistory: state.moodHistory.map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
        }));
      },

      deleteMood: (id) => {
        set((state) => ({
          moodHistory: state.moodHistory.filter((entry) => entry.id !== id),
        }));
      },

      getMoodById: (id) => {
        return get().moodHistory.find((entry) => entry.id === id);
      },

      getTodaysMood: () => {
        const today = getTodayStr();
        return get().moodHistory
          .filter((entry) => entry.date === today)
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())[0];
      },

      getMoodsForDate: (date) => {
        return get().moodHistory.filter((entry) => entry.date === date);
      },

      getMoodsForDateRange: (startDate, endDate) => {
        return get().moodHistory.filter(
          (entry) => entry.date >= startDate && entry.date <= endDate
        );
      },

      getRecentMoods: (days) => {
        const recentDates = getLastNDays(days);
        return get().moodHistory.filter((entry) => recentDates.includes(entry.date));
      },

      getAverageMoodScore: (days = 30) => {
        const recentMoods = get().getRecentMoods(days);
        if (recentMoods.length === 0) return 0;

        const moodScores: Record<MoodType, number> = {
          terrible: 1,
          bad: 2,
          neutral: 3,
          good: 4,
          excellent: 5,
        };

        const totalScore = recentMoods.reduce((sum, entry) => sum + moodScores[entry.mood], 0);
        return Math.round((totalScore / recentMoods.length) * 10) / 10;
      },

      getMoodTrend: (days) => {
        const recentMoods = get().getRecentMoods(days);
        if (recentMoods.length < 3) return 'stable';

        const moodScores: Record<MoodType, number> = {
          terrible: 1,
          bad: 2,
          neutral: 3,
          good: 4,
          excellent: 5,
        };

        const firstHalf = recentMoods.slice(0, Math.floor(recentMoods.length / 2));
        const secondHalf = recentMoods.slice(Math.floor(recentMoods.length / 2));

        const firstAvg = firstHalf.reduce((sum, e) => sum + moodScores[e.mood], 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, e) => sum + moodScores[e.mood], 0) / secondHalf.length;

        if (secondAvg > firstAvg + 0.3) return 'improving';
        if (secondAvg < firstAvg - 0.3) return 'declining';
        return 'stable';
      },

      resetStore: () => {
        set({ moodHistory: [] });
      },
    }),
    {
      name: 'mood-history-storage',
    }
  )
);

// Selector helpers
export const selectMoodDistribution = (state: MoodStore) => {
  const distribution: Record<MoodType, number> = {
    terrible: 0,
    bad: 0,
    neutral: 0,
    good: 0,
    excellent: 0,
  };

  state.moodHistory.forEach((entry) => {
    distribution[entry.mood]++;
  });

  return distribution;
};

export const selectBestDay = (state: MoodStore) => {
  const moodScores: Record<MoodType, number> = {
    terrible: 1,
    bad: 2,
    neutral: 3,
    good: 4,
    excellent: 5,
  };

  const dateScores: Record<string, { sum: number; count: number }> = {};

  state.moodHistory.forEach((entry) => {
    if (!dateScores[entry.date]) {
      dateScores[entry.date] = { sum: 0, count: 0 };
    }
    dateScores[entry.date].sum += moodScores[entry.mood];
    dateScores[entry.date].count++;
  });

  let bestDate = '';
  let bestAvg = 0;

  Object.entries(dateScores).forEach(([date, data]) => {
    const avg = data.sum / data.count;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestDate = date;
    }
  });

  return bestDate;
};
