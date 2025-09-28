import React from 'react';
import { Checkbox } from '@/render/components/ui/checkbox';
import {
  TableHead,
  TableHeader,
  TableRow,
} from '@/render/components/ui/table';

interface ResultsTableHeaderProps {
  allSelected: boolean;
  someSelected: boolean;
  onSelectAll: (checked: boolean) => void;
}

export function ResultsTableHeader({
  allSelected,
  someSelected,
  onSelectAll,
}: ResultsTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-12">
          <Checkbox
            checked={allSelected}
            indeterminate={!allSelected && someSelected}
            onCheckedChange={onSelectAll}
            aria-label="Select all"
          />
        </TableHead>
        <TableHead>Name (Chinese)</TableHead>
        <TableHead>Name (Pinyin)</TableHead>
        <TableHead>Dynasty</TableHead>
        <TableHead>Years</TableHead>
        <TableHead>Gender</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}