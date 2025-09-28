import { useState, useEffect } from 'react';
import { SerializedGraph } from 'graphology-types';
import { useApiClient } from '@/render/providers/ApiClientProvider';

export interface UseKinshipNetworkOptions {
  personId: number;
  depth?: number;
}

export interface UseKinshipNetworkResult {
  graphData?: SerializedGraph;
  loading: boolean;
  error?: Error;
  refetch: () => void;
}

/**
 * Hook to fetch kinship network data from the backend
 */
export function useKinshipNetwork({
  personId,
  depth = 1
}: UseKinshipNetworkOptions): UseKinshipNetworkResult {
  const [graphData, setGraphData] = useState<SerializedGraph>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();
  const client = useApiClient();

  const fetchData = async () => {
    setLoading(true);
    setError(undefined);

    try {
      const response = await client.person.getKinshipNetwork(personId, {
        depth: depth.toString()
      });

      // Convert the response to SerializedGraph format
      const serializedGraph: SerializedGraph = {
        nodes: response.nodes.map(node => ({
          key: node.id,
          attributes: {
            ...node.attributes,
            label: node.label
          }
        })),
        edges: response.edges.map(edge => ({
          source: edge.source,
          target: edge.target,
          attributes: {
            ...edge.attributes,
            label: edge.label
          }
        }))
      };

      setGraphData(serializedGraph);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch kinship network'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (personId) {
      fetchData();
    }
  }, [personId, depth]);

  return {
    graphData,
    loading,
    error,
    refetch: fetchData
  };
}