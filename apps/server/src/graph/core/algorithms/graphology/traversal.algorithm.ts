/**
 * GraphologyTraversalAlgorithm
 * Graphology-based implementation of traversal algorithms
 */

import { Injectable } from '@nestjs/common';
import Graph from 'graphology';
import { bfsFromNode, dfsFromNode } from 'graphology-traversal';
import { connectedComponents, stronglyConnectedComponents } from 'graphology-components';

/**
 * Traversal algorithm implementation using Graphology library
 */
@Injectable()
export class GraphologyTraversalAlgorithm {
  /**
   * Perform breadth-first search from a starting node
   *
   * @param graph Graphology graph instance
   * @param startNode Starting node ID
   * @param maxDepth Optional maximum depth to traverse
   * @returns Map of node ID to distance from start node
   */
  bfs(graph: Graph, startNode: number, maxDepth?: number): Map<number, number> {
    const distances = new Map<number, number>();

    if (!graph.hasNode(startNode)) {
      return distances;
    }

    distances.set(startNode, 0);

    // No need for String() - graphology handles type coercion
    bfsFromNode(graph, startNode, (node, attr, depth) => {
      distances.set(Number(node), depth);

      // Stop traversal if max depth is reached
      if (maxDepth !== undefined && depth >= maxDepth) {
        return true; // Return true to stop traversal
      }
      return false;
    });

    return distances;
  }

  /**
   * Perform depth-first search from a starting node
   *
   * @param graph Graphology graph instance
   * @param startNode Starting node ID
   * @param maxDepth Optional maximum depth to traverse
   * @returns Array of nodes in DFS order
   */
  dfs(graph: Graph, startNode: number, maxDepth?: number): number[] {
    const visited: number[] = [];

    if (!graph.hasNode(startNode)) {
      return visited;
    }

    const depths = new Map<number, number>();
    depths.set(startNode, 0);

    // No need for String() - graphology handles type coercion
    dfsFromNode(graph, startNode, (node, attr, depth) => {
      const nodeId = Number(node);
      visited.push(nodeId);
      depths.set(nodeId, depth);

      // Stop traversal if max depth is reached
      if (maxDepth !== undefined && depth >= maxDepth) {
        return true;
      }
      return false;
    });

    return visited;
  }

  /**
   * Find all connected components in the graph
   *
   * @param graph Graphology graph instance
   * @returns Array of components (each component is an array of node IDs)
   */
  findComponents(graph: Graph): number[][] {
    const components = connectedComponents(graph);

    // Check if connectedComponents returns an array (seems like a version difference)
    if (Array.isArray(components)) {
      // It's already an array of arrays, just convert node IDs to numbers
      return components.map(component =>
        component.map(node => Number(node))
      );
    }

    // Otherwise, it's an object mapping nodes to component IDs
    const componentMap = new Map<number, number[]>();

    // Group nodes by component
    for (const [node, componentId] of Object.entries(components)) {
      const nodeId = Number(node);
      const compId = Number(componentId);
      if (!componentMap.has(compId)) {
        componentMap.set(compId, []);
      }
      componentMap.get(compId)!.push(nodeId);
    }

    return Array.from(componentMap.values());
  }

  /**
   * Find strongly connected components (for directed graphs)
   *
   * @param graph Graphology graph instance
   * @returns Array of strongly connected components
   */
  findStronglyConnectedComponents(graph: Graph): number[][] {
    if (graph.type !== 'directed') {
      // For undirected graphs, fall back to regular components
      return this.findComponents(graph);
    }

    const components = stronglyConnectedComponents(graph);
    const componentMap = new Map<number, number[]>();

    for (const [node, componentId] of Object.entries(components)) {
      const nodeId = Number(node);
      const compId = Number(componentId);
      if (!componentMap.has(compId)) {
        componentMap.set(compId, []);
      }
      const componentNodes = componentMap.get(compId);
      if (componentNodes) {
        componentNodes.push(nodeId);
      }
    }

    return Array.from(componentMap.values());
  }

  /**
   * Check if the graph is a Directed Acyclic Graph (DAG)
   *
   * @param graph Graphology graph instance
   * @returns True if the graph is a DAG
   */
  isDAG(graph: Graph): boolean {
    if (graph.type !== 'directed') {
      return false;
    }

    // Check for cycles using DFS
    return !this.hasCycle(graph);
  }

  /**
   * Get topological sort of a DAG
   *
   * @param graph Graphology graph instance
   * @returns Array of node IDs in topological order, or null if not a DAG
   */
  getTopologicalSort(graph: Graph): number[] | null {
    if (!this.isDAG(graph)) {
      return null;
    }

    // Simple topological sort using Kahn's algorithm
    const inDegree = new Map<string, number>();
    const queue: string[] = [];
    const result: number[] = [];

    // Initialize in-degrees
    graph.forEachNode(node => {
      inDegree.set(node, graph.inDegree(node));
      if (graph.inDegree(node) === 0) {
        queue.push(node);
      }
    });

    while (queue.length > 0) {
      const node = queue.shift()!;
      result.push(Number(node));

      graph.forEachOutNeighbor(node, neighbor => {
        const deg = inDegree.get(neighbor)! - 1;
        inDegree.set(neighbor, deg);
        if (deg === 0) {
          queue.push(neighbor);
        }
      });
    }

    return result.length === graph.order ? result : null;
  }

  /**
   * Find all nodes within a certain distance from a starting node
   *
   * @param graph Graphology graph instance
   * @param startNode Starting node ID
   * @param distance Maximum distance
   * @returns Set of node IDs within the specified distance
   */
  findNodesWithinDistance(
    graph: Graph,
    startNode: number,
    distance: number
  ): Set<number> {
    const nodesInRange = new Set<number>();

    bfsFromNode(graph, String(startNode), (node, attr, depth) => {
      if (depth <= distance) {
        nodesInRange.add(Number(node));
      }
      return depth >= distance; // Stop when we reach max distance
    });

    return nodesInRange;
  }

  /**
   * Find the shortest cycle containing a specific node
   *
   * @param graph Graphology graph instance
   * @param node Node ID
   * @returns Array representing the cycle, or null if no cycle exists
   */
  findCycleContainingNode(graph: Graph, node: number): number[] | null {
    const visited = new Set<number>();
    const parent = new Map<number, number>();
    let cycle: number[] | null = null;

    const dfsForCycle = (current: number, from: number | null): boolean => {
      visited.add(current);
      if (from !== null) {
        parent.set(current, from);
      }

      const neighbors = graph.neighbors(current);
      for (const neighbor of neighbors) {
        const neighborId = Number(neighbor);

        if (!visited.has(neighborId)) {
          if (dfsForCycle(neighborId, current)) {
            return true;
          }
        } else if (from !== neighborId && neighborId === node) {
          // Found a cycle back to our starting node
          cycle = [neighborId];
          let curr = current;
          while (curr !== neighborId && parent.has(curr)) {
            cycle.push(curr);
            curr = parent.get(curr)!;
          }
          cycle.push(curr);
          return true;
        }
      }

      return false;
    };

    dfsForCycle(node, null);
    return cycle;
  }

  /**
   * Get all ancestors of a node in a DAG
   *
   * @param graph Graphology graph instance (must be directed)
   * @param node Node ID
   * @returns Set of ancestor node IDs
   */
  getAncestors(graph: Graph, node: number): Set<number> {
    const ancestors = new Set<number>();

    if (graph.type !== 'directed') {
      return ancestors;
    }

    const visited = new Set<number>();
    const stack: number[] = [];

    // Get all nodes that have edges TO the target node
    graph.forEachInEdge(node, (edge, attributes, source) => {
      const sourceId = Number(source);
      if (!visited.has(sourceId)) {
        stack.push(sourceId);
      }
    });

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (visited.has(current)) continue;

      visited.add(current);
      ancestors.add(current);

      // Add predecessors
      graph.forEachInEdge(current, (edge, attributes, source) => {
        const sourceId = Number(source);
        if (!visited.has(sourceId)) {
          stack.push(sourceId);
        }
      });
    }

    return ancestors;
  }

  /**
   * Get all descendants of a node in a DAG
   *
   * @param graph Graphology graph instance (must be directed)
   * @param node Node ID
   * @returns Set of descendant node IDs
   */
  getDescendants(graph: Graph, node: number): Set<number> {
    const descendants = new Set<number>();

    if (graph.type !== 'directed') {
      return descendants;
    }

    const visited = new Set<number>();
    const stack: number[] = [];

    // Get all nodes that this node has edges TO
    graph.forEachOutEdge(node, (edge, attributes, source, target) => {
      const targetId = Number(target);
      if (!visited.has(targetId)) {
        stack.push(targetId);
      }
    });

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (visited.has(current)) continue;

      visited.add(current);
      descendants.add(current);

      // Add successors
      graph.forEachOutEdge(current, (edge, attributes, source, target) => {
        const targetId = Number(target);
        if (!visited.has(targetId)) {
          stack.push(targetId);
        }
      });
    }

    return descendants;
  }

  /**
   * Helper method to check if graph has a cycle
   */
  private hasCycle(graph: Graph): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycleDFS = (node: string): boolean => {
      visited.add(node);
      recursionStack.add(node);

      const neighbors = graph.outNeighbors(node);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycleDFS(neighbor)) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(node);
      return false;
    };

    for (const node of graph.nodes()) {
      if (!visited.has(node)) {
        if (hasCycleDFS(node)) {
          return true;
        }
      }
    }

    return false;
  }
}