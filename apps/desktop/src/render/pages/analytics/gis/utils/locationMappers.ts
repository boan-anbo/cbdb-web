/**
 * Mapper functions to convert domain-specific data to generic map data
 */

import type { MapMarker, MapPolygon } from '@/render/components/visualization/MapRenderer/types';
import type { PersonLocation, ChgisCounty, ChgisPolygon } from '../types';
import { AddressTypeDisplay } from '../types';

/**
 * Convert CBDB person location to generic map marker
 */
export function personLocationToMapMarker(location: PersonLocation): MapMarker {
  const typeDisplay = AddressTypeDisplay[location.addressType] || {
    name: 'Unknown',
    color: '#666666'
  };

  return {
    id: `${location.personId}_${location.addressId}`,
    coordinates: location.coordinates,
    label: location.personName,
    style: {
      color: typeDisplay.color,
      size: 12,
      opacity: 0.8
    },
    popup: {
      content: `
        <div style="min-width: 200px;">
          <h4 style="margin: 0 0 8px 0;">${location.personName}</h4>
          <p style="margin: 4px 0;">
            <strong>${typeDisplay.name}</strong>
            ${location.properties.placeName ? `<br/>${location.properties.placeName}` : ''}
            ${location.properties.dynasty ? `<br/>Dynasty: ${location.properties.dynasty}` : ''}
            ${location.firstYear ? `<br/>Years: ${location.firstYear}${location.lastYear ? `-${location.lastYear}` : ''}` : ''}
          </p>
        </div>
      `
    },
    properties: location.properties
  };
}

/**
 * Convert CHGIS county to generic map marker
 */
export function chgisCountyToMapMarker(county: ChgisCounty): MapMarker {
  return {
    id: county.id,
    coordinates: county.coordinates,
    label: county.properties.name_py,
    style: {
      color: '#888888',
      size: 6,
      opacity: 0.5
    },
    popup: {
      content: `
        <div>
          <strong>${county.properties.name_ch}</strong> (${county.properties.name_py})
          <br/>Period: ${county.properties.beg_yr} - ${county.properties.end_yr}
          ${county.properties.type_ch ? `<br/>Type: ${county.properties.type_ch}` : ''}
          ${county.properties.pres_loc ? `<br/>Present: ${county.properties.pres_loc}` : ''}
        </div>
      `
    },
    properties: county.properties
  };
}

/**
 * Convert CHGIS polygon to generic map polygon
 */
export function chgisPolygonToMapPolygon(polygon: ChgisPolygon): MapPolygon {
  return {
    id: polygon.id,
    coordinates: polygon.coordinates,
    style: {
      fillColor: '#aaaaaa',
      fillOpacity: 0.2,
      strokeColor: '#666666',
      strokeWidth: 1
    },
    properties: polygon.properties
  };
}

/**
 * Filter person locations by time period
 */
export function filterLocationsByTime(
  locations: PersonLocation[],
  year: number
): PersonLocation[] {
  return locations.filter(loc => {
    // If no temporal data, include it
    if (!loc.firstYear && !loc.lastYear) return true;

    // Check if year falls within the location's time range
    const startYear = loc.firstYear || -9999;
    const endYear = loc.lastYear || 9999;

    return year >= startYear && year <= endYear;
  });
}

/**
 * Filter CHGIS counties by time period
 */
export function filterChgisByTime(
  counties: ChgisCounty[],
  year: number
): ChgisCounty[] {
  return counties.filter(county => {
    return year >= county.properties.beg_yr && year <= county.properties.end_yr;
  });
}

/**
 * Group person locations by person
 */
export function groupLocationsByPerson(
  locations: PersonLocation[]
): Map<number, PersonLocation[]> {
  const grouped = new Map<number, PersonLocation[]>();

  locations.forEach(loc => {
    if (!grouped.has(loc.personId)) {
      grouped.set(loc.personId, []);
    }
    grouped.get(loc.personId)!.push(loc);
  });

  return grouped;
}

/**
 * Get color for address type
 */
export function getAddressTypeColor(addressType: number): string {
  return AddressTypeDisplay[addressType]?.color || '#666666';
}

/**
 * Get display name for address type
 */
export function getAddressTypeName(addressType: number): string {
  return AddressTypeDisplay[addressType]?.name || `Type ${addressType}`;
}