/**
 * PersonRelationsExplorerPage
 *
 * Unified explorer for all person relationships (kinship, associations, offices).
 * Uses the Person domain's network exploration endpoint.
 */

import React, { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import NetworkVisualizationBlock from '@/render/components/domain/graph/NetworkVisualizationBlock';
import NetworkQueryControls from '@/render/components/domain/graph/NetworkQueryControls';
import { usePersonNetwork } from '@/render/hooks/graph/usePersonNetwork';
import { GraphNode, PersonSuggestionDataView, NetworkExplorationOptions } from '@cbdb/core';
import { NetworkStats } from '@/render/components/domain/graph/types';
import { CBDBPage, CBDBPageHeader, CBDBPageTitle, CBDBPageDescription, CBDBPageContent } from '@/render/components/ui/cbdb-page';
import { CBDBBlock, CBDBBlockContent, CBDBBlockHeader, CBDBBlockTitle } from '@/render/components/ui/cbdb-block';
import { PersonAutocomplete } from '@/render/components/person-autocomplete';
import { Label } from '@/render/components/ui/label';
import { GitBranch } from 'lucide-react';
import { toast } from 'sonner';

const PersonRelationsExplorerPage: React.FC = () => {
  // State
  const [selectedPerson, setSelectedPerson] = useState<PersonSuggestionDataView | null>(() => {
    // Default to Wang Anshi
    return new PersonSuggestionDataView({
      id: 1762,
      name: 'Wang Anshi',
      nameChn: '王安石',
      birthYear: null,
      deathYear: null,
      indexYear: null,
      dynastyCode: null,
      dynasty: null,
      dynastyChn: null
    });
  });
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [networkOptions, setNetworkOptions] = useState<NetworkExplorationOptions>({
    depth: 2,
    includeKinship: true,
    includeAssociation: false,
    includeOffice: false,
  });

  const queryClient = useQueryClient();

  // Fetch network data using the composed query
  const { data, isLoading, error, refetch } = usePersonNetwork(
    selectedPerson?.id,
    networkOptions,
    !!selectedPerson
  );

  // Handle person selection from PersonAutocomplete
  const handlePersonSelect = useCallback((person: PersonSuggestionDataView | null) => {
    setSelectedPerson(person);
    // Removed loading toast - the loading state is already shown in the UI
  }, []);

  // Handle node click - navigate to that person's network
  const handleNodeClick = useCallback((node: GraphNode) => {
    const nodeIdStr = node.key.toString();
    const extractedId = nodeIdStr.includes(':')
      ? nodeIdStr.split(':')[1]
      : nodeIdStr;

    const newPersonId = parseInt(extractedId);
    if (!isNaN(newPersonId)) {
      // Create a minimal PersonSuggestionDataView for the clicked node
      // We only have the ID, but that's all we need for network exploration
      const newPerson = new PersonSuggestionDataView({
        id: newPersonId,
        name: null,
        nameChn: null,
        birthYear: null,
        deathYear: null,
        indexYear: null,
        dynastyCode: null,
        dynasty: null,
        dynastyChn: null
      });
      setSelectedPerson(newPerson);
      toast.info(`Exploring network for person #${newPersonId}`);
    }
  }, []);

  // Handle stats calculation
  const handleStatsCalculated = useCallback((stats: NetworkStats) => {
    setNetworkStats(stats);
  }, []);

  // No longer need controlPanel variable - will compose directly in JSX

  // Stats panel - optional, NetworkVisualizationBlock handles default display
  const statsPanel = networkStats && (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-2xl font-bold">{networkStats.nodeCount}</div>
          <p className="text-sm text-muted-foreground">Total Nodes</p>
        </div>
        <div>
          <div className="text-2xl font-bold">{networkStats.edgeCount}</div>
          <p className="text-sm text-muted-foreground">Total Edges</p>
        </div>
        {networkStats.density !== undefined && (
          <div>
            <div className="text-2xl font-bold">{networkStats.density.toFixed(3)}</div>
            <p className="text-sm text-muted-foreground">Network Density</p>
          </div>
        )}
        {networkStats.avgDegree !== undefined && (
          <div>
            <div className="text-2xl font-bold">{networkStats.avgDegree.toFixed(1)}</div>
            <p className="text-sm text-muted-foreground">Avg. Connections</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <CBDBPage>
      <CBDBPageHeader>
        <CBDBPageTitle className="flex items-center gap-3">
          <GitBranch className="h-6 w-6" />
          Person Relations Explorer
        </CBDBPageTitle>
        <CBDBPageDescription>
          Explore all types of relationships - kinship, associations, and offices - in the CBDB database
        </CBDBPageDescription>
      </CBDBPageHeader>

      <CBDBPageContent className="space-y-4">
        {/* Controls Block - using children composition */}
        <CBDBBlock>
          <CBDBBlockHeader>
            <CBDBBlockTitle>Search & Filters</CBDBBlockTitle>
          </CBDBBlockHeader>
          <CBDBBlockContent>
            <div className="space-y-4">
              {/* Person selector */}
              <div className="flex gap-2 items-end">
                <div className="relative z-50" style={{ width: '300px' }}>
                  <Label htmlFor="person-search" className="text-xs mb-1 block">Select Person</Label>
                  <PersonAutocomplete
                    value={selectedPerson}
                    onSelect={handlePersonSelect}
                    placeholder="Search and select a person..."
                    className="h-9"
                    enableHistory={true}
                    updateSelectorOnSelect={true}
                  />
                </div>
              </div>

              {/* Network query controls */}
              <NetworkQueryControls
                initialOptions={networkOptions}
                onChange={setNetworkOptions}
                showLabels={true}
                compact={false}
              />
            </div>
          </CBDBBlockContent>
        </CBDBBlock>

        {/* Network Visualization Block */}
        <NetworkVisualizationBlock
          data={data}
          loading={isLoading}
          error={error as Error}
          title="Network Visualization"
          showBlock={true}
          height="600px"
          defaultLayout="forceatlas2"
          showLabels={true}
          enableHover={true}
          showGraphControls={true}
          showRefresh={true}
          showRawData={true}
          onRefresh={async () => {
            await queryClient.invalidateQueries({
              queryKey: ['person-network', selectedPerson?.id, networkOptions]
            });
            await refetch();
            toast.info('Refreshing network data...');
          }}
          onNodeClick={handleNodeClick}
          onNodeDoubleClick={(node) => {
            console.log('Double clicked person:', node.key);
          }}
          onStatsCalculated={handleStatsCalculated}
        />
      </CBDBPageContent>
    </CBDBPage>
  );
};

export default PersonRelationsExplorerPage;