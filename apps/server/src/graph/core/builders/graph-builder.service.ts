/**
 * Graph Builder Service
 *
 * Provides a fluent API for constructing graphs with method chaining.
 * This is a pure builder with no domain knowledge, offering type-safe
 * graph construction through an ergonomic interface.
 *
 * @description
 * The builder pattern simplifies graph construction by:
 * - Providing a chainable interface for all operations
 * - Managing graph type selection (directed/undirected/mixed)
 * - Supporting batch operations and transformations
 * - Offering convenience methods for common patterns
 *
 * @example
 * ```typescript
 * const graph = new GraphBuilder<PersonNode, RelationEdge>(graphService)
 *   .directed()
 *   .withNodeDefaults({ color: '#blue' })
 *   .addNode('person:1', { name: 'Wang Anshi' })
 *   .addNode('person:2', { name: 'Wang Ang' })
 *   .addEdge('person:1', 'person:2', { type: 'brother' })
 *   .build();
 * ```
 *
 * @module GraphModule
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import Graph from 'graphology';
import type { Attributes } from 'graphology-types';
import { GraphService } from '../../graph.service';
import { NodeData, EdgeData } from '@cbdb/core';

@Injectable()
export class GraphBuilder<
  NodeAttributes extends Attributes = Attributes,
  EdgeAttributes extends Attributes = Attributes
> {
  private graph: Graph<NodeAttributes, EdgeAttributes> | null = null;
  private nodeDefaults: Partial<NodeAttributes> = {};
  private edgeDefaults: Partial<EdgeAttributes> = {};

  constructor(private readonly graphService: GraphService) {}

  /**
   * Initialize as directed graph
   *
   * Creates a directed graph where edges have a specific direction from source to target.
   *
   * @returns This builder instance for method chaining
   */
  directed(): GraphBuilder<NodeAttributes, EdgeAttributes> {
    this.graph = this.graphService.createDirectedGraph<NodeAttributes, EdgeAttributes>();
    return this;
  }

  /**
   * Initialize as undirected graph
   */
  undirected(): GraphBuilder<NodeAttributes, EdgeAttributes> {
    this.graph = this.graphService.createUndirectedGraph<NodeAttributes, EdgeAttributes>();
    return this;
  }

  /**
   * Initialize as mixed graph
   */
  mixed(): GraphBuilder<NodeAttributes, EdgeAttributes> {
    this.graph = this.graphService.createMixedGraph<NodeAttributes, EdgeAttributes>();
    return this;
  }

  /**
   * Set default attributes for all nodes
   */
  withNodeDefaults(defaults: Partial<NodeAttributes>): GraphBuilder<NodeAttributes, EdgeAttributes> {
    this.nodeDefaults = defaults;
    return this;
  }

  /**
   * Set default attributes for all edges
   */
  withEdgeDefaults(defaults: Partial<EdgeAttributes>): GraphBuilder<NodeAttributes, EdgeAttributes> {
    this.edgeDefaults = defaults;
    return this;
  }

  /**
   * Add a single node to the graph
   *
   * @param id - Unique identifier for the node (string or number)
   * @param attributes - Optional attributes to attach to the node
   * @returns This builder instance for method chaining
   */
  addNode(
    id: string | number,
    attributes?: NodeAttributes
  ): GraphBuilder<NodeAttributes, EdgeAttributes> {
    this.ensureGraphInitialized();
    const nodeId = String(id);
    const mergedAttributes = { ...this.nodeDefaults, ...attributes } as NodeAttributes;
    this.graphService.addNode(this.graph!, nodeId, mergedAttributes);
    return this;
  }

  /**
   * Add multiple nodes at once
   */
  addNodes(
    nodes: NodeData<NodeAttributes>[]
  ): GraphBuilder<NodeAttributes, EdgeAttributes> {
    this.ensureGraphInitialized();
    nodes.forEach(node => {
      this.addNode(node.id, node.attributes);
    });
    return this;
  }

  /**
   * Add a single edge to the graph
   *
   * Automatically creates source and target nodes if they don't exist.
   *
   * @param source - Source node identifier
   * @param target - Target node identifier
   * @param attributes - Optional attributes to attach to the edge
   * @returns This builder instance for method chaining
   */
  addEdge(
    source: string | number,
    target: string | number,
    attributes?: EdgeAttributes
  ): GraphBuilder<NodeAttributes, EdgeAttributes> {
    this.ensureGraphInitialized();
    const sourceId = String(source);
    const targetId = String(target);
    const mergedAttributes = { ...this.edgeDefaults, ...attributes } as EdgeAttributes;
    this.graphService.addEdge(this.graph!, sourceId, targetId, mergedAttributes);
    return this;
  }

  /**
   * Add multiple edges at once
   */
  addEdges(
    edges: EdgeData<EdgeAttributes>[]
  ): GraphBuilder<NodeAttributes, EdgeAttributes> {
    this.ensureGraphInitialized();
    edges.forEach(edge => {
      this.addEdge(edge.source, edge.target, edge.attributes);
    });
    return this;
  }

  /**
   * Transform a collection into nodes
   *
   * Useful for converting domain objects into graph nodes.
   *
   * @param items - Array of items to transform
   * @param transformer - Function to convert each item to NodeData
   * @returns This builder instance for method chaining
   *
   * @example
   * ```typescript
   * builder.fromCollection(persons, person => ({
   *   id: `person:${person.id}`,
   *   attributes: { name: person.name }
   * }))
   * ```
   */
  fromCollection<T>(
    items: T[],
    transformer: (item: T) => NodeData<NodeAttributes>
  ): GraphBuilder<NodeAttributes, EdgeAttributes> {
    this.ensureGraphInitialized();
    items.forEach(item => {
      const node = transformer(item);
      this.addNode(node.id, node.attributes);
    });
    return this;
  }

  /**
   * Transform a collection into edges
   */
  connectFromCollection<T>(
    items: T[],
    transformer: (item: T) => EdgeData<EdgeAttributes>
  ): GraphBuilder<NodeAttributes, EdgeAttributes> {
    this.ensureGraphInitialized();
    items.forEach(item => {
      const edge = transformer(item);
      this.addEdge(edge.source, edge.target, edge.attributes);
    });
    return this;
  }

  /**
   * Add a bidirectional edge (for undirected graphs)
   */
  connect(
    node1: string | number,
    node2: string | number,
    attributes?: EdgeAttributes
  ): GraphBuilder<NodeAttributes, EdgeAttributes> {
    this.ensureGraphInitialized();
    this.addEdge(node1, node2, attributes);
    return this;
  }

  /**
   * Create a chain of connected nodes
   */
  addChain(
    nodeIds: Array<string | number>,
    edgeAttributes?: EdgeAttributes
  ): GraphBuilder<NodeAttributes, EdgeAttributes> {
    this.ensureGraphInitialized();
    for (let i = 0; i < nodeIds.length - 1; i++) {
      this.addEdge(nodeIds[i], nodeIds[i + 1], edgeAttributes);
    }
    return this;
  }

  /**
   * Create a star pattern (one central node connected to all others)
   *
   * Useful for representing hub-and-spoke relationships.
   *
   * @param centerNode - The central hub node
   * @param peripheralNodes - Array of nodes to connect to the center
   * @param edgeAttributes - Optional attributes for all edges
   * @returns This builder instance for method chaining
   */
  addStar(
    centerNode: string | number,
    peripheralNodes: Array<string | number>,
    edgeAttributes?: EdgeAttributes
  ): GraphBuilder<NodeAttributes, EdgeAttributes> {
    this.ensureGraphInitialized();
    peripheralNodes.forEach(node => {
      this.addEdge(centerNode, node, edgeAttributes);
    });
    return this;
  }

  /**
   * Apply a function to the graph (for custom operations)
   */
  apply(
    fn: (graph: Graph<NodeAttributes, EdgeAttributes>) => void
  ): GraphBuilder<NodeAttributes, EdgeAttributes> {
    this.ensureGraphInitialized();
    fn(this.graph!);
    return this;
  }

  /**
   * Conditionally apply operations
   */
  when(
    condition: boolean,
    trueFn: (builder: GraphBuilder<NodeAttributes, EdgeAttributes>) => void,
    falseFn?: (builder: GraphBuilder<NodeAttributes, EdgeAttributes>) => void
  ): GraphBuilder<NodeAttributes, EdgeAttributes> {
    if (condition) {
      trueFn(this);
    } else if (falseFn) {
      falseFn(this);
    }
    return this;
  }

  /**
   * Build and return the constructed graph
   *
   * Finalizes the graph construction and returns the graph instance.
   * The builder can be reset and reused after calling build().
   *
   * @returns The constructed graph instance
   * @throws Error if graph is not initialized
   */
  build(): Graph<NodeAttributes, EdgeAttributes> {
    this.ensureGraphInitialized();
    return this.graph!;
  }

  /**
   * Get current graph metrics
   */
  getMetrics() {
    this.ensureGraphInitialized();
    return this.graphService.getMetrics(this.graph!);
  }

  /**
   * Reset the builder
   */
  reset(): GraphBuilder<NodeAttributes, EdgeAttributes> {
    this.graph = null;
    this.nodeDefaults = {};
    this.edgeDefaults = {};
    return this;
  }

  /**
   * Clone the current graph
   */
  clone(): Graph<NodeAttributes, EdgeAttributes> {
    this.ensureGraphInitialized();
    return this.graph!.copy() as Graph<NodeAttributes, EdgeAttributes>;
  }

  private ensureGraphInitialized(): void {
    if (!this.graph) {
      throw new Error('Graph not initialized. Call directed(), undirected(), or mixed() first.');
    }
  }
}