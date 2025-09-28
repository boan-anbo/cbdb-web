import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import NetworkGraph from './core/NetworkGraph';
import { testGraphData } from './examples/data/test-data';
import { testLargeGraphData } from './examples/data/test-data-large';
import { testMultiRelationshipData } from './examples/data/test-data-multi-relationships';
import { cbdbClientManager } from '@cbdb/core';

const meta: Meta<typeof NetworkGraph> = {
  title: 'Visualization/NetworkGraph',
  component: NetworkGraph,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Full - Complete NetworkGraph with all features enabled
 */
export const Full: Story = {
  args: {
    data: testMultiRelationshipData,
    height: '600px',
    enableControls: true,
    enableHoverHighlight: true,
    edgeCurveMode: 'auto',
    renderEdgeLabels: true,
    controlsConfig: {
      showFullscreen: true,
      showZoom: true,
      showSearch: true,
      showLayoutSelector: true,
      position: 'bottom-right',
    },
    availableLayouts: ['circular', 'random', 'force', 'forceatlas2', 'noverlap', 'circlepack'],
    layout: 'forceatlas2',
    layoutConfig: {
      duration: 5000,
      gravity: 1,
      scalingRatio: 15
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: '600px', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * Multiple Relationships - demonstrates multiple edges between same nodes
 */
export const MultipleRelationships: Story = {
  args: {
    data: testMultiRelationshipData,
    height: '600px',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: '600px', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * Large NetworkGraph - 100 nodes with multiple relationship types
 */
export const LargeNetworkGraph: Story = {
  args: {
    data: testLargeGraphData,
    height: '600px',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: '600px', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * NetworkGraph with Controls - Interactive controls and layout selector
 */
export const WithControls: Story = {
  args: {
    data: testMultiRelationshipData,
    height: '600px',
    enableControls: true,
    controlsConfig: {
      showFullscreen: true,
      showZoom: true,
      showSearch: true,
      showLayoutSelector: true,
      position: 'bottom-right',
    },
    availableLayouts: ['circular', 'random', 'force', 'forceatlas2', 'noverlap', 'circlepack'],
    layout: 'circular',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: '600px', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * Hover Highlight Test - Demonstrates the light gray fade effect
 * Matching official Sigma.js example behavior
 */
export const HoverHighlightTest: Story = {
  args: {
    data: testGraphData,
    height: '600px',
    enableHoverHighlight: true,
    enableControls: false,
    layout: 'force',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: '600px', position: 'relative' }}>
        <h3 style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, background: 'white', padding: '5px' }}>
          Hover over nodes to see fade effect (#f6f6f6 gray)
        </h3>
        <Story />
      </div>
    ),
  ],
};

/**
 * No Hover Highlight - For comparison with hover effect disabled
 */
export const NoHoverHighlight: Story = {
  args: {
    data: testGraphData,
    height: '600px',
    enableHoverHighlight: false,
    enableControls: false,
    layout: 'force',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: '600px', position: 'relative' }}>
        <h3 style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, background: 'white', padding: '5px' }}>
          Hover disabled - no fade effect
        </h3>
        <Story />
      </div>
    ),
  ],
};

/**
 * Large Network Hover Test - Tests hover performance with many nodes
 */
export const LargeNetworkHover: Story = {
  args: {
    data: testLargeGraphData,
    height: '600px',
    enableHoverHighlight: true,
    enableControls: true,
    layout: 'forceatlas2',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: '600px', position: 'relative' }}>
        <h3 style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, background: 'white', padding: '5px' }}>
          Large network (100 nodes) - hover performance test
        </h3>
        <Story />
      </div>
    ),
  ],
};

/**
 * Cluster Labels - Shows cluster identification and labeling
 */
export const ClusterLabels: Story = {
  args: {
    data: testLargeGraphData,
    height: '600px',
    enableClusterLabels: true,
    minClusterSize: 3,
    enableControls: true,
    layout: 'forceatlas2',
    layoutConfig: {
      duration: 8000,  // Run for 8 seconds to allow proper clustering
      gravity: 1,
      scalingRatio: 20,
      barnesHutOptimize: true
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: '600px', position: 'relative' }}>
        <h3 style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, background: 'white', padding: '5px' }}>
          Cluster labels for kinship/association groups
        </h3>
        <Story />
      </div>
    ),
  ],
};


// ============= PERFORMANCE TESTS WITH REAL CBDB DATA =============

// Component to load real data
const RealDataLoader = ({ personId, depth, testFeatures }: {
  personId: number;
  depth: number;
  testFeatures?: {
    enableHoverHighlight?: boolean;
    enableEdgeCurve?: boolean;
    enableControls?: boolean;
    layout?: string;
  }
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.time(`[NetworkGraph Story] Fetching depth=${depth} data`);
        setLoading(true);

        const client = await cbdbClientManager.getClientAsync();
        const result = await client.personGraph.exploreNetwork(personId, {
          depth,
          includeKinship: true,
          includeAssociation: true,
          includeOffice: false,
        });

        console.timeEnd(`[NetworkGraph Story] Fetching depth=${depth} data`);
        console.log(`[NetworkGraph Story] Received ${result.graphData.nodes.length} nodes and ${result.graphData.edges.length} edges`);

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

  const features = testFeatures || {};

  return (
    <div style={{ width: '100%', height: '800px', position: 'relative' }}>
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 1000,
        background: 'white',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px'
      }}>
        <strong>Graph Stats:</strong> {data.nodes.length} nodes, {data.edges.length} edges (depth={depth})<br/>
        <strong>Features:</strong> HoverHighlight={String(features.enableHoverHighlight ?? true)},
        EdgeCurve={String(features.enableEdgeCurve ?? true)},
        Controls={String(features.enableControls ?? false)},
        Layout={features.layout || 'force'}
      </div>
      <NetworkGraph
        data={data}
        height="800px"
        layout={features.layout as any || 'force'}
        enableHoverHighlight={features.enableHoverHighlight ?? true}
        edgeCurveMode={features.enableEdgeCurve === false ? 'none' : 'auto'}
        enableControls={features.enableControls ?? false}
        renderEdgeLabels={false}
      />
    </div>
  );
};

/**
 * Real Data - Depth 1 (Baseline)
 */
export const RealDataDepth1: Story = {
  render: () => <RealDataLoader personId={1762} depth={1} />,
};

/**
 * Real Data - Depth 2 (Full Features - DEFAULT)
 * This is what PersonRelationsExplorer uses by default
 */
export const RealDataDepth2Default: Story = {
  render: () => <RealDataLoader personId={1762} depth={2} />,
};

/**
 * Real Data - Depth 2 (No Features - Minimal)
 * Test with all features disabled
 */
export const RealDataDepth2Minimal: Story = {
  render: () => <RealDataLoader personId={1762} depth={2} testFeatures={{
    enableHoverHighlight: false,
    enableEdgeCurve: false,
    enableControls: false,
    layout: 'circular'
  }} />,
};

/**
 * Real Data - Depth 2 (No HoverHighlight)
 */
export const RealDataDepth2NoHover: Story = {
  render: () => <RealDataLoader personId={1762} depth={2} testFeatures={{
    enableHoverHighlight: false,
    enableEdgeCurve: true,
    enableControls: false,
    layout: 'force'
  }} />,
};

/**
 * Real Data - Depth 2 (No EdgeCurve)
 */
export const RealDataDepth2NoEdgeCurve: Story = {
  render: () => <RealDataLoader personId={1762} depth={2} testFeatures={{
    enableHoverHighlight: true,
    enableEdgeCurve: false,
    enableControls: false,
    layout: 'force'
  }} />,
};

/**
 * Real Data - Depth 2 (Circular Layout)
 */
export const RealDataDepth2Circular: Story = {
  render: () => <RealDataLoader personId={1762} depth={2} testFeatures={{
    enableHoverHighlight: true,
    enableEdgeCurve: true,
    enableControls: false,
    layout: 'circular'
  }} />,
};

/**
 * Real Data - Depth 2 (Random Layout)
 */
export const RealDataDepth2Random: Story = {
  render: () => <RealDataLoader personId={1762} depth={2} testFeatures={{
    enableHoverHighlight: true,
    enableEdgeCurve: true,
    enableControls: false,
    layout: 'random'
  }} />,
};

/**
 * Real Data - Depth 2 (With Controls)
 */
export const RealDataDepth2WithControls: Story = {
  render: () => <RealDataLoader personId={1762} depth={2} testFeatures={{
    enableHoverHighlight: true,
    enableEdgeCurve: true,
    enableControls: true,
    layout: 'force'
  }} />,
};

/**
 * Real Data - Depth 2 (Random Layout with Controls)
 */
export const RealDataDepth2RandomWithControls: Story = {
  render: () => <RealDataLoader personId={1762} depth={2} testFeatures={{
    enableHoverHighlight: true,
    enableEdgeCurve: true,
    enableControls: true,
    layout: 'random'
  }} />,
};

/**
 * Real Data - Depth 2 (Circular Layout with Controls)
 */
export const RealDataDepth2CircularWithControls: Story = {
  render: () => <RealDataLoader personId={1762} depth={2} testFeatures={{
    enableHoverHighlight: true,
    enableEdgeCurve: true,
    enableControls: true,
    layout: 'circular'
  }} />,
};
