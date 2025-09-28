/**
 * NetworkGraphRenderer Component
 *
 * Pure graph rendering component with no wrapper or layout.
 * Just the graph visualization and its states (loading, error, empty).
 */

import React from 'react';
import { NetworkGraph, GraphData, LayoutType, LayoutConfig } from '@/render/components/visualization/NetworkGraph';
import { GraphNode, GraphEdge } from '@/render/components/visualization/NetworkGraph';
import { NetworkStats } from './types';
import { Loader2 } from 'lucide-react';

export interface NetworkGraphRendererProps {
  // Data
  graphData?: GraphData;
  loading?: boolean;
  error?: Error | null;

  // Visualization
  height?: string;
  defaultLayout?: LayoutType;
  layoutConfig?: LayoutConfig;
  nodeColorScheme?: string;
  showLabels?: boolean;
  enableHover?: boolean;
  showControls?: boolean;

  // Callbacks
  onNodeClick?: (node: GraphNode) => void;
  onNodeDoubleClick?: (node: GraphNode) => void;
  onEdgeClick?: (edge: GraphEdge) => void;
  onStatsCalculated?: (stats: NetworkStats) => void;
}

/**
 * Pure graph renderer - no wrappers, no blocks, just the visualization
 */
export const NetworkGraphRenderer: React.FC<NetworkGraphRendererProps> = ({
  graphData,
  loading = false,
  error = null,
  height = '500px',
  defaultLayout = 'forceatlas2',
  layoutConfig,
  nodeColorScheme = 'depth',
  showLabels = true,
  enableHover = true,
  showControls = true,
  onNodeClick,
  onNodeDoubleClick,
  onEdgeClick,
  onStatsCalculated,
}) => {
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center bg-muted/10" style={{ height }}>
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-lg font-medium">Loading network...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center bg-muted/10" style={{ height }}>
        <div className="text-center space-y-2 max-w-md">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <strong>Error loading network:</strong>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center bg-muted/10" style={{ height }}>
        <div className="text-center space-y-4 max-w-md mx-auto p-8">
          <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto">
            <div className="text-2xl">📊</div>
          </div>
          <div>
            <p className="text-lg font-medium mb-2">No Network Data</p>
            <p className="text-sm text-muted-foreground">
              Select options to explore network relationships.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render the graph
  return (
    <div className="relative" style={{ height }}>
      <NetworkGraph
        data={graphData}
        height={height}
        defaultLayout={defaultLayout}
        layoutConfig={layoutConfig}
        nodeColorScheme={nodeColorScheme}
        showLabels={showLabels}
        enableHover={enableHover}
        enableControls={showControls}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onEdgeClick={onEdgeClick}
        onLayoutComplete={(metrics) => {
          if (onStatsCalculated && metrics) {
            const stats: NetworkStats = {
              nodeCount: metrics.nodeCount || 0,
              edgeCount: metrics.edgeCount || 0,
              density: metrics.density,
              avgDegree: metrics.avgDegree,
              components: metrics.components,
              modularity: metrics.modularity,
            };
            onStatsCalculated(stats);
          }
        }}
      />
    </div>
  );
};

export default NetworkGraphRenderer;