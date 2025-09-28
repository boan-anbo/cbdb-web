import { useApiClient } from '@/render/providers/ApiClientProvider';
import React, { useCallback, useState, useMemo } from 'react';
import { PersonSuggestionDataView, cbdbClientManager } from '@cbdb/core';
import { User, Info } from 'lucide-react';
import { AsyncCombobox, AsyncComboboxOption } from '@/render/components/ui/async-combobox';
import { cn } from '@/render/lib/utils';
import { useSelection } from '@/render/contexts/SelectionContext';
import { personToSelectableItem } from '@/render/components/selector/integration/person/person-selector.adapter';
import { Switch } from '@/render/components/ui/switch';

interface PersonAutocompleteProps {
  value?: PersonSuggestionDataView | null;
  onSelect?: (person: PersonSuggestionDataView | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowCustomValue?: boolean;
  enableHistory?: boolean;
  updateSelectorOnSelect?: boolean;
}

// Convert PersonSuggestionDataView to AsyncComboboxOption
function suggestionToOption(suggestion: PersonSuggestionDataView): AsyncComboboxOption<PersonSuggestionDataView> {
  const label = formatSuggestionLabel(suggestion);
  return {
    value: suggestion.id.toString(),
    label,
    data: suggestion
  };
}

// Format display label for a suggestion
function formatSuggestionLabel(suggestion: PersonSuggestionDataView): string {
  const parts: string[] = [];

  // Name parts
  if (suggestion.nameChn) {
    parts.push(suggestion.nameChn);
  }
  if (suggestion.name) {
    parts.push(suggestion.nameChn ? `(${suggestion.name})` : suggestion.name);
  }

  // Add dynasty and year if available
  const metadata: string[] = [];
  // Use dynastyChn if available, fallback to dynasty
  if (suggestion.dynastyChn || suggestion.dynasty) {
    metadata.push(suggestion.dynastyChn || suggestion.dynasty);
  }
  if (suggestion.indexYear) metadata.push(suggestion.indexYear.toString());

  if (metadata.length > 0) {
    parts.push(`· ${metadata.join(' · ')}`);
  }

  // Add ID in square brackets at the end
  parts.push(`[${suggestion.id}]`);

  return parts.join(' ') || `Person ${suggestion.id}`;
}

export function PersonAutocomplete({
  value,
  onSelect,
  placeholder = "Select a person...",
  className,
  disabled = false,
  allowCustomValue = false,
  enableHistory = false,
  updateSelectorOnSelect: initialUpdateSelector = false
}: PersonAutocompleteProps) {
  const client = useApiClient();
  const { select } = useSelection();

  // State for controlling global selector update
  const [updateSelectorOnSelect, setUpdateSelectorOnSelect] = useState(initialUpdateSelector);

  // Convert value to string ID for AsyncCombobox
  const comboboxValue = value?.id?.toString();

  // Create initial options from the value
  const initialOptions = useMemo(() => {
    if (!value) return [];
    return [suggestionToOption(value)];
  }, [value]);

  // Load person suggestions - returns PersonSuggestionDataView
  const loadOptions = useCallback(async (query: string): Promise<AsyncComboboxOption<PersonSuggestionDataView>[]> => {
    if (!query || query.length < 1) {
      return [];
    }

    try {
      
      const result = await client.person.suggestions({
        query,
        limit: 199,  // Maximum safe limit (below server max of 200)
        sortByImportance: true
      });

      const suggestions = result.suggestions || [];
      // Suggestions are already PersonSuggestionDataView from the server
      return suggestions.map(suggestionToOption);
    } catch (error) {
      console.error('Failed to load person suggestions:', error);
      return [];
    }
  }, []);

  // Handle value change from AsyncCombobox
  const handleValueChange = useCallback(async (newValue: string | undefined, option?: AsyncComboboxOption<PersonSuggestionDataView>) => {
    if (option?.data) {
      // Selected from dropdown - emit the PersonSuggestionDataView
      onSelect?.(option.data);

      // If updateSelectorOnSelect is enabled, also update the global selector
      if (updateSelectorOnSelect) {
        try {
          // Fetch the full PersonModel
          const personModel = await client.person.getById(option.data.id);

          // Convert to SelectableItem and update the selector
          const selectableItem = personToSelectableItem(personModel, 'autocomplete');
          select(selectableItem, 'replace');
        } catch (error) {
          console.error('Failed to update selector with selected person:', error);
        }
      }
    } else if (!newValue) {
      // Cleared
      onSelect?.(null);
    } else if (allowCustomValue) {
      // Custom value entered (if allowed)
      // For now, we just clear since we can't create a suggestion from a string
      // In the future, this could trigger a different callback for custom input
      onSelect?.(null);
    }
  }, [onSelect, allowCustomValue, updateSelectorOnSelect, client, select]);

  return (
    <div className="space-y-1">
      <AsyncCombobox<PersonSuggestionDataView>
        value={comboboxValue}
        onValueChange={handleValueChange}
        loadOptions={loadOptions}
        initialOptions={initialOptions}
        placeholder={placeholder}
        searchPlaceholder="Search for a person..."
        emptyText="No person found."
        loadingText="Searching..."
        noResultsText="No person found."
        typeToSearchText="Type to search..."
        minSearchLength={1}
        debounceMs={300}
        disabled={disabled}
        allowCustomValue={allowCustomValue}
        enableHistory={enableHistory}
        historyKey={enableHistory ? "cbdb-person-autocomplete-history" : undefined}
        maxHistoryItems={10}
        recentSearchesLabel="Recently selected"
        className={cn("min-w-[400px]", className)}
      />
      {initialUpdateSelector && (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Switch
            checked={updateSelectorOnSelect}
            onCheckedChange={setUpdateSelectorOnSelect}
            className="h-4 scale-75"
            aria-label="Toggle global selector update"
          />
          <span>
            {updateSelectorOnSelect
              ? "Selection will update the app's global selector"
              : "Selection will not update the app's global selector"}
          </span>
        </div>
      )}
    </div>
  );
}