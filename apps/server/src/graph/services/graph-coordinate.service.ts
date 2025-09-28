/**
 * GraphCoordinateService
 *
 * Service for managing worker pool to populate graph coordinates.
 * Ensures all graph nodes have x,y positions required for visualization.
 *
 * ## Architecture
 * - Uses WorkerPathResolver to locate pre-compiled coordinate worker
 * - Delegates layout calculations to worker threads for performance
 * - Falls back to synchronous processing if workers unavailable
 *
 * ## Worker Strategy
 * - Small graphs (<10 nodes): Process synchronously (faster than worker overhead)
 * - Large graphs: Use worker pool for parallel layout computation
 * - Worker pool size: 1-2 threads (coordinate calculation is memory-bound)
 *
 * ## Graceful Degradation
 * - If worker initialization fails, service continues with sync fallback
 * - Logs worker availability for debugging
 * - Never blocks service startup due to missing workers
 */

import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import * as workerpool from 'workerpool';
import * as path from 'path';
import { CbdbGraphData } from '@cbdb/core';
import { WorkerPathResolverService } from '../../workers/worker-path-resolver.service';

/**
 * Layout options for coordinate population
 */
export interface CoordinateLayoutOptions {
  layoutType?: 'random' | 'circle' | 'grid';
  seed?: number;
}

@Injectable()
export class GraphCoordinateService implements OnModuleDestroy {
  private readonly logger = new Logger(GraphCoordinateService.name);
  private pool: workerpool.Pool | null = null;

  constructor(private readonly workerPathResolver: WorkerPathResolverService) {
    this.initializeWorkerPool();
  }

  /**
   * Initialize worker pool with proper error handling.
   * Separating initialization allows for better testing and error recovery.
   */
  private initializeWorkerPool(): void {
    const workerPath = this.workerPathResolver.getWorkerPath('graph-coordinate.worker.js');
    this.logger.log(`Initializing worker pool with path: ${workerPath}`);

    try {
      // Validate worker exists before creating pool
      if (!this.workerPathResolver.workerExists('graph-coordinate.worker.js')) {
        this.logger.warn('Coordinate worker not found, will use synchronous processing');
        return;
      }

      this.pool = workerpool.pool(workerPath, {
        minWorkers: 1,
        maxWorkers: 2, // Keep lightweight - coordinate calc is memory-bound
        workerType: 'thread' // Worker threads for better Node.js integration
      });

      this.logger.log('Worker pool initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize worker pool: ${error}`);
      this.logger.warn('Falling back to synchronous coordinate processing');
      // Set pool to null to trigger sync fallback
      this.pool = null;
    }
  }

  /**
   * Populate x,y coordinates for all nodes in graph data.
   * Intelligently chooses between worker pool and synchronous processing.
   *
   * @param graphData - The graph data to process
   * @returns Graph data with populated coordinates
   */
  async populateCoordinates(graphData: CbdbGraphData): Promise<CbdbGraphData> {
    // Early return for empty graphs
    if (!graphData?.nodes || graphData.nodes.length === 0) {
      return graphData;
    }

    // Small graphs: sync processing is faster (avoids worker overhead)
    if (graphData.nodes.length < 10 || !this.pool) {
      return this.populateCoordinatesSync(graphData);
    }

    // Large graphs: use worker pool for better performance
    try {
      const result = await this.pool.exec('populateCoordinates', [graphData]);
      return result as CbdbGraphData;
    } catch (error) {
      this.logger.warn(`Worker pool error, falling back to sync: ${error.message}`);
      return this.populateCoordinatesSync(graphData);
    }
  }

  /**
   * Populate coordinates for multiple graph data objects in batch
   *
   * @param graphDataArray - Array of graph data objects
   * @returns Array of graph data with populated coordinates
   */
  async populateCoordinatesBatch(graphDataArray: CbdbGraphData[]): Promise<CbdbGraphData[]> {
    if (!this.pool) {
      // No worker pool available, process individually with sync fallback
      return Promise.all(graphDataArray.map(data => this.populateCoordinates(data)));
    }

    try {
      const result = await this.pool.exec('populateCoordinatesBatch', [graphDataArray]);
      return result as CbdbGraphData[];
    } catch (error) {
      this.logger.warn(`Batch worker error, processing individually: ${error.message}`);
      // Fallback to individual processing
      return Promise.all(graphDataArray.map(data => this.populateCoordinates(data)));
    }
  }

  /**
   * Populate coordinates with specific layout algorithm
   *
   * @param graphData - The graph data
   * @param options - Layout options
   * @returns Graph data with coordinates based on layout
   */
  async populateCoordinatesWithLayout(
    graphData: CbdbGraphData,
    options: CoordinateLayoutOptions = {}
  ): Promise<CbdbGraphData> {
    if (!this.pool) {
      // No worker pool available, use sync fallback
      this.logger.debug('No worker pool available for layout, using sync processing');
      return this.populateCoordinatesSync(graphData);
    }

    try {
      const result = await this.pool.exec('populateCoordinatesWithLayout', [graphData, options]);
      return result as CbdbGraphData;
    } catch (error) {
      this.logger.warn(`Layout worker error, using random: ${error.message}`);
      return this.populateCoordinatesSync(graphData);
    }
  }

  /**
   * Synchronous coordinate population (fallback)
   *
   * @param graphData - Graph data to process
   * @returns Graph data with populated coordinates
   */
  private populateCoordinatesSync(graphData: CbdbGraphData): CbdbGraphData {
    if (!graphData?.nodes) {
      return graphData;
    }

    const processedNodes = graphData.nodes.map(node => {
      // If node already has valid coordinates, keep them
      if (node.attributes?.x !== undefined && node.attributes?.y !== undefined) {
        return node;
      }

      // Assign random positions
      return {
        ...node,
        attributes: {
          ...(node.attributes || {}),
          x: Math.random() * 1000 - 500,
          y: Math.random() * 1000 - 500
        }
      };
    });

    return {
      ...graphData,
      nodes: processedNodes
    };
  }

  /**
   * Get worker pool statistics
   */
  getPoolStats() {
    if (!this.pool) {
      return {
        totalWorkers: 0,
        busyWorkers: 0,
        idleWorkers: 0,
        pendingTasks: 0,
        activeTasks: 0
      };
    }
    return this.pool.stats();
  }

  /**
   * Clean up on module destroy
   */
  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.terminate();
      this.logger.log('Worker pool terminated');
    }
  }
}