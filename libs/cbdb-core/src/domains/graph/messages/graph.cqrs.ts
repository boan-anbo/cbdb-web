/**
 * CQRS messages for graph operations
 * Commands, Queries, Results for graph domain
 */

import { IsOptional, IsString, IsNumber } from 'class-validator';
import { GraphMetrics } from '../models/graph.model';
import { CbdbGraphData } from '../models/graph-data.model';
// Commands - Actions that do something
export class ExportGraphCommand {
  graph: any; // Graph instance from graphology

  @IsString()
  format: 'gexf' | 'json' | 'graphml' = 'gexf';

  @IsString()
  filepath: string = '';

  @IsOptional()
  options?: Record<string, any>;
}

export class BuildGraphCommand {
  @IsString()
  graphType: 'directed' | 'undirected' | 'mixed' = 'directed';

  nodes: Array<{ id: string | number; attributes?: any }> = [];
  edges: Array<{ source: string | number; target: string | number; attributes?: any }> = [];
}

// Queries - Read operations
export class GetGraphMetricsQuery {
  graph: any; // Graph instance
}

export class GetGraphSubsetQuery {
  graph: any; // Graph instance

  @IsOptional()
  nodeIds?: Array<string | number>;

  @IsOptional()
  @IsNumber()
  maxDepth?: number;
}

// Preset Explorer Queries (Tier 2)
export class ExploreAssociationNetworkQuery {
  @IsNumber()
  personId: number = 0;

  @IsOptional()
  @IsNumber()
  maxDepth?: number = 2;

  @IsOptional()
  includeKinship?: boolean = false;
}

export class ExploreDirectNetworkQuery {
  @IsNumber()
  personId: number = 0;

  @IsOptional()
  includeKinship?: boolean = true;

  @IsOptional()
  includeAssociations?: boolean = true;

  @IsOptional()
  includeOffices?: boolean = false;
}

export class ExplorePersonNetworkQuery {
  @IsNumber()
  personId: number = 0;

  @IsOptional()
  @IsNumber()
  depth?: number = 1;

  @IsOptional()
  relationTypes?: string[]; // ['kinship', 'association', 'office'] or undefined for all

  @IsOptional()
  includeReciprocal?: boolean = true;

  @IsOptional()
  filters?: {
    indexYearRange?: [number, number];
    dynasties?: number[];
    gender?: string;
  };
}


// Results - Response data
export class ExportGraphResult {
  success: boolean = false;
  filepath: string = '';
  metrics: GraphMetrics = {
    nodeCount: 0,
    edgeCount: 0,
    density: 0,
    avgDegree: 0
  };

  @IsOptional()
  error?: string;
}

export class BuildGraphResult {
  graph: any; // Graph instance
  metrics: GraphMetrics = {
    nodeCount: 0,
    edgeCount: 0,
    density: 0,
    avgDegree: 0
  };
}

export class GraphMetricsResult {
  metrics: GraphMetrics = {
    nodeCount: 0,
    edgeCount: 0,
    density: 0,
    avgDegree: 0
  };

  @IsOptional()
  additionalMetrics?: Record<string, any>;
}

// Preset Explorer Results
export class ExploreNetworkResult {
  centralPersonId: number = 0;

  // Using standardized CbdbGraphData format
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

  @IsOptional()
  interpretation?: {
    summary: string;
    keyFindings: string[];
    suggestions?: string[];
  };
}