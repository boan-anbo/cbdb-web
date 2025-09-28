import React from 'react';
import { getDynastyName } from '@/render/constants/dynasties';
import type { SearchFilters } from '@/render/hooks/use-person-search';

interface ActiveFiltersProps {
  filters: SearchFilters;
}

export function ActiveFilters({ filters }: ActiveFiltersProps) {
  const { searchName, dynastyCode, yearFrom, yearTo, gender } = filters;
  const hasActiveFilters = searchName || dynastyCode !== 'all' || yearFrom || yearTo || gender !== 'all';

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="text-sm text-muted-foreground mt-2">
      Active filters:
      {searchName && (
        <span className="ml-2 px-2 py-0.5 bg-primary/10 rounded">
          Name: {searchName}
        </span>
      )}
      {dynastyCode !== 'all' && (
        <span className="ml-2 px-2 py-0.5 bg-primary/10 rounded">
          Dynasty: {getDynastyName(dynastyCode)}
        </span>
      )}
      {yearFrom && (
        <span className="ml-2 px-2 py-0.5 bg-primary/10 rounded">
          From: {yearFrom}
        </span>
      )}
      {yearTo && (
        <span className="ml-2 px-2 py-0.5 bg-primary/10 rounded">
          To: {yearTo}
        </span>
      )}
      {gender !== 'all' && (
        <span className="ml-2 px-2 py-0.5 bg-primary/10 rounded">
          Gender: {gender}
        </span>
      )}
    </div>
  );
}