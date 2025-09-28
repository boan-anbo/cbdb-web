/**
 * GraphologyMetricsAlgorithm
 * Graphology-based implementation of graph metrics algorithms
 */

import { Injectable } from '@nestjs/common';
import Graph from 'graphology';
import { connectedComponents } from 'graphology-components';
import * as metrics from 'graphology-metrics';

/**
 * Metrics algorithm implementation using Graphology library
 */
@Injectable()
export class GraphologyMetricsAlgorithm {
  /**
   * Calculate comprehensive network metrics
   *
   * @param graph Graphology graph instance
   * @returns Object containing various network metrics
   */
  calculateMetrics(graph: Graph): {
    density: number;
    avgDegree: number;
    avgPathLength: number;
    clusteringCoefficient: number;
    components: number;
  } {
    // Calculate density using graphology
    const graphDensity = metrics.graph.density(graph);

    // Calculate average degree
    const totalDegree = graph.edges().length * 2; // Each edge contributes to 2 degrees
    const avgDegree = graph.order > 0 ? totalDegree / graph.order : 0;

    // Calculate average path length (simplified for performance)
    const avgPathLength = this.calculateAveragePathLength(graph);

    // Calculate clustering coefficient - simplified for now
    // TODO: Add proper clustering coefficient when available
    const clusteringCoefficient = this.calculateSimpleClusteringCoefficient(graph);

    // Count connected components
    const componentData = connectedComponents(graph);
    const componentSet = new Set(Object.values(componentData));
    const components = componentSet.size;

    return {
      density: graphDensity,
      avgDegree,
      avgPathLength,
      clusteringCoefficient,
      components
    };
  }

  /**
   * Calculate various centrality measures for all nodes
   *
   * @param graph Graphology graph instance
   * @returns Maps of node IDs to centrality scores
   */
  calculateCentrality(graph: Graph): {
    betweenness: Map<number, number>;
    closeness: Map<number, number>;
    degree: Map<number, number>;
  } {
    // Calculate betweenness centrality
    const betweennessScores = metrics.centrality.betweenness(graph);
    const betweenness = new Map<number, number>();
    for (const [node, score] of Object.entries(betweennessScores)) {
      betweenness.set(Number(node), score);
    }

    // Calculate closeness centrality
    const closenessScores = metrics.centrality.closeness(graph);
    const closeness = new Map<number, number>();
    for (const [node, score] of Object.entries(closenessScores)) {
      closeness.set(Number(node), score);
    }

    // Calculate degree centrality
    const degreeScores = metrics.centrality.degree(graph);
    const degree = new Map<number, number>();
    for (const [node, score] of Object.entries(degreeScores)) {
      degree.set(Number(node), score);
    }

    return { betweenness, closeness, degree };
  }

  /**
   * Calculate eigenvector centrality
   * Measures influence of a node based on connections to other influential nodes
   *
   * @param graph Graphology graph instance
   * @returns Map of node IDs to eigenvector centrality scores
   */
  calculateEigenvectorCentrality(graph: Graph): Map<number, number> {
    const scores = metrics.centrality.eigenvector(graph);
    const result = new Map<number, number>();

    for (const [node, score] of Object.entries(scores)) {
      result.set(Number(node), score);
    }

    return result;
  }

  /**
   * Calculate local clustering coefficient for specific nodes
   *
   * @param graph Graphology graph instance
   * @param nodes Array of node IDs to calculate for
   * @returns Map of node IDs to local clustering coefficients
   */
  calculateLocalClustering(graph: Graph, nodes: number[]): Map<number, number> {
    const result = new Map<number, number>();

    for (const node of nodes) {
      // Simple implementation - count triangles
      // Convert to string for graphology
      const coefficient = this.calculateNodeClusteringCoefficient(graph, String(node));
      result.set(node, coefficient);
    }

    return result;
  }

  /**
   * Calculate average clustering coefficient for the entire graph
   *
   * @param graph Graphology graph instance
   * @returns Average clustering coefficient
   */
  calculateAverageClustering(graph: Graph): number {
    // Calculate average of all node clustering coefficients
    let total = 0;
    let count = 0;

    graph.forEachNode(node => {
      total += this.calculateNodeClusteringCoefficient(graph, node);
      count++;
    });

    return count > 0 ? total / count : 0;
  }

  /**
   * Calculate modularity for a given partition
   * Measures the strength of division into communities
   *
   * @param graph Graphology graph instance
   * @param communities Map of node ID to community ID
   * @returns Modularity score
   */
  calculateModularity(graph: Graph, communities: Map<number, number>): number {
    // Convert Map to object format expected by graphology
    const communityObj: { [key: string]: number } = {};
    for (const [node, community] of communities) {
      communityObj[node.toString()] = community;
    }

    return metrics.graph.modularity(graph, communityObj);
  }

  /**
   * Calculate weighted degree for nodes (considers edge weights)
   *
   * @param graph Graphology graph instance
   * @returns Map of node IDs to weighted degrees
   */
  calculateWeightedDegree(graph: Graph): Map<number, number> {
    const result = new Map<number, number>();

    graph.forEachNode(node => {
      // Calculate weighted degree by summing edge weights
      let weightedDeg = 0;
      graph.forEachEdge(node, (edge, attributes) => {
        weightedDeg += attributes.weight || 1;
      });
      result.set(Number(node), weightedDeg);
    });

    return result;
  }

  /**
   * Calculate graph diameter (longest shortest path)
   *
   * @param graph Graphology graph instance
   * @returns Diameter of the graph
   */
  calculateDiameter(graph: Graph): number {
    // This is a simplified implementation
    // For large graphs, consider sampling or approximation
    let maxDistance = 0;
    const nodes = graph.nodes();

    // Sample pairs if graph is large
    const sampleSize = Math.min(nodes.length, 100);
    const sampledNodes = this.sampleNodes(nodes, sampleSize);

    for (let i = 0; i < sampledNodes.length; i++) {
      for (let j = i + 1; j < sampledNodes.length; j++) {
        const distance = this.getDistance(graph, sampledNodes[i], sampledNodes[j]);
        if (distance > maxDistance) {
          maxDistance = distance;
        }
      }
    }

    return maxDistance;
  }

  /**
   * Calculate graph radius (minimum eccentricity)
   *
   * @param graph Graphology graph instance
   * @returns Radius of the graph
   */
  calculateRadius(graph: Graph): number {
    let minEccentricity = Infinity;
    const nodes = graph.nodes();

    // Sample for large graphs
    const sampleSize = Math.min(nodes.length, 100);
    const sampledNodes = this.sampleNodes(nodes, sampleSize);

    for (const node of sampledNodes) {
      const eccentricity = this.calculateEccentricity(graph, node);
      if (eccentricity < minEccentricity) {
        minEccentricity = eccentricity;
      }
    }

    return minEccentricity === Infinity ? 0 : minEccentricity;
  }

  /**
   * Calculate eccentricity for a node (maximum distance to any other node)
   *
   * @param graph Graphology graph instance
   * @param node Node ID
   * @returns Eccentricity of the node
   */
  private calculateEccentricity(graph: Graph, node: string | number): number {
    let maxDistance = 0;
    const nodes = graph.nodes();

    for (const otherNode of nodes) {
      if (otherNode !== node) {
        const distance = this.getDistance(graph, node, otherNode);
        if (distance > maxDistance) {
          maxDistance = distance;
        }
      }
    }

    return maxDistance;
  }

  /**
   * Get distance between two nodes (simplified BFS)
   *
   * @param graph Graphology graph instance
   * @param source Source node
   * @param target Target node
   * @returns Distance between nodes, or Infinity if not connected
   */
  private getDistance(graph: Graph, source: string | number, target: string | number): number {
    if (source === target) return 0;

    const visited = new Set<string | number>();
    const queue: Array<{ node: string | number; distance: number }> = [
      { node: source, distance: 0 }
    ];

    while (queue.length > 0) {
      const { node, distance } = queue.shift()!;

      if (node === target) {
        return distance;
      }

      if (visited.has(node)) continue;
      visited.add(node);

      const neighbors = graph.neighbors(node);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push({ node: neighbor, distance: distance + 1 });
        }
      }
    }

    return Infinity;
  }

  /**
   * Calculate average path length for the graph
   *
   * @param graph Graphology graph instance
   * @returns Average path length
   */
  private calculateAveragePathLength(graph: Graph): number {
    const nodes = graph.nodes();

    // Sample for large graphs to improve performance
    const sampleSize = Math.min(nodes.length, 50);
    const sampledNodes = this.sampleNodes(nodes, sampleSize);

    let totalDistance = 0;
    let pathCount = 0;

    for (let i = 0; i < sampledNodes.length; i++) {
      for (let j = i + 1; j < sampledNodes.length; j++) {
        const distance = this.getDistance(graph, sampledNodes[i], sampledNodes[j]);
        if (distance !== Infinity) {
          totalDistance += distance;
          pathCount++;
        }
      }
    }

    return pathCount > 0 ? totalDistance / pathCount : 0;
  }

  /**
   * Sample nodes from the graph for performance optimization
   *
   * @param nodes Array of all nodes
   * @param sampleSize Number of nodes to sample
   * @returns Sampled nodes
   */
  /**
   * Simple clustering coefficient calculation
   * Measures how connected a node's neighbors are to each other
   */
  private calculateSimpleClusteringCoefficient(graph: Graph): number {
    let totalCoefficient = 0;
    let nodeCount = 0;

    graph.forEachNode(node => {
      const coefficient = this.calculateNodeClusteringCoefficient(graph, node);
      totalCoefficient += coefficient;
      nodeCount++;
    });

    return nodeCount > 0 ? totalCoefficient / nodeCount : 0;
  }

  /**
   * Calculate clustering coefficient for a single node
   */
  private calculateNodeClusteringCoefficient(graph: Graph, node: string): number {
    const neighbors = graph.neighbors(node);
    const k = neighbors.length;

    if (k < 2) return 0;

    // Count edges between neighbors
    let edgeCount = 0;
    for (let i = 0; i < neighbors.length; i++) {
      for (let j = i + 1; j < neighbors.length; j++) {
        if (graph.hasEdge(neighbors[i], neighbors[j])) {
          edgeCount++;
        }
      }
    }

    // Clustering coefficient = 2 * edges / (k * (k - 1))
    return (2 * edgeCount) / (k * (k - 1));
  }

  private sampleNodes(nodes: Array<string | number>, sampleSize: number): Array<string | number> {
    if (nodes.length <= sampleSize) {
      return nodes;
    }

    const sampled: Array<string | number> = [];
    const step = Math.floor(nodes.length / sampleSize);

    for (let i = 0; i < nodes.length && sampled.length < sampleSize; i += step) {
      sampled.push(nodes[i]);
    }

    return sampled;
  }
}