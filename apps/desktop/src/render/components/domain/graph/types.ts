/**
 * Domain-specific graph types for frontend visualization
 *
 * This file contains types for graph statistics and other
 * domain concerns. The actual graph data types (GraphNode, GraphEdge, GraphData)
 * are imported from the NetworkGraph visualization component.
 *
 * Note: In the future, GraphNode/GraphEdge will be moved to @cbdb/core
 * as shared contracts between frontend and backend.
 */

/**
 * Network statistics for graph analysis
 */
export interface NetworkStats {
  /** Total number of nodes */
  nodeCount: number;

  /** Total number of edges */
  edgeCount: number;

  /** Average degree (connections per node) */
  avgDegree: number;

  /** Graph density (ratio of actual to possible edges) */
  density: number;

  /** Number of connected components */
  components: number;

  /** Largest connected component size */
  largestComponent: number;

  /** Graph diameter (longest shortest path) */
  diameter?: number;

  /** Average clustering coefficient */
  avgClustering?: number;

  /** Additional domain-specific stats */
  [key: string]: any;
}