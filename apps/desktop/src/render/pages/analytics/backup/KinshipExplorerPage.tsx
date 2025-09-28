/**
 * KinshipExplorerPage
 *
 * Specialized explorer for kinship/family relationships.
 * Part of the Tier 2 preset explorers approach.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useKinshipNetwork } from '@/render/hooks/graph/usePersonNetwork';
import NetworkExplorerBase from '@/render/components/domain/graph/NetworkExplorerBase';
import ExplorerControlPanel from '@/render/components/domain/graph/ExplorerControlPanel';
import NetworkStatsPanel from '@/render/components/domain/graph/NetworkStatsPanel';
import KinshipPresets from '@/render/components/domain/graph/presets/KinshipPresets';
import type { KinshipPresetOptions } from '@/render/components/domain/graph/presets/KinshipPresets';
import { NetworkNode, NetworkStats } from '@/render/components/visualization/NetworkGraph/NetworkGraph.types';
import { toast } from 'sonner';

const KinshipExplorerPage: React.FC = () => {
  // State
  const [personId, setPersonId] = useState<number>(1762); // Default to Wang Anshi
  const [depth, setDepth] = useState<number>(1);
  const [showAdvancedMode, setShowAdvancedMode] = useState(false);
  const [kinshipOptions, setKinshipOptions] = useState<KinshipPresetOptions>({
    preset: 'immediate-family',
    showMaternalLine: true,
    showPaternalLine: true,
    showMarriages: true,
    showAdoptions: true,
    generationsUp: 1,
    generationsDown: 1,
    emphasizeDirect: true
  });
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);

  // Fetch kinship network data
  const { data, isLoading, error } = useKinshipNetwork(
    personId,
    depth,
    !!personId
  );


  // Handle person search
  const handlePersonSearch = useCallback((newPersonId: number) => {
    setPersonId(newPersonId);
    toast.info(`Loading kinship network for person #${newPersonId}`);
  }, []);

  // Handle depth change
  const handleDepthChange = useCallback((newDepth: number) => {
    setDepth(newDepth);
  }, []);

  // Handle node click - navigate to that person's network
  const handleNodeClick = useCallback((node: NetworkNode) => {
    // Extract person ID from node ID (format might be "person:1762" or just "1762")
    const nodeIdStr = node.id.toString();
    const extractedId = nodeIdStr.includes(':')
      ? nodeIdStr.split(':')[1]
      : nodeIdStr;

    const newPersonId = parseInt(extractedId);
    if (!isNaN(newPersonId)) {
      setPersonId(newPersonId);
      toast.info(`Exploring kinship network for person #${newPersonId}`);
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
      depthLabels={['Immediate', 'Extended', 'Clan']}
      showAdvancedToggle={true}
      showStats={true}
      nodeCount={processedGraphData?.nodes?.length || 0}
      edgeCount={processedGraphData?.edges?.length || 0}
      onPersonSearch={handlePersonSearch}
      onDepthChange={handleDepthChange}
      onRefresh={() => {
        // Trigger refetch - the hook will handle it based on personId change
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
        // Add kinship-specific stats here if available
      }}
      variant="detailed"
    />
  );

  // Advanced panel with kinship presets
  const advancedPanel = (
    <KinshipPresets
      options={kinshipOptions}
      onChange={setKinshipOptions}
    />
  );

  // Layout configuration optimized for family trees
  const layoutConfig = useMemo(() => {
    if (kinshipOptions.groupByGeneration) {
      return {
        force: {
          iterations: 100,
          gravity: 1,
          scalingRatio: 20,
          barnesHutOptimize: true
        }
      };
    }

    return {
      force: {
        iterations: 80,
        gravity: 1,
        scalingRatio: 15,
        barnesHutOptimize: true
      }
    };
  }, [kinshipOptions]);

  return (
    <div className="container mx-auto p-6">
      <NetworkExplorerBase
        title="Kinship Network Explorer"
        description="Explore family relationships and genealogical connections in the CBDB database"
        graphData={processedGraphData}
        loading={isLoading}
        error={error as Error}
        controlPanel={controlPanel}
        statsPanel={statsPanel}
        advancedPanel={advancedPanel}
        showAdvancedMode={showAdvancedMode}
        onAdvancedModeToggle={setShowAdvancedMode}
        defaultLayout="force"
        layoutConfig={layoutConfig}
        height="600px"
        nodeColorScheme="custom"
        showLabels={true}
        enableHover={true}
        showControls={true}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={(node) => {
          // Open person detail in new tab/window
          console.log('Double clicked person:', node.id);
        }}
        onStatsCalculated={handleStatsCalculated}
      />
    </div>
  );
};

export default KinshipExplorerPage;