/**
 * NetworkGraph with All React Sigma Layouts
 * REFERENCE IMPLEMENTATION - This works correctly!
 * Keep this for reference while fixing the main NetworkGraph component
 */

import React, { useEffect, useState, useCallback } from 'react';
import { SigmaContainer, useLoadGraph, useSigma } from '@react-sigma/core';
import { useLayoutCircular } from '@react-sigma/layout-circular';
import { useLayoutRandom } from '@react-sigma/layout-random';
import { useLayoutForce } from '@react-sigma/layout-force';
import { useLayoutForceAtlas2, useWorkerLayoutForceAtlas2 } from '@react-sigma/layout-forceatlas2';
import { useLayoutNoverlap } from '@react-sigma/layout-noverlap';
import { useLayoutCirclepack } from '@react-sigma/layout-circlepack';
import { MultiDirectedGraph } from 'graphology';
import { GraphData } from './NetworkGraph.types';

// Extended layout types including all React Sigma layouts
type AllLayoutType = 'circular' | 'random' | 'force' | 'forceatlas2' | 'noverlap' | 'circlepack';

/**
 * Component that handles loading the graph data
 */
const GraphLoader: React.FC<{ data: GraphData }> = ({ data }) => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const graph = new MultiDirectedGraph();

    // Add all nodes
    data.nodes.forEach(node => {
      graph.addNode(node.key, node.attributes || {});
    });

    // Add all edges
    data.edges.forEach(edge => {
      if (edge.undirected) {
        graph.addUndirectedEdge(edge.source, edge.target, edge.attributes || {});
      } else {
        graph.addDirectedEdge(edge.source, edge.target, edge.attributes || {});
      }
    });

    loadGraph(graph);
  }, [data, loadGraph]);

  return null;
};

/**
 * 1. Circular Layout - Arranges nodes in a circle
 */
const CircularLayoutComponent: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { assign } = useLayoutCircular({
    scale: 100,
    center: 0,
  });

  useEffect(() => {
    console.log('Applying circular layout');
    assign();
    if (onComplete) onComplete();
  }, [assign, onComplete]);

  return null;
};

/**
 * 2. Random Layout - Places nodes at random positions
 */
const RandomLayoutComponent: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { assign } = useLayoutRandom({
    scale: 100,
    center: 0,
  });

  useEffect(() => {
    console.log('Applying random layout');
    assign();
    if (onComplete) onComplete();
  }, [assign, onComplete]);

  return null;
};

/**
 * 3. Force Layout - Spring-based physics simulation
 */
const ForceLayoutComponent: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { assign } = useLayoutForce({
    maxIterations: 100,
    settings: {
      attraction: 0.005,
      repulsion: 0.1,
      gravity: 0.0001,
      inertia: 0.8,
      maxMove: 200,
    }
  });

  useEffect(() => {
    console.log('Applying force layout');
    assign();
    if (onComplete) {
      // Give it time to stabilize
      setTimeout(onComplete, 1000);
    }
  }, [assign, onComplete]);

  return null;
};

/**
 * 4. ForceAtlas2 Layout - Worker-based animated force-directed algorithm
 * Following the official documentation pattern
 */
const ForceAtlas2LayoutComponent: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { start, stop, kill } = useWorkerLayoutForceAtlas2({
    settings: {
      gravity: 1,
      adjustSizes: true,
      barnesHutOptimize: true,
      strongGravityMode: false,
      slowDown: 10,
      outboundAttractionDistribution: false,
      linLogMode: false,
      edgeWeightInfluence: 1,
      scalingRatio: 10,
    },
  });

  useEffect(() => {
    console.log('ForceAtlas2: Starting layout');

    // Start FA2
    start();

    // Stop after 3 seconds and notify completion
    const timer = setTimeout(() => {
      console.log('ForceAtlas2: Stopping after 3 seconds');
      stop();
      if (onComplete) {
        onComplete();
      }
    }, 3000);

    // Kill FA2 on unmount
    return () => {
      clearTimeout(timer);
      console.log('ForceAtlas2: Killing worker on unmount');
      kill();
    };
  }, [start, stop, kill]); // Include dependencies as per documentation

  return null;
};

/**
 * 5. Noverlap Layout - Prevents node overlap
 */
const NoverlapLayoutComponent: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { assign } = useLayoutNoverlap({
    maxIterations: 50,
    settings: {
      ratio: 10,
      margin: 5,
      expansion: 1.2,
      gridSize: 20,
      speed: 3,
    }
  });

  useEffect(() => {
    console.log('Applying noverlap layout');
    assign();
    if (onComplete) onComplete();
  }, [assign, onComplete]);

  return null;
};

/**
 * 6. CirclePack Layout - Hierarchical circle packing
 */
const CirclePackLayoutComponent: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { assign } = useLayoutCirclepack({
    scale: 100,
    center: 0,
    hierarchyAttributes: ['community', 'cluster'], // Attributes to use for hierarchy
  });

  useEffect(() => {
    console.log('Applying circlepack layout');
    try {
      assign();
    } catch (error) {
      console.warn('CirclePack layout error (may need hierarchical data):', error);
    }
    if (onComplete) onComplete();
  }, [assign, onComplete]);

  return null;
};

/**
 * Dynamic Layout Switcher
 */
interface LayoutSwitcherProps {
  layout: AllLayoutType;
  onLayoutComplete?: () => void;
}

const LayoutSwitcher: React.FC<LayoutSwitcherProps> = ({ layout, onLayoutComplete }) => {
  // Use key to force remount when layout changes
  const layoutKey = `${layout}-${Date.now()}`;

  switch (layout) {
    case 'circular':
      return <CircularLayoutComponent key={layoutKey} onComplete={onLayoutComplete} />;
    case 'random':
      return <RandomLayoutComponent key={layoutKey} onComplete={onLayoutComplete} />;
    case 'force':
      return <ForceLayoutComponent key={layoutKey} onComplete={onLayoutComplete} />;
    case 'forceatlas2':
      return <ForceAtlas2LayoutComponent key={layoutKey} onComplete={onLayoutComplete} />;
    case 'noverlap':
      return <NoverlapLayoutComponent key={layoutKey} onComplete={onLayoutComplete} />;
    case 'circlepack':
      return <CirclePackLayoutComponent key={layoutKey} onComplete={onLayoutComplete} />;
    default:
      return <CircularLayoutComponent key={layoutKey} onComplete={onLayoutComplete} />;
  }
};

/**
 * Main graph component with all layouts
 */
interface NetworkGraphAllLayoutsProps {
  data: GraphData;
  width?: string | number;
  height?: string | number;
  initialLayout?: AllLayoutType;
}

const NetworkGraphAllLayouts: React.FC<NetworkGraphAllLayoutsProps> = ({
  data,
  width = '100%',
  height = '600px',
  initialLayout = 'circular'
}) => {
  const [currentLayout, setCurrentLayout] = useState<AllLayoutType>(initialLayout);
  const [isLayoutChanging, setIsLayoutChanging] = useState(false);

  const handleLayoutChange = useCallback((newLayout: AllLayoutType) => {
    console.log('Switching layout to:', newLayout);
    setIsLayoutChanging(true);
    setCurrentLayout(newLayout);
  }, []);

  const handleLayoutComplete = useCallback(() => {
    console.log('Layout change complete');
    setIsLayoutChanging(false);
  }, []);

  return (
    <div style={{ width, height, position: 'relative' }}>
      {/* Layout selector */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '8px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <label style={{ marginRight: '8px' }}>Layout:</label>
        <select
          value={currentLayout}
          onChange={(e) => handleLayoutChange(e.target.value as AllLayoutType)}
          disabled={isLayoutChanging}
          style={{ minWidth: '120px' }}
        >
          <option value="circular">1. Circular</option>
          <option value="random">2. Random</option>
          <option value="force">3. Force</option>
          <option value="forceatlas2">4. ForceAtlas2</option>
          <option value="noverlap">5. Noverlap</option>
          <option value="circlepack">6. CirclePack</option>
        </select>
        {isLayoutChanging && <span style={{ marginLeft: '8px' }}>⏳ Applying...</span>}
      </div>

      {/* Layout info */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '8px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '300px',
        fontSize: '12px'
      }}>
        <strong>Current Layout: {currentLayout}</strong>
        <br />
        <span style={{ color: '#666' }}>
          {currentLayout === 'circular' && 'Nodes arranged in a circle'}
          {currentLayout === 'random' && 'Random node positions'}
          {currentLayout === 'force' && 'Spring-based physics simulation'}
          {currentLayout === 'forceatlas2' && 'Animated force-directed (3s)'}
          {currentLayout === 'noverlap' && 'Prevents node overlapping'}
          {currentLayout === 'circlepack' && 'Hierarchical circle packing'}
        </span>
      </div>

      <SigmaContainer
        graph={MultiDirectedGraph}
        settings={{
          defaultNodeColor: '#666',
          defaultEdgeColor: '#999',
          renderEdgeLabels: true,
        }}
      >
        <GraphLoader data={data} />
        <LayoutSwitcher layout={currentLayout} onLayoutComplete={handleLayoutComplete} />
      </SigmaContainer>
    </div>
  );
};

export default NetworkGraphAllLayouts;