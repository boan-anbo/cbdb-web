/**
 * Multi-Person Network Analysis Models
 * Based on CBDB's proven network discovery patterns
 */

import { PersonModel } from '../../person/models/person.model';
import { SerializedGraph } from 'graphology-types';

/**
 * Query for multi-person network discovery
 * Follows CBDB Access/PHP implementation patterns
 */
export class PersonNetworkQuery {
  personIds: number[] = [];                    // 2+ person IDs to analyze
  maxNodeDist: number = 1;                     // 0=direct only, 1=one-hop, 2=two-hop
  includeKinship: boolean = true;              // Include kinship relationships
  includeAssociation: boolean = true;          // Include non-kinship associations

  // Optional filters (query persons always included)
  indexYearRange?: [number, number];           // Filter by index year
  dynasties?: number[];                         // Filter by dynasty codes
  places?: number[];                            // Filter by place IDs
  includeMale?: boolean = true;                // Include male persons
  includeFemale?: boolean = true;              // Include female persons
}

/**
 * Discovered person in the network
 */
export class DiscoveredPerson {
  personId: number = 0;
  person?: PersonModel;                             // Full person data if loaded
  nodeDistance: number = 0;                    // Min distance to any query person
  connectsTo: number[] = [];                   // Which query persons they connect to
  discoveryPath?: number[];                    // Path of person IDs from query person
}

/**
 * Edge in the network graph
 * Represents a relationship between two persons
 */
export class NetworkEdge {
  source: number = 0;                          // Source person ID
  target: number = 0;                          // Target person ID
  edgeType: 'kinship' | 'association' = 'association';
  edgeLabel: string = '';                      // Relationship description (父, 師, etc.)
  edgeCode?: number;                           // Relationship code (kinship/assoc code)
  edgeDistance: number = 0;                    // 0 if between query persons, else higher
  nodeDistance: number = 0;                    // Min distance from edge to any query person
  metadata?: {
    kinshipCode?: number;
    assocCode?: number;
    textId?: number;
    placeId?: number;
  };
}

/**
 * Direct connection between two query persons
 * May involve multiple relationships
 */
export class DirectConnection {
  person1: number = 0;
  person2: number = 0;
  person1Name?: string;
  person2Name?: string;
  relationships: RelationshipDetail[] = [];
  connectionStrength: number = 0;              // Based on # and types of relationships
}

/**
 * Details of a specific relationship
 */
export class RelationshipDetail {
  type: 'kinship' | 'association' = 'association';
  label: string = '';                          // Human-readable relationship
  code?: number;                               // Database code
  direction?: 'forward' | 'reverse' | 'mutual'; // Direction of relationship
}

/**
 * Bridge node connecting multiple query persons
 * Key concept from CBDB implementations
 */
export class BridgeNode {
  personId: number = 0;
  person?: PersonModel;
  connectsToQueryPersons: number[] = [];       // Which query persons they connect
  connectionTypes: Map<number, string[]> = new Map(); // PersonID -> relationship types
  bridgeType: 'kinship' | 'association' | 'mixed' = 'mixed';
  bridgeScore: number = 0;                     // Importance based on connections
}

/**
 * Path between two query persons
 */
export class Pathway {
  fromPerson: number = 0;
  toPerson: number = 0;
  path: number[] = [];                         // Sequence of person IDs
  edges: NetworkEdge[] = [];                   // Edges along the path
  pathLength: number = 0;
  pathType: 'kinship' | 'association' | 'mixed' = 'mixed';
}

/**
 * Network analysis metrics
 */
export class NetworkMetrics {
  totalPersons: number = 0;                    // Total persons in network
  queryPersons: number = 0;                    // Number of query persons
  discoveredPersons: number = 0;               // Persons found through search
  totalEdges: number = 0;                      // Total relationships
  directConnections: number = 0;               // Direct connections between query persons
  bridgeNodes: number = 0;                     // Number of bridge nodes
  averagePathLength: number = 0;               // Average path length between connected pairs
  density: number = 0;                          // Network density
  components: number = 0;                       // Number of disconnected components
}

/**
 * Complete result of network analysis
 */
export class PersonNetworkResult {
  // Core network data
  queryPersons: Set<number> = new Set();       // Original query person IDs
  discoveredPersons: Map<number, DiscoveredPerson> = new Map();
  edges: NetworkEdge[] = [];

  // Analysis results
  directConnections: DirectConnection[] = [];   // Direct links between query persons
  bridgeNodes: BridgeNode[] = [];              // People connecting multiple query persons
  pathways: Pathway[] = [];                     // All paths between query persons

  // Statistics
  metrics: NetworkMetrics = new NetworkMetrics();

  // Visualization data
  graph?: SerializedGraph;                      // For NetworkGraph component

  // Metadata
  queryTime?: number;                           // Query execution time in ms
  truncated?: boolean;                          // If results were truncated for size

  constructor(init?: Partial<PersonNetworkResult>) {
    Object.assign(this, init);
  }
}

/**
 * Filter options for network discovery
 */
export class NetworkFilterOptions {
  indexYearRange?: [number, number];
  dynasties?: number[];
  places?: number[];
  includeMale?: boolean = true;
  includeFemale?: boolean = true;
  excludePersonIds?: number[];                  // Persons to exclude from discovery
}

/**
 * Configuration for network visualization
 */
export class NetworkVisualizationConfig {
  // Node appearance
  queryNodeColor?: string = '#FF6B6B';          // Color for query persons
  bridgeNodeColor?: string = '#4ECDC4';         // Color for bridge nodes
  discoveredNodeColor?: string = '#95E77E';     // Color for other discovered persons

  // Node sizing
  queryNodeSize?: number = 30;                  // Size for query persons
  bridgeNodeSize?: number = 20;                 // Size for bridge nodes
  discoveredNodeSize?: number = 10;             // Size for other persons

  // Edge appearance
  kinshipEdgeColor?: string = '#A8E6CF';        // Color for kinship edges
  associationEdgeColor?: string = '#FFD3B6';    // Color for association edges
  directEdgeWidth?: number = 3;                 // Width for direct connections
  indirectEdgeWidth?: number = 1;               // Width for indirect connections

  // Layout
  layoutType?: 'force' | 'circular' | 'hierarchical' = 'force';
}