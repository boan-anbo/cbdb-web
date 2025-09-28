import React from 'react';
import { PersonModel } from '@cbdb/core';
import { Button } from '@/render/components/ui/button';
import { Plus } from 'lucide-react';
import { useSelection } from '@/render/contexts/SelectionContext';
import { personToSelectableItem } from '@/render/components/selector/integration';
import { toast } from 'sonner';

interface ResultsTableActionsProps {
  selectedPersons: PersonModel[];
  onClearSelection: () => void;
}

export function ResultsTableActions({ selectedPersons, onClearSelection }: ResultsTableActionsProps) {
  const { select } = useSelection();

  const handleAddToSelector = () => {
    if (selectedPersons.length === 0) {
      toast.warning('No items selected');
      return;
    }

    const items = selectedPersons.map(person =>
      personToSelectableItem(person, 'search')
    );

    select(items, 'toggle');
    onClearSelection();

    toast.success(`Added ${selectedPersons.length} item${selectedPersons.length > 1 ? 's' : ''} to selector`);
  };

  if (selectedPersons.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
      <span className="text-sm text-muted-foreground">
        {selectedPersons.length} selected
      </span>
      <Button
        size="sm"
        variant="secondary"
        onClick={handleAddToSelector}
        className="ml-auto"
      >
        <Plus className="w-4 h-4 mr-1" />
        Add to Selector
      </Button>
    </div>
  );
}