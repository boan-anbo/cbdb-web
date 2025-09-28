/**
 * Geographic CQRS Messages
 *
 * Following the four-level hierarchy and CQRS patterns established in the project.
 * These messages handle geographic data operations for persons and their networks.
 */

import { IsOptional, IsNumber, IsArray } from 'class-validator';

// ============================================
// Queries (Read Operations)
// ============================================

/**
 * Query to get a person's geographic footprint
 * Shows all addresses associated with a person on a map
 */
export class GetGeographicFootprintQuery {
  @IsNumber()
  personId!: number;

  @IsOptional()
  @IsNumber()
  startYear?: number;

  @IsOptional()
  @IsNumber()
  endYear?: number;

  @IsOptional()
  @IsArray()
  addressTypes?: number[]; // Filter by address type codes (8=birthplace, 10=deathplace, etc.)

  @IsOptional()
  includeCoordinates?: boolean; // Whether to include x_coord, y_coord from ADDR_CODES

  constructor(init?: Partial<GetGeographicFootprintQuery>) {
    Object.assign(this, init);
  }
}

/**
 * Query to explore a person's geographic network
 * Combines network relationships with geographic locations
 */
export class ExploreGeographicNetworkQuery {
  @IsNumber()
  personId!: number;

  @IsOptional()
  @IsNumber()
  networkDepth?: number; // How many degrees of separation (default: 1)

  @IsOptional()
  @IsArray()
  relationTypes?: string[]; // 'kinship', 'association', 'office'

  @IsOptional()
  @IsNumber()
  proximityRadius?: number; // Geographic proximity filter in degrees (0.03 or 0.06)

  @IsOptional()
  @IsNumber()
  startYear?: number;

  @IsOptional()
  @IsNumber()
  endYear?: number;

  constructor(init?: Partial<ExploreGeographicNetworkQuery>) {
    Object.assign(this, init);
  }
}

// ============================================
// Results (Service Responses)
// ============================================

/**
 * Geographic marker representing a location on the map
 */
export class GeographicMarker {
  addressId!: number;
  personId!: number;
  addressType!: number;
  addressTypeName!: string;
  addressTypeNameChn?: string;

  // Coordinates from ADDR_CODES
  coordinates?: {
    longitude: number; // x_coord
    latitude: number;  // y_coord
  };

  placeName!: string;
  placeNameChn?: string;

  // Time period
  firstYear?: number;
  lastYear?: number;

  // Visualization properties
  color!: string;
  size!: number;
  opacity?: number;

  // Additional metadata
  isNatal?: boolean; // Is this a birthplace/hometown
  notes?: string;

  constructor(init?: Partial<GeographicMarker>) {
    Object.assign(this, init);
  }
}

/**
 * Geographic metrics for analysis
 */
export class GeographicMetrics {
  totalLocations!: number;
  locationsWithCoordinates!: number;
  locationsWithoutCoordinates!: number;

  // Spatial metrics
  geographicSpread?: number; // Maximum distance between any two points in km
  centerPoint?: { longitude: number; latitude: number }; // Geographic center of all locations
  boundingBox?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };

  // Temporal metrics
  earliestYear?: number;
  latestYear?: number;
  yearRange?: number;

  // Movement metrics
  totalDistance?: number; // Total distance if connected chronologically
  averageStayDuration?: number; // Average years at each location

  constructor(init?: Partial<GeographicMetrics>) {
    Object.assign(this, init);
  }
}

/**
 * Geographic interpretation for historians
 */
export class GeographicInterpretation {
  summary!: string;
  keyFindings!: string[];
  movementPatterns?: string[];
  suggestions?: string[];

  constructor(init?: Partial<GeographicInterpretation>) {
    Object.assign(this, init);
  }
}

/**
 * Processing metadata
 */
export class ProcessingMetadata {
  dataSourcesUsed!: string[];
  processingTimeMs!: number;
  markersWithoutCoordinates?: number;
  totalRecordsProcessed?: number;

  constructor(init?: Partial<ProcessingMetadata>) {
    Object.assign(this, init);
  }
}

/**
 * Result for geographic footprint query
 */
export class GetGeographicFootprintResult {
  personId!: number;
  personName?: string;
  personNameChn?: string;
  markers!: GeographicMarker[];
  metrics!: GeographicMetrics;
  interpretation!: GeographicInterpretation;
  metadata!: ProcessingMetadata;

  constructor(init?: Partial<GetGeographicFootprintResult>) {
    Object.assign(this, init);
  }
}

/**
 * Geographic node for network visualization
 */
export class GeographicNode {
  nodeId!: string; // person:123 format
  personId!: number;
  label!: string;
  nameChn?: string;

  // Primary location (e.g., index address or birthplace)
  primaryLocation?: {
    addressId: number;
    coordinates?: {
      longitude: number;
      latitude: number;
    };
    placeName: string;
    placeNameChn?: string;
  };

  // All associated locations
  locations!: GeographicMarker[];

  // Network properties
  nodeType!: 'central' | 'kinship' | 'association' | 'office';
  depth!: number;
  color!: string;
  size!: number;

  constructor(init?: Partial<GeographicNode>) {
    Object.assign(this, init);
  }
}

/**
 * Geographic edge for network connections
 */
export class GeographicEdge {
  edgeId!: string;
  source!: string;
  target!: string;
  relationshipType!: 'kinship' | 'association' | 'office';
  label!: string;

  // Geographic properties
  distance?: number; // Distance in km between nodes' primary locations
  sharedLocations?: number[]; // Address IDs shared by both nodes

  // Visualization
  color!: string;
  weight!: number;
  opacity?: number;

  constructor(init?: Partial<GeographicEdge>) {
    Object.assign(this, init);
  }
}

/**
 * Result for geographic network exploration
 */
export class ExploreGeographicNetworkResult {
  centralPersonId!: number;

  geographicData!: {
    nodes: GeographicNode[];
    edges: GeographicEdge[];
  };

  metrics!: GeographicMetrics & {
    // Network-specific metrics
    nodeCount: number;
    edgeCount: number;
    clustersIdentified?: number;
    averageDistance?: number; // Average distance between connected nodes
  };

  interpretation!: GeographicInterpretation;
  metadata!: ProcessingMetadata;

  constructor(init?: Partial<ExploreGeographicNetworkResult>) {
    Object.assign(this, init);
  }
}

/**
 * Query to find people within geographic proximity
 * Following reference server pattern for proximity search
 */
export class FindPeopleByProximityQuery {
  @IsNumber()
  centerLongitude!: number; // x_coord

  @IsNumber()
  centerLatitude!: number; // y_coord

  @IsNumber()
  radius!: number; // Search radius in degrees (0.03 for narrow, 0.06 for broad)

  @IsOptional()
  @IsNumber()
  startYear?: number;

  @IsOptional()
  @IsNumber()
  endYear?: number;

  @IsOptional()
  @IsNumber()
  limit?: number; // Maximum number of results

  constructor(init?: Partial<FindPeopleByProximityQuery>) {
    Object.assign(this, init);
  }
}

/**
 * Result for proximity search
 */
export class FindPeopleByProximityResult {
  centerPoint!: {
    longitude: number;
    latitude: number;
  };

  radius!: number;

  peopleFound!: Array<{
    personId: number;
    name: string;
    nameChn?: string;
    addressId: number;
    addressType: number;
    distance: number; // Distance from center in km
    coordinates: {
      longitude: number;
      latitude: number;
    };
  }>;

  totalCount!: number;
  metadata!: ProcessingMetadata;

  constructor(init?: Partial<FindPeopleByProximityResult>) {
    Object.assign(this, init);
  }
}