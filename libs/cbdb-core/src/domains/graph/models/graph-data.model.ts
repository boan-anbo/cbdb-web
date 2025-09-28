/**
 * Graph Data Models - Single Source of Truth (SSOT)
 *
 * These types extend Graphology's SerializedGraph format to provide
 * strong typing for CBDB graph visualizations while maintaining
 * full compatibility with Graphology and Sigma.js.
 *
 * IMPORTANT: This is the SINGLE SOURCE OF TRUTH for graph data exchange
 * between backend and frontend. All graph data MUST use these types.
 *
 * These types properly extend Graphology's native types, not shallow copies.
 *
 * @module @cbdb/core/domains/graph
 */

import type { SerializedGraph, SerializedNode, SerializedEdge, Attributes } from 'graphology-types';

// ============ Node Attributes ============

/**
 * Standard node attributes recognized by Sigma.js renderer
 * These directly affect visual rendering
 */
export interface GraphNodeStandardAttributes {
  /** Display label for the node */
  label?: string;

  /** Visual size of the node (in pixels) */
  size?: number;

  /** Color of the node (hex or CSS color string) */
  color?: string;

  /** X coordinate position */
  x?: number;

  /** Y coordinate position */
  y?: number;

  /** Node rendering type (e.g., 'circle', 'square', 'image', 'piechart') */
  type?: string;

  /** Whether the node is visible */
  hidden?: boolean;

  /** Force label to be displayed regardless of zoom level */
  forceLabel?: boolean;

  /** Z-index for rendering order */
  zIndex?: number;
}

/**
 * CBDB domain-specific node attributes
 * These contain business data that doesn't affect rendering
 */
export interface CbdbNodeCustomAttributes {
  // CBDB entity identifiers
  /** Person ID in CBDB database */
  personId?: number;

  /** Place ID in CBDB database */
  placeId?: number;

  /** Office ID in CBDB database */
  officeId?: number;

  /** Institution ID in CBDB database */
  institutionId?: number;

  /** Entity type for polymorphic nodes */
  entityType?: 'person' | 'place' | 'office' | 'institution' | 'text' | 'event';

  // Network analysis properties
  /** Minimum distance from any query node */
  nodeDistance?: number;

  /** Score indicating importance as a bridge node */
  bridgeScore?: number;

  /** Which query persons this node connects to */
  connectsTo?: number[];

  // Person-specific attributes
  /** Dynasty code */
  dynastyCode?: number;

  /** Chinese name */
  nameChn?: string;

  /** English name */
  nameEng?: string;

  /** Birth year */
  birthYear?: number;

  /** Death year */
  deathYear?: number;

  /** Gender (0: male, 1: female) */
  gender?: number;

  // Allow extension for future attributes
  [key: string]: any;
}

/**
 * Complete node attributes for CBDB graphs
 * Extends Graphology's Attributes to ensure compatibility
 */
export interface CbdbNodeAttributes extends GraphNodeStandardAttributes, CbdbNodeCustomAttributes, Attributes {
  // Parallel edge indexing (added by EdgeCurveProcessor)
  parallelIndex?: number | null;
  parallelMinIndex?: number | null;
  parallelMaxIndex?: number | null;

  // Preserved original values during transformations
  originalColor?: string;
  originalLabel?: string;
}

// ============ Edge Attributes ============

/**
 * Standard edge attributes recognized by Sigma.js renderer
 */
export interface GraphEdgeStandardAttributes {
  /** Display label for the edge */
  label?: string;

  /**
   * Visual thickness of the edge (in pixels)
   * Guidelines:
   * - 1-2px: Weak or casual relationships
   * - 3-4px: Moderate relationships
   * - 5-6px: Strong relationships
   * - 7+px: Very strong or critical relationships
   */
  size?: number;

  /** Color of the edge (hex or CSS color string) */
  color?: string;

  /**
   * Edge rendering type
   * RESERVED for rendering - use relationshipType for semantics
   */
  type?: 'straight' | 'curved';

  /** Curvature amount for curved edges (auto-set for parallel edges) */
  curvature?: number;

  /** Whether the edge is visible */
  hidden?: boolean;

  /** Force label to be displayed regardless of zoom level */
  forceLabel?: boolean;

  /** Z-index for rendering order */
  zIndex?: number;
}

/**
 * CBDB domain-specific edge attributes
 */
export interface CbdbEdgeCustomAttributes {
  // Relationship semantics
  /** Type of relationship */
  relationshipType?: 'kinship' | 'association' | 'office' | 'text' | 'event' | 'place';

  /** Database code for the relationship */
  relationshipCode?: number;

  /** Human-readable relationship description */
  relationshipLabel?: string;

  /** Relationship direction */
  direction?: 'forward' | 'reverse' | 'mutual';

  // Relationship strength/importance
  /** Strength or importance (0-1) */
  strength?: number;

  /** Distance from query nodes */
  edgeDistance?: number;

  // CBDB-specific codes
  /** Kinship code */
  kinshipCode?: number;

  /** Association code */
  assocCode?: number;

  /** Text ID */
  textId?: number;

  /** Place ID where relationship occurred */
  placeId?: number;

  /** Year of relationship */
  year?: number;

  // Allow extension
  [key: string]: any;
}

/**
 * Complete edge attributes for CBDB graphs
 */
export interface CbdbEdgeAttributes extends GraphEdgeStandardAttributes, CbdbEdgeCustomAttributes, Attributes {
  // Parallel edge indexing (added by EdgeCurveProcessor)
  parallelIndex?: number | null;
  parallelMinIndex?: number | null;
  parallelMaxIndex?: number | null;

  // Preserved original values
  originalColor?: string;
}

// ============ Graph Components ============

/**
 * CBDB Node - properly extends Graphology's SerializedNode
 */
export type CbdbNode = SerializedNode<CbdbNodeAttributes>;

/**
 * CBDB Edge - properly extends Graphology's SerializedEdge
 */
export type CbdbEdge = SerializedEdge<CbdbEdgeAttributes>;

/**
 * Graph-level attributes
 */
export interface CbdbGraphAttributes extends Attributes {
  /** Graph name or title */
  name?: string;

  /** Graph description */
  description?: string;

  /** Original query person IDs (for network analysis) */
  queryPersons?: number[];

  /** Timestamp when graph was created */
  createdAt?: string;

  /** Source of the graph data */
  dataSource?: 'cbdb' | 'user' | 'computed' | 'imported';

  /** Graph metrics */
  metrics?: {
    nodeCount?: number;
    edgeCount?: number;
    density?: number;
    avgDegree?: number;
  };

  [key: string]: any;
}

/**
 * CBDB Graph Data - the canonical format for all graph data exchange
 * Properly extends SerializedGraph from Graphology
 *
 * This is the SINGLE SOURCE OF TRUTH for graph data.
 */
export interface CbdbGraphData extends SerializedGraph<CbdbNodeAttributes, CbdbEdgeAttributes, CbdbGraphAttributes> {
  // Inherited from SerializedGraph:
  // - attributes: CbdbGraphAttributes
  // - options: GraphOptions
  // - nodes: Array<CbdbNode>
  // - edges: Array<CbdbEdge>

  // No additional properties needed - everything is in the extended types
}

// ============ Helper Constants & Functions ============

/**
 * Edge size guidelines for consistent visualization
 */
export const EDGE_SIZE_GUIDELINES = {
  /** Minimal relationships (acquaintances, distant connections) */
  MINIMAL: 1,

  /** Weak relationships (occasional interactions) */
  WEAK: 2,

  /** Moderate relationships (regular interactions) */
  MODERATE: 3,

  /** Strong relationships (frequent interactions, close ties) */
  STRONG: 5,

  /** Very strong relationships (family, best friends, critical dependencies) */
  VERY_STRONG: 7,

  /** Maximum relationships (spouse, parent-child, essential connections) */
  MAXIMUM: 10,
} as const;

/**
 * Calculate edge size from relationship strength
 * @param strength - Relationship strength (0-1)
 * @param minSize - Minimum edge size (default: 1)
 * @param maxSize - Maximum edge size (default: 10)
 * @returns Calculated edge size
 */
export function calculateEdgeSize(
  strength: number,
  minSize: number = EDGE_SIZE_GUIDELINES.MINIMAL,
  maxSize: number = EDGE_SIZE_GUIDELINES.MAXIMUM
): number {
  return Math.max(minSize, Math.min(maxSize, minSize + (maxSize - minSize) * strength));
}

/**
 * Type guard to check if data is valid CbdbGraphData
 */
export function isCbdbGraphData(data: any): data is CbdbGraphData {
  return data &&
    Array.isArray(data.nodes) &&
    Array.isArray(data.edges) &&
    data.options !== undefined &&
    data.attributes !== undefined;
}

/**
 * Create an empty CbdbGraphData structure
 */
export function createEmptyGraphData(): CbdbGraphData {
  return {
    attributes: {},
    options: {
      type: 'mixed',
      multi: true,
      allowSelfLoops: false
    },
    nodes: [],
    edges: []
  };
}

// ============ Type Aliases for Convenience ============
// These are strictly aliases to the properly extended types above

/** Alias for CbdbGraphData - the main type to use */
export type GraphData = CbdbGraphData;

/** Alias for CbdbNode */
export type GraphNode = CbdbNode;

/** Alias for CbdbEdge */
export type GraphEdge = CbdbEdge;

/** Alias for CbdbNodeAttributes */
export type GraphNodeAttributes = CbdbNodeAttributes;

/** Alias for CbdbEdgeAttributes */
export type GraphEdgeAttributes = CbdbEdgeAttributes;