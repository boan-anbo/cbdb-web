/**
 * Domain-specific GIS types for CBDB analytics
 * Extends generic map types with domain knowledge
 */

import type { MapLocation, Coordinates } from '@/render/components/visualization/MapRenderer/types';

/**
 * CBDB-specific location with person and address information
 */
export interface CbdbLocation extends MapLocation {
  personId: number;
  personName: string;
  addressId: number;
  addressType: number; // CBDB address type codes
  properties: {
    addressTypeName?: string; // Human-readable: "birthplace", "death place", etc.
    dynasty?: string;
    year?: number;
    placeName?: string;
    admin_type?: string; // Administrative level
  };
}

/**
 * Person location with temporal data from BIOG_ADDR_DATA
 */
export interface PersonLocation extends CbdbLocation {
  firstYear?: number;
  lastYear?: number;
  source?: number; // Source text ID
  notes?: string;
  natal?: number; // Natal/birthplace marker
  sequence?: number; // Order for multiple same-type addresses
}

/**
 * CHGIS county point from time series data
 */
export interface ChgisCounty extends MapLocation {
  properties: {
    name_py: string;  // Pinyin name
    name_ch: string;  // Chinese name
    name_ft?: string; // Traditional name
    beg_yr: number;   // Begin year
    end_yr: number;   // End year
    type_py?: string; // Type in pinyin
    type_ch?: string; // Type in Chinese
    pres_loc?: string; // Present location
    sys_id?: string;   // System ID
    lev_rank?: number; // Level rank
  };
}

/**
 * CHGIS prefecture/province polygon
 */
export interface ChgisPolygon {
  id: string | number;
  coordinates: Coordinates[][];
  properties: {
    name_py: string;
    name_ch: string;
    beg_yr: number;
    end_yr: number;
    type_py?: string;
    admin_level?: string;
  };
}

/**
 * Address type codes from BIOG_ADDR_CODES
 */
export enum AddressTypeCode {
  ANCESTRAL_HOME = 1,    // 籍貫
  BIRTHPLACE = 2,        // 出生地
  DEATH_PLACE = 10,      // 死所
  BURIAL_SITE = 9,       // 葬地
  HOUSEHOLD_REG = 16,    // 戶籍地
  OFFICE_LOCATION = 5,   // 任官地
  RESIDENCE = 4,         // 居住地
  // Add more as needed from BIOG_ADDR_CODES
}

/**
 * Map address types to display properties
 */
export const AddressTypeDisplay: Record<number, { name: string; color: string; icon?: string }> = {
  [AddressTypeCode.ANCESTRAL_HOME]: { name: 'Ancestral Home', color: '#8B4513' },
  [AddressTypeCode.BIRTHPLACE]: { name: 'Birthplace', color: '#FF0000' },
  [AddressTypeCode.DEATH_PLACE]: { name: 'Death Place', color: '#000000' },
  [AddressTypeCode.BURIAL_SITE]: { name: 'Burial Site', color: '#4B4B4B' },
  [AddressTypeCode.HOUSEHOLD_REG]: { name: 'Household Registration', color: '#FF8C00' },
  [AddressTypeCode.OFFICE_LOCATION]: { name: 'Office Location', color: '#0066CC' },
  [AddressTypeCode.RESIDENCE]: { name: 'Residence', color: '#00AA00' },
};

/**
 * Time period filter
 */
export interface TimePeriod {
  startYear: number;
  endYear: number;
}

/**
 * Filter options for CBDB locations
 */
export interface LocationFilters {
  personIds?: number[];
  addressTypes?: number[];
  timePeriod?: TimePeriod;
  dynasties?: string[];
  provinces?: string[];
}