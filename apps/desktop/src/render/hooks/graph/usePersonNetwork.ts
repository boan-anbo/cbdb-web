/**
 * usePersonNetwork Hook
 *
 * React hook for fetching person network data using PersonGraphClient.
 * Provides network exploration capabilities with various filters.
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useApiClient } from '@/render/providers/ApiClientProvider';

/**
 * Hook for exploring a person's network
 *
 * @param personId - The person ID to explore from
 * @param options - Network exploration options
 * @param enabled - Whether the query should be enabled
 */
export function usePersonNetwork(
  personId: number | undefined,
  options?: NetworkExplorationOptions,
  enabled: boolean = true
): UseQueryResult<NetworkExplorationResponse> {
  const client = useApiClient();
  return useQuery({
    queryKey: ['person-network', personId, options],
    queryFn: async () => {
      if (!personId) {
        throw new Error('Person ID is required');
      }
      return client.personGraph.exploreNetwork(personId, options);
    },
    enabled: enabled && !!personId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  });
}

/**
 * Hook for exploring kinship network specifically
 *
 * @param personId - The person ID
 * @param depth - How many generations to explore (default: 1)
 * @param enabled - Whether the query should be enabled
 */
export function useKinshipNetwork(
  personId: number | undefined,
  depth: number = 1,
  enabled: boolean = true
): UseQueryResult<NetworkExplorationResponse> {
  return useQuery({
    queryKey: ['kinship-network', personId, depth],
    queryFn: async () => {
      if (!personId) {
        throw new Error('Person ID is required');
      }
      return client.personGraph.exploreKinshipNetwork(personId, depth);
    },
    enabled: enabled && !!personId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook for exploring association network
 *
 * @param personId - The person ID
 * @param options - Association network options
 * @param enabled - Whether the query should be enabled
 */
export function useAssociationNetwork(
  personId: number | undefined,
  options?: {
    depth?: number;
    associationTypes?: string[];
    includeReciprocal?: boolean;
  },
  enabled: boolean = true
): UseQueryResult<NetworkExplorationResponse> {
  return useQuery({
    queryKey: ['association-network', personId, options],
    queryFn: async () => {
      if (!personId) {
        throw new Error('Person ID is required');
      }
      return client.personGraph.exploreAssociationNetwork(personId, options);
    },
    enabled: enabled && !!personId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook for exploring direct network connections
 *
 * @param personId - The person ID
 * @param options - Direct network options
 * @param enabled - Whether the query should be enabled
 */
export function useDirectNetwork(
  personId: number | undefined,
  options?: {
    directOnly?: boolean;
    relationshipTypes?: ('kinship' | 'association' | 'office')[];
  },
  enabled: boolean = true
): UseQueryResult<NetworkExplorationResponse> {
  return useQuery({
    queryKey: ['direct-network', personId, options],
    queryFn: async () => {
      if (!personId) {
        throw new Error('Person ID is required');
      }
      return client.personGraph.exploreDirectNetwork(personId, options);
    },
    enabled: enabled && !!personId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook for getting network statistics
 *
 * @param personId - The person ID
 * @param enabled - Whether the query should be enabled
 */
export function useNetworkStats(
  personId: number | undefined,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['network-stats', personId],
    queryFn: async () => {
      if (!personId) {
        throw new Error('Person ID is required');
      }
      return client.personGraph.getNetworkStats(personId);
    },
    enabled: enabled && !!personId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}