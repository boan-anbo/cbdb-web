/**
 * NetworkGraph Component
 *
 * A data-agnostic network visualization component using React Sigma and Graphology.
 * Supports multiple relationships between nodes with curved edges and proper label separation.
 *
 * @example
 * ```tsx
 * const graphData: GraphData = {
 *   nodes: [
 *     { key: 'node1', attributes: { label: 'Node 1', size: 20, color: '#ff0000' } },
 *     { key: 'node2', attributes: { label: 'Node 2', size: 15, color: '#00ff00' } }
 *   ],
 *   edges: [
 *     { source: 'node1', target: 'node2', attributes: { label: 'Connection', size: 3 } }
 *   ]
 * };
 * <NetworkGraph data={graphData} layout="circular" />
 * ```
 */

import { SigmaContainer, useLoadGraph } from '@react-sigma/core';
import '@react-sigma/core/lib/style.css';
import { EdgeCurvedArrowProgram } from '@sigma/edge-curve';
import { EdgeArrowProgram } from 'sigma/rendering';
import { MultiDirectedGraph } from 'graphology';
import React, { FC, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { GraphData, NetworkGraphProps } from './NetworkGraph.types';
import { HoverHighlight, EdgeCurveProcessor, ClusterLabels, InitialSpread, NodeSizeScaler } from '../processors';
import LayoutManager from '../layouts/LayoutManager';
import CustomGraphControls from '../controls/CustomGraphControls';
import { GraphControlAPI } from '../controls/types';
import { LayoutType } from '../layouts/types';


const LoadGraph = ({ data }: {
  data: GraphData;
}): React.ReactNode => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const graph = new MultiDirectedGraph();
    // Import GraphData (compatible with SerializedGraph format)
    graph.import(data as any);

    loadGraph(graph);
  }, [data, loadGraph]);

  return null;
};

const NetworkGraph = forwardRef<GraphControlAPI, NetworkGraphProps>(({
  data,
  layout: initialLayout = 'forceatlas2',
  layoutConfig,
  renderEdgeLabels = true,
  defaultEdgeColor = '#999',
  defaultNodeColor = '#666',
  defaultEdgeSize = 3,
  minEdgeSize = 1,
  maxEdgeSize = 10,
  width = '100%',
  height = '100vh',
  sigmaSettings,
  enableHoverHighlight = true,
  enableClusterLabels = false,
  minClusterSize = 5,
  edgeCurveMode = 'auto',
  enableControls = false,
  controlsConfig,
  availableLayouts = ['circular', 'random', 'forceatlas2', 'noverlap', 'circlepack'],
  onNodeClick,
  onEdgeClick,
  onBackgroundClick,
  onLayoutChange
}, ref) => {
  const [currentLayout, setCurrentLayout] = useState<LayoutType>(initialLayout);

  // Calculate node count and determine performance settings
  const nodeCount = data?.nodes?.length || 0;
  const isLargeGraph = nodeCount > 200;

  // Handle layout change
  const handleLayoutChange = (newLayout: string) => {
    const layout = newLayout as LayoutType;
    setCurrentLayout(layout);
    if (onLayoutChange) {
      onLayoutChange(layout);
    }
  };

  if (!data) {
    return <div>No graph data available</div>;
  }

  return (
    <div style={{ width, height, position: 'relative' }}>
      <SigmaContainer
        graph={MultiDirectedGraph}
        settings={{
          renderEdgeLabels: isLargeGraph ? false : renderEdgeLabels,
          defaultEdgeColor,
          defaultNodeColor,
          edgeColor: 'default',
          defaultEdgeType: 'straight',
          defaultEdgeSize,
          minEdgeSize,
          maxEdgeSize,
          // Set minimum and maximum node sizes to prevent them from being too small
          minNodeSize: 5,
          maxNodeSize: 30,
          nodeBorderColor: 'default',
          defaultNodeBorderColor: '#ffffff',
          edgeProgramClasses: {
            straight: EdgeArrowProgram,
            curved: EdgeCurvedArrowProgram,
          },
          // Keep autoRescale enabled (needed for proper viewport fitting)
          ...sigmaSettings
        }}
      >
        <LoadGraph data={data} />
        {/* Apply node size scaling with ratio 1.0 (no transformation) */}
        <NodeSizeScaler
          ratio={1.0}  // Use 1.0 ratio - no transformation
          minSize={2}
          maxSize={16}
        />
        <LayoutManager
          key={`layout-${currentLayout}`}  // Only remount when layout actually changes
          layout={currentLayout}
          config={layoutConfig}
          animate={true}
        />
        {!isLargeGraph && <EdgeCurveProcessor mode={edgeCurveMode} />}
        {enableHoverHighlight && <HoverHighlight />}

        {enableControls && (
          <CustomGraphControls
            {...controlsConfig}
            availableLayouts={availableLayouts}
            currentLayout={currentLayout}
            onLayoutChange={handleLayoutChange}
          />
        )}
      </SigmaContainer>
    </div>
  );
});

NetworkGraph.displayName = 'NetworkGraph';

export default NetworkGraph;
