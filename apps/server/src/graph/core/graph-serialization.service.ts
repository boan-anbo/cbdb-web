/**
 * GraphSerializationService
 * Handles graph building and serialization for visualization
 * Refactored to use AlgorithmOrchestratorService instead of GraphBuilderFactory
 */

import { Injectable } from '@nestjs/common';
import { NetworkEdge, cbdbMapper } from '@cbdb/core';
import type { PersonTableModel } from '@cbdb/core';
import { SerializedGraph } from 'graphology-types';
import { AlgorithmOrchestratorService } from './algorithms/algorithm-orchestrator.service';
import Graph from 'graphology';

/**
 * Service for building and serializing graphs
 * Supports multiple graph formats for different visualization libraries
 */
@Injectable()
export class GraphSerializationService {
  constructor(private readonly algorithmOrchestrator: AlgorithmOrchestratorService) {}

  /**
   * Build serialized graph for visualization
   * Creates a graphology graph and exports it
   *
   * @param persons Set of person IDs
   * @param edges Array of network edges
   * @param personDataMap Map of person ID to person data
   * @param metadata Additional metadata for nodes and edges
   * @returns Serialized graph in graphology format
   */
  async buildSerializedGraph(
    persons: Set<number>,
    edges: NetworkEdge[],
    personDataMap: Map<number, any>,
    metadata: {
      queryPersons: Set<number>;
      bridgeNodes: Set<number>;
      nodeDistances: Map<number, number>;
    }
  ): Promise<SerializedGraph> {
    // Build the graph using AlgorithmOrchestratorService
    const graph = this.algorithmOrchestrator.buildGraph(persons, edges, false);

    // Enrich nodes with additional metadata for visualization
    this.enrichNodeMetadata(graph, persons, personDataMap, metadata);

    // Export the graph for visualization
    return graph.export();
  }

  /**
   * Enrich nodes with visualization metadata
   *
   * @param graph Graph instance
   * @param persons Set of person IDs
   * @param personDataMap Map of person ID to person data
   * @param metadata Node metadata
   */
  private enrichNodeMetadata(
    graph: Graph,
    persons: Set<number>,
    personDataMap: Map<number, any>,
    metadata: {
      queryPersons: Set<number>;
      bridgeNodes: Set<number>;
      nodeDistances: Map<number, number>;
    }
  ): void {
    for (const personId of persons) {
      const personData = personDataMap.get(personId);
      const person = personData ? cbdbMapper.person.toTableModel(personData) : null;

      // Create comprehensive node attributes
      const nodeAttributes = this.createNodeAttributes(
        personId,
        person,
        metadata.queryPersons.has(personId),
        metadata.bridgeNodes.has(personId),
        metadata.nodeDistances.get(personId) || Infinity
      );

      // Set all attributes on the node
      // Note: The node already exists from buildGraph, we're just adding metadata
      for (const [key, value] of Object.entries(nodeAttributes)) {
        graph.setNodeAttribute(personId, key, value);
      }
    }
  }

  /**
   * Create node attributes for visualization
   *
   * @param personId Person ID
   * @param person Person data
   * @param isQueryPerson Whether this is a query person
   * @param isBridgeNode Whether this is a bridge node
   * @param nodeDistance Distance from query persons
   * @returns Node attributes object
   */
  private createNodeAttributes(
    personId: number,
    person: PersonTableModel | null,
    isQueryPerson: boolean,
    isBridgeNode: boolean,
    nodeDistance: number
  ): Record<string, any> {
    return {
      // Basic info
      label: person?.nameChn || person?.name || `Person ${personId}`,
      name: person?.name,
      nameChn: person?.nameChn,

      // Node type flags
      isCentral: isQueryPerson,
      isBridge: isBridgeNode,

      // Visual attributes
      size: this.calculateNodeSize(isQueryPerson, isBridgeNode),
      color: this.getNodeColor(isQueryPerson, isBridgeNode),

      // Network position
      nodeDistance,
      depth: nodeDistance,

      // Additional metadata
      birthYear: person?.birthYear,
      deathYear: person?.deathYear
    };
  }

  /**
   * Add edges to graph with metadata
   * @deprecated Edges are now added by AlgorithmOrchestratorService.buildGraph()
   */
  private addEdgesWithMetadata(
    graphBuilder: any,
    edges: NetworkEdge[]
  ): void {
    // This method is no longer needed as edges are added in buildGraph
    // Keeping for backward compatibility but marked as deprecated
  }

  /**
   * Format person label for display
   *
   * @param person Person data
   * @returns Formatted label string
   */
  private formatPersonLabel(person: PersonTableModel): string {
    if (person.nameChn) {
      return person.name ? `${person.nameChn} (${person.name})` : person.nameChn;
    }
    return person.name || `Person ${person.id}`;
  }

  /**
   * Get node color based on role in network
   *
   * @param isQueryPerson Whether this is a query person
   * @param isBridgeNode Whether this is a bridge node
   * @returns Color string for visualization
   */
  private getNodeColor(isQueryPerson: boolean, isBridgeNode: boolean): string {
    if (isQueryPerson) {
      return '#ff6b6b'; // Red for query persons
    }
    if (isBridgeNode) {
      return '#4ecdc4'; // Teal for bridge nodes
    }
    return '#95a5a6'; // Gray for regular nodes
  }

  /**
   * Calculate node size based on importance
   *
   * @param isQueryPerson Whether this is a query person
   * @param isBridgeNode Whether this is a bridge node
   * @returns Size value for visualization
   */
  private calculateNodeSize(isQueryPerson: boolean, isBridgeNode: boolean): number {
    if (isQueryPerson) {
      return 20; // Large for query persons
    }
    if (isBridgeNode) {
      return 15; // Medium for bridge nodes
    }
    return 10; // Small for regular nodes
  }
}