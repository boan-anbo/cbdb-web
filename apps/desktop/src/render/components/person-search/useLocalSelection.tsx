import { useState, useCallback } from 'react';
import { PersonModel } from '@cbdb/core';

/**
 * Custom hook for managing local selection state in ResultsTable
 * This is completely independent from the global Selector state
 */
export function useLocalSelection(results: PersonModel[]) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Check if all results are selected
  const allSelected = results.length > 0 && results.every(person => selectedIds.has(person.id));

  // Check if some results are selected
  const someSelected = results.some(person => selectedIds.has(person.id));

  // Handle selecting/deselecting a single person
  const handleSelectPerson = useCallback((person: PersonModel, checked: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(person.id);
      } else {
        newSet.delete(person.id);
      }
      return newSet;
    });
  }, []);

  // Handle select all / deselect all
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(results.map(p => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [results]);

  // Check if a specific person is selected
  const isPersonSelected = useCallback((person: PersonModel) => {
    return selectedIds.has(person.id);
  }, [selectedIds]);

  // Get selected persons
  const getSelectedPersons = useCallback(() => {
    return results.filter(person => selectedIds.has(person.id));
  }, [results, selectedIds]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    allSelected,
    someSelected,
    selectedCount: selectedIds.size,
    handleSelectPerson,
    handleSelectAll,
    isPersonSelected,
    getSelectedPersons,
    clearSelection,
  };
}