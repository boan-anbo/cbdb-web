/**
 * ITraversalAlgorithm
 * Interface for graph traversal algorithm implementations
 * Can be implemented using different libraries (Graphology, WASM, etc.)
 */

import type Graph from 'graphology';

export interface ITraversalAlgorithm {
  /**
   * Perform breadth-first search from a starting node
   */
  bfs(graph: Graph, startNode: number, maxDepth?: number): Map<number, number>;

  /**
   * Perform depth-first search from a starting node
   */
  dfs(graph: Graph, startNode: number, maxDepth?: number): number[];

  /**
   * Find all connected components in the graph
   */
  findComponents(graph: Graph): number[][];

  /**
   * Find strongly connected components (for directed graphs)
   */
  findStronglyConnectedComponents(graph: Graph): number[][];

  /**
   * Check if the graph is a Directed Acyclic Graph (DAG)
   */
  isDAG(graph: Graph): boolean;

  /**
   * Get topological sort of a DAG
   */
  getTopologicalSort(graph: Graph): number[] | null;

  /**
   * Find all nodes within a certain distance from a starting node
   */
  findNodesWithinDistance(
    graph: Graph,
    startNode: number,
    distance: number
  ): Set<number>;

  /**
   * Find the shortest cycle containing a specific node
   */
  findCycleContainingNode(graph: Graph, node: number): number[] | null;

  /**
   * Get all ancestors of a node in a DAG
   */
  getAncestors(graph: Graph, node: number): Set<number>;

  /**
   * Get all descendants of a node in a DAG
   */
  getDescendants(graph: Graph, node: number): Set<number>;
}