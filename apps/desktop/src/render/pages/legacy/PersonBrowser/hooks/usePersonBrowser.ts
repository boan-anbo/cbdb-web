import { useState, useCallback, useEffect } from 'react';
import { useApiClient } from '@/render/providers/ApiClientProvider';
import { PersonSuggestionDataView, PersonModel, cbdbClientManager } from '@cbdb/core';

/**
 * Custom hook for managing PersonBrowser state and logic
 */
export function usePersonBrowser() {
  const client = useApiClient();

  // Default to Wang Anshi (王安石)
  const [selectedPerson, setSelectedPerson] = useState<PersonSuggestionDataView | null>(() => {
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
  const [fullPersonData, setFullPersonData] = useState<PersonModel | null>(null);
  const [isLoadingPerson, setIsLoadingPerson] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle person selection from autocomplete
   */
  const handlePersonSelect = useCallback((person: PersonSuggestionDataView | null) => {
    setSelectedPerson(person);
    setFullPersonData(null); // Reset full data when selection changes
    setError(null);
  }, []);

  /**
   * Load full person data when a person is selected
   */
  useEffect(() => {
    if (!selectedPerson) {
      setFullPersonData(null);
      return;
    }

    const loadFullPersonData = async () => {
      setIsLoadingPerson(true);
      setError(null);

      try {
        const result = await client.person.getById(selectedPerson.id);

        if (result) {
          setFullPersonData(result);
        } else {
          setError(`Person with ID ${selectedPerson.id} not found`);
        }
      } catch (err) {
        console.error('Failed to load person data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load person data');
      } finally {
        setIsLoadingPerson(false);
      }
    };

    loadFullPersonData();
  }, [selectedPerson, client]);

  /**
   * Format person display name for the header
   */
  const formatPersonName = useCallback((person: PersonSuggestionDataView): string => {
    const parts: string[] = [];

    if (person.nameChn) {
      parts.push(person.nameChn);
    }
    if (person.name) {
      parts.push(`(${person.name})`);
    }

    if (parts.length === 0) {
      return `Person ${person.id}`;
    }

    return parts.join(' ');
  }, []);

  /**
   * Get display name for the currently selected person
   */
  const selectedPersonName = selectedPerson ? formatPersonName(selectedPerson) : null;

  return {
    // State
    selectedPerson,
    fullPersonData,
    isLoadingPerson,
    error,
    selectedPersonName,

    // Actions
    handlePersonSelect,
    formatPersonName,
  };
}