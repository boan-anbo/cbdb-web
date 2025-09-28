/**
 * Core Graph Service
 *
 * Low-level graph operations using the graphology library.
 * This is a pure utility service with no domain knowledge.
 *
 * @description
 * Provides foundational graph data structure operations including:
 * - Graph creation (directed, undirected, mixed)
 * - Node and edge management
 * - Graph metrics calculation
 * - Subgraph extraction
 * - Graph merging
 *
 * @example
 * ```typescript
 * const graph = graphService.createDirectedGraph<PersonNode, KinshipEdge>();
 * graphService.addNode(graph, 'person:123', { name: 'Wang Anshi' });
 * graphService.addEdge(graph, 'person:123', 'person:456', { type: 'brother' });
 * const metrics = graphService.getMetrics(graph);
 * ```
 *
 * @module GraphModule
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import Graph from 'graphology';
import type { Attributes } from 'graphology-types';
import { GraphMetrics } from '@cbdb/core';

@Injectable()
export class GraphService {
  /**
   * Create a directed graph with optional type parameters
   *
   * @template NodeAttributes - Type of node attributes
   * @template EdgeAttributes - Type of edge attributes
   * @returns A new directed graph instance
   */
  createDirectedGraph<NodeAttributes extends Attributes = Attributes, EdgeAttributes extends Attributes = Attributes>(): Graph<NodeAttributes, EdgeAttributes> {
    return new Graph<NodeAttributes, EdgeAttributes>({
      type: 'directed',
      allowSelfLoops: false,
      multi: false
    });
  }

  /**
   * Create an undirected graph with optional type parameters
   */
  createUndirectedGraph<NodeAttributes extends Attributes = Attributes, EdgeAttributes extends Attributes = Attributes>(): Graph<NodeAttributes, EdgeAttributes> {
    return new Graph<NodeAttributes, EdgeAttributes>({
      type: 'undirected',
      allowSelfLoops: false,
      multi: false
    });
  }

  /**
   * Create a mixed graph (both directed and undirected edges)
   */
  createMixedGraph<NodeAttributes extends Attributes = Attributes, EdgeAttributes extends Attributes = Attributes>(): Graph<NodeAttributes, EdgeAttributes> {
    return new Graph<NodeAttributes, EdgeAttributes>({
      type: 'mixed',
      allowSelfLoops: false,
      multi: false
    });
  }

  /**
   * Add a node to the graph
   *
   * If the node already exists, merges the attributes.
   *
   * @param graph - The graph to add the node to
   * @param id - Unique identifier for the node
   * @param attributes - Optional attributes to attach to the node
   */
  addNode<NodeAttributes extends Attributes = Attributes>(
    graph: Graph<NodeAttributes>,
    id: string,
    attributes?: NodeAttributes
  ): void {
    if (!graph.hasNode(id)) {
      graph.addNode(id, attributes);
    } else if (attributes) {
      // Update attributes if node exists
      graph.mergeNodeAttributes(id, attributes);
    }
  }

  /**
   * Add multiple nodes at once
   */
  addNodes<NodeAttributes extends Attributes = Attributes>(
    graph: Graph<NodeAttributes>,
    nodes: Array<{ id: string; attributes?: NodeAttributes }>
  ): void {
    nodes.forEach(node => {
      this.addNode(graph, node.id, node.attributes);
    });
  }

  /**
   * Add an edge to the graph
   *
   * Automatically creates source and target nodes if they don't exist.
   * If the edge already exists, merges the attributes.
   *
   * @param graph - The graph to add the edge to
   * @param source - Source node identifier
   * @param target - Target node identifier
   * @param attributes - Optional attributes to attach to the edge
   */
  addEdge<EdgeAttributes extends Attributes = Attributes>(
    graph: Graph<any, EdgeAttributes>,
    source: string,
    target: string,
    attributes?: EdgeAttributes
  ): void {
    // Ensure nodes exist before adding edge
    if (!graph.hasNode(source)) {
      graph.addNode(source);
    }
    if (!graph.hasNode(target)) {
      graph.addNode(target);
    }

    if (!graph.hasEdge(source, target)) {
      graph.addEdge(source, target, attributes);
    } else if (attributes) {
      // Update attributes if edge exists
      graph.mergeEdgeAttributes(source, target, attributes);
    }
  }

  /**
   * Add multiple edges at once
   */
  addEdges<EdgeAttributes extends Attributes = Attributes>(
    graph: Graph<any, EdgeAttributes>,
    edges: Array<{ source: string; target: string; attributes?: EdgeAttributes }>
  ): void {
    edges.forEach(edge => {
      this.addEdge(graph, edge.source, edge.target, edge.attributes);
    });
  }

  /**
   * Check if graph has a node
   */
  hasNode(graph: Graph, id: string): boolean {
    return graph.hasNode(id);
  }

  /**
   * Check if graph has an edge
   */
  hasEdge(graph: Graph, source: string, target: string): boolean {
    return graph.hasEdge(source, target);
  }

  /**
   * Get node attributes
   */
  getNodeAttributes<NodeAttributes extends Attributes = Attributes>(
    graph: Graph<NodeAttributes>,
    id: string
  ): NodeAttributes | undefined {
    if (graph.hasNode(id)) {
      return graph.getNodeAttributes(id);
    }
    return undefined;
  }

  /**
   * Get edge attributes
   */
  getEdgeAttributes<EdgeAttributes extends Attributes = Attributes>(
    graph: Graph<any, EdgeAttributes>,
    source: string,
    target: string
  ): EdgeAttributes | undefined {
    if (graph.hasEdge(source, target)) {
      return graph.getEdgeAttributes(source, target);
    }
    return undefined;
  }

  /**
   * Get all nodes as array
   */
  getNodes<NodeAttributes extends Attributes = Attributes>(graph: Graph<NodeAttributes>): Array<string> {
    return graph.nodes();
  }

  /**
   * Get all edges as array
   */
  getEdges<EdgeAttributes extends Attributes = Attributes>(
    graph: Graph<any, EdgeAttributes>
  ): Array<[string, string, EdgeAttributes]> {
    const edges: Array<[string, string, EdgeAttributes]> = [];
    graph.forEachEdge((edge, attributes, source, target) => {
      edges.push([source, target, attributes]);
    });
    return edges;
  }

  /**
   * Calculate graph metrics
   *
   * @param graph - The graph to analyze
   * @returns GraphMetrics object containing:
   *   - nodeCount: Number of nodes
   *   - edgeCount: Number of edges
   *   - density: Graph density (0-1)
   *   - avgDegree: Average node degree
   */
  getMetrics(graph: Graph): GraphMetrics {
    const nodeCount = graph.order;
    const edgeCount = graph.size;

    // Density calculation depends on graph type
    let density = 0;
    if (nodeCount > 1) {
      if (graph.type === 'directed') {
        // For directed graphs: edges / (n * (n - 1))
        density = edgeCount / (nodeCount * (nodeCount - 1));
      } else {
        // For undirected graphs: 2 * edges / (n * (n - 1))
        density = (2 * edgeCount) / (nodeCount * (nodeCount - 1));
      }
    }

    return {
      nodeCount,
      edgeCount,
      density,
      avgDegree: nodeCount > 0 ? (2 * edgeCount) / nodeCount : 0
    };
  }

  /**
   * Get subgraph containing only specified nodes
   *
   * Extracts a subgraph with only the specified nodes and edges between them.
   *
   * @param graph - The source graph
   * @param nodeIds - Array of node IDs to include in the subgraph
   * @returns A new graph containing only the specified nodes and their interconnections
   */
  getSubgraph<NodeAttributes extends Attributes = Attributes, EdgeAttributes extends Attributes = Attributes>(
    graph: Graph<NodeAttributes, EdgeAttributes>,
    nodeIds: string[]
  ): Graph<NodeAttributes, EdgeAttributes> {
    const subgraph = graph.nullCopy() as Graph<NodeAttributes, EdgeAttributes>;

    // Add specified nodes
    nodeIds.forEach(nodeId => {
      if (graph.hasNode(nodeId)) {
        subgraph.addNode(nodeId, graph.getNodeAttributes(nodeId));
      }
    });

    // Add edges between specified nodes
    graph.forEachEdge((edge, attributes, source, target) => {
      if (nodeIds.includes(source) && nodeIds.includes(target)) {
        subgraph.addEdge(source, target, attributes);
      }
    });

    return subgraph;
  }

  /**
   * Merge two graphs
   */
  mergeGraphs<NodeAttributes extends Attributes = Attributes, EdgeAttributes extends Attributes = Attributes>(
    graph1: Graph<NodeAttributes, EdgeAttributes>,
    graph2: Graph<NodeAttributes, EdgeAttributes>
  ): Graph<NodeAttributes, EdgeAttributes> {
    const merged = graph1.copy() as Graph<NodeAttributes, EdgeAttributes>;

    // Add all nodes from graph2
    graph2.forEachNode((node, attributes) => {
      this.addNode(merged, node, attributes);
    });

    // Add all edges from graph2
    graph2.forEachEdge((edge, attributes, source, target) => {
      this.addEdge(merged, source, target, attributes);
    });

    return merged;
  }

  /**
   * Clear all nodes and edges from graph
   */
  clear(graph: Graph): void {
    graph.clear();
  }

  /**
   * Get node degree (number of connections)
   */
  getNodeDegree(graph: Graph, nodeId: string): number {
    return graph.hasNode(nodeId) ? graph.degree(nodeId) : 0;
  }

  /**
   * Get neighbors of a node
   */
  getNeighbors(graph: Graph, nodeId: string): string[] {
    if (!graph.hasNode(nodeId)) {
      return [];
    }
    return graph.neighbors(nodeId);
  }
}