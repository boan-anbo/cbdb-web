import {
  CBDBBlock,
  CBDBBlockContent,
  CBDBBlockHeader,
  CBDBBlockTitle,
} from '@/render/components/ui/cbdb-block';
import {
  CBDBPage,
  CBDBPageContent,
  CBDBPageDescription,
  CBDBPageHeader,
  CBDBPageTitle,
} from '@/render/components/ui/cbdb-page';
import { Alert, AlertTitle } from '@/render/components/ui/alert';
import CHGISHistoricalMap from '@/render/components/visualization/CHGISRenderer/CHGISHistoricalMap';
import type { ChgisFeature } from '@/render/components/visualization/CHGISRenderer/CHGISHistoricalMap';
import type { MapMarker } from '@/render/components/visualization/MapRenderer/types';
import {
  transformGeographicFootprintToMapMarkers,
  transformGeographicNetworkToMapMarkers,
  usePersonGeographicFootprint,
  usePersonGeographicNetwork,
} from '@/render/hooks/usePersonGeographic';
import { PersonSuggestionDataView } from '@cbdb/core';
import { AlertCircle, Loader2, MapPin } from 'lucide-react';
import React, { useMemo, useState, useCallback } from 'react';

interface GISExplorerPageProps {}

/**
 * GIS Explorer Page - Analytics component for geographic visualization
 * Uses CHGIS data and the MapRenderer component for historical geographic analysis
 */
const GISExplorerPage: React.FC<GISExplorerPageProps> = () => {
  const [selectedYear] = useState<number>(1070);
  // Default to Wang Anshi (王安石)
  const [selectedPerson] =
    useState<PersonSuggestionDataView | null>(new PersonSuggestionDataView({
      id: 1762,
      name: 'Wang Anshi',
      nameChn: '王安石',
      birthYear: 1021,
      deathYear: 1086,
      indexYear: 1021,
      dynastyCode: 15,
      dynasty: 'Song',
      dynastyChn: '宋'
    }));
  const [networkDepth] = useState<number>(0);
  const [showNetworkConnections] =
    useState<boolean>(false);

  // Fetch geographic data using hooks
  const { data: footprint, isLoading: footprintLoading } =
    usePersonGeographicFootprint(selectedPerson?.id, {
      startYear: selectedYear - 50,
      endYear: selectedYear + 50,
      includeCoordinates: true,
    });

  const { data: network, isLoading: networkLoading } =
    usePersonGeographicNetwork(
      selectedPerson?.id,
      {
        networkDepth,
        relationTypes: ['kinship', 'association'],
        startYear: selectedYear - 50,
        endYear: selectedYear + 50,
      },
      {
        enabled: networkDepth > 0 && showNetworkConnections,
      },
    );

  // Transform data to map markers
  const personMarkers: MapMarker[] = useMemo(() => {
    const markers: MapMarker[] = [];

    // Add footprint markers
    if (footprint) {
      markers.push(...transformGeographicFootprintToMapMarkers(footprint));
    }

    // Add network markers if enabled
    if (networkDepth > 0 && showNetworkConnections && network) {
      markers.push(...transformGeographicNetworkToMapMarkers(network));
    }

    return markers;
  }, [footprint, network, networkDepth, showNetworkConnections]);

  // Handle marker click - show person details
  const handleMarkerClick = useCallback((marker: MapMarker) => {
    if (marker.properties?.personId && marker.properties.personId !== selectedPerson?.id) {
      // If clicking a different person marker, could potentially select them
      console.log('Marker clicked for person:', marker.properties.personId, marker.label);
    }
  }, [selectedPerson]);

  // Handle county click - show county info
  const handleCountyClick = useCallback((county: ChgisFeature) => {
    console.log(
      'Historical location:',
      county.properties.name_ch,
      county.properties.name_py,
      `(${county.properties.beg_yr} - ${county.properties.end_yr})`
    );
  }, []);

  return (
    <CBDBPage>
      <CBDBPageHeader>
        <CBDBPageTitle className="flex items-center gap-3">
          <MapPin className="h-6 w-6" />
          GIS Explorer
        </CBDBPageTitle>
        <CBDBPageDescription>
          Explore historical geographic data using CHGIS maps and person
          locations
        </CBDBPageDescription>
      </CBDBPageHeader>

      <CBDBPageContent className="space-y-4">
        {/* Work in Progress Alert */}
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Work in Progress</AlertTitle>
        </Alert>

        {/* Filters & Controls Block - Hidden until historical map is ready */}
        {/* TODO: Re-enable when historical map component is complete
        <CBDBBlock>
          <CBDBBlockHeader>
            <CBDBBlockTitle>Filters & Controls</CBDBBlockTitle>
          </CBDBBlockHeader>
          <CBDBBlockContent>
            ... controls content ...
          </CBDBBlockContent>
        </CBDBBlock>
        */}

        {/* Map Block with CHGIS historical boundaries */}
        <CBDBBlock>
          <CBDBBlockHeader>
            <CBDBBlockTitle className="flex items-center gap-2">
              <span>Historical Map Visualization</span>
              {selectedPerson && (
                <span className="text-sm font-normal text-gray-500">
                  {selectedPerson.nameChn || selectedPerson.name}
                  {selectedPerson.birthYear && selectedPerson.deathYear && (
                    <span className="ml-1">
                      ({selectedPerson.birthYear} - {selectedPerson.deathYear})
                    </span>
                  )}
                </span>
              )}
              {(footprintLoading || networkLoading) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
            </CBDBBlockTitle>
          </CBDBBlockHeader>
          <CBDBBlockContent className="p-0" style={{ height: '600px' }}>
            {!selectedPerson ? (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-600 mb-2">
                    No Person Selected
                  </p>
                  <p className="text-sm text-gray-500">
                    Use the person selector above to explore geographic data
                  </p>
                </div>
              </div>
            ) : (
              <CHGISHistoricalMap
                year={selectedYear}
                markers={personMarkers}
                displayMode="dots"
                mapConfig={{
                  center: footprint?.metrics.centerPoint || {
                    longitude: 110,
                    latitude: 32,
                  },
                  zoom:
                    footprint?.metrics.geographicSpread &&
                    footprint.metrics.geographicSpread < 500
                      ? 7
                      : 5,
                }}
                onMarkerClick={handleMarkerClick}
                onFeatureClick={handleCountyClick}
                className="w-full h-full"
              />
            )}
          </CBDBBlockContent>
        </CBDBBlock>
      </CBDBPageContent>
    </CBDBPage>
  );
};

export default GISExplorerPage;
