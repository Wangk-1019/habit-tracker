import { renderHook, act } from '@testing-library/react';
import { useHabitStore } from '../habitStore';
import { Habit } from '../../types/habit';

describe('habitStore', () => {
  beforeEach(() => {
    // Clear store state before each test
    const { resetStore } = useHabitStore.getState();
    resetStore();
  });

  const createTestHabit = (): Omit<Habit, 'id' | 'createdAt' | 'completedDates'> => ({
    name: 'Test Habit',
    description: 'Test description',
    category: 'health',
    color: 'indigo',
    active: true,
  });

  describe('initial state', () => {
    it('should have empty habits array initially', () => {
      const { result } = renderHook(() => useHabitStore());
      expect(result.current.habits).toEqual([]);
    });
  });

  describe('addHabit', () => {
    it('should add a new habit with generated id and dates', () => {
      const { result } = renderHook(() => useHabitStore());

      act(() => {
        result.current.addHabit(createTestHabit());
      });

      const habits = result.current.habits;
      expect(habits).toHaveLength(1);
      expect(habits[0].name).toBe('Test Habit');
      expect(habits[0].id).toMatch(/^habit_\d+_/);
      expect(habits[0].createdAt).toBeTruthy();
      expect(habits[0].completedDates).toEqual([]);
    });

    it('should generate unique ids for multiple habits', () => {
      const { result } = renderHook(() => useHabitStore());

      act(() => {
        result.current.addHabit(createTestHabit());
        result.current.addHabit({ ...createTestHabit(), name: 'Second Habit' });
      });

      const habits = result.current.habits;
      expect(habits).toHaveLength(2);
      expect(habits[0].id).not.toBe(habits[1].id);
    });

    it('should return the new habit id', () => {
      const { result } = renderHook(() => useHabitStore());

      let returnedId = '';
      act(() => {
        returnedId = result.current.addHabit(createTestHabit());
      });

      expect(returnedId).toBeTruthy();
      expect(result.current.habits[0].id).toBe(returnedId);
    });
  });

  describe('updateHabit', () => {
    it('should update habit properties', () => {
      const { result } = renderHook(() => useHabitStore());

      let habitId = '';
      act(() => {
        habitId = result.current.addHabit(createTestHabit());
      });

      act(() => {
        result.current.updateHabit(habitId, { name: 'Updated Name' });
      });

      const habit = result.current.habits[0];
      expect(habit.name).toBe('Updated Name');
      expect(habit.description).toBe('Test description'); // Unchanged
    });

    it('should not affect other habits', () => {
      const { result } = renderHook(() => useHabitStore());

      let id1 = '';
      let id2 = '';
      act(() => {
        id1 = result.current.addHabit({ ...createTestHabit(), name: 'Habit 1' });
        id2 = result.current.addHabit({ ...createTestHabit(), name: 'Habit 2' });
      });

      act(() => {
        result.current.updateHabit(id1, { name: 'Updated' });
      });

      expect(result.current.habits[0].name).toBe('Updated');
      expect(result.current.habits[1].name).toBe('Habit 2'); // Unchanged
    });

    it('should update habit active status', () => {
      const { result } = renderHook(() => useHabitStore());

      let habitId = '';
      act(() => {
        habitId = result.current.addHabit(createTestHabit());
      });

      act(() => {
        result.current.updateHabit(habitId, { active: false });
      });

      expect(result.current.habits[0].active).toBe(false);
    });
  });

  describe('deleteHabit', () => {
    it('should remove habit by id', () => {
      const { result } = renderHook(() => useHabitStore());

      let habitId = '';
      act(() => {
        habitId = result.current.addHabit(createTestHabit());
      });

      expect(result.current.habits).toHaveLength(1);

      act(() => {
        result.current.deleteHabit(habitId);
      });

      expect(result.current.habits).toHaveLength(0);
    });

    it('should not remove habit with different id', () => {
      const { result } = renderHook(() => useHabitStore());

      act(() => {
        result.current.addHabit(createTestHabit());
      });

      act(() => {
        result.current.deleteHabit('non-existent-id');
      });

      expect(result.current.habits).toHaveLength(1);
    });

    it('should keep other habits when deleting one', () => {
      const { result } = renderHook(() => useHabitStore());

      let id1 = '';
      let id2 = '';
      act(() => {
        id1 = result.current.addHabit({ ...createTestHabit(), name: 'Habit 1' });
        id2 = result.current.addHabit({ ...createTestHabit(), name: 'Habit 2' });
      });

      act(() => {
        result.current.deleteHabit(id1);
      });

      expect(result.current.habits).toHaveLength(1);
      expect(result.current.habits[0].id).toBe(id2);
    });
  });

  describe('toggleCompletion', () => {
    it('should add date when marking as complete', () => {
      const { result } = renderHook(() => useHabitStore());

      let habitId = '';
      act(() => {
        habitId = result.current.addHabit(createTestHabit());
      });

      act(() => {
        result.current.toggleCompletion(habitId, '2024-03-15');
      });

      const habit = result.current.habits[0];
      expect(habit.completedDates).toEqual(['2024-03-15']);
    });

    it('should remove date when unmarking as complete', () => {
      const { result } = renderHook(() => useHabitStore());

      let habitId = '';
      act(() => {
        habitId = result.current.addHabit(createTestHabit());
        result.current.toggleCompletion(habitId, '2024-03-15');
      });

      expect(result.current.habits[0].completedDates).toContain('2024-03-15');

      act(() => {
        result.current.toggleCompletion(habitId, '2024-03-15');
      });

      expect(result.current.habits[0].completedDates).not.toContain('2024-03-15');
    });

    it('should keep dates sorted', () => {
      const { result } = renderHook(() => useHabitStore());

      let habitId = '';
      act(() => {
        habitId = result.current.addHabit(createTestHabit());
        result.current.toggleCompletion(habitId, '2024-03-15');
        result.current.toggleCompletion(habitId, '2024-03-13');
      });

      const dates = result.current.habits[0].completedDates;
      expect(dates).toEqual(['2024-03-13', '2024-03-15']);
    });

    it('should not affect other habits', () => {
      const { result } = renderHook(() => useHabitStore());

      let id1 = '';
      let id2 = '';
      act(() => {
        id1 = result.current.addHabit({ ...createTestHabit(), name: 'Habit 1' });
        id2 = result.current.addHabit({ ...createTestHabit(), name: 'Habit 2' });
      });

      act(() => {
        result.current.toggleCompletion(id1, '2024-03-15');
      });

      expect(result.current.habits[0].completedDates).toContain('2024-03-15');
      expect(result.current.habits[1].completedDates).not.toContain('2024-03-15');
    });
  });

  describe('getHabitById', () => {
    it('should return habit by id', () => {
      const { result } = renderHook(() => useHabitStore());

      let habitId = '';
      act(() => {
        habitId = result.current.addHabit(createTestHabit());
      });

      const habit = result.current.getHabitById(habitId);
      expect(habit).toBeTruthy();
      expect(habit?.id).toBe(habitId);
    });

    it('should return undefined for non-existent id', () => {
      const { result } = renderHook(() => useHabitStore());

      const habit = result.current.getHabitById('non-existent');
      expect(habit).toBeUndefined();
    });
  });

  describe('getActiveHabits', () => {
    it('should return only active habits', () => {
      const { result } = renderHook(() => useHabitStore());

      act(() => {
        result.current.addHabit({ ...createTestHabit(), name: 'Active 1', active: true });
        result.current.addHabit({ ...createTestHabit(), name: 'Inactive', active: false });
        result.current.addHabit({ ...createTestHabit(), name: 'Active 2', active: true });
      });

      const activeHabits = result.current.getActiveHabits();
      expect(activeHabits).toHaveLength(2);
      expect(activeHabits.every(h => h.active)).toBe(true);
    });

    it('should return empty array when no habits exist', () => {
      const { result } = renderHook(() => useHabitStore());

      const activeHabits = result.current.getActiveHabits();
      expect(activeHabits).toEqual([]);
    });
  });

  describe('getHabitsByCategory', () => {
    it('should return habits by category', () => {
      const { result } = renderHook(() => useHabitStore());

      act(() => {
        result.current.addHabit({ ...createTestHabit(), name: 'H1', category: 'health' });
        result.current.addHabit({ ...createTestHabit(), name: 'H2', category: 'productivity' });
        result.current.addHabit({ ...createTestHabit(), name: 'H3', category: 'health' });
      });

      const healthHabits = result.current.getHabitsByCategory('health');
      expect(healthHabits).toHaveLength(2);
      expect(healthHabits.every(h => h.category === 'health')).toBe(true);
    });

    it('should return empty array for non-existent category', () => {
      const { result } = renderHook(() => useHabitStore());

      const habits = result.current.getHabitsByCategory('non-existent');
      expect(habits).toEqual([]);
    });
  });

  describe('resetStore', () => {
    it('should clear all habits', () => {
      const { result } = renderHook(() => useHabitStore());

      act(() => {
        result.current.addHabit(createTestHabit());
        result.current.addHabit({ ...createTestHabit(), name: 'Second' });
      });

      expect(result.current.habits).toHaveLength(2);

      act(() => {
        result.current.resetStore();
      });

      expect(result.current.habits).toEqual([]);
    });
  });
});
