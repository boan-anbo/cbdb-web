/**
 * MinimalSigmaGraph Stories
 *
 * Testing raw Sigma.js performance with real CBDB data
 */

import type { Meta, StoryObj } from '@storybook/react';
import MinimalSigmaGraph from './MinimalSigmaGraph';
import React, { useEffect, useState } from 'react';
import { cbdbClientManager } from '@cbdb/core';

const meta: Meta<typeof MinimalSigmaGraph> = {
  title: 'Visualization/MinimalSigmaGraph',
  component: MinimalSigmaGraph,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Component to load real data
const RealDataLoader = ({ personId, depth }: { personId: number; depth: number }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.time(`[Story] Fetching depth=${depth} data`);
        setLoading(true);

        const client = await cbdbClientManager.getClientAsync();
        const result = await client.personGraph.exploreNetwork(personId, {
          depth,
          includeKinship: true,
          includeAssociation: true,
          includeOffice: false,
        });

        console.timeEnd(`[Story] Fetching depth=${depth} data`);
        console.log(`[Story] Received ${result.graphData.nodes.length} nodes and ${result.graphData.edges.length} edges`);

        setData(result.graphData);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [personId, depth]);

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading depth={depth} network data...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
  }

  if (!data) {
    return <div style={{ padding: '20px' }}>No data available</div>;
  }

  return (
    <div>
      <div style={{ padding: '10px', background: '#f5f5f5' }}>
        <strong>Graph Stats:</strong> {data.nodes.length} nodes, {data.edges.length} edges (depth={depth})
      </div>
      <MinimalSigmaGraph data={data} layout="circular" height="800px" />
    </div>
  );
};

// Small test graph
export const SmallGraph: Story = {
  args: {
    data: {
      nodes: [
        { key: '1', attributes: { label: 'Node 1', x: 0, y: 0 } },
        { key: '2', attributes: { label: 'Node 2', x: 100, y: 0 } },
        { key: '3', attributes: { label: 'Node 3', x: 50, y: 100 } },
        { key: '4', attributes: { label: 'Node 4', x: 0, y: 100 } },
        { key: '5', attributes: { label: 'Node 5', x: 100, y: 100 } },
      ],
      edges: [
        { source: '1', target: '2' },
        { source: '1', target: '3' },
        { source: '2', target: '3' },
        { source: '3', target: '4' },
        { source: '3', target: '5' },
        { source: '4', target: '5' },
      ],
    },
    layout: 'circular',
    height: '600px',
  },
};

// Medium test graph (100 nodes)
export const MediumGraph: Story = {
  args: {
    data: {
      nodes: Array.from({ length: 100 }, (_, i) => ({
        key: `node-${i}`,
        attributes: { label: `Node ${i}` },
      })),
      edges: Array.from({ length: 200 }, (_, i) => ({
        source: `node-${Math.floor(Math.random() * 100)}`,
        target: `node-${Math.floor(Math.random() * 100)}`,
      })),
    },
    layout: 'circular',
    height: '600px',
  },
};

// Large test graph (1000 nodes)
export const LargeGraph: Story = {
  args: {
    data: {
      nodes: Array.from({ length: 1000 }, (_, i) => ({
        key: `node-${i}`,
        attributes: { label: `Node ${i}` },
      })),
      edges: Array.from({ length: 2000 }, (_, i) => ({
        source: `node-${Math.floor(Math.random() * 1000)}`,
        target: `node-${Math.floor(Math.random() * 1000)}`,
      })),
    },
    layout: 'random',
    height: '800px',
  },
};

// Real CBDB Data - Depth 1 (Direct connections)
export const RealDataDepth1: Story = {
  render: () => <RealDataLoader personId={1762} depth={1} />,
};

// Real CBDB Data - Depth 2 (Secondary connections)
export const RealDataDepth2: Story = {
  render: () => <RealDataLoader personId={1762} depth={2} />,
};

// Test with Force Layout (like PersonRelationsExplorer uses)
export const RealDataDepth2ForceLayout: Story = {
  render: () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const loadData = async () => {
        try {
          const client = await cbdbClientManager.getClientAsync();
          const result = await client.personGraph.exploreNetwork(1762, {
            depth: 2,
            includeKinship: true,
            includeAssociation: true,
            includeOffice: false,
          });
          setData(result.graphData);
        } catch (err) {
          console.error('Failed to load data:', err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (!data) return <div>No data</div>;

    return (
      <div>
        <div style={{ padding: '10px', background: '#f0f0f0' }}>
          <strong>Force Layout Test:</strong> {data.nodes.length} nodes, {data.edges.length} edges
        </div>
        <div>Force layout is not available in minimal component - would need ForceLayout component</div>
      </div>
    );
  },
};

// Real CBDB Data - Depth 2 with Random Layout
export const RealDataDepth2Random: Story = {
  render: () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const loadData = async () => {
        try {
          console.time('[Story] Fetching depth=2 data');
          const client = await cbdbClientManager.getClientAsync();
          const result = await client.personGraph.exploreNetwork(1762, {
            depth: 2,
            includeKinship: true,
            includeAssociation: true,
            includeOffice: false,
          });
          console.timeEnd('[Story] Fetching depth=2 data');
          setData(result.graphData);
        } catch (err) {
          console.error('Failed to load data:', err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (!data) return <div>No data</div>;

    return (
      <div>
        <div style={{ padding: '10px', background: '#f5f5f5' }}>
          <strong>Random Layout:</strong> {data.nodes.length} nodes, {data.edges.length} edges
        </div>
        <MinimalSigmaGraph data={data} layout="random" height="800px" />
      </div>
    );
  },
};

// Test Suspect 1: EdgeCurveProcessor
export const RealDataDepth2WithEdgeCurve: Story = {
  render: () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const loadData = async () => {
        try {
          console.time('[Story] Fetching depth=2 data');
          const client = await cbdbClientManager.getClientAsync();
          const result = await client.personGraph.exploreNetwork(1762, {
            depth: 2,
            includeKinship: true,
            includeAssociation: true,
            includeOffice: false,
          });
          console.timeEnd('[Story] Fetching depth=2 data');
          setData(result.graphData);
        } catch (err) {
          console.error('Failed to load data:', err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (!data) return <div>No data</div>;

    return (
      <div>
        <div style={{ padding: '10px', background: '#ffcccc' }}>
          <strong>WITH EdgeCurveProcessor:</strong> {data.nodes.length} nodes, {data.edges.length} edges
        </div>
        <MinimalSigmaGraph
          data={data}
          layout="circular"
          height="800px"
          enableEdgeCurve={true}  // TEST EdgeCurve
          enableHoverHighlight={false}
        />
      </div>
    );
  },
};

// Test Suspect 2: HoverHighlight
export const RealDataDepth2WithHoverHighlight: Story = {
  render: () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const loadData = async () => {
        try {
          console.time('[Story] Fetching depth=2 data');
          const client = await cbdbClientManager.getClientAsync();
          const result = await client.personGraph.exploreNetwork(1762, {
            depth: 2,
            includeKinship: true,
            includeAssociation: true,
            includeOffice: false,
          });
          console.timeEnd('[Story] Fetching depth=2 data');
          setData(result.graphData);
        } catch (err) {
          console.error('Failed to load data:', err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (!data) return <div>No data</div>;

    return (
      <div>
        <div style={{ padding: '10px', background: '#ccffcc' }}>
          <strong>WITH HoverHighlight:</strong> {data.nodes.length} nodes, {data.edges.length} edges
        </div>
        <MinimalSigmaGraph
          data={data}
          layout="circular"
          height="800px"
          enableEdgeCurve={false}
          enableHoverHighlight={true}  // TEST HoverHighlight
        />
      </div>
    );
  },
};

// Test Suspect 3: Search Controls
export const RealDataDepth2WithSearch: Story = {
  render: () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const loadData = async () => {
        try {
          console.time('[Story] Fetching depth=2 data');
          const client = await cbdbClientManager.getClientAsync();
          const result = await client.personGraph.exploreNetwork(1762, {
            depth: 2,
            includeKinship: true,
            includeAssociation: true,
            includeOffice: false,
          });
          console.timeEnd('[Story] Fetching depth=2 data');
          setData(result.graphData);
        } catch (err) {
          console.error('Failed to load data:', err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (!data) return <div>No data</div>;

    return (
      <div>
        <div style={{ padding: '10px', background: '#ccccff' }}>
          <strong>WITH Search Controls:</strong> {data.nodes.length} nodes, {data.edges.length} edges
        </div>
        <MinimalSigmaGraph
          data={data}
          layout="circular"
          height="800px"
          enableEdgeCurve={false}
          enableHoverHighlight={false}
          enableSearchControls={true}  // TEST Search
        />
      </div>
    );
  },
};

// Test Both Suspects Together
export const RealDataDepth2WithBoth: Story = {
  render: () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const loadData = async () => {
        try {
          console.time('[Story] Fetching depth=2 data');
          const client = await cbdbClientManager.getClientAsync();
          const result = await client.personGraph.exploreNetwork(1762, {
            depth: 2,
            includeKinship: true,
            includeAssociation: true,
            includeOffice: false,
          });
          console.timeEnd('[Story] Fetching depth=2 data');
          setData(result.graphData);
        } catch (err) {
          console.error('Failed to load data:', err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (!data) return <div>No data</div>;

    return (
      <div>
        <div style={{ padding: '10px', background: '#ffff99' }}>
          <strong>WITH BOTH EdgeCurve + HoverHighlight:</strong> {data.nodes.length} nodes, {data.edges.length} edges
        </div>
        <MinimalSigmaGraph
          data={data}
          layout="circular"
          height="800px"
          enableEdgeCurve={true}      // TEST Both
          enableHoverHighlight={true}  // TEST Both
        />
      </div>
    );
  },
};

// Real CBDB Data - Depth 2 with No Layout (positions from data)
export const RealDataDepth2NoLayout: Story = {
  render: () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const loadData = async () => {
        try {
          console.time('[Story] Fetching depth=2 data');
          const client = await cbdbClientManager.getClientAsync();
          const result = await client.personGraph.exploreNetwork(1762, {
            depth: 2,
            includeKinship: true,
            includeAssociation: true,
            includeOffice: false,
          });
          console.timeEnd('[Story] Fetching depth=2 data');
          setData(result.graphData);
        } catch (err) {
          console.error('Failed to load data:', err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (!data) return <div>No data</div>;

    return (
      <div>
        <div style={{ padding: '10px', background: '#f5f5f5' }}>
          <strong>No Layout (uses data positions):</strong> {data.nodes.length} nodes, {data.edges.length} edges
        </div>
        <MinimalSigmaGraph data={data} layout="none" height="800px" />
      </div>
    );
  },
};