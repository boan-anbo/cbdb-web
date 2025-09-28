/**
 * DTOs for graph API operations
 * Request/Response contracts for graph endpoints
 */

import { IsOptional, IsString, IsNumber, IsArray, IsNumberString, IsBoolean } from 'class-validator';
import { GraphMetrics } from '../models/graph.model';
import { PersonNetworkResult } from '../models/graph-network.model';
import { CbdbGraphData } from '../models/graph-data.model';

// Requests
export class ExportGraphRequest {
  @IsString()
  format: 'gexf' | 'json' | 'graphml' = 'gexf';

  @IsString()
  outputPath: string = '';

  @IsOptional()
  includeMetrics?: boolean;
}

export class BuildPersonGraphRequest {
  @IsNumber()
  personId: number = 0;

  @IsOptional()
  @IsString()
  graphType?: 'kinship' | 'association' | 'office' | 'full';

  @IsOptional()
  @IsNumber()
  depth?: number;

  @IsOptional()
  @IsArray()
  includeRelationTypes?: string[];
}

export class ExportPersonNetworkRequest {
  @IsNumber()
  personId: number = 0;

  @IsString()
  outputPath: string = '';

  @IsOptional()
  @IsString()
  format?: 'gexf' | 'json' | 'graphml';

  @IsOptional()
  @IsString()
  networkType?: 'kinship' | 'association' | 'full';

  @IsOptional()
  @IsNumber()
  maxDepth?: number;
}

export class ExportSimpleRelationshipRequest {
  @IsNumber()
  personId1: number = 0;

  @IsNumber()
  personId2: number = 0;

  @IsString()
  outputPath: string = '';

  @IsOptional()
  @IsString()
  format?: 'gexf' | 'json';
}

// Responses
export class ExportGraphResponse {
  success: boolean = false;
  filepath: string = '';
  metrics?: GraphMetrics;
  error?: string;
}

export class GraphDataResponse {
  nodes: Array<{
    id: string;
    attributes: Record<string, any>;
  }> = [];
  edges: Array<{
    source: string;
    target: string;
    attributes: Record<string, any>;
  }> = [];
  metrics: GraphMetrics = {
    nodeCount: 0,
    edgeCount: 0,
    density: 0,
    avgDegree: 0
  };
}

export class PersonNetworkResponse extends ExportGraphResponse {
  personId: number = 0;
  networkType: string = '';
  depth: number = 1;
}

/**
 * Request for getting kinship network graph data
 */
export class GetKinshipNetworkRequest {
  @IsOptional()
  @IsNumberString()
  depth?: string; // How many hops from the central person (default: 1)
}

/**
 * Response for kinship network graph data
 */
export class KinshipNetworkResponse extends GraphDataResponse {
  centralPersonId: number = 0;
  depth: number = 1;
}

/**
 * Request for multi-person relationship network
 * Analyzes connections between 2+ selected persons
 */
export class GetPersonNetworkRequest {
  @IsArray()
  personIds: number[] = [];                    // 2+ person IDs to analyze

  @IsOptional()
  @IsNumber()
  maxNodeDist?: number;                        // 0=direct, 1=one-hop, 2=two-hop

  @IsOptional()
  @IsBoolean()
  includeKinship?: boolean;

  @IsOptional()
  @IsBoolean()
  includeAssociation?: boolean;

  @IsOptional()
  filters?: {
    indexYearRange?: [number, number];
    dynasties?: number[];
    places?: number[];
    includeMale?: boolean;
    includeFemale?: boolean;
  };
}

/**
 * Response for multi-person network analysis
 * Contains complete network data and analysis
 */
/**
 * Options for general network exploration
 */
export class NetworkExplorationOptions {
  /** Maximum depth to explore (1-3) */
  depth?: number;
  /** Include kinship relationships */
  includeKinship?: boolean;
  /** Include association relationships */
  includeAssociation?: boolean;
  /** Include office relationships */
  includeOffice?: boolean;
  /** Maximum nodes to return */
  maxNodes?: number;
  /** Dynasty filter */
  dynastyCode?: number;
  /** Year range filter */
  yearRange?: { start?: number; end?: number };
}

/**
 * Options for association network exploration
 */
export class AssociationNetworkOptions {
  /** Maximum depth to explore */
  depth?: number;
  /** Association types to include */
  associationTypes?: string[];
  /** Include reciprocal relationships */
  includeReciprocal?: boolean;
}

/**
 * Options for direct network exploration
 */
export class DirectNetworkOptions {
  /** Include only direct connections between persons */
  directOnly?: boolean;
  /** Relationship types to include */
  relationshipTypes?: ('kinship' | 'association' | 'office')[];
}

/**
 * Options for multi-person network analysis
 */
export class MultiPersonNetworkOptions {
  /** Maximum search depth */
  maxDepth?: number;
  /** Include bridge nodes */
  includeBridgeNodes?: boolean;
  /** Find shortest paths */
  findPaths?: boolean;
  /** Filters */
  filters?: {
    dynasties?: number[];
    yearRange?: { start?: number; end?: number };
    includeMale?: boolean;
    includeFemale?: boolean;
  };
}

/**
 * Response for network exploration
 */
export class NetworkExplorationResponse {
  /** The central person ID */
  centralPersonId?: number;
  /** The depth explored */
  depth?: number;
  /** The graph data in standardized CbdbGraphData format */
  graphData: CbdbGraphData = {
    attributes: {},
    options: {
      type: 'mixed',
      multi: true,
      allowSelfLoops: false
    },
    nodes: [],
    edges: []
  };
  /** Network statistics */
  stats?: {
    nodeCount: number;
    edgeCount: number;
    density?: number;
    components?: number;
  };
  /** Network metrics */
  metrics?: GraphMetrics;
  /** Query metadata */
  metadata?: {
    queryTime: number;
    truncated?: boolean;
  };
}

export class MultiPersonNetworkResponse extends NetworkExplorationResponse {
  /** Direct connections between query persons */
  directConnections?: Array<{
    person1: number;
    person2: number;
    relationships: any[];
  }>;
  /** Bridge nodes connecting query persons */
  bridgeNodes?: Array<{
    personId: number;
    name?: string;
    connectsTo: number[];
    bridgeScore: number;
  }>;
  /** Paths between query persons */
  pathways?: Array<{
    fromPerson: number;
    toPerson: number;
    path: number[];
    pathLength: number;
  }>;

  result?: PersonNetworkResult;
  responseTime?: number;
}

// Preset Explorer DTOs (Tier 2)
export class ExploreAssociationNetworkRequest {
  @IsOptional()
  @IsNumberString()
  maxDepth?: string; // URL param as string

  @IsOptional()
  @IsBoolean()
  includeKinship?: boolean;
}

export class ExploreDirectNetworkRequest {
  @IsOptional()
  @IsBoolean()
  includeKinship?: boolean;

  @IsOptional()
  @IsBoolean()
  includeAssociations?: boolean;

  @IsOptional()
  @IsBoolean()
  includeOffices?: boolean;
}

export class ExplorePersonNetworkRequest {
  @IsOptional()
  @IsNumberString()
  depth?: string; // How many hops from central person (1-3)

  @IsOptional()
  relationTypes?: string | string[]; // ['kinship', 'association', 'office'] or undefined for all

  @IsOptional()
  @IsBoolean()
  includeReciprocal?: boolean; // Include bidirectional relationships

  @IsOptional()
  filters?: {
    indexYearRange?: [number, number];
    dynasties?: number[];
    gender?: string;
  };
}

export class ExploreNetworkResponse {
  centralPersonId: number = 0;
  explorerType: string = '';
  graphData: CbdbGraphData = {
    attributes: {},
    options: {
      type: 'mixed',
      multi: true,
      allowSelfLoops: false
    },
    nodes: [],
    edges: []
  };
  metrics: GraphMetrics = {
    nodeCount: 0,
    edgeCount: 0,
    density: 0,
    avgDegree: 0
  };
  interpretation?: {
    summary: string;
    keyFindings: string[];
    suggestions?: string[];
  };
}