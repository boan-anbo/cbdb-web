/**
 * IPathfindingAlgorithm
 * Interface for pathfinding algorithm implementations
 * Can be implemented using different libraries (Graphology, WASM, etc.)
 */

import type Graph from 'graphology';

export interface IPathfindingAlgorithm {
  /**
   * Find the shortest path between two nodes
   */
  findShortestPath(graph: Graph, source: number, target: number): number[] | null;

  /**
   * Find the shortest weighted path using edge weights
   */
  findWeightedShortestPath(graph: Graph, source: number, target: number): number[] | null;

  /**
   * Find all shortest paths from a single source to all other nodes
   */
  findAllShortestPathsFromSource(graph: Graph, source: number): Map<number, number[]>;

  /**
   * Find the lengths of shortest paths from a source to all other nodes
   */
  findShortestPathLengths(graph: Graph, source: number): Map<number, number>;

  /**
   * Find all paths between two nodes up to a maximum length
   */
  findAllPaths(
    graph: Graph,
    source: number,
    target: number,
    maxLength: number
  ): number[][];

  /**
   * Find paths that must go through specific intermediate nodes
   */
  findPathsThroughNodes(
    graph: Graph,
    source: number,
    target: number,
    throughNodes: number[]
  ): number[][];

  /**
   * Calculate the average shortest path length for the entire graph
   */
  calculateAveragePathLength(graph: Graph): number;

  /**
   * Find the diameter of the graph (longest shortest path)
   */
  calculateDiameter(graph: Graph): number;
}