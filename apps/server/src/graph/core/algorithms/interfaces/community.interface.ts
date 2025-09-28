/**
 * ICommunityAlgorithm
 * Interface for community detection algorithm implementations
 * Can be implemented using different libraries (Graphology, WASM, etc.)
 */

import type Graph from 'graphology';

export interface CommunityDetectionOptions {
  resolution?: number;
  randomWalk?: boolean;
  weightAttribute?: string;
}

export interface CommunityResult {
  resolution: number;
  communities: Map<number, number>;
  count: number;
}

export interface ICommunityAlgorithm {
  /**
   * Detect communities using the specified algorithm
   */
  detectCommunities(
    graph: Graph,
    options?: CommunityDetectionOptions
  ): Map<number, number>;

  /**
   * Get the number of unique communities
   */
  getCommunityCount(communities: Map<number, number>): number;

  /**
   * Get members of a specific community
   */
  getCommunityMembers(
    communities: Map<number, number>,
    communityId: number
  ): number[];

  /**
   * Find bridge nodes between communities
   */
  findCommunityBridges(graph: Graph): Map<number, Set<number>>;

  /**
   * Calculate modularity score for given communities
   */
  calculateModularityScore(
    graph: Graph,
    communities: Map<number, number>
  ): number;

  /**
   * Find the largest communities
   */
  getLargestCommunities(
    communities: Map<number, number>,
    topN: number
  ): Array<{ communityId: number; size: number; members: number[] }>;

  /**
   * Detect hierarchical communities at different resolutions
   */
  detectHierarchicalCommunities(
    graph: Graph,
    resolutions: number[]
  ): CommunityResult[];
}