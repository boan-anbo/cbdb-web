import React from 'react';
import { Loader2 } from 'lucide-react';

interface ResultsEmptyStateProps {
  isLoading: boolean;
}

export function ResultsEmptyState({ isLoading }: ResultsEmptyStateProps) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Searching...</span>
        </div>
      ) : (
        'Use the search form above to find historical figures'
      )}
    </div>
  );
}