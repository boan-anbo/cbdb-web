/**
 * Factory for creating graph service instances based on strategy
 * Provides centralized service selection and configuration
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IPersonGraphService,
  GraphServiceStrategy,
  GraphServiceConfig
} from '../interfaces/graph-service.interface';
import { PersonGraphService } from '../person-graph.service';
import { PersonGraphOptimizedService } from '../person-graph-optimized.service';
import { PersonGraphWorkerPoolService } from '../person-graph-worker-pool.service';

/**
 * Factory service for creating and managing graph service instances
 * Implements the Strategy pattern for swappable implementations
 */
@Injectable()
export class GraphServiceFactory {
  private readonly logger = new Logger(GraphServiceFactory.name);
  private readonly config: GraphServiceConfig;

  constructor(
    @Inject(PersonGraphService) private readonly originalService: PersonGraphService,
    @Inject(PersonGraphOptimizedService) private readonly optimizedService: PersonGraphOptimizedService,
    @Inject(PersonGraphWorkerPoolService) private readonly workerPoolService: PersonGraphWorkerPoolService,
    private readonly configService: ConfigService
  ) {
    // Load configuration with defaults
    this.config = {
      strategy: this.configService.get('GRAPH_SERVICE_STRATEGY', GraphServiceStrategy.AUTO) as GraphServiceStrategy,
      thresholds: {
        smallNetwork: this.configService.get('GRAPH_SMALL_NETWORK_THRESHOLD', 100),
        largeNetwork: this.configService.get('GRAPH_LARGE_NETWORK_THRESHOLD', 1000)
      },
      workerPool: {
        minWorkers: this.configService.get('GRAPH_WORKER_POOL_MIN', 2),
        maxWorkers: this.configService.get('GRAPH_WORKER_POOL_MAX', 4)
      }
    };

    this.logger.log(`Graph service factory initialized with strategy: ${this.config.strategy}`);
  }

  /**
   * Get the appropriate graph service based on configuration
   */
  getService(strategy?: GraphServiceStrategy): IPersonGraphService {
    const selectedStrategy = strategy || this.config.strategy;

    switch (selectedStrategy) {
      case GraphServiceStrategy.ORIGINAL:
        this.logger.debug('Using original graph service');
        return this.originalService;

      case GraphServiceStrategy.OPTIMIZED:
        this.logger.debug('Using optimized graph service');
        return this.optimizedService;

      case GraphServiceStrategy.WORKER_POOL:
        this.logger.debug('Using worker pool graph service');
        return this.workerPoolService;

      case GraphServiceStrategy.AUTO:
      default:
        // AUTO strategy will be determined at runtime based on query
        this.logger.debug('Using AUTO strategy - will select based on network size');
        return this.createAutoService();
    }
  }

  /**
   * Create a proxy service that automatically selects the best implementation
   */
  private createAutoService(): IPersonGraphService {
    const factory = this;

    // Return a proxy that delegates to the appropriate service based on network size
    return new Proxy({} as IPersonGraphService, {
      get(target, prop: string) {
        return async (...args: any[]) => {
          const service = await factory.selectServiceForQuery(prop, args);
          return service[prop](...args);
        };
      }
    });
  }

  /**
   * Select the best service based on the query parameters
   */
  private async selectServiceForQuery(method: string, args: any[]): Promise<IPersonGraphService> {
    // Estimate network size based on method and parameters
    const estimatedSize = await this.estimateNetworkSize(method, args);

    if (estimatedSize < this.config.thresholds!.smallNetwork) {
      this.logger.debug(`Auto-selected ORIGINAL service for estimated ${estimatedSize} nodes`);
      return this.originalService;
    } else if (estimatedSize < this.config.thresholds!.largeNetwork) {
      this.logger.debug(`Auto-selected OPTIMIZED service for estimated ${estimatedSize} nodes`);
      return this.optimizedService;
    } else {
      this.logger.debug(`Auto-selected WORKER_POOL service for estimated ${estimatedSize} nodes`);
      return this.workerPoolService;
    }
  }

  /**
   * Estimate network size based on query parameters
   */
  private async estimateNetworkSize(method: string, args: any[]): Promise<number> {
    // Simple heuristic based on depth and method
    if (method === 'explorePersonNetwork' || method === 'exploreDirectNetwork') {
      const query = args[0];
      const depth = query?.depth || 1;
      const baseSize = 20; // Average connections per person

      // Exponential growth with depth
      return Math.pow(baseSize, depth);
    }

    // Default to medium size
    return 150;
  }

  /**
   * Get current configuration
   */
  getConfig(): GraphServiceConfig {
    return { ...this.config };
  }

  /**
   * Update configuration at runtime
   */
  updateConfig(config: Partial<GraphServiceConfig>): void {
    Object.assign(this.config, config);
    this.logger.log(`Graph service configuration updated: ${JSON.stringify(config)}`);
  }

  /**
   * Get service statistics for monitoring
   */
  async getStats(): Promise<{
    strategy: GraphServiceStrategy;
    config: GraphServiceConfig;
    workerPoolStats?: any;
  }> {
    const stats: any = {
      strategy: this.config.strategy,
      config: this.config
    };

    // Add worker pool stats if available
    if (this.config.strategy === GraphServiceStrategy.WORKER_POOL ||
        this.config.strategy === GraphServiceStrategy.AUTO) {
      stats.workerPoolStats = this.workerPoolService.getPoolStats();
    }

    return stats;
  }
}