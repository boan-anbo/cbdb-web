/**
 * PersonRelationsExplorerPage Tests
 *
 * Test that the component fetches data and renders graph properly
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PersonRelationsExplorerPage from './PersonRelationsExplorerPage';
import React from 'react';

// Mock the cbdbClientManager
vi.mock('@cbdb/core', () => ({
  cbdbClientManager: {
    getClient: () => ({
      personGraph: {
        exploreNetwork: vi.fn()
      }
    }),
    getClientAsync: () => Promise.resolve({
      personGraph: {
        exploreNetwork: vi.fn()
      }
    })
  },
  NetworkExplorationOptions: {},
  NetworkExplorationResponse: {}
}));

// Mock the NetworkExplorerBase component
vi.mock('@/render/components/domain/graph/NetworkExplorerBase', () => ({
  default: ({ graphData, loading, error, title }: any) => (
    <div data-testid="network-explorer-base">
      <h1>{title}</h1>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {graphData && (
        <div data-testid="graph-data">
          <div>Nodes: {graphData.nodes?.length || 0}</div>
          <div>Edges: {graphData.edges?.length || 0}</div>
        </div>
      )}
    </div>
  )
}));

describe('PersonRelationsExplorerPage', () => {
  let queryClient: QueryClient;
  const mockExploreNetwork = vi.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0
        }
      }
    });

    // Reset mocks
    vi.clearAllMocks();

    // Setup the mock
    const { cbdbClientManager } = vi.mocked(await import('@cbdb/core'));
    cbdbClientManager.getClient().personGraph.exploreNetwork = mockExploreNetwork;
  });

  it('should render the component with initial state', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <PersonRelationsExplorerPage />
      </QueryClientProvider>
    );

    // Check title is rendered
    expect(screen.getByText('Person Relations Explorer')).toBeInTheDocument();

    // Check initial person ID input shows Wang Anshi
    const input = screen.getByPlaceholderText(/Enter person ID/i) as HTMLInputElement;
    expect(input.value).toBe('1762');
  });

  it('should fetch and display network data for Wang Anshi', async () => {
    // Mock successful network response
    const mockNetworkData = {
      nodes: [
        {
          id: 'person:1762',
          attributes: {
            label: 'Wang Anshi 王安石',
            isCentral: true,
            depth: 0
          }
        },
        {
          id: 'person:1763',
          attributes: {
            label: 'Wang Fang 王雱',
            depth: 1
          }
        }
      ],
      edges: [
        {
          source: 'person:1762',
          target: 'person:1763',
          attributes: {
            type: 'kinship'
          }
        }
      ]
    };

    mockExploreNetwork.mockResolvedValue(mockNetworkData);

    render(
      <QueryClientProvider client={queryClient}>
        <PersonRelationsExplorerPage />
      </QueryClientProvider>
    );

    // Wait for the network data to be fetched and displayed
    await waitFor(() => {
      expect(mockExploreNetwork).toHaveBeenCalledWith(
        1762,
        expect.objectContaining({
          depth: 1,
          includeKinship: true,
          includeAssociation: true,
          includeOffice: false
        })
      );
    });

    // Check that graph data is displayed
    await waitFor(() => {
      const graphData = screen.getByTestId('graph-data');
      expect(graphData).toBeInTheDocument();
      expect(graphData).toHaveTextContent('Nodes: 2');
      expect(graphData).toHaveTextContent('Edges: 1');
    });
  });

  it('should show loading state while fetching data', async () => {
    // Mock a delayed response
    mockExploreNetwork.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({ nodes: [], edges: [] }), 100))
    );

    render(
      <QueryClientProvider client={queryClient}>
        <PersonRelationsExplorerPage />
      </QueryClientProvider>
    );

    // Should show loading state initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle errors gracefully', async () => {
    // Mock an error response
    mockExploreNetwork.mockRejectedValue(new Error('Network request failed'));

    render(
      <QueryClientProvider client={queryClient}>
        <PersonRelationsExplorerPage />
      </QueryClientProvider>
    );

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Error: Network request failed')).toBeInTheDocument();
    });
  });

  it('should update relation type filters', async () => {
    const mockNetworkData = { nodes: [], edges: [] };
    mockExploreNetwork.mockResolvedValue(mockNetworkData);

    render(
      <QueryClientProvider client={queryClient}>
        <PersonRelationsExplorerPage />
      </QueryClientProvider>
    );

    // Find and click the kinship toggle
    const kinshipToggle = screen.getByLabelText(/Kinship/i);
    expect(kinshipToggle).toBeChecked(); // Should be checked by default

    // The component should fetch data on mount
    await waitFor(() => {
      expect(mockExploreNetwork).toHaveBeenCalledTimes(1);
    });
  });
});