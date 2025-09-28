/**
 * AlgorithmOrchestratorService
 * Main orchestrator for graph algorithms
 * Provides a unified interface for all graph algorithm operations
 * Designed to be easily swappable between JS and future WASM implementations
 */

import { Injectable } from '@nestjs/common';
import Graph from 'graphology';
import { NetworkEdge } from '@cbdb/core';

// Algorithm implementations
import { GraphologyPathfindingAlgorithm } from './graphology/pathfinding.algorithm';
import { GraphologyTraversalAlgorithm } from './graphology/traversal.algorithm';
import { GraphologyMetricsAlgorithm } from './graphology/metrics.algorithm';
import { GraphologyCommunityAlgorithm } from './graphology/community.algorithm';
import { GraphologyLayoutAlgorithm } from './graphology/layout.algorithm';
import { GraphCacheService } from '../cache/graph-cache.service';

/**
 * Service that orchestrates all graph algorithms
 * Acts as a facade to various algorithm implementations
 */
@Injectable()
export class AlgorithmOrchestratorService {
  constructor(
    private readonly pathfinding: GraphologyPathfindingAlgorithm,
    private readonly traversal: GraphologyTraversalAlgorithm,
    private readonly metrics: GraphologyMetricsAlgorithm,
    private readonly community: GraphologyCommunityAlgorithm,
    private readonly layout: GraphologyLayoutAlgorithm,
    private readonly graphCache: GraphCacheService
  ) {}

  /**
   * Convert our edge array to a graphology Graph object
   * This is the bridge between our domain model and the algorithm library
   *
   * @param nodes Set of node IDs
   * @param edges Array of network edges
   * @param directed Whether to create a directed or undirected graph
   * @returns Graphology Graph instance
   */
  buildGraph(
    nodes: Set<number>,
    edges: NetworkEdge[],
    directed: boolean = false
  ): Graph {
    // Use cache to avoid rebuilding the same graph
    return this.graphCache.getOrBuild(
      nodes,
      edges,
      directed,
      this.buildGraphInternal.bind(this)
    );
  }

  /**
   * Internal method to build graph (called by cache if needed)
   */
  private buildGraphInternal(
    nodes: Set<number>,
    edges: NetworkEdge[],
    directed: boolean = false
  ): Graph {
    const graph = new Graph({ type: directed ? 'directed' : 'undirected' });

    // Add nodes
    for (const nodeId of nodes) {
      graph.addNode(nodeId);
    }

    // Add edges
    for (const edge of edges) {
      const weight = edge.edgeDistance !== undefined ?
        1 / (edge.edgeDistance + 1) : // Closer edges have higher weight
        1;

      // Check if edge already exists to avoid duplicates in undirected graphs
      if (!graph.hasEdge(edge.source, edge.target)) {
        graph.addEdge(edge.source, edge.target, {
          weight,
          type: edge.edgeType,
          label: edge.edgeLabel,
          code: edge.edgeCode,
          distance: edge.edgeDistance,
          ...edge.metadata
        });
      }
    }

    return graph;
  }

  /**
   * Find shortest path between two nodes
   * Delegates to PathfindingAlgorithm
   */
  async findShortestPath(
    nodes: Set<number>,
    edges: NetworkEdge[],
    source: number,
    target: number
  ): Promise<number[] | null> {
    const graph = this.buildGraph(nodes, edges);
    return this.pathfinding.findShortestPath(graph, source, target);
  }

  /**
   * Find all paths up to a certain length
   * Delegates to PathfindingAlgorithm
   */
  async findAllPaths(
    nodes: Set<number>,
    edges: NetworkEdge[],
    source: number,
    target: number,
    maxLength: number = 3
  ): Promise<number[][]> {
    const graph = this.buildGraph(nodes, edges);
    return this.pathfinding.findAllPaths(graph, source, target, maxLength);
  }

  /**
   * Perform breadth-first search
   * Delegates to TraversalAlgorithm
   */
  async bfs(
    nodes: Set<number>,
    edges: NetworkEdge[],
    startNode: number,
    maxDepth?: number
  ): Promise<Map<number, number>> {
    const graph = this.buildGraph(nodes, edges);
    return this.traversal.bfs(graph, startNode, maxDepth);
  }

  /**
   * Calculate various network metrics from nodes and edges
   * Delegates to MetricsAlgorithm
   */
  async calculateMetrics(
    nodes: Set<number>,
    edges: NetworkEdge[]
  ): Promise<{
    density: number;
    avgDegree: number;
    avgPathLength: number;
    clusteringCoefficient: number;
    components: number;
  }> {
    const graph = this.buildGraph(nodes, edges);
    return this.metrics.calculateMetrics(graph);
  }

  /**
   * Calculate various network metrics from a Graph instance
   * Separate method for when you already have a graph
   */
  calculateMetricsFromGraph(
    graph: Graph
  ): {
    density: number;
    avgDegree: number;
    avgPathLength: number;
    clusteringCoefficient: number;
    components: number;
  } {
    return this.metrics.calculateMetrics(graph);
  }

  /**
   * Calculate centrality measures
   * Delegates to MetricsAlgorithm
   */
  async calculateCentrality(
    nodes: Set<number>,
    edges: NetworkEdge[]
  ): Promise<{
    betweenness: Map<number, number>;
    closeness: Map<number, number>;
    degree: Map<number, number>;
  }> {
    const graph = this.buildGraph(nodes, edges);
    return this.metrics.calculateCentrality(graph);
  }

  /**
   * Detect communities in the network
   * Delegates to CommunityAlgorithm
   */
  async detectCommunities(
    nodes: Set<number>,
    edges: NetworkEdge[]
  ): Promise<Map<number, number>> {
    const graph = this.buildGraph(nodes, edges);
    return this.community.detectCommunities(graph);
  }

  /**
   * Calculate layout positions for visualization
   * Delegates to LayoutAlgorithm
   */
  async calculateLayout(
    nodes: Set<number>,
    edges: NetworkEdge[],
    algorithm: 'forceatlas2' | 'circular' | 'random' = 'forceatlas2'
  ): Promise<Map<number, { x: number; y: number }>> {
    const graph = this.buildGraph(nodes, edges);
    return this.layout.calculateLayout(graph, algorithm);
  }

  /**
   * Find connected components in the graph
   * Useful for identifying isolated subgraphs
   */
  async findComponents(
    nodes: Set<number>,
    edges: NetworkEdge[]
  ): Promise<number[][]> {
    const graph = this.buildGraph(nodes, edges);
    return this.traversal.findComponents(graph);
  }

  /**
   * Check if the graph is a DAG (Directed Acyclic Graph)
   * Useful for hierarchical relationships
   */
  async isDAG(
    nodes: Set<number>,
    edges: NetworkEdge[]
  ): Promise<boolean> {
    const graph = this.buildGraph(nodes, edges, true);
    return this.traversal.isDAG(graph);
  }

  /**
   * Clear the graph cache
   * Call this when underlying data changes
   */
  clearCache(): void {
    this.graphCache.clear();
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats() {
    return this.graphCache.getStats();
  }
}