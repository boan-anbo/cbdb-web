import { useState, useCallback } from 'react';
import { useApiClient } from '@/render/providers/ApiClientProvider';
import { PersonModel, PersonListQuery, cbdbClientManager } from '@cbdb/core';
import { toast } from 'sonner';

export interface SearchFilters {
  searchName: string;
  dynastyCode: string;
  yearFrom: string;
  yearTo: string;
  gender: 'all' | 'male' | 'female';
  limit: string;
}

export interface UsePersonSearchReturn {
  // State
  filters: SearchFilters;
  results: PersonModel[];
  totalResults: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  setFilters: (filters: Partial<SearchFilters>) => void;
  handleSearch: (page?: number) => Promise<void>;
  clearFilters: () => void;
  setSearchName: (value: string) => void;
  setDynastyCode: (value: string) => void;
  setYearFrom: (value: string) => void;
  setYearTo: (value: string) => void;
  setGender: (value: 'all' | 'male' | 'female') => void;
  setLimit: (value: string) => void;
}

const initialFilters: SearchFilters = {
  searchName: '',
  dynastyCode: 'all',
  yearFrom: '',
  yearTo: '',
  gender: 'all',
  limit: '50',
};

export function usePersonSearch(): UsePersonSearchReturn {
  const client = useApiClient();
  const [filters, setFiltersState] = useState<SearchFilters>(initialFilters);
  const [results, setResults] = useState<PersonModel[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    // Reset to first page when filters change
    if (!('limit' in newFilters)) {
      setCurrentPage(1);
    }
  }, []);

  const setSearchName = useCallback((value: string) => {
    setFilters({ searchName: value });
  }, [setFilters]);

  const setDynastyCode = useCallback((value: string) => {
    setFilters({ dynastyCode: value });
  }, [setFilters]);

  const setYearFrom = useCallback((value: string) => {
    setFilters({ yearFrom: value });
  }, [setFilters]);

  const setYearTo = useCallback((value: string) => {
    setFilters({ yearTo: value });
  }, [setFilters]);

  const setGender = useCallback((value: 'all' | 'male' | 'female') => {
    setFilters({ gender: value });
  }, [setFilters]);

  const setLimit = useCallback((value: string) => {
    setFilters({ limit: value });
  }, [setFilters]);

  const clearFilters = useCallback(() => {
    setFiltersState(initialFilters);
    setCurrentPage(1);
    setResults([]);
    setTotalResults(0);
    setError(null);
  }, []);

  const handleSearch = useCallback(async (page: number = 1) => {
    // Allow empty search criteria - will return all records with pagination
    setIsLoading(true);
    setError(null);
    setCurrentPage(page);

    try {
      const limitNum = parseInt(filters.limit);
      const offset = (page - 1) * limitNum;

      const listRequest: PersonListQuery = {
        name: filters.searchName || undefined,
        dynastyCode: filters.dynastyCode !== 'all' ? filters.dynastyCode : undefined,
        startYear: filters.yearFrom || undefined,
        endYear: filters.yearTo || undefined,
        gender: filters.gender !== 'all' ? filters.gender : undefined,
        limit: filters.limit,
        start: offset.toString(),
      };

      const response = await client.person.list(listRequest);

      setResults(response.data);
      setTotalResults(response.total);

      if (response.data.length === 0 && page === 1) {
        toast.info('No results found');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  return {
    // State
    filters,
    results,
    totalResults,
    currentPage,
    isLoading,
    error,

    // Actions
    setFilters,
    handleSearch,
    clearFilters,
    setSearchName,
    setDynastyCode,
    setYearFrom,
    setYearTo,
    setGender,
    setLimit,
  };
}