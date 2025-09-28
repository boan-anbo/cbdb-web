/**
 * NetworkDiscoveryService
 * Handles the three-phase iterative discovery of network nodes
 * Extracted from PersonNetworkService for modularity and reusability
 */

import { Injectable } from '@nestjs/common';
import { NetworkEdge, PersonNetworkQuery } from '@cbdb/core';
import { PersonNetworkRepository, RelatedPerson } from '../repositories/person-network.repository';

/**
 * Service for discovering network connections in phases
 * Can be reused for any graph discovery needs
 */
@Injectable()
export class NetworkDiscoveryService {
  constructor(private readonly personNetworkRepo: PersonNetworkRepository) {}

  /**
   * Main discovery orchestration method
   * Implements the three-phase discovery algorithm
   */
  async discoverNetwork(
    query: PersonNetworkQuery,
    validPersonIds: number[]
  ): Promise<{
    allPersons: Set<number>;
    allEdges: NetworkEdge[];
    queryPersons: Set<number>;
    nodeDistances: Map<number, number>;
  }> {
    // Initialize tracking sets
    const queryPersons = new Set(validPersonIds);
    const allPersons = new Set(queryPersons);
    const allEdges: NetworkEdge[] = [];
    const nodeDistances = new Map<number, number>();

    // Set distance 0 for query persons
    queryPersons.forEach(id => nodeDistances.set(id, 0));

    // Phase 1: Direct connections (maxNodeDist = 0)
    if (query.maxNodeDist >= 0) {
      const directEdges = await this.discoverDirectConnections(
        Array.from(queryPersons),
        this.personNetworkRepo,
        query.includeKinship !== false,
        query.includeAssociation !== false
      );
      allEdges.push(...directEdges);
    }

    // Phase 2: One-hop discovery (maxNodeDist >= 1)
    if (query.maxNodeDist >= 1) {
      const oneHopResults = await this.discoverOneHop(
        Array.from(queryPersons),
        queryPersons,
        allPersons,
        nodeDistances,
        this.personNetworkRepo,
        query.includeKinship !== false,
        query.includeAssociation !== false
      );
      allEdges.push(...oneHopResults.edges);
    }

    // Phase 3: Two-hop discovery (maxNodeDist >= 2)
    if (query.maxNodeDist >= 2) {
      const oneHopPersons = Array.from(allPersons).filter(id =>
        !queryPersons.has(id) && nodeDistances.get(id) === 1
      );

      if (oneHopPersons.length > 0) {
        const twoHopResults = await this.discoverTwoHop(
          oneHopPersons,
          queryPersons,
          allPersons,
          nodeDistances,
          this.personNetworkRepo,
          query.includeKinship !== false,
          query.includeAssociation !== false
        );
        allEdges.push(...twoHopResults.edges);
      }
    }

    return { allPersons, allEdges, queryPersons, nodeDistances };
  }
  /**
   * Phase 1: Discover direct connections between query nodes
   * Finds edges where both source and target are in the query set
   *
   * @param queryPersonIds Array of person IDs to find connections between
   * @param personNetworkRepo Repository for network queries
   * @param includeKinship Whether to include kinship relationships
   * @param includeAssociation Whether to include association relationships
   * @returns Array of direct connection edges
   */
  async discoverDirectConnections(
    queryPersonIds: number[],
    personNetworkRepo: any, // Will be properly typed when we refactor
    includeKinship: boolean,
    includeAssociation: boolean
  ): Promise<NetworkEdge[]> {
    const edges = await personNetworkRepo.findEdgesWithinGroup(
      queryPersonIds,
      includeKinship,
      includeAssociation
    );

    // Set edge distance 0 for all direct connections
    edges.forEach(edge => {
      edge.edgeDistance = 0;
      edge.nodeDistance = 0;
    });

    return edges;
  }

  /**
   * Phase 2: One-hop discovery from query nodes
   * Discovers nodes that are directly connected to query nodes
   *
   * @param queryPersonIds Original query person IDs
   * @param queryPersons Set of query persons for fast lookup
   * @param allPersons Set to track all discovered persons
   * @param nodeDistances Map to track minimum distance to query nodes
   * @param personNetworkRepo Repository for network queries
   * @param includeKinship Whether to include kinship relationships
   * @param includeAssociation Whether to include association relationships
   * @returns Discovered edges and updated sets
   */
  async discoverOneHop(
    queryPersonIds: number[],
    queryPersons: Set<number>,
    allPersons: Set<number>,
    nodeDistances: Map<number, number>,
    personNetworkRepo: any,
    includeKinship: boolean,
    includeAssociation: boolean
  ): Promise<{ edges: NetworkEdge[] }> {
    const edges: NetworkEdge[] = [];

    // Get all connections from query persons
    const connections = await personNetworkRepo.discoverConnectedPersons(
      queryPersonIds,
      includeKinship,
      includeAssociation
    );

    // Process connections
    for (const [personId, relations] of connections) {
      for (const rel of relations) {
        // Add discovered person
        allPersons.add(rel.relatedPersonId);

        // Update node distance
        if (!nodeDistances.has(rel.relatedPersonId) || nodeDistances.get(rel.relatedPersonId)! > 1) {
          nodeDistances.set(rel.relatedPersonId, 1);
        }

        // Create edge
        const edge: NetworkEdge = {
          source: personId,
          target: rel.relatedPersonId,
          edgeType: rel.type,
          edgeLabel: rel.label,
          edgeCode: rel.code,
          edgeDistance: queryPersons.has(rel.relatedPersonId) ? 0 : 1,
          nodeDistance: 1
        };
        edges.push(edge);
      }
    }

    // Find edges within the expanded group
    const allGroupEdges = await personNetworkRepo.findEdgesWithinGroup(
      Array.from(allPersons),
      includeKinship,
      includeAssociation
    );

    // Calculate edge distances for group edges
    for (const edge of allGroupEdges) {
      const sourceIsQuery = queryPersons.has(edge.source);
      const targetIsQuery = queryPersons.has(edge.target);

      if (sourceIsQuery && targetIsQuery) {
        edge.edgeDistance = 0;
      } else if (sourceIsQuery || targetIsQuery) {
        edge.edgeDistance = 1;
      } else {
        edge.edgeDistance = 2;
      }

      // Avoid duplicates
      const isDuplicate = edges.some(e =>
        (e.source === edge.source && e.target === edge.target) ||
        (e.source === edge.target && e.target === edge.source)
      );

      if (!isDuplicate) {
        edges.push(edge);
      }
    }

    return { edges };
  }

  /**
   * Phase 3: Two-hop discovery from one-hop nodes
   * Discovers nodes that are two hops away from query nodes
   *
   * @param oneHopPersonIds Person IDs discovered in phase 2
   * @param queryPersons Set of original query persons
   * @param allPersons Set to track all discovered persons
   * @param nodeDistances Map to track minimum distance to query nodes
   * @param personNetworkRepo Repository for network queries
   * @param includeKinship Whether to include kinship relationships
   * @param includeAssociation Whether to include association relationships
   * @returns Discovered edges
   */
  async discoverTwoHop(
    oneHopPersonIds: number[],
    queryPersons: Set<number>,
    allPersons: Set<number>,
    nodeDistances: Map<number, number>,
    personNetworkRepo: any,
    includeKinship: boolean,
    includeAssociation: boolean
  ): Promise<{ edges: NetworkEdge[] }> {
    const edges: NetworkEdge[] = [];

    // Get connections from one-hop persons
    const connections = await personNetworkRepo.discoverConnectedPersons(
      oneHopPersonIds,
      includeKinship,
      includeAssociation
    );

    // Process connections
    for (const [personId, relations] of connections) {
      for (const rel of relations) {
        // Don't go back to query persons
        if (!queryPersons.has(rel.relatedPersonId)) {
          // Add discovered person
          allPersons.add(rel.relatedPersonId);

          // Update node distance
          if (!nodeDistances.has(rel.relatedPersonId) || nodeDistances.get(rel.relatedPersonId)! > 2) {
            nodeDistances.set(rel.relatedPersonId, 2);
          }

          // Create edge
          const edge: NetworkEdge = {
            source: personId,
            target: rel.relatedPersonId,
            edgeType: rel.type,
            edgeLabel: rel.label,
            edgeCode: rel.code,
            edgeDistance: 2,
            nodeDistance: 2
          };
          edges.push(edge);
        }
      }
    }

    return { edges };
  }

  /**
   * Check for duplicate edges
   * Helper method to avoid duplicate edges in the network
   *
   * @param edges Existing edges array
   * @param newEdge Edge to check for duplicates
   * @returns True if edge already exists
   */
  isDuplicateEdge(edges: NetworkEdge[], newEdge: NetworkEdge): boolean {
    return edges.some(e =>
      (e.source === newEdge.source && e.target === newEdge.target) ||
      (e.source === newEdge.target && e.target === newEdge.source)
    );
  }

  /**
   * Calculate edge distance based on query membership
   * Helper to determine how far an edge is from query nodes
   *
   * @param source Source node ID
   * @param target Target node ID
   * @param queryPersons Set of query person IDs
   * @returns Calculated edge distance
   */
  calculateEdgeDistance(source: number, target: number, queryPersons: Set<number>): number {
    const sourceIsQuery = queryPersons.has(source);
    const targetIsQuery = queryPersons.has(target);

    if (sourceIsQuery && targetIsQuery) {
      return 0; // Direct connection between query persons
    } else if (sourceIsQuery || targetIsQuery) {
      return 1; // One hop from query
    } else {
      return 2; // Between discovered persons
    }
  }
}