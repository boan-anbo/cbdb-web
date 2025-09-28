/**
 * AssociationExplorerPage
 *
 * Specialized explorer for professional and social associations.
 * Part of the Tier 2 preset explorers approach.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useAssociationNetwork } from '@/render/hooks/graph/usePersonNetwork';
import NetworkExplorerBase from '@/render/components/domain/graph/NetworkExplorerBase';
import ExplorerControlPanel from '@/render/components/domain/graph/ExplorerControlPanel';
import NetworkStatsPanel from '@/render/components/domain/graph/NetworkStatsPanel';
import LayoutControls from '@/render/components/domain/graph/LayoutControls';
import { NetworkNode, NetworkStats, LayoutType, LayoutConfig } from '@/render/components/visualization/NetworkGraph/NetworkGraph.types';
import { toast } from 'sonner';

interface AssociationOptions {
  showPolitical: boolean;
  showAcademic: boolean;
  showMilitary: boolean;
  showReligious: boolean;
  includeReciprocal: boolean;
}

const AssociationExplorerPage: React.FC = () => {
  // State
  const [personId, setPersonId] = useState<number>(1762); // Default to Wang Anshi
  const [depth, setDepth] = useState<number>(1);
  const [showAdvancedMode, setShowAdvancedMode] = useState(false);
  const [associationOptions, setAssociationOptions] = useState<AssociationOptions>({
    showPolitical: true,
    showAcademic: true,
    showMilitary: true,
    showReligious: true,
    includeReciprocal: true
  });
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('force');
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
    force: {
      gravity: 1.5,
      scalingRatio: 25,
      iterations: 100,
      barnesHutOptimize: true
    }
  });

  // Fetch association network data
  const { data, isLoading, error } = useAssociationNetwork(
    personId,
    {
      depth,
      includeReciprocal: associationOptions.includeReciprocal
    },
    !!personId
  );

  // Handle person search
  const handlePersonSearch = useCallback((newPersonId: number) => {
    setPersonId(newPersonId);
    toast.info(`Loading association network for person #${newPersonId}`);
  }, []);

  // Handle depth change
  const handleDepthChange = useCallback((newDepth: number) => {
    setDepth(newDepth);
  }, []);

  // Handle node click - navigate to that person's network
  const handleNodeClick = useCallback((node: NetworkNode) => {
    const nodeIdStr = node.id.toString();
    const extractedId = nodeIdStr.includes(':')
      ? nodeIdStr.split(':')[1]
      : nodeIdStr;

    const newPersonId = parseInt(extractedId);
    if (!isNaN(newPersonId)) {
      setPersonId(newPersonId);
      toast.info(`Exploring association network for person #${newPersonId}`);
    }
  }, []);

  // Handle stats calculation
  const handleStatsCalculated = useCallback((stats: NetworkStats) => {
    setNetworkStats(stats);
  }, []);

  // Use data directly from API - backend now sends proper format
  const processedGraphData = data || null;

  // Control panel
  const controlPanel = (
    <ExplorerControlPanel
      personId={personId}
      depth={depth}
      loading={isLoading}
      maxDepth={3}
      depthLabels={['Direct', 'Secondary', 'Extended']}
      showAdvancedToggle={true}
      showStats={true}
      nodeCount={processedGraphData?.nodes?.length || 0}
      edgeCount={processedGraphData?.edges?.length || 0}
      onPersonSearch={handlePersonSearch}
      onDepthChange={handleDepthChange}
      onRefresh={() => {
        toast.info('Refreshing network...');
      }}
      onAdvancedToggle={setShowAdvancedMode}
    />
  );

  // Stats panel
  const statsPanel = networkStats && (
    <NetworkStatsPanel
      stats={networkStats}
      additionalStats={{
        // Add association-specific stats here if available
      }}
      variant="detailed"
    />
  );

  // Advanced panel with association filters and layout controls
  const advancedPanel = (
    <div className="space-y-6">
      {/* Layout Controls */}
      <LayoutControls
        currentLayout={currentLayout}
        layoutConfig={layoutConfig}
        onLayoutChange={setCurrentLayout}
        onConfigChange={setLayoutConfig}
        disabled={isLoading}
      />

      {/* Association Filters */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium">Association Types</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={associationOptions.showPolitical}
              onChange={(e) => setAssociationOptions({
                ...associationOptions,
                showPolitical: e.target.checked
              })}
              className="mr-2"
            />
            Political Associations
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={associationOptions.showAcademic}
              onChange={(e) => setAssociationOptions({
                ...associationOptions,
                showAcademic: e.target.checked
              })}
              className="mr-2"
            />
            Academic Associations
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={associationOptions.showMilitary}
              onChange={(e) => setAssociationOptions({
                ...associationOptions,
                showMilitary: e.target.checked
              })}
              className="mr-2"
            />
            Military Associations
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={associationOptions.showReligious}
              onChange={(e) => setAssociationOptions({
                ...associationOptions,
                showReligious: e.target.checked
              })}
              className="mr-2"
            />
            Religious Associations
          </label>
        </div>
        <hr />
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={associationOptions.includeReciprocal}
            onChange={(e) => setAssociationOptions({
              ...associationOptions,
              includeReciprocal: e.target.checked
            })}
            className="mr-2"
          />
          Highlight Reciprocal Relationships
        </label>
      </div>
    </div>
  );


  return (
    <div className="container mx-auto p-6">
      <NetworkExplorerBase
        title="Association Network Explorer"
        description="Explore professional and social associations in the CBDB database"
        graphData={processedGraphData}
        loading={isLoading}
        error={error as Error}
        controlPanel={controlPanel}
        statsPanel={statsPanel}
        advancedPanel={advancedPanel}
        showAdvancedMode={showAdvancedMode}
        onAdvancedModeToggle={setShowAdvancedMode}
        defaultLayout={currentLayout}
        layoutConfig={layoutConfig}
        height="600px"
        nodeColorScheme="custom"
        showLabels={true}
        enableHover={true}
        showControls={true}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={(node) => {
          console.log('Double clicked person:', node.id);
        }}
        onStatsCalculated={handleStatsCalculated}
      />
    </div>
  );
};

export default AssociationExplorerPage;