/**
 * PersonNetworkService - Core orchestrator for multi-person network discovery
 * Orchestrates modular services to implement the iterative discovery algorithm
 * Maintains the exact same public API while using specialized services internally
 */

import { Injectable } from '@nestjs/common';
import {
  PersonNetworkQuery,
  PersonNetworkResult,
  NetworkEdge,
  DiscoveredPerson,
  DirectConnection,
  BridgeNode,
  Pathway,
  NetworkMetrics,
  cbdbMapper,
  RelationshipDetail
} from '@cbdb/core';
import { PersonNetworkRepository, RelatedPerson } from '../repositories/person-network.repository';
import { PersonRepository } from '../person.repository';
import { SerializedGraph } from 'graphology-types';

// Import modular services
import { NetworkDiscoveryService } from './network-discovery.service';
import { BridgeNodeAnalyzer } from './bridge-node-analyzer.service';
import { NetworkMetricsCalculator } from './network-metrics-calculator.service';
import { PathwayFinder } from './pathway-finder.service';
import { EdgeEnrichmentService } from './edge-enrichment.service';
import { GraphSerializationService } from '../../graph/core/graph-serialization.service';

@Injectable()
export class PersonNetworkService {
  constructor(
    private readonly personNetworkRepo: PersonNetworkRepository,
    private readonly personRepo: PersonRepository,
    // Modular services
    private readonly discoveryService: NetworkDiscoveryService,
    private readonly bridgeAnalyzer: BridgeNodeAnalyzer,
    private readonly metricsCalculator: NetworkMetricsCalculator,
    private readonly pathwayFinder: PathwayFinder,
    private readonly edgeEnrichment: EdgeEnrichmentService,
    private readonly graphSerialization: GraphSerializationService
  ) {}

  /**
   * Build multi-person relationship network
   * Orchestrates modular services to implement the three-phase discovery algorithm
   * Maintains exact same public API
   */
  async buildMultiPersonNetwork(query: PersonNetworkQuery): Promise<PersonNetworkResult> {
    const startTime = Date.now();

    // Validate input
    if (!query.personIds || query.personIds.length < 2) {
      throw new Error('At least 2 person IDs are required for network analysis');
    }

    // Verify persons exist
    const existingPersons = await this.personRepo.findModelsByIds(query.personIds);
    if (existingPersons.length === 0) {
      throw new Error('None of the specified persons were found');
    }

    // Use discovery service for the three-phase discovery algorithm
    const discoveryResult = await this.discoveryService.discoverNetwork(
      query,
      existingPersons.map(p => p.id)
    );

    // Extract results from discovery
    let { allPersons, allEdges, queryPersons, nodeDistances } = discoveryResult;

    // Apply filters if specified
    if (this.hasFilters(query)) {
      const filteredPersons = await this.personNetworkRepo.filterPersons(
        Array.from(allPersons),
        queryPersons,
        {
          indexYearRange: query.indexYearRange,
          dynasties: query.dynasties,
          includeMale: query.includeMale,
          includeFemale: query.includeFemale
        }
      );

      // Update person set and filter edges
      allPersons = new Set(filteredPersons);

      // Remove edges involving filtered-out persons
      allEdges = allEdges.filter(edge =>
        allPersons.has(edge.source) && allPersons.has(edge.target)
      );
    }

    // Use edge enrichment service to add labels
    await this.edgeEnrichment.enrichEdgesWithLabels(allEdges);

    // Analysis phase using modular services
    const directConnections = this.analyzeDirectConnections(allEdges, queryPersons);
    const bridgeNodes = await this.bridgeAnalyzer.findBridgeNodes(
      allEdges,
      queryPersons,
      allPersons,
      this.personNetworkRepo
    );
    const pathways = await this.pathwayFinder.findPathways(allEdges, queryPersons, allPersons);

    // Load person data
    const personDataMap = await this.personNetworkRepo.loadPersonsByIds(
      Array.from(allPersons)
    );

    // Create discovered persons map
    const discoveredPersons = new Map<number, DiscoveredPerson>();
    for (const personId of allPersons) {
      if (!queryPersons.has(personId)) {
        const personData = personDataMap.get(personId);
        discoveredPersons.set(personId, {
          personId,
          person: personData ? cbdbMapper.person.toTableModel(personData) : undefined,
          nodeDistance: nodeDistances.get(personId) || Infinity,
          connectsTo: this.findConnectionsToQueryPersons(personId, allEdges, queryPersons)
        });
      }
    }

    // Use metrics calculator service with enhanced graph algorithms
    const metrics = await this.metricsCalculator.calculateMetrics(
      queryPersons.size,
      allPersons.size,
      allEdges.length,
      directConnections.length,
      bridgeNodes.length,
      allEdges,
      allPersons
    );

    // Use graph serialization service
    const graph = await this.graphSerialization.buildSerializedGraph(
      allPersons,
      allEdges,
      personDataMap,
      {
        queryPersons,
        bridgeNodes: new Set(bridgeNodes.map(b => b.personId)),
        nodeDistances
      }
    );

    // Check if results were truncated
    const truncated = allPersons.size > 5000;

    return new PersonNetworkResult({
      queryPersons,
      discoveredPersons,
      edges: allEdges,
      directConnections,
      bridgeNodes,
      pathways,
      metrics,
      graph,
      queryTime: Date.now() - startTime,
      truncated
    });
  }


  /**
   * Analyze direct connections between query persons
   */
  private analyzeDirectConnections(
    edges: NetworkEdge[],
    queryPersons: Set<number>
  ): DirectConnection[] {
    const pairMap = new Map<string, RelationshipDetail[]>();

    for (const edge of edges) {
      if (edge.edgeDistance === 0 &&
          queryPersons.has(edge.source) &&
          queryPersons.has(edge.target)) {
        const key = [edge.source, edge.target].sort().join('-');
        if (!pairMap.has(key)) {
          pairMap.set(key, []);
        }
        pairMap.get(key)!.push({
          type: edge.edgeType,
          label: edge.edgeLabel,
          code: edge.edgeCode,
          direction: 'forward'
        });
      }
    }

    return Array.from(pairMap.entries()).map(([key, relationships]) => {
      const [person1, person2] = key.split('-').map(Number);
      return {
        person1,
        person2,
        relationships,
        connectionStrength: relationships.length
      } as DirectConnection;
    });
  }


  /**
   * Find which query persons a discovered person connects to
   */
  private findConnectionsToQueryPersons(
    personId: number,
    edges: NetworkEdge[],
    queryPersons: Set<number>
  ): number[] {
    const connections = new Set<number>();

    for (const edge of edges) {
      if (edge.source === personId && queryPersons.has(edge.target)) {
        connections.add(edge.target);
      }
      if (edge.target === personId && queryPersons.has(edge.source)) {
        connections.add(edge.source);
      }
    }

    return Array.from(connections);
  }


  /**
   * Check if query has filters
   */
  private hasFilters(query: PersonNetworkQuery): boolean {
    return !!(
      query.indexYearRange ||
      query.dynasties?.length ||
      query.places?.length ||
      query.includeMale === false ||
      query.includeFemale === false
    );
  }
}