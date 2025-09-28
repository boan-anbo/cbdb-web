/**
 * NetworkVisualizationBlock Component
 *
 * Reusable network visualization component that combines CBDBBlock with NetworkExplorerBase.
 * Used in both PersonRelationsExplorerPage and data inspector views.
 */

import React, { ReactNode, useCallback, useState, useMemo } from 'react';
import { NetworkExplorationResponse } from '@cbdb/core';
import NetworkGraphRenderer from './NetworkGraphRenderer';
import { NetworkStats } from './types';
import { GraphNode } from '@/render/components/visualization/NetworkGraph';
import { CBDBBlock, CBDBBlockContent, CBDBBlockHeader, CBDBBlockTitle } from '@/render/components/ui/cbdb-block';
import { Button } from '@/render/components/ui/button';
import { cn } from '@/render/lib/utils';
import { RefreshCw, Code2 } from 'lucide-react';

export interface NetworkVisualizationBlockProps {
  // Core data
  data?: NetworkExplorationResponse | null;
  loading?: boolean;
  error?: Error | null;

  // Block configuration - pass-through to CBDBBlock
  title?: string | ReactNode;  // Allow custom title content
  showBlock?: boolean; // If false, renders NetworkExplorerBase directly
  className?: string;
  blockClassName?: string; // Additional className for CBDBBlock
  headerClassName?: string; // Additional className for CBDBBlockHeader
  contentClassName?: string; // Additional className for CBDBBlockContent

  // Header controls
  showRefresh?: boolean; // Show refresh button
  showRawData?: boolean; // Show raw data button

  // Optional control panels (for additional custom controls)
  controlPanel?: ReactNode;
  statsPanel?: ReactNode;

  // Graph configuration
  height?: string;
  defaultLayout?: 'forceatlas2' | 'circular' | 'random';
  showLabels?: boolean;
  enableHover?: boolean;
  showGraphControls?: boolean; // Graph-specific controls (layout, zoom, etc)

  // Callbacks
  onNodeClick?: (node: GraphNode) => void;
  onNodeDoubleClick?: (node: GraphNode) => void;
  onStatsCalculated?: (stats: NetworkStats) => void;
  onRefresh?: () => void;
}

const NetworkVisualizationBlock: React.FC<NetworkVisualizationBlockProps> = ({
  data,
  loading = false,
  error = null,
  title = 'Network Visualization',
  showBlock = true,
  className,
  blockClassName,
  headerClassName,
  contentClassName,
  showRefresh = true,
  showRawData = false,
  controlPanel,
  statsPanel,
  height = '500px',
  defaultLayout = 'forceatlas2',
  showLabels = true,
  enableHover = true,
  showGraphControls = true,
  onNodeClick,
  onNodeDoubleClick,
  onStatsCalculated,
  onRefresh,
}) => {
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [showRawDataPanel, setShowRawDataPanel] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  }, [onRefresh]);

  const handleStatsCalculated = useCallback((stats: NetworkStats) => {
    setNetworkStats(stats);
    onStatsCalculated?.(stats);
  }, [onStatsCalculated]);

  // Must define all hooks before any conditional returns
  const layoutConfig = useMemo(() => ({
    forceatlas2: { duration: 6000 }
  }), []);

  // Header controls - simplified
  const headerControls = useMemo(() => {
    const hasButtons = showRefresh || showRawData;
    const hasStats = data && !loading;

    if (!hasButtons && !hasStats) return null;

    return (
      <div className="flex items-center gap-2">
        {hasButtons && (
          <div className="flex gap-1">
            {showRefresh && (
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing || !onRefresh}
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                title="Refresh"
              >
                <RefreshCw className={cn("w-3 h-3", isRefreshing && "animate-spin")} />
              </Button>
            )}
            {showRawData && (
              <Button
                onClick={() => setShowRawDataPanel(!showRawDataPanel)}
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                title={showRawDataPanel ? "Hide Data" : "Show Data"}
              >
                <Code2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}

        {hasButtons && hasStats && <div className="h-4 w-px bg-border" />}

        {hasStats && (
          <div className="flex gap-1 text-xs text-muted-foreground">
            <span>{data.graphData?.nodes?.length || 0} nodes</span>
            <span>·</span>
            <span>{data.graphData?.edges?.length || 0} edges</span>
          </div>
        )}
      </div>
    );
  }, [showRefresh, showRawData, data, loading, isRefreshing, onRefresh, handleRefresh, showRawDataPanel]);

  // Early return must be after all hooks
  if (!data && !loading) return null;

  // The graph renderer content - always the same regardless of wrapper
  const graphContent = (
    <NetworkGraphRenderer
      graphData={data?.graphData}
      loading={loading}
      error={error}
      height={height}
      defaultLayout={defaultLayout}
      layoutConfig={layoutConfig}
      nodeColorScheme="depth"
      showLabels={showLabels}
      enableHover={enableHover}
      showControls={showGraphControls}
      onNodeClick={onNodeClick}
      onNodeDoubleClick={onNodeDoubleClick}
      onStatsCalculated={handleStatsCalculated}
    />
  );

  // When showBlock=false, return just the graph content
  if (!showBlock) {
    return graphContent;
  }

  // When showBlock=true, wrap in CBDBBlock with pass-through props
  return (
    <>
      <CBDBBlock className={cn(blockClassName, className)}>
        <CBDBBlockHeader className={headerClassName}>
          <div className="flex items-center justify-between w-full">
            <CBDBBlockTitle>{title}</CBDBBlockTitle>
            {headerControls}
          </div>
        </CBDBBlockHeader>
        <CBDBBlockContent className={cn("p-0", contentClassName)}>
          {graphContent}
        </CBDBBlockContent>
      </CBDBBlock>

      {/* Raw Data Panel - simplified */}
      {showRawDataPanel && data && (
        <div className="fixed top-20 right-4 z-50 max-w-2xl max-h-[80vh]">
          <CBDBBlock className="shadow-2xl border-2">
            <CBDBBlockHeader className="pb-3">
              <CBDBBlockTitle className="text-sm flex items-center justify-between">
                Raw Network Data
                <Button
                  onClick={() => setShowRawDataPanel(false)}
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 -mr-2"
                >
                  <Code2 className="w-4 h-4" />
                </Button>
              </CBDBBlockTitle>
            </CBDBBlockHeader>
            <CBDBBlockContent className="max-h-[70vh] overflow-auto">
              <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </CBDBBlockContent>
          </CBDBBlock>
        </div>
      )}
    </>
  );
};

export default NetworkVisualizationBlock;