import React from 'react';
import { PersonModel } from '@cbdb/core';
import { Button } from '@/render/components/ui/button';
import { Checkbox } from '@/render/components/ui/checkbox';
import { TableCell, TableRow } from '@/render/components/ui/table';

interface ResultsTableRowProps {
  person: PersonModel;
  selected: boolean;
  onSelect: (person: PersonModel, checked?: boolean) => void;
  onViewDetails: (person: PersonModel) => void;
  showCheckbox?: boolean;
}

export function ResultsTableRow({
  person,
  selected,
  onSelect,
  onViewDetails,
  showCheckbox = true,
}: ResultsTableRowProps) {
  const handleRowClick = (e: React.MouseEvent) => {
    // Don't select if clicking on button or checkbox
    const target = e.target as HTMLElement;
    if (target.closest('button') || (showCheckbox && target.closest('[role="checkbox"]'))) {
      return;
    }

    if (showCheckbox) {
      // Multi-select mode - toggle selection
      onSelect(person, !selected);
    } else {
      // Single-select mode - replace selection
      onSelect(person);
    }
  };

  const formatYears = () => {
    const birth = person.birthYear;
    const death = person.deathYear;

    if (birth && death) return `${birth}-${death}`;
    if (birth) return `Born ${birth}`;
    if (death) return `Died ${death}`;
    return 'Unknown';
  };

  return (
    <TableRow
      className={`cursor-pointer transition-colors ${
        selected && showCheckbox ? 'bg-muted/50' : 'hover:bg-muted/30'
      }`}
      onClick={handleRowClick}
    >
      {showCheckbox && (
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onSelect(person, checked as boolean)}
            aria-label={`Select ${person.nameChn || person.name}`}
          />
        </TableCell>
      )}
      <TableCell className="font-medium">
        {person.nameChn || person.name || 'Unknown'}
      </TableCell>
      <TableCell>{person.name || '-'}</TableCell>
      <TableCell>{person.dynastyNameChn || person.dynastyName || '-'}</TableCell>
      <TableCell>{formatYears()}</TableCell>
      <TableCell>{person.female ? 'Female' : 'Male'}</TableCell>
      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(person)}
        >
          View Details
        </Button>
      </TableCell>
    </TableRow>
  );
}