/**
 * MinimalSigmaGraph - A minimal Sigma.js implementation for performance testing
 *
 * This component uses the most basic Sigma.js setup with no extra features
 * to test raw rendering performance with large graphs.
 */

import React, { useEffect } from 'react';
import { SigmaContainer, useLoadGraph, useRegisterEvents, useSigma } from '@react-sigma/core';
import { useLayoutCircular } from '@react-sigma/layout-circular';
import { MultiDirectedGraph } from 'graphology';
import '@react-sigma/core/lib/style.css';
import { EdgeCurvedArrowProgram } from '@sigma/edge-curve';
import { EdgeArrowProgram } from 'sigma/rendering';

// Import suspects to test
import { EdgeCurveProcessor } from './NetworkGraph/processors';
import { HoverHighlight } from './NetworkGraph/processors';
import CustomGraphControls from './NetworkGraph/controls/CustomGraphControls';

interface MinimalSigmaGraphProps {
  data: {
    nodes: Array<{ key: string; attributes?: any }>;
    edges: Array<{ source: string; target: string; attributes?: any }>;
  };
  layout?: 'circular' | 'random' | 'none';
  width?: string | number;
  height?: string | number;
  // Test flags for suspects
  enableEdgeCurve?: boolean;
  enableHoverHighlight?: boolean;
  enableSearchControls?: boolean;
}

const GraphLoader: React.FC<{ data: MinimalSigmaGraphProps['data']; layout: string }> = ({ data, layout }) => {
  const loadGraph = useLoadGraph();
  const { assign: assignCircular } = useLayoutCircular();

  useEffect(() => {
    console.time('[MinimalSigma] Graph creation');
    const graph = new MultiDirectedGraph();

    // Test using import like the full NetworkGraph does
    console.time('[MinimalSigma] Graph import');
    graph.import(data as any);
    console.timeEnd('[MinimalSigma] Graph import');

    console.timeEnd('[MinimalSigma] Graph creation');
    console.log(`[MinimalSigma] Created graph with ${graph.order} nodes and ${graph.size} edges`);

    // Load graph into Sigma
    console.time('[MinimalSigma] Load graph');
    loadGraph(graph);
    console.timeEnd('[MinimalSigma] Load graph');

    // Apply layout if requested
    if (layout === 'circular') {
      console.time('[MinimalSigma] Circular layout');
      assignCircular();
      console.timeEnd('[MinimalSigma] Circular layout');
    } else if (layout === 'random') {
      console.time('[MinimalSigma] Random layout');
      graph.forEachNode((node) => {
        graph.setNodeAttribute(node, 'x', Math.random() * 100);
        graph.setNodeAttribute(node, 'y', Math.random() * 100);
      });
      console.timeEnd('[MinimalSigma] Random layout');
    }
  }, [data, loadGraph, assignCircular, layout]);

  return null;
};

const MinimalSigmaGraph: React.FC<MinimalSigmaGraphProps> = ({
  data,
  layout = 'circular',
  width = '100%',
  height = '600px',
  enableEdgeCurve = false,
  enableHoverHighlight = false,
  enableSearchControls = false,
}) => {
  console.log('[MinimalSigma] Rendering with', data.nodes.length, 'nodes and', data.edges.length, 'edges');
  console.log('[MinimalSigma] EdgeCurve:', enableEdgeCurve, 'HoverHighlight:', enableHoverHighlight, 'SearchControls:', enableSearchControls);

  return (
    <div style={{ width, height, border: '1px solid #ccc' }}>
      <SigmaContainer
        graph={MultiDirectedGraph}
        settings={{
          renderEdgeLabels: false,
          renderLabels: false,
          defaultNodeColor: '#666',
          defaultEdgeColor: '#ccc',
          minEdgeSize: 0.5,
          maxEdgeSize: 1,
          // Add edge program classes for curved edges
          edgeProgramClasses: {
            straight: EdgeArrowProgram,
            curved: EdgeCurvedArrowProgram,
          },
        }}
      >
        <GraphLoader data={data} layout={layout} />
        {enableEdgeCurve && <EdgeCurveProcessor mode="auto" />}
        {enableHoverHighlight && <HoverHighlight />}
        {enableSearchControls && (
          <CustomGraphControls
            showSearch={true}
            showZoom={false}
            showFullscreen={false}
            showLayoutSelector={false}
          />
        )}
      </SigmaContainer>
    </div>
  );
};

export default MinimalSigmaGraph;