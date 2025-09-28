/**
 * PersonGraphController
 *
 * Handles all graph/network visualization endpoints for persons.
 * Modularized separately from PersonController to keep files lean.
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
  NotFoundException
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody
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
  ExplorePersonNetworkQuery,
  GraphEndpoints
} from '@cbdb/core';

import { PersonGraphService } from './person-graph.service';
import { PersonGraphWorkerPoolService } from './person-graph-worker-pool.service';

/**
 * Controller for person graph/network endpoints
 */
@ApiTags('Person Graph')
@Controller('people')
export class PersonGraphController {
  constructor(
    private readonly personGraphService: PersonGraphService,
    private readonly workerPoolService: PersonGraphWorkerPoolService
  ) {}

  /**
   * Get kinship network graph data
   */
  @Get(':id/network/kinship')
  @ApiOperation({
    summary: 'Get kinship network graph data',
    description: 'Retrieve kinship network graph data for visualization'
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
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Kinship network graph data',
    type: KinshipNetworkResponse
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Person not found'
  })
  async getKinshipNetwork(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: GetKinshipNetworkRequest
  ): Promise<KinshipNetworkResponse> {
    const depth = query?.depth ? parseInt(query.depth, 10) : 2;

    // Use the kinship-specific method
    const networkResult = await this.personGraphService.exploreKinshipNetwork(id, depth);

    // Convert to KinshipNetworkResponse format for backward compatibility
    const response: KinshipNetworkResponse = {
      centralPersonId: id,
      depth: depth,
      nodes: networkResult.graphData.nodes.map(node => ({
        id: String(node.key),
        attributes: node.attributes || {}
      })),
      edges: networkResult.graphData.edges.map(edge => ({
        source: String(edge.source),
        target: String(edge.target),
        attributes: edge.attributes || {}
      })),
      metrics: networkResult.metrics
    };

    return response;
  }

  /**
   * Explore Association Network
   *
   * GET /api/persons/:id/explore/association-network
   */
  @Get(':id/explore/association-network')
  @ApiOperation({
    summary: GraphEndpoints.exploreAssociationNetwork.summary,
    description: GraphEndpoints.exploreAssociationNetwork.description
  })
  @ApiParam({
    name: 'id',
    description: 'Person ID',
    type: Number,
    example: 1762
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Association network data',
    type: ExploreNetworkResponse
  })
  async exploreAssociationNetwork(
    @Param('id', ParseIntPipe) id: number,
    @Query(ValidationPipe) queryParams: ExploreAssociationNetworkRequest
  ): Promise<ExploreNetworkResponse> {
    // Map request to query
    const query = new ExploreAssociationNetworkQuery();
    query.personId = id;
    query.maxDepth = queryParams.maxDepth ? parseInt(queryParams.maxDepth, 10) : 2;
    query.includeKinship = queryParams.includeKinship;

    const result = await this.personGraphService.exploreAssociationNetwork(query);

    // Map result to response
    const response = new ExploreNetworkResponse();
    response.centralPersonId = id;
    response.explorerType = 'association-network';
    response.graphData = result.graphData;
    response.metrics = result.metrics;
    response.interpretation = result.interpretation;

    return response;
  }

  /**
   * Explore Direct Network
   *
   * GET /api/persons/:id/explore/direct-network
   */
  @Get(':id/explore/direct-network')
  @ApiOperation({
    summary: GraphEndpoints.exploreDirectNetwork.summary,
    description: GraphEndpoints.exploreDirectNetwork.description
  })
  @ApiParam({
    name: 'id',
    description: 'Person ID',
    type: Number,
    example: 1762
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Direct network data',
    type: ExploreNetworkResponse
  })
  async exploreDirectNetwork(
    @Param('id', ParseIntPipe) id: number,
    @Query(ValidationPipe) queryParams: ExploreDirectNetworkRequest
  ): Promise<ExploreNetworkResponse> {
    // Map request to query
    const query = new ExploreDirectNetworkQuery();
    query.personId = id;
    query.includeKinship = queryParams.includeKinship;
    query.includeAssociations = queryParams.includeAssociations;
    query.includeOffices = queryParams.includeOffices;

    const result = await this.personGraphService.exploreDirectNetwork(query);

    // Map result to response
    const response = new ExploreNetworkResponse();
    response.centralPersonId = id;
    response.explorerType = 'direct-network';
    response.graphData = result.graphData;
    response.metrics = result.metrics;
    response.interpretation = result.interpretation;

    return response;
  }

  /**
   * Explore Person Network (Generic, Flexible)
   *
   * GET /api/persons/:id/explore/network
   */
  @Get(':id/explore/network')
  @ApiOperation({
    summary: GraphEndpoints.explorePersonNetwork.summary,
    description: GraphEndpoints.explorePersonNetwork.description
  })
  @ApiParam({
    name: 'id',
    description: 'Person ID',
    type: Number,
    example: 1762
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Person network data',
    type: ExploreNetworkResponse
  })
  async explorePersonNetwork(
    @Param('id', ParseIntPipe) id: number,
    @Query(ValidationPipe) queryParams: ExplorePersonNetworkRequest
  ): Promise<ExploreNetworkResponse> {
    // Map request to query
    const query = new ExplorePersonNetworkQuery();
    query.personId = id;
    query.depth = queryParams.depth ? parseInt(queryParams.depth, 10) : 1;

    // Handle relationTypes - can be string or array
    if (queryParams.relationTypes) {
      query.relationTypes = Array.isArray(queryParams.relationTypes)
        ? queryParams.relationTypes
        : [queryParams.relationTypes];
    }

    query.includeReciprocal = queryParams.includeReciprocal;
    query.filters = queryParams.filters;

    // Always use worker pool for consistent behavior
    const result = await this.workerPoolService.explorePersonNetwork(query);

    // Map result to response
    const response = new ExploreNetworkResponse();
    response.centralPersonId = id;
    response.explorerType = 'person-network';
    response.graphData = result.graphData;
    response.metrics = result.metrics;
    response.interpretation = result.interpretation;

    return response;
  }

  // TODO: Implement these methods in PersonGraphService
  // /**
  //  * Build multi-person network
  //  *
  //  * POST /api/persons/network/multi-person
  //  */
  // @Post('network/multi-person')
  // async buildMultiPersonNetwork(
  //   @Body() body: {
  //     personIds: number[];
  //     maxDepth?: number;
  //     includeBridgeNodes?: boolean;
  //     findPaths?: boolean;
  //   }
  // ) {
  //   // TODO: Implement buildMultiPersonNetwork in PersonGraphService
  //   throw new NotFoundException('Method not yet implemented');
  // }

  // /**
  //  * Search persons for network visualization
  //  *
  //  * GET /api/persons/search/network
  //  */
  // @Get('search/network')
  // async searchPersonsForNetwork(
  //   @Query('q') query: string,
  //   @Query('limit', ParseIntPipe) limit: number = 10
  // ) {
  //   // TODO: Implement searchPersonsForNetwork in PersonGraphService
  //   throw new NotFoundException('Method not yet implemented');
  // }

  // /**
  //  * Get network statistics for a person
  //  *
  //  * GET /api/persons/:id/network/stats
  //  */
  // @Get(':id/network/stats')
  // async getNetworkStats(
  //   @Param('id', ParseIntPipe) id: number
  // ) {
  //   // TODO: Implement getNetworkStats in PersonGraphService
  //   throw new NotFoundException('Method not yet implemented');
  // }
}