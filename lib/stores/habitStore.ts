import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Habit } from '../types/habit';
import { calculateCurrentStreak, calculateLongestStreak, getStreakData } from '../utils/streakCalculator';
import { getStorageItem, setStorageItem } from '../storage';

interface HabitStore {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => string;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleCompletion: (habitId: string, date: string) => void;
  getHabitById: (id: string) => Habit | undefined;
  getActiveHabits: () => Habit[];
  getHabitsByCategory: (category: Habit['category']) => Habit[];
  getTodayHabits: () => Habit[];
  getStreakForHabit: (habitId: string) => number;
  getLongestStreakForHabit: (habitId: string) => number;
  resetStore: () => void;
}

const initialHabits: Habit[] = [];

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: initialHabits,

      addHabit: (habitData) => {
        const newHabit: Habit = {
          ...habitData,
          id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          completedDates: [],
        };

        set((state) => ({
          habits: [...state.habits, newHabit],
        }));

        return newHabit.id;
      },

      updateHabit: (id, updates) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id ? { ...habit, ...updates } : habit
          ),
        }));
      },

      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
        }));
      },

      toggleCompletion: (habitId, date) => {
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== habitId) return habit;

            const isCompleted = habit.completedDates.includes(date);

            return {
              ...habit,
              completedDates: isCompleted
                ? habit.completedDates.filter((d) => d !== date)
                : [...habit.completedDates, date].sort(),
            };
          }),
        }));
      },

      getHabitById: (id) => {
        return get().habits.find((habit) => habit.id === id);
      },

      getActiveHabits: () => {
        return get().habits.filter((habit) => habit.active);
      },

      getHabitsByCategory: (category) => {
        return get().habits.filter((habit) => habit.category === category);
      },

      getTodayHabits: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().habits.filter((habit) => habit.active);
      },

      getStreakForHabit: (habitId) => {
        const habit = get().getHabitById(habitId);
        if (!habit) return 0;
        return calculateCurrentStreak(habit);
      },

      getLongestStreakForHabit: (habitId) => {
        const habit = get().getHabitById(habitId);
        if (!habit) return 0;
        return calculateLongestStreak(habit);
      },

      resetStore: () => {
        set({ habits: [] });
      },
    }),
    {
      name: 'habit-tracker-storage',
    }
  )
);

// Selector helpers
export const selectActiveHabits = (state: HabitStore) => state.getTodayHabits();
export const selectCompletedToday = (state: HabitStore) => {
  const today = new Date().toISOString().split('T')[0];
  return state.habits.filter((h) => h.completedDates.includes(today));
};
export const selectTotalStreaks = (state: HabitStore) => {
  return state.habits.reduce((sum, habit) => sum + calculateCurrentStreak(habit), 0);
};
