/**
 * PersonGraphOptimizedController
 *
 * Enhanced controller that uses the GraphServiceFactory for swappable implementations.
 * Can be used as a drop-in replacement for PersonGraphController or alongside it.
 */

import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  HttpStatus,
  ValidationPipe,
  ParseIntPipe,
  NotFoundException,
  Logger,
  Header
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiHeader
} from '@nestjs/swagger';

import {
  GetKinshipNetworkRequest,
  KinshipNetworkResponse,
  ExploreAssociationNetworkRequest,
  ExploreDirectNetworkRequest,
  ExplorePersonNetworkRequest,
  ExploreNetworkResponse,
  ExploreAssociationNetworkQuery,
  ExploreDirectNetworkQuery,
  ExplorePersonNetworkQuery
} from '@cbdb/core';

import { GraphServiceFactory } from './services/graph-service-factory';
import { GraphServiceStrategy, IPersonGraphService } from './interfaces/graph-service.interface';

/**
 * Optimized controller with swappable graph service implementations
 *
 * Features:
 * - Strategy selection via header or query parameter
 * - Automatic optimization based on network size
 * - Performance metrics in response headers
 */
@ApiTags('Person Graph (Optimized)')
@Controller('person-graph-optimized')
export class PersonGraphOptimizedController {
  private readonly logger = new Logger(PersonGraphOptimizedController.name);

  constructor(private readonly graphServiceFactory: GraphServiceFactory) {}

  /**
   * Get kinship network with strategy selection
   */
  @Get(':id/kinship')
  @ApiOperation({
    summary: 'Get kinship network with optimized strategy',
    description: 'Retrieve kinship network using selectable optimization strategy'
  })
  @ApiParam({
    name: 'id',
    description: 'Person ID',
    type: Number,
    example: 1762
  })
  @ApiQuery({
    name: 'depth',
    required: false,
    description: 'Network depth (1-3)',
    type: Number,
    example: 2
  })
  @ApiQuery({
    name: 'strategy',
    required: false,
    description: 'Service strategy to use',
    enum: GraphServiceStrategy,
    example: GraphServiceStrategy.AUTO
  })
  @ApiHeader({
    name: 'X-Graph-Strategy',
    required: false,
    description: 'Override strategy via header',
    enum: GraphServiceStrategy
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Kinship network graph data',
    type: KinshipNetworkResponse,
    headers: {
      'X-Graph-Strategy-Used': {
        description: 'The strategy that was actually used',
        schema: { type: 'string' }
      },
      'X-Graph-Performance-Ms': {
        description: 'Time taken to generate the graph',
        schema: { type: 'number' }
      }
    }
  })
  @Header('Cache-Control', 'public, max-age=300')
  async getKinshipNetwork(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: GetKinshipNetworkRequest & { strategy?: GraphServiceStrategy }
  ): Promise<KinshipNetworkResponse> {
    const startTime = Date.now();
    const depth = query?.depth ? parseInt(query.depth, 10) : 2;

    // Select strategy from query param or use AUTO
    const strategy = query.strategy || GraphServiceStrategy.AUTO;
    const service = this.graphServiceFactory.getService(strategy);

    this.logger.log(`Fetching kinship network for person ${id} with depth ${depth} using strategy: ${strategy}`);

    // Execute with selected service
    const networkResult = await service.exploreKinshipNetwork(id, depth);

    const performanceMs = Date.now() - startTime;
    this.logger.log(`Generated kinship network in ${performanceMs}ms using ${strategy} strategy`);

    // Convert to response format
    const response: KinshipNetworkResponse = {
      centralPersonId: id,
      depth: depth,
      nodes: networkResult.graphData.nodes.map(node => ({
        id: String(node.key),
        attributes: node.attributes || {}
      })),
      edges: networkResult.graphData.edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        attributes: edge.attributes || {}
      })),
      metrics: networkResult.metrics,
      // Add strategy info
      metadata: {
        strategy: strategy,
        performanceMs: performanceMs,
        nodeCount: networkResult.graphData.nodes.length,
        edgeCount: networkResult.graphData.edges.length
      }
    } as any;

    return response;
  }

  /**
   * Explore person network with full optimization options
   */
  @Post('explore')
  @ApiOperation({
    summary: 'Explore person network with advanced options',
    description: 'Flexible network exploration with optimization strategy selection'
  })
  @ApiBody({ type: ExplorePersonNetworkRequest })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Network exploration result',
    type: ExploreNetworkResponse
  })
  async explorePersonNetwork(
    @Body(ValidationPipe) request: ExplorePersonNetworkRequest & { strategy?: GraphServiceStrategy }
  ): Promise<ExploreNetworkResponse> {
    const startTime = Date.now();

    // Convert request to query
    const query = new ExplorePersonNetworkQuery();
    Object.assign(query, request);

    // Determine strategy based on estimated network size
    let strategy = request.strategy || GraphServiceStrategy.AUTO;

    if (strategy === GraphServiceStrategy.AUTO) {
      // Estimate network size and select appropriate strategy
      const estimatedSize = Math.pow(20, query.depth || 1);
      if (estimatedSize < 100) {
        strategy = GraphServiceStrategy.ORIGINAL;
      } else if (estimatedSize < 1000) {
        strategy = GraphServiceStrategy.OPTIMIZED;
      } else {
        strategy = GraphServiceStrategy.WORKER_POOL;
      }
      this.logger.log(`AUTO selected ${strategy} for estimated ${estimatedSize} nodes`);
    }

    const service = this.graphServiceFactory.getService(strategy);
    const result = await service.explorePersonNetwork(query);

    const performanceMs = Date.now() - startTime;

    // Add metadata to response
    const response: ExploreNetworkResponse = {
      ...result,
      metadata: {
        strategy: strategy,
        performanceMs: performanceMs,
        queryParams: request
      }
    } as any;

    return response;
  }

  /**
   * Get service statistics and configuration
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Get graph service statistics',
    description: 'Returns current configuration and performance statistics'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service statistics'
  })
  async getStats() {
    return this.graphServiceFactory.getStats();
  }

  /**
   * Update service configuration
   */
  @Post('config')
  @ApiOperation({
    summary: 'Update graph service configuration',
    description: 'Dynamically update strategy and thresholds'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        strategy: {
          type: 'string',
          enum: Object.values(GraphServiceStrategy)
        },
        thresholds: {
          type: 'object',
          properties: {
            smallNetwork: { type: 'number' },
            largeNetwork: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configuration updated'
  })
  async updateConfig(@Body() config: any) {
    this.graphServiceFactory.updateConfig(config);
    return { success: true, config: this.graphServiceFactory.getConfig() };
  }

  /**
   * Benchmark different strategies
   */
  @Get(':id/benchmark')
  @ApiOperation({
    summary: 'Benchmark all strategies for a person',
    description: 'Compares performance of all available strategies'
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'depth', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Benchmark results'
  })
  async benchmark(
    @Param('id', ParseIntPipe) id: number,
    @Query('depth') depth: string = '1'
  ) {
    const depthNum = parseInt(depth, 10);
    const results: any = {};

    const query = new ExplorePersonNetworkQuery();
    query.personId = id;
    query.depth = depthNum;
    query.relationTypes = ['kinship', 'association'];

    // Test each strategy
    for (const strategy of [
      GraphServiceStrategy.ORIGINAL,
      GraphServiceStrategy.OPTIMIZED,
      // GraphServiceStrategy.WORKER_POOL // Skip if not available
    ]) {
      try {
        const service = this.graphServiceFactory.getService(strategy);
        const startTime = Date.now();
        const result = await service.explorePersonNetwork(query);
        const endTime = Date.now();

        results[strategy] = {
          success: true,
          timeMs: endTime - startTime,
          nodeCount: result.graphData.nodes.length,
          edgeCount: result.graphData.edges.length,
          metrics: result.metrics
        };
      } catch (error: any) {
        results[strategy] = {
          success: false,
          error: error.message
        };
      }
    }

    // Calculate speedup
    if (results[GraphServiceStrategy.ORIGINAL]?.success &&
        results[GraphServiceStrategy.OPTIMIZED]?.success) {
      const speedup = results[GraphServiceStrategy.ORIGINAL].timeMs /
                      results[GraphServiceStrategy.OPTIMIZED].timeMs;
      results.speedup = {
        optimizedVsOriginal: speedup.toFixed(2) + 'x'
      };
    }

    return results;
  }
}