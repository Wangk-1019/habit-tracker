import {
  calculateCurrentStreak,
  calculateLongestStreak,
  getStreakData,
  isStreakAtRisk,
  getStreakRisks,
  getCompletionRate,
  calculateConsistencyScore,
} from '../streakCalculator';
import { Habit } from '../../types/habit';

// Mock date utilities
jest.mock('../dateUtils', () => ({
  getTodayStr: jest.fn(() => '2024-03-15'),
  getPrevDay: jest.fn((date: string) => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }),
}));

describe('streakCalculator', () => {
  const createHabit = (completedDates: string[]): Habit => ({
    id: 'test-habit',
    name: 'Test Habit',
    createdAt: '2024-01-01',
    completedDates,
    active: true,
  });

  describe('calculateCurrentStreak', () => {
    it('should return 0 for no completions', () => {
      const habit = createHabit([]);
      expect(calculateCurrentStreak(habit)).toBe(0);
    });

    it('should count consecutive days up to today', () => {
      const habit = createHabit([
        '2024-03-13',
        '2024-03-14',
        '2024-03-15', // Today
      ]);
      expect(calculateCurrentStreak(habit)).toBe(3);
    });

    it('should count consecutive days ending yesterday', () => {
      const habit = createHabit([
        '2024-03-13',
        '2024-03-14',
        // Not completed today
      ]);
      expect(calculateCurrentStreak(habit)).toBe(2);
    });

    it('should reset streak when day is missed', () => {
      const habit = createHabit([
        '2024-03-10',
        '2024-03-11',
        // March 12 missing
        '2024-03-13',
      ]);
      expect(calculateCurrentStreak(habit)).toBe(1);
    });

    it('should handle single day streak', () => {
      const habit = createHabit(['2024-03-15']);
      expect(calculateCurrentStreak(habit)).toBe(1);
    });

    it('should ignore future dates', () => {
      const habit = createHabit([
        '2024-03-15',
        '2024-03-16', // Future
      ]);
      expect(calculateCurrentStreak(habit)).toBe(1);
    });

    it('should handle old completions (no current streak)', () => {
      const habit = createHabit([
        '2024-01-01',
        '2024-01-02',
        '2024-01-03',
      ]);
      expect(calculateCurrentStreak(habit)).toBe(0);
    });
  });

  describe('calculateLongestStreak', () => {
    it('should return 0 for no completions', () => {
      const habit = createHabit([]);
      expect(calculateLongestStreak(habit)).toBe(0);
    });

    it('should return 1 for single completion', () => {
      const habit = createHabit(['2024-03-15']);
      expect(calculateLongestStreak(habit)).toBe(1);
    });

    it('should find longest consecutive streak', () => {
      const habit = createHabit([
        '2024-03-01',
        '2024-03-02',
        '2024-03-03',
        '2024-03-04',
        // Gap
        '2024-03-10',
        '2024-03-11',
        '2024-03-12',
      ]);
      expect(calculateLongestStreak(habit)).toBe(4);
    });

    it('should handle multiple streaks', () => {
      const habit = createHabit([
        '2024-03-01',
        '2024-03-02',
        // Gap
        '2024-03-05',
        '2024-03-06',
        '2024-03-07',
        '2024-03-08',
        // Gap
        '2024-03-10',
      ]);
      expect(calculateLongestStreak(habit)).toBe(4);
    });

    it('should handle long streak', () => {
      const dates: string[] = [];
      for (let i = 0; i < 30; i++) {
        const d = new Date('2024-02-15');
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
      }
      const habit = createHabit(dates);
      expect(calculateLongestStreak(habit)).toBe(30);
    });
  });

  describe('getStreakData', () => {
    it('should return complete streak data', () => {
      const habit = createHabit([
        '2024-03-13',
        '2024-03-14',
        '2024-03-15',
      ]);

      const data = getStreakData(habit);

      expect(data).toEqual({
        currentStreak: 3,
        longestStreak: 3,
        streakStartDate: '2024-03-13',
      });
    });

    it('should handle no streak', () => {
      const habit = createHabit([]);

      const data = getStreakData(habit);

      expect(data).toEqual({
        currentStreak: 0,
        longestStreak: 0,
        streakStartDate: undefined,
      });
    });
  });

  describe('isStreakAtRisk', () => {
    it('should return false for streak of 0', () => {
      const habit = createHabit([]);
      expect(isStreakAtRisk(habit)).toBe(false);
    });

    it('should return false for streak of 1', () => {
      const habit = createHabit(['2024-03-15']);
      expect(isStreakAtRisk(habit)).toBe(false);
    });

    it('should return false for streak of 3', () => {
      const habit = createHabit([
        '2024-03-13',
        '2024-03-14',
        '2024-03-15',
      ]);
      expect(isStreakAtRisk(habit)).toBe(false);
    });

    it('should return false when completed today', () => {
      const habit = createHabit([
        '2024-03-10',
        '2024-03-11',
        '2024-03-12',
        '2024-03-13',
        '2024-03-14',
        '2024-03-15',
      ]);
      expect(isStreakAtRisk(habit)).toBe(false);
    });

    it('should return true for streak > 3 not completed today', () => {
      const habit = createHabit([
        '2024-03-10',
        '2024-03-11',
        '2024-03-12',
        '2024-03-13',
        '2024-03-14',
        // Not completed today
      ]);
      expect(isStreakAtRisk(habit)).toBe(true);
    });

    it('should return false when not completed yesterday either', () => {
      const habit = createHabit([
        '2024-03-10',
        '2024-03-11',
        '2024-03-12',
        '2024-03-13',
        // Missing yesterday and today
      ]);
      expect(isStreakAtRisk(habit)).toBe(false);
    });
  });

  describe('getStreakRisks', () => {
    it('should return low risk for completed habits', () => {
      const habits = [
        createHabit(['2024-03-15']),
        createHabit(['2024-03-13', '2024-03-14', '2024-03-15']),
      ];

      const risks = getStreakRisks(habits);

      expect(risks).toHaveLength(2);
      expect(risks.every(r => r.riskLevel === 'low')).toBe(true);
    });

    it('should return high risk for 14+ day streaks not completed today', () => {
      const dates: string[] = [];
      for (let i = 0; i < 14; i++) {
        const d = new Date('2024-03-01');
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
      }
      const habits = [createHabit(dates)];

      const risks = getStreakRisks(habits);

      expect(risks).toHaveLength(1);
      expect(risks[0].riskLevel).toBe('high');
    });

    it('should return medium risk for 7-13 day streaks not completed today', () => {
      const dates: string[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date('2024-03-08');
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
      }
      const habits = [createHabit(dates)];

      const risks = getStreakRisks(habits);

      expect(risks).toHaveLength(1);
      expect(risks[0].riskLevel).toBe('medium');
    });

    it('should return low risk for streak < 7', () => {
      const habits = [
        createHabit(['2024-03-13', '2024-03-14']),
        createHabit(['2024-03-13', '2024-03-14', '2024-03-15']),
      ];

      const risks = getStreakRisks(habits);

      expect(risks.every(r => r.riskLevel === 'low')).toBe(true);
    });

    it('should filter inactive habits', () => {
      const activeHabit = createHabit([
        '2024-03-13',
        '2024-03-14',
      ]);
      activeHabit.active = true;

      const inactiveHabit = createHabit([
        '2024-03-10',
        '2024-03-11',
        '2024-03-12',
        '2024-03-13',
        '2024-03-14',
      ]);
      inactiveHabit.active = false;

      const risks = getStreakRisks([activeHabit, inactiveHabit]);

      expect(risks).toHaveLength(1);
      expect(risks[0].habitId).toBe(activeHabit.id);
    });
  });

  describe('getCompletionRate', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2024-03-15'));
    });

    it('should calculate 100% completion for all days', () => {
      const habit = createHabit([
        '2024-03-11',
        '2024-03-12',
        '2024-03-13',
        '2024-03-14',
        '2024-03-15',
      ]);
      expect(getCompletionRate(habit, 5)).toBe(1);
    });

    it('should calculate 60% completion', () => {
      const habit = createHabit([
        '2024-03-12',
        '2024-03-14',
      ]);
      expect(getCompletionRate(habit, 5)).toBe(0.4);
    });

    it('should return 0 for no completions', () => {
      const habit = createHabit([]);
      expect(getCompletionRate(habit, 5)).toBe(0);
    });

    it('should calculate for 30 days', () => {
      const habit = createHabit([
        '2024-03-13',
        '2024-03-14',
        '2024-03-15',
      ]);
      expect(getCompletionRate(habit, 30)).toBeLessThan(0.2);
    });
  });

  describe('calculateConsistencyScore', () => {
    it('should return 0 for no completions', () => {
      const habit = createHabit([]);
      expect(calculateConsistencyScore(habit)).toBe(0);
    });

    it('should return 100 for perfect completion', () => {
      const habit = createHabit([
        '2024-03-13',
        '2024-03-14',
        '2024-03-15',
      ]);
      habit.createdAt = '2024-03-13';
      expect(calculateConsistencyScore(habit)).toBe(100);
    });

    it('should calculate partial consistency', () => {
      const habit = createHabit([
        '2024-03-14',
        '2024-03-15',
      ]);
      habit.createdAt = '2024-03-13';
      const score = calculateConsistencyScore(habit);
      expect(score).toBeGreaterThan(50);
      expect(score).toBeLessThan(100);
    });

    it('should give bonus for maintaining streak', () => {
      const habit1 = createHabit([
        '2024-03-13',
        '2024-03-14',
        '2024-03-15',
      ]);
      habit1.createdAt = '2024-03-13';

      const habit2 = createHabit([
        '2024-03-13',
        '2024-03-14',
      ]);
      habit2.createdAt = '2024-03-13';

      // Both have same completion rate (2/3 = 67%)
      // But habit1 has current streak, should get higher score
      const score1 = calculateConsistencyScore(habit1);
      const score2 = calculateConsistencyScore(habit2);

      expect(score1).toBeGreaterThan(score2);
    });

    it('should not exceed 100', () => {
      const habit = createHabit([
        '2024-03-13',
        '2024-03-14',
        '2024-03-15',
      ]);
      habit.createdAt = '2024-03-13';
      expect(calculateConsistencyScore(habit)).toBeLessThanOrEqual(100);
    });
  });
});
