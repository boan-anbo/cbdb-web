/**
 * usePersonDetail Hook
 *
 * Fetches comprehensive person details from the API.
 * Provides caching and error handling through React Query.
 */

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PersonDetailResponse } from '@cbdb/core';
import { useApiClient } from '@/render/providers/ApiClientProvider';

/**
 * Hook for fetching comprehensive person details
 * @param personId - The ID of the person to fetch details for
 * @param enabled - Whether the query should run (default: true)
 * @returns Query result with person detail data
 */
export function usePersonDetail(
  personId: number | undefined,
  enabled: boolean = true
) {
  const client = useApiClient();

  return useQuery({
    queryKey: ['person-detail', personId],
    queryFn: async () => {
      if (!personId) {
        throw new Error('Person ID is required');
      }

      const response = await client.person.getDetail(personId);

      if (!response || !response.result) {
        throw new Error(`No details found for person ${personId}`);
      }

      return response;
    },
    enabled: enabled && !!personId,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if (error instanceof Error && error.message.includes('not found')) {
        return false;
      }
      return failureCount < 2;
    }
  });
}

/**
 * Prefetch person detail data
 * Useful for preloading data before navigation
 */
export function usePrefetchPersonDetail() {
  const queryClient = useQueryClient();
  const client = useApiClient();

  return useCallback(
    (personId: number) => {
      return queryClient.prefetchQuery({
        queryKey: ['person-detail', personId],
        queryFn: async () => {
          const response = await client.person.getDetail(personId);

          if (!response || !response.result) {
            throw new Error(`No details found for person ${personId}`);
          }

          return response;
        },
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient, client]
  );
}

// Export useful utilities for cache management
export const personDetailQueryKey = (personId: number) => ['person-detail', personId];