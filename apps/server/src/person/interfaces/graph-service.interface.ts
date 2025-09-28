/**
 * Common interface for all graph service implementations
 * Ensures API stability and swappability
 */

import {
  ExplorePersonNetworkQuery,
  ExploreDirectNetworkQuery,
  ExploreAssociationNetworkQuery,
  ExploreNetworkResult
} from '@cbdb/core';

/**
 * Graph service interface that all implementations must follow
 * This ensures complete swappability between different optimization strategies
 */
export interface IPersonGraphService {
  /**
   * Explore person network with configurable depth and filters
   */
  explorePersonNetwork(query: ExplorePersonNetworkQuery): Promise<ExploreNetworkResult>;

  /**
   * Explore direct relationships (depth 1 specialized)
   */
  exploreDirectNetwork(query: ExploreDirectNetworkQuery): Promise<ExploreNetworkResult>;

  /**
   * Explore association network (academic/social focus)
   */
  exploreAssociationNetwork(query: ExploreAssociationNetworkQuery): Promise<ExploreNetworkResult>;

  /**
   * Explore kinship network (family focus)
   */
  exploreKinshipNetwork(personId: number, depth?: number): Promise<ExploreNetworkResult>;

  /**
   * Export network to GEXF format
   */
  exportNetworkToGEXF(
    personId: number,
    outputPath: string,
    options?: {
      includeKinship?: boolean;
      includeAssociations?: boolean;
      includeOffices?: boolean;
    }
  ): Promise<{ success: boolean; filepath: string; metrics: any }>;
}

/**
 * Graph service strategy selection
 */
export enum GraphServiceStrategy {
  ORIGINAL = 'original',
  OPTIMIZED = 'optimized',
  WORKER_POOL = 'worker-pool',
  AUTO = 'auto'
}

/**
 * Configuration for graph service selection
 */
export interface GraphServiceConfig {
  strategy: GraphServiceStrategy;
  thresholds?: {
    smallNetwork: number;  // Use original if nodes < this
    largeNetwork: number;  // Use worker pool if nodes > this
  };
  workerPool?: {
    minWorkers: number;
    maxWorkers: number;
  };
}