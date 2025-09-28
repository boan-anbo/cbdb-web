/**
 * PathwayFinder
 * Finds paths between nodes in the network
 * Enhanced with graphology algorithms for real pathfinding
 */

import { Injectable } from '@nestjs/common';
import { NetworkEdge, Pathway } from '@cbdb/core';
import { AlgorithmOrchestratorService } from '../../graph/core/algorithms/algorithm-orchestrator.service';

/**
 * Service for finding paths between nodes in a network
 * Uses graphology algorithms for advanced pathfinding
 */
@Injectable()
export class PathwayFinder {
  constructor(private readonly graphAlgorithms: AlgorithmOrchestratorService) {}
  /**
   * Find pathways between query persons
   * Uses graph algorithms to find both direct and indirect paths
   *
   * @param edges Array of network edges
   * @param queryPersons Set of query person IDs
   * @param allPersons Optional set of all persons in network
   * @returns Array of pathways between query persons
   */
  async findPathways(
    edges: NetworkEdge[],
    queryPersons: Set<number>,
    allPersons?: Set<number>
  ): Promise<Pathway[]> {
    const pathways: Pathway[] = [];
    const processedPairs = new Set<string>();

    // Create set of all nodes if not provided
    const nodes = allPersons || this.extractNodesFromEdges(edges);

    // Find paths between each pair of query persons
    const queryArray = Array.from(queryPersons);
    for (let i = 0; i < queryArray.length; i++) {
      for (let j = i + 1; j < queryArray.length; j++) {
        const source = queryArray[i];
        const target = queryArray[j];
        const pairKey = [source, target].sort().join('-');

        if (processedPairs.has(pairKey)) continue;
        processedPairs.add(pairKey);

        // Find shortest path between the pair
        const shortestPath = await this.graphAlgorithms.findShortestPath(
          nodes,
          edges,
          source,
          target
        );

        if (shortestPath && shortestPath.length > 0) {
          const pathway = this.buildPathwayFromPath(shortestPath, edges);
          if (pathway) {
            pathways.push(pathway);
          }
        }
      }
    }

    return pathways;
  }

  /**
   * Extract all unique nodes from edges
   */
  private extractNodesFromEdges(edges: NetworkEdge[]): Set<number> {
    const nodes = new Set<number>();
    for (const edge of edges) {
      nodes.add(edge.source);
      nodes.add(edge.target);
    }
    return nodes;
  }

  /**
   * Find all direct pathways (current implementation)
   * Direct pathways are single-edge connections between query persons
   *
   * @param edges Array of network edges
   * @param queryPersons Set of query person IDs
   * @returns Array of direct pathways
   */
  findDirectPathways(
    edges: NetworkEdge[],
    queryPersons: Set<number>
  ): Pathway[] {
    const pathways: Pathway[] = [];
    const processedPairs = new Set<string>();

    for (const edge of edges) {
      // Check if both ends are query persons
      if (!queryPersons.has(edge.source) || !queryPersons.has(edge.target)) {
        continue;
      }

      // Create unique pair key to avoid duplicates
      const pairKey = [edge.source, edge.target].sort().join('-');
      if (processedPairs.has(pairKey)) {
        continue;
      }
      processedPairs.add(pairKey);

      pathways.push(this.createPathway(edge.source, edge.target, [edge]));
    }

    return pathways;
  }

  /**
   * Find shortest path between two specific nodes
   * Uses Dijkstra's algorithm for optimal pathfinding
   *
   * @param edges Array of network edges
   * @param fromNode Source node ID
   * @param toNode Target node ID
   * @param allNodes Optional set of all nodes
   * @returns Shortest pathway or null if no path exists
   */
  async findShortestPath(
    edges: NetworkEdge[],
    fromNode: number,
    toNode: number,
    allNodes?: Set<number>
  ): Promise<Pathway | null> {
    const nodes = allNodes || this.extractNodesFromEdges(edges);

    const path = await this.graphAlgorithms.findShortestPath(
      nodes,
      edges,
      fromNode,
      toNode
    );

    if (path && path.length > 0) {
      return this.buildPathwayFromPath(path, edges);
    }

    return null;
  }

  /**
   * Find all paths between two nodes up to a maximum length
   * Uses DFS with depth limit for comprehensive path discovery
   *
   * @param edges Array of network edges
   * @param fromNode Source node ID
   * @param toNode Target node ID
   * @param maxLength Maximum path length to consider
   * @param allNodes Optional set of all nodes
   * @returns Array of all pathways within max length
   */
  async findAllPaths(
    edges: NetworkEdge[],
    fromNode: number,
    toNode: number,
    maxLength: number = 3,
    allNodes?: Set<number>
  ): Promise<Pathway[]> {
    const nodes = allNodes || this.extractNodesFromEdges(edges);

    const paths = await this.graphAlgorithms.findAllPaths(
      nodes,
      edges,
      fromNode,
      toNode,
      maxLength
    );

    const pathways: Pathway[] = [];
    for (const path of paths) {
      const pathway = this.buildPathwayFromPath(path, edges);
      if (pathway) {
        pathways.push(pathway);
      }
    }

    return pathways;
  }

  /**
   * Find paths through specific intermediate nodes
   * Useful for finding connections through bridge nodes
   *
   * @param edges Array of network edges
   * @param fromNode Source node ID
   * @param toNode Target node ID
   * @param throughNodes Array of node IDs the path must pass through
   * @param allNodes Optional set of all nodes
   * @returns Array of pathways passing through specified nodes
   */
  async findPathsThroughNodes(
    edges: NetworkEdge[],
    fromNode: number,
    toNode: number,
    throughNodes: number[],
    allNodes?: Set<number>
  ): Promise<Pathway[]> {
    const nodes = allNodes || this.extractNodesFromEdges(edges);

    // Find all paths and filter those going through required nodes
    const allPaths = await this.graphAlgorithms.findAllPaths(
      nodes,
      edges,
      fromNode,
      toNode,
      throughNodes.length + 2  // Max length should accommodate all intermediate nodes
    );

    const pathways: Pathway[] = [];
    for (const path of allPaths) {
      // Check if path includes all required nodes
      const pathSet = new Set(path);
      const includesAll = throughNodes.every(node => pathSet.has(node));

      if (includesAll) {
        const pathway = this.buildPathwayFromPath(path, edges);
        if (pathway) {
          pathways.push(pathway);
        }
      }
    }

    return pathways;
  }

  /**
   * Create a Pathway object from path information
   *
   * @param fromPerson Starting person ID
   * @param toPerson Ending person ID
   * @param pathEdges Edges that form the path
   * @param explicitPath Optional explicit path array (when already known)
   * @returns Pathway object
   */
  private createPathway(
    fromPerson: number,
    toPerson: number,
    pathEdges: NetworkEdge[],
    explicitPath?: number[]
  ): Pathway {
    // Use explicit path if provided, otherwise build from edges
    const path = explicitPath || this.buildPathFromEdges(fromPerson, pathEdges);

    // Determine path type (kinship, association, or mixed)
    const pathType = this.determinePathType(pathEdges);

    return {
      fromPerson,
      toPerson,
      path,
      edges: pathEdges,
      pathLength: pathEdges.length,
      pathType
    };
  }

  /**
   * Build path array from edges
   */
  private buildPathFromEdges(startNode: number, pathEdges: NetworkEdge[]): number[] {
    const path: number[] = [startNode];
    let currentNode = startNode;

    for (const edge of pathEdges) {
      if (edge.source === currentNode) {
        currentNode = edge.target;
      } else {
        currentNode = edge.source;
      }
      path.push(currentNode);
    }

    return path;
  }

  /**
   * Determine the type of a pathway based on its edges
   *
   * @param edges Edges in the pathway
   * @returns Path type: 'kinship', 'association', or 'mixed'
   */
  private determinePathType(edges: NetworkEdge[]): 'kinship' | 'association' | 'mixed' {
    let hasKinship = false;
    let hasAssociation = false;

    for (const edge of edges) {
      if (edge.edgeType === 'kinship') {
        hasKinship = true;
      } else if (edge.edgeType === 'association') {
        hasAssociation = true;
      }
    }

    if (hasKinship && hasAssociation) {
      return 'mixed';
    } else if (hasKinship) {
      return 'kinship';
    } else {
      return 'association';
    }
  }

  /**
   * Build pathway object from a path array
   *
   * @param path Array of node IDs representing the path
   * @param edges All edges in the network
   * @returns Pathway object or null if path edges cannot be found
   */
  private buildPathwayFromPath(path: number[], edges: NetworkEdge[]): Pathway | null {
    if (!path || path.length < 2) {
      return null;
    }

    const pathEdges: NetworkEdge[] = [];

    // Find edges that form the path
    for (let i = 0; i < path.length - 1; i++) {
      const source = path[i];
      const target = path[i + 1];

      const edge = edges.find(e =>
        (e.source === source && e.target === target) ||
        (e.source === target && e.target === source)
      );

      if (edge) {
        pathEdges.push(edge);
      } else {
        // Path edge not found, invalid path
        return null;
      }
    }

    return this.createPathway(path[0], path[path.length - 1], pathEdges, path);
  }

  /**
   * Build adjacency list from edges for graph algorithms
   * Helper method for graph operations
   *
   * @param edges Array of network edges
   * @returns Map of node ID to array of neighbor IDs
   */
  private buildAdjacencyList(edges: NetworkEdge[]): Map<number, number[]> {
    const adjacency = new Map<number, number[]>();

    for (const edge of edges) {
      // Add target to source's neighbors
      if (!adjacency.has(edge.source)) {
        adjacency.set(edge.source, []);
      }
      adjacency.get(edge.source)!.push(edge.target);

      // Add source to target's neighbors (undirected)
      if (!adjacency.has(edge.target)) {
        adjacency.set(edge.target, []);
      }
      adjacency.get(edge.target)!.push(edge.source);
    }

    return adjacency;
  }

  /**
   * Calculate path strength based on edge types and weights
   * Useful for ranking multiple paths between same nodes
   *
   * @param pathway Pathway to evaluate
   * @returns Strength score
   */
  calculatePathStrength(pathway: Pathway): number {
    let strength = 0;

    for (const edge of pathway.edges) {
      // Kinship edges might be considered stronger
      if (edge.edgeType === 'kinship') {
        strength += 2;
      } else {
        strength += 1;
      }

      // Closer edges (lower distance) are stronger
      strength += 1 / (edge.edgeDistance + 1);
    }

    // Shorter paths are generally stronger
    strength = strength / pathway.pathLength;

    return strength;
  }
}