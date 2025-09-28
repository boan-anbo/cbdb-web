/**
 * GraphologyCommunityAlgorithm
 * Graphology-based implementation of community detection algorithms
 */

import { Injectable } from '@nestjs/common';
import Graph from 'graphology';
import louvain from 'graphology-communities-louvain';
import * as metrics from 'graphology-metrics';

/**
 * Community detection algorithm implementation using Graphology library
 */
@Injectable()
export class GraphologyCommunityAlgorithm {
  /**
   * Detect communities using the Louvain algorithm
   * One of the most popular community detection algorithms
   *
   * @param graph Graphology graph instance
   * @param options Algorithm options
   * @returns Map of node ID to community ID
   */
  detectCommunities(
    graph: Graph,
    options?: {
      resolution?: number; // Higher resolution = more communities
      randomWalk?: boolean; // Use random walk for better results
      weighted?: boolean; // Consider edge weights
    }
  ): Map<number, number> {
    const detectedCommunities = louvain(graph, {
      resolution: options?.resolution || 1,
      randomWalk: options?.randomWalk || false,
      getEdgeWeight: options?.weighted ? 'weight' : null
    });

    const result = new Map<number, number>();
    for (const [node, community] of Object.entries(detectedCommunities)) {
      result.set(Number(node), community);
    }

    return result;
  }

  /**
   * Detect communities with detailed information
   *
   * @param graph Graphology graph instance
   * @returns Detailed community information
   */
  detectCommunitiesDetailed(graph: Graph): {
    communities: Map<number, number>;
    communityNodes: Map<number, number[]>;
    communityCount: number;
    modularity: number;
  } {
    const communities = this.detectCommunities(graph);
    const communityNodes = new Map<number, number[]>();

    // Group nodes by community
    for (const [node, communityId] of communities) {
      if (!communityNodes.has(communityId)) {
        communityNodes.set(communityId, []);
      }
      communityNodes.get(communityId)!.push(node);
    }

    // Calculate modularity (measure of community quality)
    const communityObj: { [key: string]: number } = {};
    for (const [node, community] of communities) {
      communityObj[node.toString()] = community;
    }

    const modularityScore = metrics.graph.modularity(graph, communityObj);

    return {
      communities,
      communityNodes,
      communityCount: communityNodes.size,
      modularity: modularityScore
    };
  }

  /**
   * Find the community of a specific node
   *
   * @param graph Graphology graph instance
   * @param nodeId Node ID to find community for
   * @returns Community ID of the node
   */
  findNodeCommunity(graph: Graph, nodeId: number): number | null {
    const communities = this.detectCommunities(graph);
    return communities.get(nodeId) || null;
  }

  /**
   * Find nodes in the same community as a given node
   *
   * @param graph Graphology graph instance
   * @param nodeId Node ID to find community members for
   * @returns Array of node IDs in the same community
   */
  findCommunityMembers(graph: Graph, nodeId: number): number[] {
    const communities = this.detectCommunities(graph);
    const targetCommunity = communities.get(nodeId);

    if (targetCommunity === undefined) {
      return [];
    }

    const members: number[] = [];
    for (const [node, community] of communities) {
      if (community === targetCommunity && node !== nodeId) {
        members.push(node);
      }
    }

    return members;
  }

  /**
   * Find bridge nodes between communities
   * Bridge nodes connect multiple communities
   *
   * @param graph Graphology graph instance
   * @returns Map of node ID to array of connected community IDs
   */
  findCommunityBridges(graph: Graph): Map<number, number[]> {
    const communities = this.detectCommunities(graph);
    const bridges = new Map<number, Set<number>>();

    graph.forEachNode(node => {
      const nodeId = Number(node);
      const nodeCommunity = communities.get(nodeId);

      if (nodeCommunity === undefined) return;

      const connectedCommunities = new Set<number>();
      connectedCommunities.add(nodeCommunity);

      // Check communities of neighbors
      graph.forEachNeighbor(node, neighbor => {
        const neighborId = Number(neighbor);
        const neighborCommunity = communities.get(neighborId);

        if (neighborCommunity !== undefined && neighborCommunity !== nodeCommunity) {
          connectedCommunities.add(neighborCommunity);
        }
      });

      // Node is a bridge if it connects to multiple communities
      if (connectedCommunities.size > 1) {
        bridges.set(nodeId, connectedCommunities);
      }
    });

    const result = new Map<number, number[]>();
    for (const [node, comms] of bridges) {
      result.set(node, Array.from(comms));
    }

    return result;
  }

  /**
   * Calculate community sizes
   *
   * @param graph Graphology graph instance
   * @returns Map of community ID to size
   */
  getCommunitySizes(graph: Graph): Map<number, number> {
    const communities = this.detectCommunities(graph);
    const sizes = new Map<number, number>();

    for (const community of communities.values()) {
      sizes.set(community, (sizes.get(community) || 0) + 1);
    }

    return sizes;
  }

  /**
   * Find the largest communities
   *
   * @param graph Graphology graph instance
   * @param topN Number of largest communities to return
   * @returns Array of [communityId, size] sorted by size
   */
  getLargestCommunities(graph: Graph, topN: number = 5): Array<[number, number]> {
    const sizes = this.getCommunitySizes(graph);
    const sorted = Array.from(sizes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN);

    return sorted;
  }

  /**
   * Calculate inter-community edges
   * Count edges between different communities
   *
   * @param graph Graphology graph instance
   * @returns Map of community pair to edge count
   */
  getInterCommunityEdges(graph: Graph): Map<string, number> {
    const communities = this.detectCommunities(graph);
    const interEdges = new Map<string, number>();

    graph.forEachEdge((edge, attributes, source, target) => {
      const sourceId = Number(source);
      const targetId = Number(target);
      const sourceCommunity = communities.get(sourceId);
      const targetCommunity = communities.get(targetId);

      if (sourceCommunity !== undefined && targetCommunity !== undefined &&
          sourceCommunity !== targetCommunity) {
        // Create a consistent key for the community pair
        const key = [sourceCommunity, targetCommunity].sort().join('-');
        interEdges.set(key, (interEdges.get(key) || 0) + 1);
      }
    });

    return interEdges;
  }

  /**
   * Calculate community cohesion (internal density)
   *
   * @param graph Graphology graph instance
   * @param communityNodes Array of node IDs in the community
   * @returns Cohesion score (0-1)
   */
  calculateCommunityCohesion(graph: Graph, communityNodes: number[]): number {
    if (communityNodes.length <= 1) {
      return 0;
    }

    let internalEdges = 0;
    const nodeSet = new Set(communityNodes);

    // Count edges within the community
    for (const node of communityNodes) {
      graph.forEachNeighbor(node, neighbor => {
        if (nodeSet.has(Number(neighbor))) {
          internalEdges++;
        }
      });
    }

    // Each edge is counted twice in undirected graphs
    if (graph.type === 'undirected') {
      internalEdges /= 2;
    }

    // Calculate maximum possible edges
    const n = communityNodes.length;
    const maxEdges = (n * (n - 1)) / 2;

    return maxEdges > 0 ? internalEdges / maxEdges : 0;
  }

  /**
   * Hierarchical community detection
   * Detect communities at multiple resolution levels
   *
   * @param graph Graphology graph instance
   * @param resolutions Array of resolution values
   * @returns Array of community detections at each resolution
   */
  detectHierarchicalCommunities(
    graph: Graph,
    resolutions: number[] = [0.5, 1, 1.5, 2]
  ): Array<{
    resolution: number;
    communities: Map<number, number>;
    count: number;
  }> {
    return resolutions.map(resolution => {
      const communities = this.detectCommunities(graph, { resolution });
      const communitySet = new Set(communities.values());

      return {
        resolution,
        communities,
        count: communitySet.size
      };
    });
  }
}