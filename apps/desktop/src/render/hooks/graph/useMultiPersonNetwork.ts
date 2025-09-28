/**
 * useMultiPersonNetwork Hook
 *
 * React hook for analyzing networks between multiple persons.
 * Finds connections, bridge nodes, and paths between people.
 */

import { useApiClient } from '@/render/providers/ApiClientProvider';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import {
  cbdbClientManager,
  MultiPersonNetworkOptions,
  MultiPersonNetworkResponse
} from '@cbdb/core';

/**
 * Hook for building multi-person network analysis
 *
 * Uses mutation since this is a POST request with complex parameters
 */
export function useMultiPersonNetwork(): UseMutationResult<
  MultiPersonNetworkResponse,
  Error,
  {
    personIds: number[];
    options?: MultiPersonNetworkOptions;
  }
> {
  return useMutation({
    mutationFn: async ({ personIds, options }) => {
      if (!personIds || personIds.length < 2) {
        throw new Error('At least 2 person IDs are required');
      }
      const client = useApiClient();
      return client.personGraph.buildMultiPersonNetwork(personIds, options);
    },
    onSuccess: (data) => {
      console.log('Multi-person network built successfully', {
        nodeCount: data.graph.nodes?.length || 0,
        edgeCount: data.graph.edges?.length || 0,
        directConnections: data.directConnections?.length || 0,
        bridgeNodes: data.bridgeNodes?.length || 0,
        pathways: data.pathways?.length || 0
      });
    },
    onError: (error) => {
      console.error('Failed to build multi-person network:', error);
    }
  });
}

/**
 * Hook for searching persons suitable for network analysis
 *
 * @param query - Search query
 * @param limit - Maximum results
 */
export function useSearchPersonsForNetwork(
  query: string,
  limit: number = 10
) {
  return useMutation({
    mutationFn: async () => {
      if (!query || query.trim().length === 0) {
        throw new Error('Search query is required');
      }
      const client = useApiClient();
      return client.personGraph.searchPersonsForNetwork(query, limit);
    }
  });
}

/**
 * Hook for finding shortest path between two persons
 *
 * Helper hook that uses multi-person network with path-finding enabled
 */
export function useShortestPath(
  person1Id: number | undefined,
  person2Id: number | undefined,
  maxDepth: number = 3
) {
  return useMutation({
    mutationFn: async () => {
      if (!person1Id || !person2Id) {
        throw new Error('Both person IDs are required');
      }

      const client = useApiClient();
      const result = await client.personGraph.buildMultiPersonNetwork(
        [person1Id, person2Id],
        {
          maxDepth,
          findPaths: true,
          includeBridgeNodes: false
        }
      );

      // Extract the shortest path if found
      const pathway = result.pathways?.find(
        p => (p.fromPerson === person1Id && p.toPerson === person2Id) ||
             (p.fromPerson === person2Id && p.toPerson === person1Id)
      );

      return {
        ...result,
        shortestPath: pathway
      };
    }
  });
}

/**
 * Hook for finding bridge nodes between multiple persons
 *
 * Identifies key intermediary figures that connect the query persons
 */
export function useBridgeNodes(
  personIds: number[],
  maxDepth: number = 2
) {
  return useMutation({
    mutationFn: async () => {
      if (!personIds || personIds.length < 2) {
        throw new Error('At least 2 person IDs are required');
      }

      const client = useApiClient();
      const result = await client.personGraph.buildMultiPersonNetwork(
        personIds,
        {
          maxDepth,
          includeBridgeNodes: true,
          findPaths: false
        }
      );

      // Sort bridge nodes by their bridge score
      const sortedBridges = [...(result.bridgeNodes || [])].sort(
        (a, b) => b.bridgeScore - a.bridgeScore
      );

      return {
        ...result,
        topBridges: sortedBridges.slice(0, 10) // Top 10 bridge nodes
      };
    }
  });
}