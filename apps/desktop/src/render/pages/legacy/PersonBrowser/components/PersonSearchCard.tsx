import React from 'react';
import {
  CBDBBlock,
  CBDBBlockContent,
  CBDBBlockHeader,
  CBDBBlockTitle,
} from '@/render/components/ui/cbdb-block';
import { PersonAutocomplete } from '@/render/components/person-autocomplete';
import { PersonSuggestionDataView } from '@cbdb/core';

interface PersonSearchCardProps {
  selectedPerson: PersonSuggestionDataView | null;
  onPersonSelect: (person: PersonSuggestionDataView | null) => void;
}

export function PersonSearchCard({
  selectedPerson,
  onPersonSelect,
}: PersonSearchCardProps) {
  return (
    <CBDBBlock className="w-full">
      <CBDBBlockHeader>
        <CBDBBlockTitle>Person Search (人物搜索)</CBDBBlockTitle>
      </CBDBBlockHeader>
      <CBDBBlockContent>
        <div className="space-y-2">
          <PersonAutocomplete
            value={selectedPerson}
            onSelect={onPersonSelect}
            placeholder="Search for a person by name..."
            enableHistory={true}
            updateSelectorOnSelect={true}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Start typing to search for historical figures. Try: 王安石 (Wang Anshi), 蘇軾 (Su Shi), or any other name
          </p>
        </div>
      </CBDBBlockContent>
    </CBDBBlock>
  );
}