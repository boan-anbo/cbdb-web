import { useState, useEffect, useCallback } from 'react';

/**
 * A hook for managing localStorage with React state
 * @param key The localStorage key
 * @param defaultValue The default value if no stored value exists
 * @returns [value, setValue] tuple with the current value and setter
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prevValue: T) => T)) => void] {
  // Check if we're on the client side
  const isClient = typeof window !== 'undefined';

  // Initialize state with a function to avoid accessing localStorage on every render
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!isClient) {
      return defaultValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  // Update localStorage when state changes
  const setValue = useCallback(
    (value: T | ((prevValue: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (isClient) {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, isClient]
  );

  // Listen for changes in other tabs/windows
  useEffect(() => {
    if (!isClient) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, isClient]);

  return [storedValue, setValue];
}

/**
 * Storage keys used throughout the application
 */
export const STORAGE_KEYS = {
  SIDEBAR_OPEN: 'cbdb-desktop-sidebar-open',
  DATA_INSPECTOR_OPEN: 'cbdb-desktop-inspector-open',
  DATA_INSPECTOR_AUTO_OPEN: 'cbdb-desktop-inspector-auto-open',
  FIRST_VISIT: 'cbdb-desktop-first-visit',
} as const;

/**
 * Check if this is the first visit
 */
export function isFirstVisit(): boolean {
  if (typeof window === 'undefined') return true;

  const firstVisit = window.localStorage.getItem(STORAGE_KEYS.FIRST_VISIT);
  if (!firstVisit) {
    window.localStorage.setItem(STORAGE_KEYS.FIRST_VISIT, new Date().toISOString());
    return true;
  }
  return false;
}