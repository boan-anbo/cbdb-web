/**
 * PersonNetworkView
 *
 * Inspector view that displays a person's network visualization.
 * Integrates with SelectionContext to show network for selected/active person.
 */

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Network } from 'lucide-react';
import { InspectorViewDefinition, InspectorViewComponentProps } from '../types';
import { useSelection } from '@/render/contexts/SelectionContext';
import NetworkVisualizationBlock from '@/render/components/domain/graph/NetworkVisualizationBlock';
import NetworkQueryControls from '@/render/components/domain/graph/NetworkQueryControls';
import { usePersonNetwork } from '@/render/hooks/graph/usePersonNetwork';
import { PersonSuggestionDataView, NetworkExplorationOptions } from '@cbdb/core';
import { GraphNode } from '@/render/components/visualization/NetworkGraph';
import { CBDBBlock, CBDBBlockContent, CBDBBlockHeader, CBDBBlockTitle } from '@/render/components/ui/cbdb-block';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

// Default person (Wang Anshi) when no selection
const DEFAULT_PERSON = new PersonSuggestionDataView({
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

const PersonNetworkInspectorView: React.FC<InspectorViewComponentProps> = ({ data, isActive }) => {
  const { selectedItems, lastSelectedId } = useSelection();
  const queryClient = useQueryClient();

  // Store the current person being displayed by this view
  const [displayedPerson, setDisplayedPerson] = useState<PersonSuggestionDataView>(DEFAULT_PERSON);

  // Network query options state
  const [networkOptions, setNetworkOptions] = useState<NetworkExplorationOptions>({
    depth: 2,
    includeKinship: true,
    includeAssociation: false,  // Default to kinship only for better performance
    includeOffice: false,
  });

  // Track what we've already processed to avoid duplicate updates
  const lastProcessedSelection = useRef<{ items: string; lastId: string | null }>({
    items: '',
    lastId: null
  });

  // Track if we were active in the previous render to detect activation transitions
  const wasActiveRef = useRef(isActive);

  // Helper to create PersonSuggestionDataView
  const createPersonView = (personData: any) => {
    if (!personData) return DEFAULT_PERSON;

    const id = personData.id || personData.c_personid;
    if (!id) return DEFAULT_PERSON;

    return new PersonSuggestionDataView({
      id,
      name: personData.name || personData.c_name || null,
      nameChn: personData.nameChn || personData.c_name_chn || null,
      birthYear: personData.birthYear || personData.c_birthyear || null,
      deathYear: personData.deathYear || personData.c_deathyear || null,
      indexYear: personData.indexYear || personData.c_index_year || null,
      dynastyCode: personData.dynastyCode || personData.c_dy || null,
      dynasty: personData.dynasty || personData.c_dynasty || null,
      dynastyChn: personData.dynastyChn || personData.c_dynasty_chn || null
    });
  };

  // Create a selection signature for comparison
  const currentSelectionSignature = useMemo(() => {
    const personSelections = selectedItems.filter(item => item.type === 'person');
    const itemsKey = personSelections.map(p => p.id).sort().join(',');
    return { items: itemsKey, lastId: lastSelectedId };
  }, [selectedItems, lastSelectedId]);

  // Update displayed person only when:
  // 1. This view is active
  // 2. The selection actually changed (not just becoming active)
  useEffect(() => {
    // Check if this is just becoming active (was inactive, now active)
    const justBecameActive = !wasActiveRef.current && isActive;

    // Update the ref for next render
    wasActiveRef.current = isActive;

    // If we just became active, don't update - keep showing what we had
    if (justBecameActive) {
      return;
    }

    // If we're not active, don't process changes
    if (!isActive) {
      return;
    }

    // Check if the selection actually changed
    const selectionChanged =
      currentSelectionSignature.items !== lastProcessedSelection.current.items ||
      currentSelectionSignature.lastId !== lastProcessedSelection.current.lastId;

    // If selection hasn't changed, don't update
    if (!selectionChanged) {
      return;
    }

    // Now we know: we're active AND selection changed while we were active
    try {
      const personSelections = selectedItems.filter(item => item.type === 'person');

      let person: PersonSuggestionDataView;
      if (personSelections.length === 0) {
        person = DEFAULT_PERSON;
      } else if (personSelections.length === 1) {
        person = createPersonView(personSelections[0].data);
      } else if (lastSelectedId) {
        const activeSelection = personSelections.find(item => item.id === lastSelectedId);
        person = activeSelection ? createPersonView(activeSelection.data) : createPersonView(personSelections[0].data);
      } else {
        person = createPersonView(personSelections[0].data);
      }

      setDisplayedPerson(person);
      lastProcessedSelection.current = currentSelectionSignature;
    } catch (error) {
      console.error('Error processing selection:', error);
    }
  }, [currentSelectionSignature, isActive, selectedItems, lastSelectedId]);

  // Fetch network data based on displayed person and options
  const { data: networkData, isLoading, error, refetch } = usePersonNetwork(
    displayedPerson?.id,
    networkOptions,
    !!displayedPerson
  );

  // Handle node click - could navigate or select that person
  const handleNodeClick = (node: GraphNode) => {
    const nodeIdStr = node.key.toString();
    const extractedId = nodeIdStr.includes(':')
      ? nodeIdStr.split(':')[1]
      : nodeIdStr;

    const nodePersonId = parseInt(extractedId);
    if (!isNaN(nodePersonId)) {
      toast.info(`Person #${nodePersonId} clicked. You could implement navigation or selection here.`);
    }
  };

  return (
    <div className="flex flex-col h-full gap-3" key={`network-${displayedPerson?.id}`}>
      {/* Query controls in a collapsible CBDB block */}
      <CBDBBlock className="flex-shrink-0" collapsible defaultCollapsed={true}>
        <CBDBBlockHeader>
          <CBDBBlockTitle className="text-xs">Network Control Options</CBDBBlockTitle>
        </CBDBBlockHeader>
        <CBDBBlockContent className="p-3">
          <NetworkQueryControls
            initialOptions={networkOptions}
            onChange={setNetworkOptions}
            showLabels={true}
            compact={true}
          />
        </CBDBBlockContent>
      </CBDBBlock>

      {/* Network visualization - takes up remaining height */}
      <div className="flex-1 min-h-0">
        <NetworkVisualizationBlock
          data={networkData}
          loading={isLoading}
          error={error as Error}
          title={`Network Visualization: ${displayedPerson?.nameChn || displayedPerson?.name || 'Unknown'}`}
          showBlock={true}
          height="100%"  // Use full available height
          blockClassName="h-full"  // Make the block take full height
          contentClassName="h-full"  // Make content take full height
          defaultLayout="forceatlas2"
          showLabels={true}
          enableHover={true}
          showGraphControls={true}
          showRefresh={true}
          showRawData={false}
          onRefresh={async () => {
            await queryClient.invalidateQueries({
              queryKey: ['person-network', displayedPerson?.id, networkOptions]
            });
            await refetch();
            toast.info('Refreshing network data...');
          }}
          onNodeClick={handleNodeClick}
        />
      </div>
    </div>
  );
};

// Self-contained inspector view definition
export const personNetworkInspectorViewDef: InspectorViewDefinition = {
  id: 'core.person-network',
  title: 'Person Network',
  icon: Network,
  component: PersonNetworkInspectorView,
  defaultOrder: 3,
  category: 'core',
  description: 'Interactive network visualization of person relationships'
};