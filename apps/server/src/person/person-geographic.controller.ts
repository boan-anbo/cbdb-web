/**
 * Person Geographic Controller
 *
 * REST API endpoints for geographic data and visualization.
 * Follows the same patterns as PersonController and PersonGraphController.
 */

import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ValidationPipe,
  ParseIntPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import {
  GetGeographicFootprintQuery,
  GetGeographicFootprintResult,
  GetGeographicFootprintRequest,
  GetGeographicFootprintResponse,
  ExploreGeographicNetworkQuery,
  ExploreGeographicNetworkResult,
  ExploreGeographicNetworkRequest,
  ExploreGeographicNetworkResponse,
  FindPeopleByProximityQuery,
  FindPeopleByProximityResult,
  FindPeopleByProximityRequest,
  FindPeopleByProximityResponse
} from '@cbdb/core';
import { PersonGeographicService } from './person-geographic.service';

@ApiTags('Person Geographic')
@Controller('people')
export class PersonGeographicController {
  constructor(private readonly personGeographicService: PersonGeographicService) {}

  /**
   * Get a person's geographic footprint
   * Returns all addresses with coordinates for map visualization
   */
  @Get(':id/geographic/footprint')
  @ApiOperation({
    summary: 'Get geographic footprint',
    description: 'Get all geographic locations associated with a person'
  })
  @ApiParam({ name: 'id', type: Number, description: 'Person ID' })
  @ApiResponse({ status: 200, description: 'Geographic footprint retrieved' })
  async getGeographicFootprint(
    @Param('id', ParseIntPipe) id: number,
    @Query(ValidationPipe) request: GetGeographicFootprintRequest
  ): Promise<GetGeographicFootprintResponse> {
    const startTime = Date.now();

    const query = new GetGeographicFootprintQuery();
    query.personId = id;
    query.startYear = request.startYear ? Number(request.startYear) : undefined;
    query.endYear = request.endYear ? Number(request.endYear) : undefined;
    query.addressTypes = request.addressTypes;
    query.includeCoordinates = request.includeCoordinates !== false; // Default to true

    const result = await this.personGeographicService.getGeographicFootprint(query);

    const response = new GetGeographicFootprintResponse();
    response.result = result;
    response.responseTime = Date.now() - startTime;
    return response;
  }

  /**
   * Explore a person's geographic network
   * Combines social network with geographic visualization
   */
  @Post(':id/geographic/network')
  @ApiOperation({
    summary: 'Explore geographic network',
    description: 'Get network connections with geographic locations'
  })
  @ApiParam({ name: 'id', type: Number, description: 'Person ID' })
  @ApiResponse({ status: 200, description: 'Geographic network retrieved' })
  async exploreGeographicNetwork(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) request: ExploreGeographicNetworkRequest
  ): Promise<ExploreGeographicNetworkResponse> {
    const startTime = Date.now();

    const query = new ExploreGeographicNetworkQuery();
    query.personId = id;
    query.networkDepth = request.networkDepth || 1;
    query.relationTypes = request.relationTypes || ['kinship', 'association'];
    query.proximityRadius = request.proximityRadius;
    query.startYear = request.startYear;
    query.endYear = request.endYear;

    const result = await this.personGeographicService.exploreGeographicNetwork(query);

    const response = new ExploreGeographicNetworkResponse();
    response.result = result;
    response.responseTime = Date.now() - startTime;
    return response;
  }

  /**
   * Find people within geographic proximity
   * Useful for finding people in the same region
   */
  @Post('geographic/proximity')
  @ApiOperation({
    summary: 'Find people by proximity',
    description: 'Find people within a geographic radius'
  })
  @ApiResponse({ status: 200, description: 'Nearby people found' })
  async findPeopleByProximity(
    @Body(ValidationPipe) request: FindPeopleByProximityRequest
  ): Promise<FindPeopleByProximityResponse> {
    const startTime = Date.now();

    const query = new FindPeopleByProximityQuery();
    query.centerLongitude = request.longitude;
    query.centerLatitude = request.latitude;
    query.radius = request.radius || 0.06; // Default to broad search
    query.startYear = request.startYear;
    query.endYear = request.endYear;
    query.limit = request.limit;

    const result = await this.personGeographicService.findPeopleByProximity(query);

    const response = new FindPeopleByProximityResponse();
    response.result = result;
    response.responseTime = Date.now() - startTime;
    return response;
  }
}