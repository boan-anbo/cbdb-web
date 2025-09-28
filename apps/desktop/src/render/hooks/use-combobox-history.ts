import { useState, useEffect, useCallback } from 'react';

export interface HistoryItem<T = any> {
  query: string;
  option: {
    value: string;
    label: string;
    data?: T;
  };
  timestamp: number;
}

interface UseComboboxHistoryProps<T = any> {
  enabled?: boolean;
  storageKey?: string;
  maxItems?: number;
  maxAge?: number; // Maximum age in milliseconds
}

interface UseComboboxHistoryReturn<T = any> {
  history: HistoryItem<T>[];
  addToHistory: (query: string, option: HistoryItem<T>['option']) => void;
  clearHistory: () => void;
  removeFromHistory: (value: string) => void;
}

/**
 * Custom hook for managing combobox search history
 * Stores selected items with their search queries in localStorage
 */
export function useComboboxHistory<T = any>({
  enabled = false,
  storageKey,
  maxItems = 10,
  maxAge = 30 * 24 * 60 * 60 * 1000, // 30 days
}: UseComboboxHistoryProps<T>): UseComboboxHistoryReturn<T> {
  const [history, setHistory] = useState<HistoryItem<T>[]>([]);

  // Validate configuration
  useEffect(() => {
    if (enabled && !storageKey) {
      console.error(
        'useComboboxHistory: storageKey is required when enabled is true. ' +
        'Each combobox instance must have a unique storage key to prevent conflicts.'
      );
    }
  }, [enabled, storageKey]);

  // Load history from localStorage
  useEffect(() => {
    if (!enabled || !storageKey) return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedHistory = JSON.parse(stored) as HistoryItem<T>[];
        const cutoffTime = Date.now() - maxAge;

        // Filter out old items and limit to maxItems
        const validHistory = parsedHistory
          .filter(item => item.timestamp > cutoffTime)
          .slice(0, maxItems);

        setHistory(validHistory);

        // Update localStorage if we filtered anything
        if (validHistory.length !== parsedHistory.length) {
          localStorage.setItem(storageKey, JSON.stringify(validHistory));
        }
      }
    } catch (error) {
      console.error('Failed to load combobox history:', error);
      setHistory([]);
    }
  }, [enabled, storageKey, maxItems, maxAge]);

  // Add item to history
  const addToHistory = useCallback((query: string, option: HistoryItem<T>['option']) => {
    if (!enabled || !storageKey || !query || !option) return;

    try {
      const newItem: HistoryItem<T> = {
        query,
        option,
        timestamp: Date.now(),
      };

      // Remove duplicates (same value) and add new item at the beginning
      const newHistory = [
        newItem,
        ...history.filter(item => item.option.value !== option.value)
      ].slice(0, maxItems);

      setHistory(newHistory);
      localStorage.setItem(storageKey, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save to combobox history:', error);
    }
  }, [enabled, storageKey, history, maxItems]);

  // Clear all history
  const clearHistory = useCallback(() => {
    if (!enabled || !storageKey) return;

    try {
      setHistory([]);
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to clear combobox history:', error);
    }
  }, [enabled, storageKey]);

  // Remove specific item from history
  const removeFromHistory = useCallback((value: string) => {
    if (!enabled || !storageKey) return;

    try {
      const newHistory = history.filter(item => item.option.value !== value);
      setHistory(newHistory);
      localStorage.setItem(storageKey, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to remove from combobox history:', error);
    }
  }, [enabled, storageKey, history]);

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
}