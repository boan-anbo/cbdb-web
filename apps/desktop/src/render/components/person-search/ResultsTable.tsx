import React from 'react';
import { PersonModel } from '@cbdb/core';
import { Table, TableBody } from '@/render/components/ui/table';
import { toast } from 'sonner';
import { ResultsTableHeader } from './ResultsTableHeader';
import { ResultsTableRow } from './ResultsTableRow';
import { ResultsEmptyState } from './ResultsEmptyState';
import { useLocalSelection } from './useLocalSelection';
import { useSelection } from '@/render/contexts/SelectionContext';
import { personToSelectableItem } from '@/render/components/selector/integration/person/person-selector.adapter';

interface ResultsTableProps {
  results: PersonModel[];
  isLoading: boolean;
  multiSelectEnabled?: boolean;
  onViewDetails?: (person: PersonModel) => void;
}

export function ResultsTable({
  results,
  isLoading,
  multiSelectEnabled = false,
  onViewDetails,
}: ResultsTableProps) {
  const { select } = useSelection();

  const {
    allSelected,
    someSelected,
    handleSelectPerson,
    handleSelectAll,
    isPersonSelected,
    getSelectedPersons,
    clearSelection,
  } = useLocalSelection(results);

  const handleViewDetails = (person: PersonModel) => {
    if (onViewDetails) {
      onViewDetails(person);
    } else {
      // Default behavior if no handler provided
      toast.info(`View details for ${person.nameChn || person.name}`);
    }
  };

  const handlePersonClick = (person: PersonModel) => {
    if (!multiSelectEnabled) {
      // Single click to replace selector items
      const item = personToSelectableItem(person, 'search');
      select(item, 'replace');
    } else {
      // Multi-select mode - toggle selection
      handleSelectPerson(person, !isPersonSelected(person));
    }
  };

  if (results.length === 0) {
    return <ResultsEmptyState isLoading={isLoading} />;
  }

  return (
    <div className="space-y-2">
      <Table>
        {multiSelectEnabled && (
          <ResultsTableHeader
            allSelected={allSelected}
            someSelected={someSelected}
            onSelectAll={handleSelectAll}
          />
        )}
        <TableBody>
          {results.map((person) => (
            <ResultsTableRow
              key={person.id}
              person={person}
              selected={isPersonSelected(person)}
              onSelect={multiSelectEnabled ? handleSelectPerson : handlePersonClick}
              onViewDetails={handleViewDetails}
              showCheckbox={multiSelectEnabled}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}