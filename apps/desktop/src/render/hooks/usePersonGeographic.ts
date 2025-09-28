/**
 * React hooks for person geographic data
 *
 * Following the same patterns as usePersonNetwork and usePersonTimeline hooks
 */

import { useApiClient } from '@/render/providers/ApiClientProvider';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import {
  GetGeographicFootprintQuery,
  GetGeographicFootprintResult,
  ExploreGeographicNetworkQuery,
  ExploreGeographicNetworkResult,
  FindPeopleByProximityQuery,
  FindPeopleByProximityResult,
  cbdbClientManager
} from '@cbdb/core';

/**
 * Hook to get a person's geographic footprint
 * Shows all addresses associated with a person on a map
 */
export function usePersonGeographicFootprint(
  personId: number | undefined,
  options?: Partial<GetGeographicFootprintQuery>,
  queryOptions?: Omit<UseQueryOptions<GetGeographicFootprintResult>, 'queryKey' | 'queryFn'>
) {
  const client = useApiClient();
  return useQuery<GetGeographicFootprintResult>({
    queryKey: ['person-geographic-footprint', personId, options],
    queryFn: async () => {
      if (!personId) {
        throw new Error('Person ID is required');
      }
      // Convert Query types to Request types (numbers to strings for query params)
      const requestOptions = options ? {
        startYear: options.startYear?.toString(),
        endYear: options.endYear?.toString(),
        addressTypes: options.addressTypes,
        includeCoordinates: options.includeCoordinates
      } : undefined;
      const response = await client.personGeographic.getGeographicFootprint(personId, requestOptions);
      return response.result;
    },
    enabled: !!personId,
    ...queryOptions
  });
}

/**
 * Hook to explore a person's geographic network
 * Combines social network with geographic visualization
 */
export function usePersonGeographicNetwork(
  personId: number | undefined,
  options?: Partial<ExploreGeographicNetworkQuery>,
  queryOptions?: Omit<UseQueryOptions<ExploreGeographicNetworkResult>, 'queryKey' | 'queryFn'>
) {
  const client = useApiClient();
  return useQuery<ExploreGeographicNetworkResult>({
    queryKey: ['person-geographic-network', personId, options],
    queryFn: async () => {
      if (!personId) {
        throw new Error('Person ID is required');
      }
      const response = await client.personGeographic.exploreGeographicNetwork(personId, options);
      return response.result;
    },
    enabled: !!personId,
    ...queryOptions
  });
}

/**
 * Hook to find people within geographic proximity
 * Useful for finding people in the same region
 */
export function usePeopleByProximity(
  query: FindPeopleByProximityQuery | undefined,
  queryOptions?: Omit<UseQueryOptions<FindPeopleByProximityResult>, 'queryKey' | 'queryFn'>
) {
  const client = useApiClient();
  return useQuery<FindPeopleByProximityResult>({
    queryKey: ['people-by-proximity', query],
    queryFn: async () => {
      if (!query) {
        throw new Error('Query parameters are required');
      }
      // Map from Query parameters to Request parameters
      const response = await client.personGeographic.findPeopleByProximity({
        longitude: query.centerLongitude,  // Map centerLongitude to longitude
        latitude: query.centerLatitude,    // Map centerLatitude to latitude
        radius: query.radius,
        startYear: query.startYear,
        endYear: query.endYear,
        limit: query.limit
      });
      return response.result;
    },
    enabled: !!query && query.centerLongitude !== undefined && query.centerLatitude !== undefined,
    ...queryOptions
  });
}

/**
 * Helper to transform geographic data to map markers for visualization
 */
export function transformGeographicFootprintToMapMarkers(footprint: GetGeographicFootprintResult | undefined) {
  if (!footprint?.markers) return [];

  return footprint.markers
    .filter(marker => marker.coordinates) // Only markers with coordinates
    .map(marker => ({
      id: `address_${marker.addressId}`,
      coordinates: marker.coordinates!,
      label: marker.placeNameChn || marker.placeName,
      style: {
        color: marker.color,
        size: marker.size,
        opacity: marker.opacity || 1
      },
      popup: {
        content: `
          <div style="min-width: 150px;">
            <strong>${marker.placeNameChn || marker.placeName}</strong>
            <br/>Type: ${marker.addressTypeNameChn || marker.addressTypeName}
            ${marker.firstYear ? `<br/>From: ${marker.firstYear}` : ''}
            ${marker.lastYear ? `<br/>To: ${marker.lastYear}` : ''}
            ${marker.notes ? `<br/>Notes: ${marker.notes}` : ''}
          </div>
        `
      },
      properties: marker
    }));
}

/**
 * Helper to transform geographic network to map markers
 */
export function transformGeographicNetworkToMapMarkers(network: ExploreGeographicNetworkResult | undefined) {
  if (!network?.geographicData) return [];

  const markers = [];

  // Add markers for each node's primary location
  for (const node of network.geographicData.nodes) {
    if (node.primaryLocation?.coordinates) {
      markers.push({
        id: `node_${node.personId}`,
        coordinates: node.primaryLocation.coordinates,
        label: node.label,
        style: {
          color: node.color,
          size: node.size,
          opacity: node.nodeType === 'central' ? 1 : 0.8
        },
        popup: {
          content: `
            <div style="min-width: 150px;">
              <strong>${node.nameChn || node.label}</strong>
              <br/>Location: ${node.primaryLocation.placeNameChn || node.primaryLocation.placeName}
              <br/>Type: ${node.nodeType}
              <br/>Network depth: ${node.depth}
            </div>
          `
        },
        properties: {
          nodeType: node.nodeType,
          personId: node.personId,
          depth: node.depth
        }
      });
    }

    // Optionally add all locations for central person
    if (node.nodeType === 'central') {
      for (const location of node.locations) {
        if (location.coordinates && location.addressId !== node.primaryLocation?.addressId) {
          markers.push({
            id: `location_${node.personId}_${location.addressId}`,
            coordinates: location.coordinates,
            label: location.placeNameChn || location.placeName,
            style: {
              color: location.color,
              size: location.size * 0.8, // Slightly smaller
              opacity: 0.6
            },
            popup: {
              content: `
                <div style="min-width: 150px;">
                  <strong>${location.placeNameChn || location.placeName}</strong>
                  <br/>Type: ${location.addressTypeNameChn || location.addressTypeName}
                  ${location.firstYear ? `<br/>From: ${location.firstYear}` : ''}
                  ${location.lastYear ? `<br/>To: ${location.lastYear}` : ''}
                </div>
              `
            },
            properties: location
          });
        }
      }
    }
  }

  return markers;
}