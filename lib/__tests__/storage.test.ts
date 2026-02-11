import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearAllStorage,
  exportData,
  importData,
} from '../storage';

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: function(key: string): string | null {
    return this.store[key] || null;
  },
  setItem: function(key: string, value: string): void {
    this.store[key] = value;
  },
  removeItem: function(key: string): void {
    delete this.store[key];
  },
  clear: function(): void {
    this.store = {};
  },
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('storage', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  describe('getStorageItem', () => {
    it('should return null for non-existent key', () => {
      const result = getStorageItem('non-existent');
      expect(result).toBeNull();
    });

    it('should return parsed object for valid JSON', () => {
      const testData = { name: 'test', value: 123 };
      mockLocalStorage.setItem('habitTracker_test', JSON.stringify(testData));

      const result = getStorageItem('test');

      expect(result).toEqual(testData);
    });

    it('should return null for invalid JSON', () => {
      mockLocalStorage.setItem('habitTracker_invalid', 'not valid json');

      const result = getStorageItem('invalid');

      expect(result).toBeNull();
    });

    it('should add prefix to key', () => {
      const testData = { foo: 'bar' };
      mockLocalStorage.setItem('habitTracker_key', JSON.stringify(testData));

      getStorageItem('key');

      // Should call with prefixed key
      expect(mockLocalStorage.getItem('habitTracker_key')).toBeTruthy();
    });

    it('should return null when window is undefined', () => {
      const originalWindow = (global as any).window;
      (global as any).window = undefined;

      const result = getStorageItem('test');

      expect(result).toBeNull();

      (global as any).window = originalWindow;
    });
  });

  describe('setStorageItem', () => {
    it('should store stringified object', () => {
      const testData = { name: 'test', value: 123 };
      const result = setStorageItem('test', testData);

      expect(result).toBe(true);
      expect(mockLocalStorage.getItem('habitTracker_test')).toBe(JSON.stringify(testData));
    });

    it('should overwrite existing value', () => {
      setStorageItem('test', { old: 'value' });
      const newTestData = { new: 'value' };
      const result = setStorageItem('test', newTestData);

      expect(result).toBe(true);
      expect(mockLocalStorage.getItem('habitTracker_test')).toBe(JSON.stringify(newTestData));
    });

    it('should return false on error', () => {
      const originalSetItem = mockLocalStorage.setItem;
      mockLocalStorage.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      const result = setStorageItem('test', { data: 'test' });

      expect(result).toBe(false);

      mockLocalStorage.setItem = originalSetItem;
    });

    it('should add prefix to key', () => {
      setStorageItem('myKey', { data: 'test' });

      const storedKeys = Object.keys(mockLocalStorage.store);
      expect(storedKeys).toContain('habitTracker_myKey');
    });

    it('should return false when window is undefined', () => {
      const originalWindow = (global as any).window;
      (global as any).window = undefined;

      const result = setStorageItem('test', { data: 'test' });

      expect(result).toBe(false);

      (global as any).window = originalWindow;
    });
  });

  describe('removeStorageItem', () => {
    it('should remove existing item', () => {
      setStorageItem('test', { data: 'test' });
      const result = removeStorageItem('test');

      expect(result).toBe(true);
      expect(mockLocalStorage.getItem('habitTracker_test')).toBeNull();
    });

    it('should return false when removing non-existent item', () => {
      const result = removeStorageItem('non-existent');

      expect(result).toBe(true); // Still returns true as item is gone
      expect(mockLocalStorage.getItem('habitTracker_non-existent')).toBeNull();
    });

    it('should use prefixed key', () => {
      setStorageItem('test', { data: 'test' });
      removeStorageItem('test');

      expect(mockLocalStorage.getItem('habitTracker_test')).toBeNull();
    });

    it('should return false on error', () => {
      const originalRemoveItem = mockLocalStorage.removeItem;
      mockLocalStorage.removeItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      const result = removeStorageItem('test');

      expect(result).toBe(false);

      mockLocalStorage.removeItem = originalRemoveItem;
    });
  });

  describe('clearAllStorage', () => {
    it('should clear all habit tracker data', () => {
      setStorageItem('habits', [1, 2, 3]);
      setStorageItem('moods', ['good', 'bad']);
      setStorageItem('chat', []);
      setStorageItem('otherData', { shouldStay: true }); // Different prefix

      const result = clearAllStorage();

      expect(result).toBe(true);
      expect(mockLocalStorage.getItem('habitTracker_habits')).toBeNull();
      expect(mockLocalStorage.getItem('habitTracker_moods')).toBeNull();
      expect(mockLocalStorage.getItem('habitTracker_chat')).toBeNull();
      expect(mockLocalStorage.getItem('otherData')).toBeTruthy(); // Different prefix should remain
    });

    it('should return false on error', () => {
      const originalGetOwnPropertyNames = Object.getOwnPropertyNames;
      Object.getOwnPropertyNames = jest.fn(() => {
        throw new Error('Error');
      });

      const result = clearAllStorage();

      expect(result).toBe(false);

      Object.getOwnPropertyNames = originalGetOwnPropertyNames;
    });

    it('should return false when window is undefined', () => {
      const originalWindow = (global as any).window;
      (global as any).window = undefined;

      const result = clearAllStorage();

      expect(result).toBe(false);

      (global as any).window = originalWindow;
    });
  });

  describe('exportData', () => {
    it('should export all data as JSON', () => {
      setStorageItem('habits', [{ id: 1, name: 'Exercise' }]);
      setStorageItem('moods', [{ mood: 'good', date: '2024-03-15' }]);
      setStorageItem('chat', [{ role: 'user', content: 'Hello' }]);

      const exported = exportData();

      const data = JSON.parse(exported);
      expect(data['habitTracker_habits']).toBeTruthy();
      expect(data['habitTracker_moods']).toBeTruthy();
      expect(data['habitTracker_chat']).toBeTruthy();
    });

    it('should return valid JSON', () => {
      setStorageItem('test', { data: 'test' });

      const exported = exportData();

      expect(() => JSON.parse(exported)).not.toThrow();
    });

    it('should handle empty storage', () => {
      const exported = exportData();

      const data = JSON.parse(exported);
      expect(Object.keys(data)).toHaveLength(0);
    });

    it('should return string', () => {
      setStorageItem('test', { data: 'test' });

      const exported = exportData();

      expect(typeof exported).toBe('string');
    });
  });

  describe('importData', () => {
    it('should import data from JSON', () => {
      const dataToImport = {
        'habitTracker_habits': JSON.stringify([{ id: 1, name: 'Test Habit' }]),
        'habitTracker_moods': JSON.stringify([{ mood: 'good' }]),
        'otherData': JSON.stringify({ shouldNotBeImported: true }),
      };

      const result = importData(JSON.stringify(dataToImport));

      expect(result).toBe(true);
      expect(mockLocalStorage.getItem('habitTracker_habits')).toBeTruthy();
      expect(mockLocalStorage.getItem('habitTracker_moods')).toBeTruthy();
      expect(mockLocalStorage.getItem('otherData')).toBeFalsy(); // Non-prefixed should not be imported
    });

    it('should handle empty JSON', () => {
      const result = importData('{}');

      expect(result).toBe(true);
    });

    it('should return false for invalid JSON', () => {
      const result = importData('not valid json');

      expect(result).toBe(false);
    });

    it('should return false on error', () => {
      const originalSetItem = mockLocalStorage.setItem;
      mockLocalStorage.setItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      const result = importData('{"key":"value"}');

      expect(result).toBe(false);

      mockLocalStorage.setItem = originalSetItem;
    });

    it('should preserve existing data not in import', () => {
      setStorageItem('existing', { data: 'keep me' });
      const dataToImport = {
        'habitTracker_new': JSON.stringify({ data: 'new' }),
      };

      importData(JSON.stringify(dataToImport));

      expect(mockLocalStorage.getItem('habitTracker_existing')).toBeTruthy();
      expect(mockLocalStorage.getItem('habitTracker_new')).toBeTruthy();
    });
  });
});
