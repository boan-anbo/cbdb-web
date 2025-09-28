/**
 * IMetricsAlgorithm
 * Interface for graph metrics algorithm implementations
 * Can be implemented using different libraries (Graphology, WASM, etc.)
 */

import type Graph from 'graphology';

export interface GraphMetrics {
  density: number;
  avgDegree: number;
  avgPathLength: number;
  clusteringCoefficient: number;
  components: number;
}

export interface CentralityScores {
  betweenness: Map<number, number>;
  closeness: Map<number, number>;
  degree: Map<number, number>;
}

export interface IMetricsAlgorithm {
  /**
   * Calculate comprehensive network metrics
   */
  calculateMetrics(graph: Graph): GraphMetrics;

  /**
   * Calculate centrality measures for all nodes
   */
  calculateCentrality(graph: Graph): CentralityScores;

  /**
   * Calculate eigenvector centrality
   */
  calculateEigenvectorCentrality(graph: Graph): Map<number, number>;

  /**
   * Calculate local clustering for specific nodes
   */
  calculateLocalClustering(graph: Graph, nodes: number[]): Map<number, number>;

  /**
   * Calculate average clustering coefficient
   */
  calculateAverageClustering(graph: Graph): number;

  /**
   * Calculate modularity for given communities
   */
  calculateModularity(graph: Graph, communities: Map<number, number>): number;

  /**
   * Calculate weighted degree for all nodes
   */
  calculateWeightedDegree(graph: Graph): Map<number, number>;

  /**
   * Calculate network diameter
   */
  calculateDiameter(graph: Graph): number;
}