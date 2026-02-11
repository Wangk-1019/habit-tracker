import { renderHook, act } from '@testing-library/react';
import { useMoodStore } from '../moodStore';

// Mock dateUtils
jest.mock('../../lib/utils/dateUtils', () => ({
  getTodayStr: jest.fn(() => '2024-03-15'),
}));

describe('moodStore', () => {
  beforeEach(() => {
    // Clear store state before each test
    const { resetStore } = useMoodStore.getState();
    resetStore();
  });

  describe('initial state', () => {
    it('should have empty mood history initially', () => {
      const { result } = renderHook(() => useMoodStore());
      expect(result.current.moodHistory).toEqual([]);
    });
  });

  describe('addMood', () => {
    it('should add mood entry with generated id', () => {
      const { result } = renderHook(() => useMoodStore());

      act(() => {
        result.current.addMood('good', 'Feeling great!');
      });

      const history = result.current.moodHistory;
      expect(history).toHaveLength(1);
      expect(history[0].mood).toBe('good');
      expect(history[0].note).toBe('Feeling great!');
      expect(history[0].id).toMatch(/^mood_\d+_/);
      expect(history[0].date).toBe('2024-03-15');
      expect(history[0].time).toBeTruthy();
    });

    it('should add mood with activities', () => {
      const { result } = renderHook(() => useMoodStore());

      act(() => {
        result.current.addMood('good', 'Good day', ['exercise', 'meditation']);
      });

      const entry = result.current.moodHistory[0];
      expect(entry.activities).toEqual(['exercise', 'meditation']);
    });

    it('should add mood without note', () => {
      const { result } = renderHook(() => useMoodStore());

      act(() => {
        result.current.addMood('neutral');
      });

      const entry = result.current.moodHistory[0];
      expect(entry.mood).toBe('neutral');
      expect(entry.note).toBeUndefined();
    });

    it('should generate unique ids', () => {
      const { result } = renderHook(() => useMoodStore());

      let id1 = '';
      let id2 = '';
      act(() => {
        id1 = result.current.addMood('good');
        id2 = result.current.addMood('bad');
      });

      expect(id1).not.toBe(id2);
    });

    it('should return the new entry id', () => {
      const { result } = renderHook(() => useMoodStore());

      let returnedId = '';
      act(() => {
        returnedId = result.current.addMood('good');
      });

      expect(returnedId).toBeTruthy();
      expect(result.current.moodHistory[0].id).toBe(returnedId);
    });
  });

  describe('updateMood', () => {
    it('should update mood entry', () => {
      const { result } = renderHook(() => useMoodStore());

      let entryId = '';
      act(() => {
        entryId = result.current.addMood('good', 'Original note');
      });

      act(() => {
        result.current.updateMood(entryId, { note: 'Updated note' });
      });

      const entry = result.current.moodHistory[0];
      expect(entry.note).toBe('Updated note');
      expect(entry.mood).toBe('good'); // Unchanged
    });

    it('should update mood type', () => {
      const { result } = renderHook(() => useMoodStore());

      let entryId = '';
      act(() => {
        entryId = result.current.addMood('good');
      });

      act(() => {
        result.current.updateMood(entryId, { mood: 'excellent' });
      });

      expect(result.current.moodHistory[0].mood).toBe('excellent');
    });

    it('should not affect other entries', () => {
      const { result } = renderHook(() => useMoodStore());

      let id1 = '';
      let id2 = '';
      act(() => {
        id1 = result.current.addMood('good', 'Note 1');
        id2 = result.current.addMood('bad', 'Note 2');
      });

      act(() => {
        result.current.updateMood(id1, { note: 'Updated' });
      });

      expect(result.current.moodHistory[0].note).toBe('Updated');
      expect(result.current.moodHistory[1].note).toBe('Note 2'); // Unchanged
    });
  });

  describe('deleteMood', () => {
    it('should remove mood entry by id', () => {
      const { result } = renderHook(() => useMoodStore());

      let entryId = '';
      act(() => {
        entryId = result.current.addMood('good');
      });

      expect(result.current.moodHistory).toHaveLength(1);

      act(() => {
        result.current.deleteMood(entryId);
      });

      expect(result.current.moodHistory).toHaveLength(0);
    });

    it('should keep other entries when deleting one', () => {
      const { result } = renderHook(() => useMoodStore());

      let id1 = '';
      let id2 = '';
      act(() => {
        id1 = result.current.addMood('good', 'Note 1');
        id2 = result.current.addMood('bad', 'Note 2');
      });

      act(() => {
        result.current.deleteMood(id1);
      });

      expect(result.current.moodHistory).toHaveLength(1);
      expect(result.current.moodHistory[0].id).toBe(id2);
    });
  });

  describe('getTodaysMood', () => {
    it('should return mood entry for today', () => {
      const { result } = renderHook(() => useMoodStore());

      act(() => {
        result.current.addMood('good', 'Today feeling');
      });

      const todaysMood = result.current.getTodaysMood();
      expect(todaysMood).toBeTruthy();
      expect(todaysMood?.mood).toBe('good');
    });

    it('should return latest mood for today if multiple exist', () => {
      const { result } = renderHook(() => useMoodStore());

      act(() => {
        result.current.addMood('good', 'Morning');
        result.current.addMood('bad', 'Evening');
      });

      const todaysMood = result.current.getTodaysMood();
      expect(todaysMood?.note).toBe('Evening'); // Latest
    });

    it('should return undefined for no entry today', () => {
      const { result } = renderHook(() => useMoodStore());

      const todaysMood = result.current.getTodaysMood();
      expect(todaysMood).toBeUndefined();
    });
  });

  describe('getMoodsForDate', () => {
    it('should return all entries for given date', () => {
      const { result } = renderHook(() => useMoodStore());

      act(() => {
        result.current.addMood('good', 'Morning');
        result.current.addMood('bad', 'Evening');
      });

      const moods = result.current.getMoodsForDate('2024-03-15');
      expect(moods).toHaveLength(2);
    });

    it('should return empty array for date with no entries', () => {
      const { result } = renderHook(() => useMoodStore());

      const moods = result.current.getMoodsForDate('2024-03-14');
      expect(moods).toEqual([]);
    });
  });

  describe('getRecentMoods', () => {
    it('should return entries from last N days', () => {
      const { result } = renderHook(() => useMoodStore());

      act(() => {
        result.current.addMood('good');
        result.current.addMood('bad');
        result.current.addMood('neutral');
      });

      const recent = result.current.getRecentMoods(7);
      expect(recent).toHaveLength(3);
    });

    it('should filter entries older than N days', () => {
      const { result } = renderHook(() => useMoodStore());

      act(() => {
        // Simulate older entry
        const oldEntry = {
          id: 'mood_old',
          date: '2024-03-08', // 7 days ago
          time: '2024-03-08T10:00:00.000Z',
          mood: 'good' as const,
        };
        result.current.moodHistory.push(oldEntry);
        result.current.addMood('bad');
      });

      const recent = result.current.getRecentMoods(7);
      expect(recent).toHaveLength(1);
      expect(recent[0].mood).toBe('bad');
    });
  });

  describe('getAverageMoodScore', () => {
    it('should calculate average mood score', () => {
      const { result } = renderHook(() => useMoodStore());

      act(() => {
        result.current.addMood('good'); // 4
        result.current.addMood('bad'); // 2
        result.current.addMood('neutral'); // 3
      });

      const avg = result.current.getAverageMoodScore();
      expect(avg).toBe(3); // (4 + 2 + 3) / 3
    });

    it('should return 0 for no entries', () => {
      const { result } = renderHook(() => useMoodStore());

      const avg = result.current.getAverageMoodScore();
      expect(avg).toBe(0);
    });

    it('should use only recent entries when days specified', () => {
      const { result } = renderHook(() => useMoodStore());

      act(() => {
        const oldEntry = {
          id: 'mood_old',
          date: '2024-02-15', // 29 days ago
          time: '2024-02-15T10:00:00.000Z',
          mood: 'terrible' as const, // 1
        };
        result.current.moodHistory.push(oldEntry);
        result.current.addMood('excellent'); // 5
      });

      const avg = result.current.getAverageMoodScore(30);
      expect(avg).toBe(5); // Only counts the recent one
    });
  });

  describe('getMoodTrend', () => {
    it('should return improving for positive trend', () => {
      const { result } = renderHook(() => useMoodStore());

      act(() => {
        result.current.addMood('bad'); // 2
        result.current.addMood('good'); // 4
        result.current.addMood('good'); // 4
        result.current.addMood('excellent'); // 5
      });

      const trend = result.current.getMoodTrend(10);
      expect(trend).toBe('improving');
    });

    it('should return declining for negative trend', () => {
      const { result } = renderHook(() => useMoodStore());

      act(() => {
        result.current.addMood('excellent'); // 5
        result.current.addMood('good'); // 4
        result.current.addMood('neutral'); // 3
        result.current.addMood('bad'); // 2
      });

      const trend = result.current.getMoodTrend(10);
      expect(trend).toBe('declining');
    });

    it('should return stable for flat trend', () => {
      const { result } = renderHook(() => useMoodStore());

      act(() => {
        result.current.addMood('good'); // 4
        result.current.addMood('good'); // 4
        result.current.addMood('good'); // 4
        result.current.addMood('good'); // 4
      });

      const trend = result.current.getMoodTrend(10);
      expect(trend).toBe('stable');
    });

    it('should return stable for insufficient data', () => {
      const { result } = renderHook(() => useMoodStore());

      act(() => {
        result.current.addMood('good');
      });

      const trend = result.current.getMoodTrend(10);
      expect(trend).toBe('stable');
    });
  });

  describe('resetStore', () => {
    it('should clear all mood history', () => {
      const { result } = renderHook(() => useMoodStore());

      act(() => {
        result.current.addMood('good');
        result.current.addMood('bad');
      });

      expect(result.current.moodHistory).toHaveLength(2);

      act(() => {
        result.current.resetStore();
      });

      expect(result.current.moodHistory).toEqual([]);
    });
  });
});
