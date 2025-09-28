/**
 * Core graph data models
 * Domain-agnostic types for graph operations
 */

export interface GraphMetrics {
  nodeCount: number;
  edgeCount: number;
  density: number;
  avgDegree: number;
}

export interface GraphConfig {
  type: 'directed' | 'undirected' | 'mixed';
  allowSelfLoops?: boolean;
  multi?: boolean;
}

// Node attribute interfaces for common use cases
export interface BaseNodeAttributes {
  label?: string;
  [key: string]: any;
}

// Edge attribute interfaces for common use cases
export interface BaseEdgeAttributes {
  label?: string;
  weight?: number;
  [key: string]: any;
}

// Re-export commonly used interfaces for backward compatibility
export type NodeData<T = any> = {
  id: string | number;
  attributes?: T;
};

export type EdgeData<T = any> = {
  source: string | number;
  target: string | number;
  attributes?: T;
};

// Entity-specific node attributes
export interface EntityNodeAttributes extends BaseNodeAttributes {
  entityType: string;
  entityId: string | number;
}

// Relationship-specific edge attributes
export interface RelationshipEdgeAttributes extends BaseEdgeAttributes {
  relationshipType: string;
}