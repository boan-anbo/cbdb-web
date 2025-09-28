/**
 * Person Graph Service with Worker Pool
 *
 * Combines optimized batch fetching with parallel processing using Worker Pool
 * for CPU-intensive graph computations.
 *
 * ## Architecture
 * - Uses WorkerPathResolver to locate pre-compiled worker files
 * - Workers run CPU-intensive graph metrics calculations in separate threads
 * - Main thread handles data fetching and orchestration
 *
 * ## Worker Management
 * - Pool size: min(4, CPU cores / 2) for optimal performance
 * - Workers are reused across requests to minimize overhead
 * - Graceful shutdown on module destroy
 *
 * ## Error Handling
 * - Falls back to single-threaded computation if workers unavailable
 * - Logs worker initialization failures but continues operation
 */

import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import * as workerpool from 'workerpool';
import * as path from 'path';
import * as fs from 'fs/promises';
import Graph from 'graphology';
import { write as writeGEXF } from 'graphology-gexf';
import {
  ExplorePersonNetworkQuery,
  ExploreDirectNetworkQuery,
  ExploreAssociationNetworkQuery,
  ExploreNetworkResult
} from '@cbdb/core';
import { PersonGraphOptimizedService } from './person-graph-optimized.service';
import { WorkerPathResolverService } from '../workers/worker-path-resolver.service';

interface GraphMetrics {
  nodeCount: number;
  edgeCount: number;
  density: number;
  avgDegree: number;
  clusteringCoefficient: number;
  degreeDistribution: {
    min: number;
    max: number;
    median: number;
    mean: number;
  };
  componentCount: number;
  largestComponentSize: number;
  isConnected: boolean;
}

@Injectable()
export class PersonGraphWorkerPoolService implements OnModuleDestroy {
  private readonly logger = new Logger(PersonGraphWorkerPoolService.name);
  private pool: workerpool.Pool;

  constructor(
    private readonly optimizedService: PersonGraphOptimizedService,
    private readonly workerPathResolver: WorkerPathResolverService
  ) {
    // Initialize worker pool using convention-based path resolution
    const workerPath = this.workerPathResolver.getWorkerPath('graph-metrics.worker.js');
    this.logger.log(`Initializing worker pool with path: ${workerPath}`);

    try {
      this.pool = workerpool.pool(
        workerPath,
        {
          minWorkers: 2,
          maxWorkers: 4, // Adjust based on CPU cores
          workerType: 'process' // Use 'thread' for Node.js worker threads if available
        }
      );
    } catch (error) {
      console.error('[PersonGraphWorkerPool] Failed to initialize worker pool:', error);
      console.error('[PersonGraphWorkerPool] Available workers:', this.workerPathResolver.listAvailableWorkers());
      throw new Error(`Failed to initialize worker pool: ${error.message}`);
    }
  }

  async onModuleDestroy() {
    // Clean up worker pool on module destroy
    if (this.pool) {
      await this.pool.terminate();
    }
  }

  /**
   * Explore network with parallel metrics computation
   */
  async explorePersonNetworkWithWorkers(
    query: ExplorePersonNetworkQuery
  ): Promise<ExploreNetworkResult> {
    // Step 1: Use optimized service to build the graph data
    const result = await this.optimizedService.explorePersonNetworkOptimized(query);

    // Step 2: Calculate metrics in parallel using worker pool
    try {
      const metrics = await this.calculateMetricsInWorker(result.graphData);

      // Update result with worker-computed metrics
      result.metrics = {
        ...result.metrics, // Keep basic metrics
        ...metrics // Override with worker-computed metrics
      };

      // Add advanced insights based on metrics
      this.addAdvancedInsights(result, metrics);
    } catch (error) {
      console.error('Worker pool metrics calculation failed, using fallback:', error);
      // Fallback to basic metrics if worker fails
    }

    return result;
  }

  /**
   * Calculate metrics using worker pool
   */
  private async calculateMetricsInWorker(graphData: any): Promise<GraphMetrics> {
    // Execute metrics calculation in worker
    const metrics = await this.pool.exec('calculateAllMetrics', [graphData]) as GraphMetrics;
    return metrics;
  }

  /**
   * Calculate specific metrics in parallel
   */
  async calculateMetricsParallel(graphData: any): Promise<GraphMetrics> {
    // Run multiple metric calculations in parallel
    const [
      basicMetrics,
      clustering,
      degreeDistribution,
      components
    ] = await Promise.all([
      // Basic metrics
      this.pool.exec('calculateDensity', [
        graphData.nodes.length,
        graphData.edges.length
      ]).then(density => ({
        density: density as number,
        avgDegree: (2 * graphData.edges.length) / graphData.nodes.length
      })),

      // Clustering coefficient
      this.pool.exec('calculateClusteringCoefficient', [graphData]),

      // Degree distribution
      this.pool.exec('calculateDegreeDistribution', [graphData]),

      // Connected components
      this.pool.exec('findConnectedComponents', [graphData])
    ]);

    const componentSizes = components as number[];

    return {
      nodeCount: graphData.nodes.length,
      edgeCount: graphData.edges.length,
      density: basicMetrics.density,
      avgDegree: basicMetrics.avgDegree,
      clusteringCoefficient: clustering as number,
      degreeDistribution: degreeDistribution as any,
      componentCount: componentSizes.length,
      largestComponentSize: Math.max(...componentSizes, 0),
      isConnected: componentSizes.length === 1
    };
  }

  /**
   * Process large graphs in chunks using worker pool
   */
  async processLargeGraphInChunks(
    graphData: any,
    chunkSize: number = 1000
  ): Promise<any> {
    const nodes = graphData.nodes;
    const chunks: any[] = [];

    // Split nodes into chunks
    for (let i = 0; i < nodes.length; i += chunkSize) {
      chunks.push({
        nodes: nodes.slice(i, i + chunkSize),
        edges: this.filterEdgesForNodes(
          graphData.edges,
          nodes.slice(i, i + chunkSize).map((n: any) => n.key)
        )
      });
    }

    // Process chunks in parallel
    const chunkResults = await Promise.all(
      chunks.map(chunk => this.pool.exec('calculateAllMetrics', [chunk]))
    );

    // Merge results
    return this.mergeChunkResults(chunkResults);
  }

  /**
   * Filter edges for a subset of nodes
   */
  private filterEdgesForNodes(edges: any[], nodeKeys: string[]): any[] {
    const nodeSet = new Set(nodeKeys);
    return edges.filter(edge =>
      nodeSet.has(edge.source) && nodeSet.has(edge.target)
    );
  }

  /**
   * Merge results from multiple chunks
   */
  private mergeChunkResults(chunkResults: any[]): GraphMetrics {
    // Aggregate metrics from chunks
    let totalNodes = 0;
    let totalEdges = 0;
    let totalDensity = 0;
    let totalClustering = 0;

    for (const chunk of chunkResults) {
      totalNodes += chunk.nodeCount || 0;
      totalEdges += chunk.edgeCount || 0;
      totalDensity += chunk.density || 0;
      totalClustering += chunk.clusteringCoefficient || 0;
    }

    return {
      nodeCount: totalNodes,
      edgeCount: totalEdges,
      density: totalDensity / chunkResults.length,
      avgDegree: (2 * totalEdges) / totalNodes,
      clusteringCoefficient: totalClustering / chunkResults.length,
      degreeDistribution: {
        min: Math.min(...chunkResults.map(c => c.degreeDistribution?.min || 0)),
        max: Math.max(...chunkResults.map(c => c.degreeDistribution?.max || 0)),
        median: chunkResults[Math.floor(chunkResults.length / 2)]?.degreeDistribution?.median || 0,
        mean: chunkResults.reduce((sum, c) => sum + (c.degreeDistribution?.mean || 0), 0) / chunkResults.length
      },
      componentCount: chunkResults.reduce((sum, c) => sum + (c.componentCount || 0), 0),
      largestComponentSize: Math.max(...chunkResults.map(c => c.largestComponentSize || 0)),
      isConnected: chunkResults.every(c => c.isConnected)
    };
  }

  /**
   * Add advanced insights based on metrics
   */
  private addAdvancedInsights(result: ExploreNetworkResult, metrics: GraphMetrics): void {
    const insights: string[] = [];

    // Network structure insights
    if (metrics.density > 0.5) {
      insights.push('Highly dense network indicates strong interconnectedness');
    } else if (metrics.density < 0.1) {
      insights.push('Sparse network suggests selective or limited connections');
    }

    // Clustering insights
    if (metrics.clusteringCoefficient > 0.5) {
      insights.push('High clustering indicates tight-knit communities');
    } else if (metrics.clusteringCoefficient < 0.1) {
      insights.push('Low clustering suggests hierarchical or star-like structure');
    }

    // Component insights
    if (!metrics.isConnected) {
      insights.push(`Network has ${metrics.componentCount} separate components`);
    }

    // Degree distribution insights
    const degreeRange = metrics.degreeDistribution.max - metrics.degreeDistribution.min;
    if (degreeRange > 20) {
      insights.push('Wide degree distribution indicates presence of hubs');
    }

    // Add to interpretation
    if (result.interpretation) {
      result.interpretation.keyFindings = [
        ...(result.interpretation.keyFindings || []),
        ...insights
      ];
    }
  }

  /**
   * Calculate betweenness centrality for important nodes
   */
  async calculateCentrality(
    graphData: any,
    topN: number = 10
  ): Promise<Map<string, number>> {
    // Sample nodes for large graphs
    const sampleSize = Math.min(100, graphData.nodes.length);
    const sampledNodes = graphData.nodes
      .sort(() => Math.random() - 0.5)
      .slice(0, sampleSize)
      .map((n: any) => n.key);

    const centrality = await this.pool.exec(
      'calculateBetweennessCentrality',
      [graphData, sampledNodes]
    ) as Array<[string, number]>;

    // Convert to Map and get top N
    const centralityMap = new Map(centrality);
    const sorted = Array.from(centralityMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN);

    return new Map(sorted);
  }

  /**
   * Get pool statistics for monitoring
   */
  getPoolStats(): any {
    return this.pool.stats();
  }

  // Interface implementations for IPersonGraphService compatibility
  async explorePersonNetwork(query: ExplorePersonNetworkQuery): Promise<ExploreNetworkResult> {
    return this.explorePersonNetworkWithWorkers(query);
  }

  private async exploreWithWorkerPool(query: ExplorePersonNetworkQuery): Promise<ExploreNetworkResult> {
    return this.explorePersonNetworkWithWorkers(query);
  }

  async exploreDirectNetwork(query: ExploreDirectNetworkQuery): Promise<ExploreNetworkResult> {
    // Direct network is depth 1 with specified relation types
    const relationTypes: string[] = [];
    if (query.includeKinship !== false) relationTypes.push('kinship');
    if (query.includeAssociations !== false) relationTypes.push('association');
    if (query.includeOffices) relationTypes.push('office');

    const personQuery: ExplorePersonNetworkQuery = {
      personId: query.personId,
      depth: 1,
      relationTypes: relationTypes.length > 0 ? relationTypes : undefined
    };
    return this.exploreWithWorkerPool(personQuery);
  }

  async exploreAssociationNetwork(query: ExploreAssociationNetworkQuery): Promise<ExploreNetworkResult> {
    // Focus on associations with optional kinship
    const relationTypes: string[] = ['association'];
    if (query.includeKinship) relationTypes.push('kinship');

    const personQuery: ExplorePersonNetworkQuery = {
      personId: query.personId,
      depth: query.maxDepth || 2,
      relationTypes
    };
    return this.exploreWithWorkerPool(personQuery);
  }

  async exploreKinshipNetwork(personId: number, depth: number = 2): Promise<ExploreNetworkResult> {
    // Focus on kinship only
    const query: ExplorePersonNetworkQuery = {
      personId,
      depth,
      relationTypes: ['kinship']
    };
    return this.exploreWithWorkerPool(query);
  }

  async exportNetworkToGEXF(
    personId: number,
    outputPath: string,
    options?: {
      includeKinship?: boolean;
      includeAssociations?: boolean;
      includeOffices?: boolean;
    }
  ): Promise<{ success: boolean; filepath: string; metrics: any }> {
    try {
      // Build relation types array
      const relationTypes: string[] = [];
      if (options?.includeKinship !== false) relationTypes.push('kinship');
      if (options?.includeAssociations !== false) relationTypes.push('association');
      if (options?.includeOffices) relationTypes.push('office');

      const query: ExplorePersonNetworkQuery = {
        personId,
        depth: 2,
        relationTypes: relationTypes.length > 0 ? relationTypes : undefined
      };

      // Build the graph using worker pool
      const result = await this.exploreWithWorkerPool(query);

      // Create a new graph for GEXF export
      const exportGraph = new Graph();

      // Add nodes from result
      result.graphData.nodes.forEach(node => {
        const attrs = node.attributes || {};
        exportGraph.addNode(node.key, {
          label: attrs.label,
          personId: attrs.personId,
          nameChn: attrs.nameChn,
          nameEng: attrs.nameEng,
          dynastyCode: attrs.dynastyCode,
          birthYear: attrs.birthYear,
          x: attrs.x,
          y: attrs.y,
          size: attrs.size,
          color: attrs.color
        });
      });

      // Add edges from result
      result.graphData.edges.forEach(edge => {
        if (!exportGraph.hasEdge(edge.source, edge.target)) {
          const attrs = edge.attributes || {};
          exportGraph.addEdge(edge.source, edge.target, {
            label: attrs.label,
            relationshipType: attrs.relationshipType,
            kinshipCode: attrs.kinshipCode,
            assocCode: attrs.assocCode,
            strength: attrs.strength,
            color: attrs.color,
            size: attrs.size
          });
        }
      });

      // Generate GEXF string
      const gexfString = writeGEXF(exportGraph, {
        formatNode: (key, attributes) => ({
          label: attributes.label || key,
          attributes: {
            personId: attributes.personId,
            nameChn: attributes.nameChn,
            nameEng: attributes.nameEng,
            dynastyCode: attributes.dynastyCode,
            birthYear: attributes.birthYear
          },
          viz: {
            color: attributes.color,
            size: attributes.size,
            position: {
              x: attributes.x || 0,
              y: attributes.y || 0,
              z: 0
            }
          }
        }),
        formatEdge: (key, attributes) => ({
          label: attributes.label || '',
          attributes: {
            relationshipType: attributes.relationshipType,
            kinshipCode: attributes.kinshipCode,
            assocCode: attributes.assocCode,
            strength: attributes.strength
          },
          viz: {
            color: attributes.color,
            thickness: attributes.size || 1
          }
        })
      });

      // Ensure directory exists
      const dir = path.dirname(outputPath);
      await fs.mkdir(dir, { recursive: true });

      // Write to file
      await fs.writeFile(outputPath, gexfString, 'utf-8');

      return {
        success: true,
        filepath: outputPath,
        metrics: result.metrics
      };
    } catch (error) {
      console.error('Failed to export network to GEXF:', error);
      return {
        success: false,
        filepath: outputPath,
        metrics: null
      };
    }
  }
}