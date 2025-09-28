import React from 'react';
import { CBDBPage, CBDBPageHeader, CBDBPageTitle, CBDBPageDescription, CBDBPageContent } from '@/render/components/ui/cbdb-page';
import { CBDBBlock, CBDBBlockContent, CBDBBlockHeader, CBDBBlockTitle } from '@/render/components/ui/cbdb-block';
import { MapPin, Map } from 'lucide-react';

const PlacesPage: React.FC = () => {
  return (
    <CBDBPage>
      <CBDBPageHeader>
        <CBDBPageTitle className="flex items-center gap-3">
          <MapPin className="h-6 w-6" />
          Geographic Locations
        </CBDBPageTitle>
        <CBDBPageDescription>
          Explore historical places and geographic data
        </CBDBPageDescription>
      </CBDBPageHeader>

      <CBDBPageContent>
        <CBDBBlock>
          <CBDBBlockHeader>
            <CBDBBlockTitle>
              Interactive Map
            </CBDBBlockTitle>
          </CBDBBlockHeader>
          <CBDBBlockContent>
            <p className="text-sm text-muted-foreground mb-4">
              Visualize historical locations on an interactive map interface.
            </p>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">Map View Coming Soon</span>
            </div>
          </CBDBBlockContent>
        </CBDBBlock>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CBDBBlock>
            <CBDBBlockHeader>
              <CBDBBlockTitle>Provinces</CBDBBlockTitle>
            </CBDBBlockHeader>
            <CBDBBlockContent>
              <p className="text-sm text-muted-foreground">
                Browse locations by administrative divisions
              </p>
            </CBDBBlockContent>
          </CBDBBlock>
          <CBDBBlock>
            <CBDBBlockHeader>
              <CBDBBlockTitle>Cities</CBDBBlockTitle>
            </CBDBBlockHeader>
            <CBDBBlockContent>
              <p className="text-sm text-muted-foreground">
                Explore major historical cities and capitals
              </p>
            </CBDBBlockContent>
          </CBDBBlock>
        </div>
      </CBDBPageContent>
    </CBDBPage>
  );
};

export default PlacesPage;