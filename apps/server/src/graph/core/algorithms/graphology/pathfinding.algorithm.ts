/**
 * GraphologyPathfindingAlgorithm
 * Graphology-based implementation of pathfinding algorithms
 * Implements a standard interface for swappable implementations
 */

import { Injectable } from '@nestjs/common';
import Graph from 'graphology';
import { bidirectional, singleSource, singleSourceLength } from 'graphology-shortest-path';
import * as dijkstra from 'graphology-shortest-path/dijkstra';

/**
 * Pathfinding algorithm implementation using Graphology library
 */
@Injectable()
export class GraphologyPathfindingAlgorithm {
  /**
   * Find the shortest path between two nodes using Dijkstra's algorithm
   *
   * @param graph Graphology graph instance
   * @param source Source node ID
   * @param target Target node ID
   * @returns Array of node IDs representing the path, or null if no path exists
   */
  findShortestPath(graph: Graph, source: number, target: number): number[] | null {
    // Check if nodes exist first instead of using try-catch for control flow
    if (!graph.hasNode(source) || !graph.hasNode(target)) {
      return null;
    }

    // Graphology handles type coercion - no need for String() conversion
    const path = bidirectional(graph, source, target);
    // Graphology returns string node IDs, convert back to numbers
    return path ? path.map(node => Number(node)) : null;
  }

  /**
   * Find the shortest weighted path using edge weights
   *
   * @param graph Graphology graph instance
   * @param source Source node ID
   * @param target Target node ID
   * @returns Array of node IDs representing the weighted shortest path
   */
  findWeightedShortestPath(graph: Graph, source: number, target: number): number[] | null {
    if (!graph.hasNode(source) || !graph.hasNode(target)) {
      return null;
    }

    const path = dijkstra.bidirectional(
      graph,
      source,
      target,
      'weight'
    );
    return path ? path.map(node => Number(node)) : null;
  }

  /**
   * Find all shortest paths from a single source to all other nodes
   *
   * @param graph Graphology graph instance
   * @param source Source node ID
   * @returns Map of target node ID to path array
   */
  findAllShortestPathsFromSource(graph: Graph, source: number): Map<number, number[]> {
    if (!graph.hasNode(source)) {
      return new Map();
    }

    const paths = singleSource(graph, source);
    const result = new Map<number, number[]>();

    for (const [target, path] of Object.entries(paths)) {
      if (path && Array.isArray(path)) {
        result.set(Number(target), path.map(node => Number(node)));
      }
    }

    return result;
  }

  /**
   * Find the lengths of shortest paths from a source to all other nodes
   *
   * @param graph Graphology graph instance
   * @param source Source node ID
   * @returns Map of target node ID to path length
   */
  findShortestPathLengths(graph: Graph, source: number): Map<number, number> {
    if (!graph.hasNode(source)) {
      return new Map();
    }

    const lengths = singleSourceLength(graph, source);
    const result = new Map<number, number>();

    for (const [target, length] of Object.entries(lengths)) {
      result.set(Number(target), length as number);
    }

    return result;
  }

  /**
   * Find all paths between two nodes up to a maximum length
   * Uses DFS with depth limit
   *
   * @param graph Graphology graph instance
   * @param source Source node ID
   * @param target Target node ID
   * @param maxLength Maximum path length
   * @returns Array of paths (each path is an array of node IDs)
   */
  findAllPaths(
    graph: Graph,
    source: number,
    target: number,
    maxLength: number = 3
  ): number[][] {
    const paths: number[][] = [];
    const visited = new Set<number>();

    const dfs = (current: number, path: number[]) => {
      // Check if we've exceeded max length
      if (path.length > maxLength + 1) {
        return;
      }

      // Found target
      if (current === target) {
        paths.push([...path]);
        return;
      }

      // Mark as visited
      visited.add(current);

      // Explore neighbors - neighbors() returns strings even for number nodes
      const neighbors = graph.neighbors(current);
      for (const neighbor of neighbors) {
        const neighborNum = Number(neighbor);
        if (!visited.has(neighborNum)) {
          dfs(neighborNum, [...path, neighborNum]);
        }
      }

      // Backtrack
      visited.delete(current);
    };

    // Start DFS from source
    dfs(source, [source]);

    return paths;
  }

  /**
   * Find paths that must go through specific intermediate nodes
   *
   * @param graph Graphology graph instance
   * @param source Source node ID
   * @param target Target node ID
   * @param throughNodes Array of node IDs the path must pass through
   * @returns Array of paths that go through all specified nodes
   */
  findPathsThroughNodes(
    graph: Graph,
    source: number,
    target: number,
    throughNodes: number[]
  ): number[][] {
    const validPaths: number[][] = [];

    // Get all paths between source and target
    const allPaths = this.findAllPaths(graph, source, target, throughNodes.length + 2);

    // Filter paths that go through all required nodes
    for (const path of allPaths) {
      const pathSet = new Set(path);
      const containsAll = throughNodes.every(node => pathSet.has(node));

      if (containsAll) {
        validPaths.push(path);
      }
    }

    return validPaths;
  }

  /**
   * Calculate the average shortest path length for the entire graph
   * Useful for network metrics
   *
   * @param graph Graphology graph instance
   * @returns Average shortest path length
   */
  calculateAveragePathLength(graph: Graph): number {
    let totalLength = 0;
    let pathCount = 0;

    const nodes = graph.nodes();

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        // Check nodes exist (though they should since we got them from graph.nodes())
        if (graph.hasNode(nodes[i]) && graph.hasNode(nodes[j])) {
          const path = bidirectional(graph, nodes[i], nodes[j]);
          if (path) {
            totalLength += path.length - 1; // Path length is number of edges
            pathCount++;
          }
        }
      }
    }

    return pathCount > 0 ? totalLength / pathCount : 0;
  }

  /**
   * Find the diameter of the graph (longest shortest path)
   *
   * @param graph Graphology graph instance
   * @returns The diameter of the graph
   */
  calculateDiameter(graph: Graph): number {
    let maxLength = 0;
    const nodes = graph.nodes();

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (graph.hasNode(nodes[i]) && graph.hasNode(nodes[j])) {
          const path = bidirectional(graph, nodes[i], nodes[j]);
          if (path) {
            maxLength = Math.max(maxLength, path.length - 1);
          }
        }
      }
    }

    return maxLength;
  }
}