/**
 * NetworkMetricsCalculator
 * Calculates various network metrics and statistics
 * Extracted from PersonNetworkService for modularity and reusability
 */

import { Injectable } from '@nestjs/common';
import { NetworkEdge, NetworkMetrics, DirectConnection, BridgeNode } from '@cbdb/core';
import { AlgorithmOrchestratorService } from '../../graph/core/algorithms/algorithm-orchestrator.service';
import { GraphologyMetricsAlgorithm } from '../../graph/core/algorithms/graphology/metrics.algorithm';
import { density } from 'graphology-metrics/graph';
// import degree from 'graphology-metrics/degree'; // Not needed if using from algorithm service

/**
 * Service for calculating network metrics
 * Can be reused for any graph metric calculation needs
 * Uses graphology algorithms for advanced metrics
 */
@Injectable()
export class NetworkMetricsCalculator {
  constructor(
    private readonly graphAlgorithms: AlgorithmOrchestratorService,
    private readonly metricsAlgorithm: GraphologyMetricsAlgorithm
  ) {}
  /**
   * Calculate comprehensive network metrics
   * Enhanced with real graph algorithms from graphology
   *
   * @param queryPersons Number of query persons
   * @param totalPersons Total number of persons in network
   * @param totalEdges Total number of edges in network
   * @param directConnections Number of direct connections between query persons
   * @param bridgeNodes Number of bridge nodes
   * @param edges Optional edges for advanced metric calculation
   * @param nodes Optional nodes for advanced metric calculation
   * @returns NetworkMetrics object
   */
  async calculateMetrics(
    queryPersons: number,
    totalPersons: number,
    totalEdges: number,
    directConnections: number,
    bridgeNodes: number,
    edges?: NetworkEdge[],
    nodes?: Set<number>
  ): Promise<NetworkMetrics> {
    const discoveredPersons = totalPersons - queryPersons;
    let density = this.calculateDensity(totalPersons, totalEdges);
    let avgPathLength = 0;
    let components = 1;

    // If we have edges and nodes, calculate advanced metrics using graphology
    if (edges && nodes && edges.length > 0) {
      const graph = this.graphAlgorithms.buildGraph(nodes, edges);
      const graphMetrics = this.metricsAlgorithm.calculateMetrics(graph);

      // Use graphology's more accurate metrics
      density = graphMetrics.density;
      avgPathLength = graphMetrics.avgPathLength;
      components = graphMetrics.components;
    }

    return {
      totalPersons,
      queryPersons,
      discoveredPersons,
      totalEdges,
      directConnections,
      bridgeNodes,
      averagePathLength: avgPathLength,
      density,
      components
    };
  }

  /**
   * Calculate network density using graphology
   * Density = actual edges / possible edges
   *
   * @param nodeCount Number of nodes in the network
   * @param edgeCount Number of edges in the network
   * @returns Network density between 0 and 1
   */
  calculateDensity(nodeCount: number, edgeCount: number): number {
    // For simple cases, use the formula directly
    // For graph-based calculations, use graphology's density function
    if (nodeCount <= 1) {
      return 0;
    }

    // For undirected graph: possible edges = n(n-1)/2
    const possibleEdges = (nodeCount * (nodeCount - 1)) / 2;

    if (possibleEdges === 0) {
      return 0;
    }

    return edgeCount / possibleEdges;
  }

  /**
   * Calculate average degree of nodes
   * Average degree = 2 * edges / nodes (for undirected graph)
   *
   * @param nodeCount Number of nodes
   * @param edgeCount Number of edges
   * @returns Average degree
   */
  calculateAverageDegree(nodeCount: number, edgeCount: number): number {
    if (nodeCount === 0) {
      return 0;
    }

    // For undirected graph, each edge contributes to 2 degrees
    return (2 * edgeCount) / nodeCount;
  }

  /**
   * Calculate degree distribution of the network
   * Uses graphology when a graph is available, otherwise falls back to manual calculation
   *
   * @param edges Array of network edges
   * @param graph Optional graphology graph for more accurate calculation
   * @returns Map of node ID to degree count
   */
  calculateDegreeDistribution(
    edges: NetworkEdge[],
    graph?: any
  ): Map<number, number> {
    // If we have a graph, use graphology's degree function
    if (graph) {
      const degrees = new Map<number, number>();
      graph.forEachNode((node: string | number) => {
        degrees.set(Number(node), graph.degree(node));
      });
      return degrees;
    }

    // Fallback to manual calculation
    const degrees = new Map<number, number>();
    for (const edge of edges) {
      degrees.set(edge.source, (degrees.get(edge.source) || 0) + 1);
      degrees.set(edge.target, (degrees.get(edge.target) || 0) + 1);
    }
    return degrees;
  }

  /**
   * Find nodes with highest degree (most connected)
   *
   * @param edges Array of network edges
   * @param topN Number of top nodes to return
   * @returns Array of [nodeId, degree] sorted by degree
   */
  findHighDegreeNodes(edges: NetworkEdge[], topN: number = 10): Array<[number, number]> {
    const degrees = this.calculateDegreeDistribution(edges);

    // Convert to array and sort by degree
    const sorted = Array.from(degrees.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN);

    return sorted;
  }

  /**
   * Calculate clustering coefficient using graphology
   *
   * @param edges Array of network edges
   * @param nodes Optional set of nodes
   * @returns Clustering coefficient
   */
  async calculateClusteringCoefficient(
    edges: NetworkEdge[],
    nodes?: Set<number>
  ): Promise<number> {
    if (edges.length === 0) {
      return 0;
    }

    // Build graph once and use graphology metrics
    const nodeSet = nodes || this.extractNodesFromEdges(edges);
    const graph = this.graphAlgorithms.buildGraph(nodeSet, edges);
    const metrics = this.metricsAlgorithm.calculateMetrics(graph);

    return metrics.clusteringCoefficient;
  }

  /**
   * Calculate average shortest path length using graphology
   *
   * @param edges Array of network edges
   * @param nodeIds Array of all node IDs
   * @returns Average shortest path length
   */
  async calculateAveragePathLength(
    edges: NetworkEdge[],
    nodeIds: number[]
  ): Promise<number> {
    if (edges.length === 0 || nodeIds.length === 0) {
      return 0;
    }

    const nodes = new Set(nodeIds);
    const graph = this.graphAlgorithms.buildGraph(nodes, edges);
    const metrics = this.metricsAlgorithm.calculateMetrics(graph);

    return metrics.avgPathLength;
  }

  /**
   * Count connected components using graphology
   *
   * @param edges Array of network edges
   * @param nodeIds Array of all node IDs
   * @returns Number of connected components
   */
  async countConnectedComponents(
    edges: NetworkEdge[],
    nodeIds: number[]
  ): Promise<number> {
    if (nodeIds.length === 0) {
      return 0;
    }

    if (edges.length === 0) {
      // All nodes are isolated components
      return nodeIds.length;
    }

    const nodes = new Set(nodeIds);
    const graph = this.graphAlgorithms.buildGraph(nodes, edges);
    const metrics = this.metricsAlgorithm.calculateMetrics(graph);

    return metrics.components;
  }

  /**
   * Calculate network diameter using graphology
   *
   * @param edges Array of network edges
   * @param nodeIds Array of all node IDs
   * @returns Network diameter (longest shortest path)
   */
  async calculateDiameter(
    edges: NetworkEdge[],
    nodeIds: number[]
  ): Promise<number> {
    if (edges.length === 0 || nodeIds.length <= 1) {
      return 0;
    }

    const nodes = new Set(nodeIds);
    const graph = this.graphAlgorithms.buildGraph(nodes, edges);

    return this.metricsAlgorithm.calculateDiameter(graph);
  }

  /**
   * Get edge statistics by type
   *
   * @param edges Array of network edges
   * @returns Statistics grouped by edge type
   */
  getEdgeTypeStatistics(edges: NetworkEdge[]): {
    kinship: number;
    association: number;
    total: number;
  } {
    const stats = {
      kinship: 0,
      association: 0,
      total: edges.length
    };

    for (const edge of edges) {
      if (edge.edgeType === 'kinship') {
        stats.kinship++;
      } else if (edge.edgeType === 'association') {
        stats.association++;
      }
    }

    return stats;
  }

  /**
   * Calculate distance distribution in the network
   *
   * @param nodeDistances Map of node ID to distance from query
   * @returns Distribution of nodes by distance
   */
  getDistanceDistribution(nodeDistances: Map<number, number>): Map<number, number> {
    const distribution = new Map<number, number>();

    for (const distance of nodeDistances.values()) {
      distribution.set(distance, (distribution.get(distance) || 0) + 1);
    }

    return distribution;
  }

  /**
   * Calculate centrality measures for specific nodes
   * Uses graphology for betweenness, closeness, and degree centrality
   *
   * @param edges Array of network edges
   * @param nodeIds Node IDs to calculate centrality for
   * @param allNodes Optional set of all nodes in network
   * @returns Map of node ID to centrality scores
   */
  async calculateCentrality(
    edges: NetworkEdge[],
    nodeIds: number[],
    allNodes?: Set<number>
  ): Promise<Map<number, { betweenness: number; closeness: number; degree: number }>> {
    if (edges.length === 0 || nodeIds.length === 0) {
      return new Map();
    }

    const nodes = allNodes || this.extractNodesFromEdges(edges);
    const graph = this.graphAlgorithms.buildGraph(nodes, edges);
    const { betweenness, closeness, degree } = this.metricsAlgorithm.calculateCentrality(graph);

    const result = new Map<number, { betweenness: number; closeness: number; degree: number }>();
    for (const nodeId of nodeIds) {
      result.set(nodeId, {
        betweenness: betweenness.get(nodeId) || 0,
        closeness: closeness.get(nodeId) || 0,
        degree: degree.get(nodeId) || 0
      });
    }

    return result;
  }

  /**
   * Calculate eigenvector centrality (influence based on neighbor importance)
   *
   * @param edges Array of network edges
   * @param nodes Optional set of nodes
   * @returns Map of node ID to eigenvector centrality score
   */
  async calculateEigenvectorCentrality(
    edges: NetworkEdge[],
    nodes?: Set<number>
  ): Promise<Map<number, number>> {
    if (edges.length === 0) {
      return new Map();
    }

    const nodeSet = nodes || this.extractNodesFromEdges(edges);
    const graph = this.graphAlgorithms.buildGraph(nodeSet, edges);

    return this.metricsAlgorithm.calculateEigenvectorCentrality(graph);
  }

  /**
   * Calculate local clustering for specific nodes
   *
   * @param edges Array of network edges
   * @param nodeIds Nodes to calculate clustering for
   * @param allNodes Optional set of all nodes
   * @returns Map of node ID to local clustering coefficient
   */
  async calculateLocalClustering(
    edges: NetworkEdge[],
    nodeIds: number[],
    allNodes?: Set<number>
  ): Promise<Map<number, number>> {
    if (edges.length === 0 || nodeIds.length === 0) {
      return new Map();
    }

    const nodes = allNodes || this.extractNodesFromEdges(edges);
    const graph = this.graphAlgorithms.buildGraph(nodes, edges);

    return this.metricsAlgorithm.calculateLocalClustering(graph, nodeIds);
  }

  /**
   * Extract all unique nodes from edges
   * Helper method for when node set is not provided
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
   * Calculate network efficiency metrics
   *
   * @param metrics Basic network metrics
   * @returns Efficiency indicators
   */
  calculateEfficiencyMetrics(metrics: NetworkMetrics): {
    sparsity: number;
    connectedness: number;
    centralization: number;
  } {
    return {
      sparsity: 1 - metrics.density, // How sparse the network is
      connectedness: metrics.components === 1 ? 1 : 1 / metrics.components, // How connected
      centralization: 0 // Centralization would require more complex calculation
    };
  }
}