/**
 * BridgeNodeAnalyzer
 * Identifies and analyzes bridge nodes that connect multiple query persons
 * Extracted from PersonNetworkService for modularity and reusability
 */

import { Injectable } from '@nestjs/common';
import { NetworkEdge, BridgeNode, cbdbMapper } from '@cbdb/core';
import type { PersonModel } from '@cbdb/core';

/**
 * Service for analyzing bridge nodes in networks
 * Bridge nodes are persons who connect multiple query persons
 * Can be reused for any graph bridge detection needs
 */
@Injectable()
export class BridgeNodeAnalyzer {
  /**
   * Find bridge nodes connecting multiple query persons
   * A bridge node is a discovered person connected to 2+ query persons
   *
   * @param edges All edges in the network
   * @param queryPersons Set of query person IDs
   * @param allPersons Set of all person IDs in network
   * @param personNetworkRepo Repository for loading person data
   * @returns Array of bridge nodes sorted by importance
   */
  async findBridgeNodes(
    edges: NetworkEdge[],
    queryPersons: Set<number>,
    allPersons: Set<number>,
    personNetworkRepo?: any // Optional, for loading person data
  ): Promise<BridgeNode[]> {
    // Track connections from discovered persons to query persons
    const connectionCount = new Map<number, Map<number, string[]>>();

    // Analyze all edges
    for (const edge of edges) {
      // Check if edge connects query person to discovered person
      if (queryPersons.has(edge.source) && !queryPersons.has(edge.target)) {
        if (!connectionCount.has(edge.target)) {
          connectionCount.set(edge.target, new Map());
        }
        const connections = connectionCount.get(edge.target)!;
        if (!connections.has(edge.source)) {
          connections.set(edge.source, []);
        }
        connections.get(edge.source)!.push(edge.edgeLabel);
      }

      // Check reverse direction
      if (queryPersons.has(edge.target) && !queryPersons.has(edge.source)) {
        if (!connectionCount.has(edge.source)) {
          connectionCount.set(edge.source, new Map());
        }
        const connections = connectionCount.get(edge.source)!;
        if (!connections.has(edge.target)) {
          connections.set(edge.target, []);
        }
        connections.get(edge.target)!.push(edge.edgeLabel);
      }
    }

    // Filter to those connecting 2+ query persons and build bridge nodes
    const bridgeNodes: BridgeNode[] = [];

    // Load person data if repository provided
    let personDataMap = new Map();
    if (personNetworkRepo) {
      personDataMap = await personNetworkRepo.loadPersonsByIds(
        Array.from(connectionCount.keys())
      );
    }

    for (const [personId, connections] of connectionCount) {
      if (connections.size >= 2) {
        const personData = personDataMap.get(personId);
        const connectsTo = Array.from(connections.keys());

        // Determine bridge type based on edge labels
        const bridgeType = this.determineBridgeType(connections);

        bridgeNodes.push({
          personId,
          person: personData ? cbdbMapper.person.toTableModel(personData) : undefined,
          connectsToQueryPersons: connectsTo,
          connectionTypes: connections,
          bridgeType,
          bridgeScore: this.calculateBridgeScore(connections)
        });
      }
    }

    // Sort by bridge score (importance)
    return this.sortByImportance(bridgeNodes);
  }

  /**
   * Calculate bridge score based on number and types of connections
   * Higher score = more important bridge node
   *
   * @param connections Map of query person ID to relationship labels
   * @returns Bridge score
   */
  calculateBridgeScore(connections: Map<number, string[]>): number {
    // Base score is number of query persons connected
    let score = connections.size;

    // Additional weight for multiple relationships to same person
    for (const labels of connections.values()) {
      if (labels.length > 1) {
        score += 0.5 * (labels.length - 1);
      }
    }

    return score;
  }

  /**
   * Determine bridge type based on connection types
   *
   * @param connections Map of query person ID to relationship labels
   * @returns Bridge type: 'kinship', 'association', or 'mixed'
   */
  determineBridgeType(connections: Map<number, string[]>): 'kinship' | 'association' | 'mixed' {
    let hasKinship = false;
    let hasAssociation = false;

    for (const labels of connections.values()) {
      for (const label of labels) {
        // Simple heuristic: labels starting with 'K' are kinship, 'A' are association
        // This matches the current label format from the repository
        if (label.startsWith('K') || label.includes('Kinship')) {
          hasKinship = true;
        } else if (label.startsWith('A') || label.includes('Association')) {
          hasAssociation = true;
        }
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
   * Sort bridge nodes by importance (bridge score)
   *
   * @param bridgeNodes Array of bridge nodes
   * @returns Sorted array with most important bridges first
   */
  sortByImportance(bridgeNodes: BridgeNode[]): BridgeNode[] {
    return bridgeNodes.sort((a, b) => b.bridgeScore - a.bridgeScore);
  }

  /**
   * Filter bridge nodes by minimum connections
   *
   * @param bridgeNodes Array of bridge nodes
   * @param minConnections Minimum number of query persons to connect
   * @returns Filtered array of bridge nodes
   */
  filterByMinConnections(bridgeNodes: BridgeNode[], minConnections: number): BridgeNode[] {
    return bridgeNodes.filter(node => node.connectsToQueryPersons.length >= minConnections);
  }

  /**
   * Filter bridge nodes by type
   *
   * @param bridgeNodes Array of bridge nodes
   * @param type Bridge type to filter by
   * @returns Filtered array of bridge nodes
   */
  filterByType(bridgeNodes: BridgeNode[], type: 'kinship' | 'association' | 'mixed'): BridgeNode[] {
    return bridgeNodes.filter(node => node.bridgeType === type);
  }

  /**
   * Get statistics about bridge nodes
   *
   * @param bridgeNodes Array of bridge nodes
   * @returns Statistics object
   */
  getBridgeStatistics(bridgeNodes: BridgeNode[]): {
    total: number;
    byType: Record<string, number>;
    avgConnectionsPerBridge: number;
    maxConnections: number;
  } {
    const stats = {
      total: bridgeNodes.length,
      byType: {
        kinship: 0,
        association: 0,
        mixed: 0
      },
      avgConnectionsPerBridge: 0,
      maxConnections: 0
    };

    if (bridgeNodes.length === 0) {
      return stats;
    }

    let totalConnections = 0;
    for (const node of bridgeNodes) {
      stats.byType[node.bridgeType]++;
      totalConnections += node.connectsToQueryPersons.length;
      stats.maxConnections = Math.max(stats.maxConnections, node.connectsToQueryPersons.length);
    }

    stats.avgConnectionsPerBridge = totalConnections / bridgeNodes.length;

    return stats;
  }
}