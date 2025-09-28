/**
 * usePersonTimeline Hook
 *
 * React hook for fetching person timeline data using PersonTimelineClient.
 * Provides timeline exploration capabilities with various filters.
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useApiClient } from '@/render/providers/ApiClientProvider';

/**
 * Hook for fetching a person's life timeline
 *
 * @param personId - The person ID to fetch timeline for
 * @param options - Timeline filter options
 * @param enabled - Whether the query should be enabled
 */
export function usePersonTimeline(
  personId: number | undefined,
  options?: Omit<GetLifeTimelineRequest, 'personId'>,
  enabled: boolean = true
): UseQueryResult<GetLifeTimelineResponse> {
  const client = useApiClient();
  console.log('[usePersonTimeline] Called with:', { personId, options, enabled, actualEnabled: enabled && !!personId });

  return useQuery({
    queryKey: ['person-timeline', personId, options],
    queryFn: async () => {
      console.log('[usePersonTimeline] Fetching timeline for person:', personId);
      if (!personId) {
        throw new Error('Person ID is required');
      }
      const response = await client.personTimeline.getLifeTimeline(personId, options);
      console.log('[usePersonTimeline] Response received:', {
        personId,
        events: response?.result?.timeline?.events?.length || 0
      });
      return response;
    },
    enabled: enabled && !!personId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  });
}

/**
 * Hook for comparing multiple persons' timelines
 *
 * @param personIds - Array of person IDs to compare
 * @param options - Timeline filter options
 * @param enabled - Whether the query should be enabled
 */
export function useTimelineComparison(
  personIds: number[],
  options?: {
    startYear?: string;
    endYear?: string;
    eventTypes?: string[];
  },
  enabled: boolean = true
): UseQueryResult {
  const client = useApiClient();
  return useQuery({
    queryKey: ['timeline-comparison', personIds, options],
    queryFn: async () => {
      if (!personIds || personIds.length === 0) {
        throw new Error('At least one person ID is required');
      }
      return client.personTimeline.compareTimelines({
        personIds: personIds.map(id => id.toString()),
        ...options
      });
    },
    enabled: enabled && personIds.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}