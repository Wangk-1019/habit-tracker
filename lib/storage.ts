/**
 * LocalStorage wrapper with error handling and JSON parsing
 */

const STORAGE_PREFIX = 'habitTracker_';

/**
 * Get an item from localStorage
 */
export function getStorageItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const item = window.localStorage.getItem(STORAGE_PREFIX + key);
    if (!item) return null;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return null;
  }
}

/**
 * Set an item in localStorage
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
    return false;
  }
}

/**
 * Remove an item from localStorage
 */
export function removeStorageItem(key: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.removeItem(STORAGE_PREFIX + key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
    return false;
  }
}

/**
 * Clear all habit tracker data from localStorage
 */
export function clearAllStorage(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const keys = Object.keys(window.localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        window.localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * Export all data as JSON
 */
export function exportData(): string {
  const data: { [key: string]: any } = {};

  if (typeof window !== 'undefined') {
    const keys = Object.keys(window.localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        data[key] = window.localStorage.getItem(key);
      }
    });
  }

  return JSON.stringify(data, null, 2);
}

/**
 * Import data from JSON
 */
export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);

    Object.entries(data).forEach(([key, value]) => {
      if (key.startsWith(STORAGE_PREFIX) && typeof value === 'string') {
        window.localStorage.setItem(key, value);
      }
    });

    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}
