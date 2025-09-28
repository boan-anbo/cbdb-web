import React from 'react';
import { CBDBPage, CBDBPageHeader, CBDBPageTitle, CBDBPageDescription, CBDBPageContent } from '@/render/components/ui/cbdb-page';
import { CBDBBlock, CBDBBlockContent } from '@/render/components/ui/cbdb-block';
import { Users } from 'lucide-react';

const PeoplePage: React.FC = () => {
  return (
    <CBDBPage>
      <CBDBPageHeader>
        <CBDBPageTitle className="flex items-center gap-3">
          <Users className="h-6 w-6" />
          People Browser
        </CBDBPageTitle>
        <CBDBPageDescription>
          Browse and explore all historical figures in the database
        </CBDBPageDescription>
      </CBDBPageHeader>

      <CBDBPageContent>
        <CBDBBlock>
          <CBDBBlockContent>
            <h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
            <p className="text-sm text-muted-foreground">
              This feature will allow you to browse through all people in the database with advanced filtering and search capabilities.
            </p>
          </CBDBBlockContent>
        </CBDBBlock>
      </CBDBPageContent>
    </CBDBPage>
  );
};

export default PeoplePage;