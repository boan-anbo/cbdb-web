import React from 'react';
import {
  CBDBPage,
  CBDBPageHeader,
  CBDBPageTitle,
  CBDBPageDescription,
  CBDBPageContent,
} from '@/render/components/ui/cbdb-page';
import { Archive } from 'lucide-react';
import {
  CBDBBlock,
  CBDBBlockContent,
  CBDBBlockHeader,
  CBDBBlockTitle,
} from '@/render/components/ui/cbdb-block';
import { Alert, AlertDescription } from '@/render/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { usePersonBrowser } from './hooks/usePersonBrowser';
import { PersonSearchCard } from './components/PersonSearchCard';
import { PersonNotesCard } from './components/PersonNotesCard';
import { PersonDetailsTabs } from './components/PersonDetailsTabs';

/**
 * PersonBrowser - Legacy Access interface replication
 * Replicates the Person Browser form from Microsoft Access CBDB
 *
 * This component manages:
 * - Person search/selection using PersonAutocomplete
 * - Tab navigation for different person information views
 * - Loading and error states
 *
 * Each tab component manages its own data fetching and display
 */
const PersonBrowser: React.FC = () => {
  const {
    selectedPerson,
    fullPersonData,
    isLoadingPerson,
    error,
    selectedPersonName,
    handlePersonSelect,
  } = usePersonBrowser();

  return (
    <CBDBPage>
      <CBDBPageHeader>
        <CBDBPageTitle className="flex items-center gap-3">
          <Archive className="h-6 w-6" />
          Person Browser
        </CBDBPageTitle>
        <CBDBPageDescription>
          Browse and explore detailed information about historical figures in the CBDB database
        </CBDBPageDescription>
      </CBDBPageHeader>

      <CBDBPageContent>
        {/* Search Section */}
        <PersonSearchCard
          selectedPerson={selectedPerson}
          onPersonSelect={handlePersonSelect}
        />

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Person Notes */}
        {selectedPerson && (
          <PersonNotesCard
            fullPersonData={fullPersonData}
            isLoadingPerson={isLoadingPerson}
          />
        )}

        {/* Main Browser Content */}
        <CBDBBlock className="w-full">
          <CBDBBlockHeader>
            <CBDBBlockTitle className="flex items-center gap-2">
              Person Details
              {selectedPersonName && ` - ${selectedPersonName}`}
              {isLoadingPerson && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </CBDBBlockTitle>
          </CBDBBlockHeader>
          <CBDBBlockContent className="h-full">
            {!selectedPerson ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p>Select a person from the search above to view their details</p>
              </div>
            ) : (
              <PersonDetailsTabs selectedPerson={selectedPerson} />
            )}
          </CBDBBlockContent>
        </CBDBBlock>
      </CBDBPageContent>
    </CBDBPage>
  );
};

export default PersonBrowser;