/**
 * ILayoutAlgorithm
 * Interface for graph layout algorithm implementations
 * Can be implemented using different libraries (Graphology, WASM, etc.)
 */

import type Graph from 'graphology';

export type LayoutAlgorithmType = 'forceatlas2' | 'circular' | 'random' | 'hierarchical' | 'grid';

export interface Position {
  x: number;
  y: number;
}

export interface LayoutOptions {
  iterations?: number;
  gravity?: number;
  scalingRatio?: number;
  barnesHutOptimize?: boolean;
  strongGravityMode?: boolean;
  outboundAttractionDistribution?: boolean;
}

export interface ILayoutAlgorithm {
  /**
   * Calculate layout using specified algorithm
   */
  calculateLayout(
    graph: Graph,
    algorithm: LayoutAlgorithmType,
    options?: LayoutOptions
  ): Map<number, Position>;

  /**
   * Calculate hierarchical layout for directed graphs
   */
  calculateHierarchicalLayout(graph: Graph): Map<number, Position>;

  /**
   * Calculate circular layout
   */
  calculateCircularLayout(graph: Graph, scale?: number): Map<number, Position>;

  /**
   * Calculate random layout
   */
  calculateRandomLayout(graph: Graph, scale?: number): Map<number, Position>;

  /**
   * Calculate force-directed layout
   */
  calculateForceDirectedLayout(
    graph: Graph,
    options?: LayoutOptions
  ): Map<number, Position>;

  /**
   * Calculate grid layout
   */
  calculateGridLayout(graph: Graph, columns?: number): Map<number, Position>;

  /**
   * Optimize layout for reduced edge crossings
   */
  optimizeLayout(
    graph: Graph,
    initialLayout: Map<number, Position>
  ): Map<number, Position>;
}