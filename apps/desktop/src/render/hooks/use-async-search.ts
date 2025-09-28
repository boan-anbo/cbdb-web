import { useState, useCallback, useRef, useEffect } from 'react';

interface UseAsyncSearchProps<T = any> {
  loadOptions: (query: string, signal?: AbortSignal) => Promise<T[]>;
  debounceMs?: number;
  minSearchLength?: number;
  onSearchStart?: () => void;
  onSearchComplete?: (results: T[]) => void;
  onSearchError?: (error: Error) => void;
}

interface UseAsyncSearchReturn<T = any> {
  results: T[];
  isLoading: boolean;
  hasSearched: boolean;
  searchValue: string;
  performSearch: (query: string) => Promise<void>;
  handleSearchChange: (value: string) => void;
  clearSearch: () => void;
}

/**
 * Custom hook for handling async search with debouncing
 * Manages loading states, abort controllers, and search results
 */
export function useAsyncSearch<T = any>({
  loadOptions,
  debounceMs = 300,
  minSearchLength = 0,
  onSearchStart,
  onSearchComplete,
  onSearchError,
}: UseAsyncSearchProps<T>): UseAsyncSearchReturn<T> {
  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Perform the actual search
  const performSearch = useCallback(async (query: string) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check minimum search length
    if (query.length < minSearchLength && minSearchLength > 0) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setHasSearched(true);
    onSearchStart?.();

    try {
      const searchResults = await loadOptions(query, abortControllerRef.current.signal);

      // Check if request was aborted
      if (!abortControllerRef.current?.signal.aborted) {
        setResults(searchResults);
        onSearchComplete?.(searchResults);
      }
    } catch (error: any) {
      // Ignore aborted requests
      if (error?.name !== 'AbortError') {
        console.error('Search failed:', error);
        setResults([]);
        onSearchError?.(error);
      }
    } finally {
      // Only update loading state if this request wasn't aborted
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [loadOptions, minSearchLength, onSearchStart, onSearchComplete, onSearchError]);

  // Handle search input changes with debouncing
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced search
    if (value || minSearchLength === 0) {
      debounceTimerRef.current = setTimeout(() => {
        performSearch(value);
      }, debounceMs);
    } else {
      // Clear results if search is empty and minSearchLength > 0
      setResults([]);
      setHasSearched(false);
    }
  }, [performSearch, debounceMs, minSearchLength]);

  // Clear search state
  const clearSearch = useCallback(() => {
    setSearchValue('');
    setResults([]);
    setHasSearched(false);
    setIsLoading(false);

    // Cancel any pending operations
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    results,
    isLoading,
    hasSearched,
    searchValue,
    performSearch,
    handleSearchChange,
    clearSearch,
  };
}