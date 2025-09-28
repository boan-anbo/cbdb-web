/**
 * PersonDetailView
 *
 * Comprehensive inspector view that displays all person information
 * matching the Harvard API data structure with complete field coverage.
 */

import React, { useEffect, useRef, useState } from 'react';
import { User, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/render/components/ui/alert';
import { Skeleton } from '@/render/components/ui/skeleton';
import {
  CBDBBlock,
  CBDBBlockContent,
  CBDBBlockHeader,
} from '@/render/components/ui/cbdb-block';
import { ScrollArea } from '@/render/components/ui/scroll-area';
import { useSelection } from '@/render/contexts/SelectionContext';
import { usePersonDetail } from '@/render/hooks/usePersonDetail';
import { useQueryClient } from '@tanstack/react-query';
import { InspectorViewComponentProps, InspectorViewDefinition } from '../types';
import {
  PersonalInfoBlock,
  AddressesBlock,
  KinshipRelationsBlock,
  OfficialInfoBlock,
  SocialLiteraryBlock,
  StatisticsBlock,
} from './person-detail-blocks';

// Default person when no selection
const DEFAULT_PERSON_ID = 1762; // Wang Anshi

const PersonDetailInspectorView: React.FC<InspectorViewComponentProps> = ({
  data,
  isActive,
}) => {
  const { selectedItems, lastSelectedId } = useSelection();
  const queryClient = useQueryClient();

  // Track the current person being displayed
  const [displayedPersonId, setDisplayedPersonId] = useState<
    number | undefined
  >(DEFAULT_PERSON_ID);

  // Track what we've already processed to avoid duplicate updates
  const lastProcessedSelection = useRef<{
    items: string;
    lastId: string | null;
  }>({
    items: '',
    lastId: null,
  });

  // Track if we were active in the previous render
  const wasActiveRef = useRef(isActive);

  // Create a selection signature for comparison
  const currentSelectionSignature = React.useMemo(() => {
    const personSelections = selectedItems.filter(
      (item) => item.type === 'person',
    );
    const itemsKey = personSelections
      .map((p) => p.id)
      .sort()
      .join(',');
    return { items: itemsKey, lastId: lastSelectedId };
  }, [selectedItems, lastSelectedId]);

  // Update displayed person only when selection changes while active
  useEffect(() => {
    // Check if this is just becoming active
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
      currentSelectionSignature.items !==
        lastProcessedSelection.current.items ||
      currentSelectionSignature.lastId !==
        lastProcessedSelection.current.lastId;

    // If selection hasn't changed, don't update
    if (!selectionChanged) {
      return;
    }

    // Now we know: we're active AND selection changed while we were active
    try {
      const personSelections = selectedItems.filter(
        (item) => item.type === 'person',
      );

      let personId: number | undefined;
      if (personSelections.length === 0) {
        personId = DEFAULT_PERSON_ID;
      } else if (personSelections.length === 1) {
        const personData = personSelections[0].data;
        personId = personData?.id || personData?.c_personid;
      } else if (lastSelectedId) {
        const activeSelection = personSelections.find(
          (item) => item.id === lastSelectedId,
        );
        if (activeSelection) {
          const personData = activeSelection.data;
          personId = personData?.id || personData?.c_personid;
        } else {
          const personData = personSelections[0].data;
          personId = personData?.id || personData?.c_personid;
        }
      } else {
        const personData = personSelections[0].data;
        personId = personData?.id || personData?.c_personid;
      }

      setDisplayedPersonId(personId);
      lastProcessedSelection.current = currentSelectionSignature;
    } catch (error) {
      console.error('Error processing selection:', error);
    }
  }, [currentSelectionSignature, isActive, selectedItems, lastSelectedId]);

  // Fetch person detail data
  const {
    data: detailResponse,
    isLoading,
    error,
    refetch,
  } = usePersonDetail(displayedPersonId);

  const personDetail = detailResponse?.result;

  // Refresh handler
  const handleRefresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['person-detail', displayedPersonId],
    });
    await refetch();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-3">
        <CBDBBlock>
          <CBDBBlockHeader>
            <Skeleton className="h-6 w-32" />
          </CBDBBlockHeader>
          <CBDBBlockContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CBDBBlockContent>
        </CBDBBlock>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-3">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load person details:{' '}
            {error instanceof Error ? error.message : 'Unknown error'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No data state
  if (!personDetail) {
    return (
      <div className="p-3">
        <Alert>
          <AlertDescription>
            No person details available. Select a person to view their
            information.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const {
    person,
    kinships,
    associations,
    offices,
    addresses,
    entries,
    statuses,
    texts,
    events,
    alternativeNames,
    stats,
  } = personDetail;

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-3 p-3">
        <PersonalInfoBlock
          person={person}
          alternativeNames={alternativeNames}
          events={events}
          statuses={statuses}
          onRefresh={handleRefresh}
        />

        <AddressesBlock addresses={addresses} />

        <KinshipRelationsBlock kinships={kinships} />

        <OfficialInfoBlock offices={offices} entries={entries} />

        <SocialLiteraryBlock associations={associations} texts={texts} />

        <StatisticsBlock stats={stats} />
      </div>
    </ScrollArea>
  );
};

// Self-contained inspector view definition
export const personDetailInspectorViewDef: InspectorViewDefinition = {
  id: 'core.person-detail',
  title: 'Person Details',
  icon: User,
  component: PersonDetailInspectorView,
  defaultOrder: 2,
  category: 'core',
  description:
    'Comprehensive view of all person information and relations matching Harvard API structure',
};
