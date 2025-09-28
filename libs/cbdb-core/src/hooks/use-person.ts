/**
 * React Query hooks for Person API
 * Provides type-safe data fetching hooks with caching and state management
 */

import {
  useQuery,
  useMutation,
  useQueries,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';
import { PersonClient } from '../client/person.client';
import {
  PersonSearchQuery,
  PersonSearchResult,
  PersonGetResult,
  PersonBatchGetResult,
  PersonListQuery,
  PersonListResult,
  PersonWithStatsResult
} from '../domains/person/messages/person.cqrs';
import {
  PersonDetailResponse,
  GetPersonDetailRequest,
  SearchPersonRequest,
  SearchByDynastyRequest,
  SearchByYearRangeRequest,
  AdvancedSearchRequest,
  GetPersonsByIdsRequest
} from '../domains/person/messages/person.dtos';
import { PersonWithFullRelations } from '../domains/person/models/person.model.extended';

// Query keys factory for consistent cache key management
export const personKeys = {
  all: ['person'] as const,
  lists: () => [...personKeys.all, 'list'] as const,
  list: (filters: any) => [...personKeys.lists(), filters] as const,
  details: () => [...personKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...personKeys.details(), id] as const,
  search: (query: string) => [...personKeys.all, 'search', query] as const,
  dynasty: (code: number) => [...personKeys.all, 'dynasty', code] as const,
  yearRange: (start: number, end: number) => [...personKeys.all, 'yearRange', start, end] as const,
  stats: (id: number) => [...personKeys.all, 'stats', id] as const,
  full: (id: number) => [...personKeys.all, 'full', id] as const,
  batch: (ids: number[]) => [...personKeys.all, 'batch', ...ids] as const,
};

/**
 * Hook to search for people by name
 */
export function useSearchPerson(
  request: SearchPersonRequest,
  options?: Omit<UseQueryOptions<PersonSearchResult>, 'queryKey' | 'queryFn'>
) {
  const personClient = new PersonClient(window.cbdbClient?.baseClient);

  return useQuery({
    queryKey: personKeys.search(request.name),
    queryFn: () => personClient.searchByName({
      query: request.name,
      accurate: request.accurate,
      start: request.start,
      limit: request.limit
    }),
    enabled: !!request.name,
    ...options
  });
}

/**
 * Hook to get comprehensive person details
 */
export function usePersonDetail(
  request: GetPersonDetailRequest,
  options?: Omit<UseQueryOptions<PersonDetailResponse>, 'queryKey' | 'queryFn'>
) {
  const personClient = new PersonClient(window.cbdbClient?.baseClient);
  const key = request.id ? String(request.id) : request.name || '';

  return useQuery({
    queryKey: personKeys.detail(key),
    queryFn: () => personClient.getDetail({
      id: request.id,
      name: request.name
    }),
    enabled: !!(request.id || request.name),
    ...options
  });
}

/**
 * Hook to get person by ID with optional relations
 */
export function usePersonById(
  id: number,
  include?: string,
  options?: Omit<UseQueryOptions<PersonGetResult>, 'queryKey' | 'queryFn'>
) {
  const personClient = new PersonClient(window.cbdbClient?.baseClient);

  return useQuery({
    queryKey: [...personKeys.detail(id), include],
    queryFn: () => personClient.getById(id, include),
    enabled: !!id,
    ...options
  });
}

/**
 * Hook to get person with all relations
 */
export function usePersonFull(
  id: number,
  options?: Omit<UseQueryOptions<PersonWithFullRelations>, 'queryKey' | 'queryFn'>
) {
  const personClient = new PersonClient(window.cbdbClient?.baseClient);

  return useQuery({
    queryKey: personKeys.full(id),
    queryFn: () => personClient.getFullById(id),
    enabled: !!id,
    ...options
  });
}

/**
 * Hook to get person relation statistics
 */
export function usePersonStats(
  id: number,
  options?: Omit<UseQueryOptions<PersonWithStatsResult>, 'queryKey' | 'queryFn'>
) {
  const personClient = new PersonClient(window.cbdbClient?.baseClient);

  return useQuery({
    queryKey: personKeys.stats(id),
    queryFn: () => personClient.getRelationStats(id),
    enabled: !!id,
    ...options
  });
}

/**
 * Hook to search by dynasty
 */
export function useSearchByDynasty(
  request: SearchByDynastyRequest,
  options?: Omit<UseQueryOptions<PersonListResult>, 'queryKey' | 'queryFn'>
) {
  const personClient = new PersonClient(window.cbdbClient?.baseClient);

  return useQuery({
    queryKey: personKeys.dynasty(request.dynastyCode),
    queryFn: () => personClient.searchByDynasty({
      dynastyCode: request.dynastyCode,
      start: request.start,
      limit: request.limit
    }),
    enabled: !!request.dynastyCode,
    ...options
  });
}

/**
 * Hook to search by year range
 */
export function useSearchByYearRange(
  request: SearchByYearRangeRequest,
  options?: Omit<UseQueryOptions<PersonListResult>, 'queryKey' | 'queryFn'>
) {
  const personClient = new PersonClient(window.cbdbClient?.baseClient);

  return useQuery({
    queryKey: personKeys.yearRange(request.startYear, request.endYear),
    queryFn: () => personClient.searchByYearRange({
      startYear: request.startYear,
      endYear: request.endYear,
      start: request.start,
      limit: request.limit
    }),
    enabled: !!(request.startYear && request.endYear),
    ...options
  });
}

/**
 * Hook for advanced search with multiple filters
 */
export function useAdvancedPersonSearch(
  request: AdvancedSearchRequest,
  options?: Omit<UseQueryOptions<PersonListResult>, 'queryKey' | 'queryFn'>
) {
  const personClient = new PersonClient(window.cbdbClient?.baseClient);

  return useQuery({
    queryKey: personKeys.list(request),
    queryFn: () => personClient.advancedSearch({
      dynastyCode: request.dynastyCode,
      startYear: request.startYear,
      endYear: request.endYear,
      gender: request.gender,
      start: request.start,
      limit: request.limit
    }),
    ...options
  });
}

/**
 * Hook to batch get people by IDs
 */
export function usePersonBatch(
  ids: number[],
  options?: Omit<UseQueryOptions<PersonBatchGetResult>, 'queryKey' | 'queryFn'>
) {
  const personClient = new PersonClient(window.cbdbClient?.baseClient);

  return useQuery({
    queryKey: personKeys.batch(ids),
    queryFn: () => personClient.batchGet(ids),
    enabled: ids.length > 0,
    ...options
  });
}

/**
 * Hook to fetch multiple people in parallel
 */
export function usePersonQueries(ids: number[]) {
  const personClient = new PersonClient(window.cbdbClient?.baseClient);

  return useQueries({
    queries: ids.map(id => ({
      queryKey: personKeys.detail(id),
      queryFn: () => personClient.getById(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }))
  });
}

// Prefetch helpers for optimistic loading
export const personPrefetch = {
  detail: (client: any, id: number | string) => {
    return client.prefetchQuery({
      queryKey: personKeys.detail(id),
      queryFn: () => new PersonClient(window.cbdbClient?.baseClient).getDetail(
        typeof id === 'number' ? { id } : { name: id }
      ),
    });
  },

  full: (client: any, id: number) => {
    return client.prefetchQuery({
      queryKey: personKeys.full(id),
      queryFn: () => new PersonClient(window.cbdbClient?.baseClient).getFullById(id),
    });
  },

  stats: (client: any, id: number) => {
    return client.prefetchQuery({
      queryKey: personKeys.stats(id),
      queryFn: () => new PersonClient(window.cbdbClient?.baseClient).getRelationStats(id),
    });
  },
};