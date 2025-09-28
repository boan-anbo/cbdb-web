/**
 * NetworkExplorerBase Component
 *
 * Base component for all network explorer pages.
 * Provides common functionality for graph visualization and interaction.
 */

import React, { ReactNode, useState, useCallback } from 'react';
import {
  NetworkGraph,
  GraphData,
  GraphNode,
  GraphEdge,
  LayoutType,
  LayoutConfig
} from '@/render/components/visualization/NetworkGraph';
import { CBDBBlock, CBDBBlockContent, CBDBBlockHeader, CBDBBlockTitle } from '@/render/components/ui/cbdb-block';
import { Alert, AlertDescription } from '@/render/components/ui/alert';
import { Loader2, AlertCircle, Info } from 'lucide-react';
import { NetworkStats } from './types';

export interface NetworkExplorerBaseProps {
  title?: string | null;
  description?: string | null;

  // Graph data
  graphData?: GraphData;
  loading?: boolean;
  error?: Error | null;

  // Controls
  controlPanel?: ReactNode;
  statsPanel?: ReactNode;
  advancedPanel?: ReactNode;

  // Layout
  defaultLayout?: LayoutType;
  layoutConfig?: LayoutConfig;
  height?: string;

  // Visualization options
  nodeColorScheme?: string;
  showLabels?: boolean;
  enableHover?: boolean;
  showControls?: boolean;

  // Wrapper control
  noWrapper?: boolean; // Skip the "Network Visualization" CBDBBlock wrapper

  // Callbacks
  onNodeClick?: (node: GraphNode) => void;
  onNodeDoubleClick?: (node: GraphNode) => void;
  onEdgeClick?: (edge: GraphEdge) => void;
  onStatsCalculated?: (stats: NetworkStats) => void;
  onRefresh?: () => void;

  // Advanced mode
  showAdvancedMode?: boolean;
  onAdvancedModeToggle?: (enabled: boolean) => void;
}

/**
 * Base component for network exploration
 *
 * Provides:
 * - Graph visualization area
 * - Loading/error states
 * - Control panel slot
 * - Stats panel slot
 * - Advanced mode slot
 */
const NetworkExplorerBase: React.FC<NetworkExplorerBaseProps> = ({
  title,
  description,
  graphData,
  loading = false,
  error = null,
  controlPanel,
  statsPanel,
  advancedPanel,
  defaultLayout = 'forceatlas2',
  layoutConfig,
  height = '600px',
  nodeColorScheme = 'depth',
  showLabels = true,
  enableHover = true,
  showControls = true,
  noWrapper = false,
  onNodeClick,
  onNodeDoubleClick,
  onEdgeClick,
  onStatsCalculated,
  onRefresh,
  showAdvancedMode = false,
  onAdvancedModeToggle
}) => {
  const [layout, setLayout] = useState<LayoutType>(defaultLayout);

  return (
    <div className="space-y-6">
      {/* Page Header - Only show if title is provided */}
      {title && (
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {/* Control Panel */}
      {controlPanel && (
        <CBDBBlock>
          <CBDBBlockHeader>
            <CBDBBlockTitle>Search & Filters</CBDBBlockTitle>
          </CBDBBlockHeader>
          <CBDBBlockContent>
            {controlPanel}
          </CBDBBlockContent>
        </CBDBBlock>
      )}

      {/* Advanced Mode Panel */}
      {showAdvancedMode && advancedPanel && (
        <CBDBBlock className="border-dashed">
          <CBDBBlockHeader>
            <CBDBBlockTitle className="flex items-center gap-2">
              <span className="text-muted-foreground">⚡</span>
              Advanced Mode
            </CBDBBlockTitle>
          </CBDBBlockHeader>
          <CBDBBlockContent>
            {advancedPanel}
          </CBDBBlockContent>
        </CBDBBlock>
      )}

      {/* Graph Visualization */}
      <CBDBBlock className="relative overflow-hidden">
        <CBDBBlockHeader>
          <div className="flex items-center justify-between">
            <CBDBBlockTitle>Network Visualization</CBDBBlockTitle>
            {/* Layout selector could go here */}
          </div>
        </CBDBBlockHeader>
        <CBDBBlockContent className="p-0">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center bg-muted/10" style={{ height }}>
              <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <p className="text-lg font-medium">Loading network...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex items-center justify-center bg-muted/10" style={{ height }}>
              <Alert className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Graph */}
          {!loading && !error && graphData && (
            <div className="bg-background" style={{ height }}>
              <NetworkGraph
                data={graphData}
                layout={layout}
                layoutConfig={layoutConfig}
                height={height}
                enableHoverHighlight={enableHover}
                enableControls={showControls}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
              />
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && !graphData && (
            <div className="flex items-center justify-center bg-muted/10" style={{ height }}>
              <div className="text-center space-y-4 max-w-md">
                <Info className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">No Network Data</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Select a person and adjust filters to explore their network
                  </p>
                </div>
              </div>
            </div>
          )}
        </CBDBBlockContent>
      </CBDBBlock>

      {/* Stats Panel */}
      {statsPanel && !loading && !error && graphData && (
        <CBDBBlock>
          <CBDBBlockHeader>
            <CBDBBlockTitle>Network Statistics</CBDBBlockTitle>
          </CBDBBlockHeader>
          <CBDBBlockContent>
            {statsPanel}
          </CBDBBlockContent>
        </CBDBBlock>
      )}
    </div>
  );
};

export default NetworkExplorerBase;