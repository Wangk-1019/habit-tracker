import {
  getTodayStr,
  formatDate,
  formatDayName,
  getDateDiff,
  isSameDay,
  isToday,
  isPast,
  getLastNDays,
  getWeekDates,
  getRelativeTime,
} from '../dateUtils';

// Mock the current date for consistent tests
const mockDate = new Date('2024-03-15T10:30:00.000Z');

describe('dateUtils', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getTodayStr', () => {
    it('should return today in YYYY-MM-DD format', () => {
      const result = getTodayStr();
      expect(result).toBe('2024-03-15');
    });
  });

  describe('formatDate', () => {
    it('should format date with default format', () => {
      const result = formatDate('2024-03-15');
      expect(result).toBe('Mar 15, 2024');
    });

    it('should format date with custom format', () => {
      const result = formatDate('2024-03-15', 'MM/dd/yyyy');
      expect(result).toBe('03/15/2024');
    });

    it('should handle invalid date gracefully', () => {
      const result = formatDate('invalid');
      expect(result).toBe('invalid');
    });
  });

  describe('formatDayName', () => {
    it('should return full day name', () => {
      expect(formatDayName('2024-03-15')).toBe('Friday');
      expect(formatDayName('2024-03-18')).toBe('Monday');
    });

    it('should handle invalid date', () => {
      const result = formatDayName('invalid');
      expect(result).toBe('invalid');
    });
  });

  describe('getDateDiff', () => {
    it('should return positive days when date2 is after date1', () => {
      const result = getDateDiff('2024-03-20', '2024-03-15');
      expect(result).toBe(5);
    });

    it('should return negative days when date2 is before date1', () => {
      const result = getDateDiff('2024-03-15', '2024-03-20');
      expect(result).toBe(-5);
    });

    it('should return 0 for same dates', () => {
      const result = getDateDiff('2024-03-15', '2024-03-15');
      expect(result).toBe(0);
    });

    it('should handle invalid dates', () => {
      const result = getDateDiff('invalid', '2024-03-15');
      expect(result).toBe(0);
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day', () => {
      expect(isSameDay('2024-03-15', '2024-03-15')).toBe(true);
    });

    it('should return false for different days', () => {
      expect(isSameDay('2024-03-15', '2024-03-16')).toBe(false);
    });

    it('should handle invalid dates', () => {
      expect(isSameDay('invalid', '2024-03-15')).toBe(false);
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      expect(isToday('2024-03-15')).toBe(true);
    });

    it('should return false for other dates', () => {
      expect(isToday('2024-03-14')).toBe(false);
      expect(isToday('2024-03-16')).toBe(false);
    });

    it('should return false for past date', () => {
      expect(isToday('2024-02-15')).toBe(false);
    });

    it('should return false for future date', () => {
      expect(isToday('2024-04-15')).toBe(false);
    });
  });

  describe('isPast', () => {
    it('should return true for past dates', () => {
      expect(isPast('2024-03-14')).toBe(true);
      expect(isPast('2024-01-01')).toBe(true);
    });

    it('should return false for today', () => {
      expect(isPast('2024-03-15')).toBe(false);
    });

    it('should return false for future dates', () => {
      expect(isPast('2024-03-16')).toBe(false);
      expect(isPast('2024-12-31')).toBe(false);
    });
  });

  describe('getLastNDays', () => {
    it('should return last 7 days', () => {
      const result = getLastNDays(7);
      expect(result).toHaveLength(7);
      expect(result[0]).toBe('2024-03-09');
      expect(result[6]).toBe('2024-03-15');
    });

    it('should return last 30 days', () => {
      const result = getLastNDays(30);
      expect(result).toHaveLength(30);
      expect(result[0]).toBe('2024-02-15');
      expect(result[29]).toBe('2024-03-15');
    });

    it('should return single day when n=1', () => {
      const result = getLastNDays(1);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('2024-03-15');
    });

    it('should return empty array when n=0', () => {
      const result = getLastNDays(0);
      expect(result).toHaveLength(0);
    });
  });

  describe('getWeekDates', () => {
    it('should return 7 days starting from Monday', () => {
      const result = getWeekDates('2024-03-18'); // Monday
      expect(result).toHaveLength(7);
      expect(result[0]).toBe('2024-03-18'); // Monday
      expect(result[6]).toBe('2024-03-24'); // Sunday
    });

    it('should return week containing given date', () => {
      const result = getWeekDates('2024-03-15'); // Friday
      expect(result).toHaveLength(7);
      expect(result).toContain('2024-03-15');
      expect(result[0]).toBe('2024-03-11'); // Monday of that week
      expect(result[6]).toBe('2024-03-17'); // Sunday of that week
    });

    it('should return current week when no date provided', () => {
      const result = getWeekDates();
      expect(result).toHaveLength(7);
      expect(result).toContain('2024-03-15'); // Current day
    });
  });

  describe('getRelativeTime', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(mockDate);
    });

    it('should return "just now" for very recent time', () => {
      const now = new Date();
      const recentTime = new Date(now.getTime() - 30 * 1000).toISOString(); // 30 seconds ago
      const result = getRelativeTime(recentTime);
      expect(result).toBe('just now');
    });

    it('should return minutes ago', () => {
      const now = new Date();
      const recentTime = new Date(now.getTime() - 5 * 60 * 1000).toISOString(); // 5 minutes ago
      const result = getRelativeTime(recentTime);
      expect(result).toBe('5m ago');
    });

    it('should return hours ago', () => {
      const now = new Date();
      const recentTime = new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(); // 3 hours ago
      const result = getRelativeTime(recentTime);
      expect(result).toBe('3h ago');
    });

    it('should return days ago for recent days', () => {
      const now = new Date();
      const recentTime = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(); // 2 days ago
      const result = getRelativeTime(recentTime);
      expect(result).toBe('2d ago');
    });

    it('should return formatted date for older entries', () => {
      const oldTime = '2024-01-15T10:30:00.000Z';
      const result = getRelativeTime(oldTime);
      expect(result).toBe('Jan 15, 2024');
    });

    it('should handle invalid date string', () => {
      const result = getRelativeTime('invalid');
      expect(result).toBe('invalid');
    });
  });
});
