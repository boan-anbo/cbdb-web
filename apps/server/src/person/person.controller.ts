import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ParseIntPipe,
  NotFoundException,
  HttpStatus,
  ValidationPipe
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiResponse
} from '@nestjs/swagger';
import {
  PersonEndpoints,
  IPersonController,
  PersonModel,
  PersonFullExtendedModel,
  PersonBirthDeathResponse,
  PersonDetailResponse,
  GetLifeTimelineResponse,
  PersonWithStatsResult,
  ExploreNetworkResponse,
  PersonListResult,
  PersonBatchGetResult,
  GetPersonsByIdsRequest,
  PersonNetworkAnalyticsRequest,
  TimelineAnalyticsRequest,
  MultiPersonNetworkAnalyticsRequest,
  PersonGetQuery,
  PersonGetResult,
  PersonListQuery,
  PersonSearchQuery,
  PersonBatchGetQuery,
  GetLifeTimelineQuery,
  CompareTimelinesQuery,
  ExplorePersonNetworkQuery,
  PersonSuggestionsQuery,
  PersonSuggestionsResult
} from '@cbdb/core';
import { PersonService } from './person.service';
import { PersonDetailService } from './person-detail.service';
import { PersonTimelineService } from './person-timeline.service';
import { PersonGraphService } from './person-graph.service';

/**
 * Person Controller - Clean API Pattern
 * All endpoints start with /api/people
 * No backward compatibility
 */
@ApiTags('People')
@Controller('people')
export class PersonController implements IPersonController {
  constructor(
    private readonly personService: PersonService,
    private readonly personDetailService: PersonDetailService,
    private readonly personTimelineService: PersonTimelineService,
    private readonly personGraphService: PersonGraphService
  ) {}

  // ============================================
  // List & Search Operations (MUST BE BEFORE :id)
  // ============================================

  /**
   * List people with filters
   * GET /api/people/list
   *
   * Pagination limits:
   * - Default limit: 100 records
   * - Maximum limit: 1000 records per request
   */
  @Get('list')
  @ApiOperation({
    summary: PersonEndpoints.list.summary,
    description: PersonEndpoints.list.description + '\n\nPagination: Default 100, max 1000 records per request.'
  })
  @ApiQuery({ name: 'name', required: false, description: 'Filter by name' })
  @ApiQuery({ name: 'dynastyCode', required: false, description: 'Filter by dynasty code' })
  @ApiQuery({ name: 'yearFrom', required: false, description: 'Year range start' })
  @ApiQuery({ name: 'yearTo', required: false, description: 'Year range end' })
  @ApiQuery({ name: 'gender', required: false, description: 'Filter by gender' })
  @ApiQuery({ name: 'offset', required: false, description: 'Pagination offset (default: 0)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Result limit (default: 100, max: 1000)' })
  @ApiQuery({ name: 'accurate', required: false, description: 'Accurate name search' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List results',
    type: PersonListResult
  })
  async list(
    @Query(new ValidationPipe({ transform: true, transformOptions: { enableImplicitConversion: true } })) query: PersonListQuery
  ): Promise<PersonListResult> {
    // Direct pass to service
    return this.personService.list(query);
  }

  /**
   * List people with full data
   * GET /api/people/list/full
   */
  @Get('list/full')
  @ApiOperation({
    summary: PersonEndpoints.listFull.summary,
    description: PersonEndpoints.listFull.description
  })
  @ApiQuery({ name: 'name', required: false, description: 'Filter by name' })
  @ApiQuery({ name: 'dynastyCode', required: false, description: 'Filter by dynasty code' })
  @ApiQuery({ name: 'yearFrom', required: false, description: 'Year range start' })
  @ApiQuery({ name: 'yearTo', required: false, description: 'Year range end' })
  @ApiQuery({ name: 'gender', required: false, description: 'Filter by gender' })
  @ApiQuery({ name: 'offset', required: false, description: 'Pagination offset' })
  @ApiQuery({ name: 'limit', required: false, description: 'Result limit' })
  @ApiQuery({ name: 'accurate', required: false, description: 'Accurate name search' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List results with full data',
    type: [PersonFullExtendedModel]
  })
  async listFull(
    @Query(new ValidationPipe({ transform: true, transformOptions: { enableImplicitConversion: true } })) query: PersonListQuery
  ): Promise<PersonFullExtendedModel[]> {
    // For now, get the list and then fetch full data for each
    const listResult = await this.list(query);
    const fullResults: PersonFullExtendedModel[] = [];

    for (const person of listResult.data) {
      const full = await this.personService.getPersonWithAllRelations(person.id);
      if (full) {
        fullResults.push(full);
      }
    }

    return fullResults;
  }

  /**
   * Get multiple people by IDs
   * POST /api/people/batch
   *
   * Batch limit: Maximum 500 IDs per request
   */
  @Post('batch')
  @ApiOperation({
    summary: PersonEndpoints.batch.summary,
    description: PersonEndpoints.batch.description + '\n\nBatch limit: Maximum 500 IDs per request.'
  })
  @ApiBody({
    type: GetPersonsByIdsRequest,
    description: 'IDs of people to retrieve'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Batch results'
    // PersonBatchGetResult is a type alias, not a class, so we can't use it in decorators
  })
  async batch(
    @Body(ValidationPipe) request: GetPersonsByIdsRequest
  ): Promise<PersonBatchGetResult> {
    const query: PersonBatchGetQuery = {
      ids: request.ids
    };
    return this.personService.findByIds(query);
  }

  /**
   * Get multiple people with full data
   * POST /api/people/batch/full
   */
  @Post('batch/full')
  @ApiOperation({
    summary: PersonEndpoints.batchFull.summary,
    description: PersonEndpoints.batchFull.description
  })
  @ApiBody({
    type: GetPersonsByIdsRequest,
    description: 'IDs of people to retrieve'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Batch results with full data',
    type: [PersonFullExtendedModel]
  })
  async batchFull(
    @Body(ValidationPipe) request: GetPersonsByIdsRequest
  ): Promise<PersonFullExtendedModel[]> {
    const fullResults: PersonFullExtendedModel[] = [];

    for (const id of request.ids) {
      const full = await this.personService.getPersonWithAllRelations(id);
      if (full) {
        fullResults.push(full);
      }
    }

    return fullResults;
  }

  /**
   * Get suggestions for autocomplete
   * POST /api/people/suggestions
   *
   * Limits:
   * - Default: 10 suggestions
   * - Maximum: 200 suggestions
   */
  @Post('suggestions')
  @ApiOperation({
    summary: 'Get person suggestions for autocomplete',
    description: 'Returns limited person models for typeahead/autocomplete functionality. Max 200 suggestions per request.'
  })
  @ApiBody({
    type: PersonSuggestionsQuery,
    description: 'Query parameters for suggestions'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Suggestion results',
    type: PersonSuggestionsResult
  })
  async suggestions(
    @Body(ValidationPipe) query: PersonSuggestionsQuery
  ): Promise<PersonSuggestionsResult> {
    return this.personService.listSuggestions(query);
  }

  /**
   * Complex search
   * POST /api/people/search
   *
   * Pagination limits:
   * - Default limit: 100 records
   * - Maximum limit: 1000 records per request
   */
  @Post('search')
  @ApiOperation({
    summary: PersonEndpoints.search.summary,
    description: PersonEndpoints.search.description + '\n\nPagination: Default 100, max 1000 records per request.'
  })
  @ApiBody({
    type: PersonSearchQuery,
    description: 'Complex search criteria'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Search results',
    type: PersonListResult
  })
  async search(
    @Body(new ValidationPipe({ transform: true, transformOptions: { enableImplicitConversion: true } })) query: PersonSearchQuery
  ): Promise<PersonListResult> {
    // Direct pass to service
    return this.personService.searchByName(query);
  }

  /**
   * Complex search with full data
   * POST /api/people/search/full
   */
  @Post('search/full')
  @ApiOperation({
    summary: PersonEndpoints.searchFull.summary,
    description: PersonEndpoints.searchFull.description
  })
  @ApiBody({
    type: PersonSearchQuery,
    description: 'Complex search criteria'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Search results with full data',
    type: [PersonFullExtendedModel]
  })
  async searchFull(
    @Body(new ValidationPipe({ transform: true, transformOptions: { enableImplicitConversion: true } })) query: PersonSearchQuery
  ): Promise<PersonFullExtendedModel[]> {
    const searchResult = await this.search(query);
    const fullResults: PersonFullExtendedModel[] = [];

    for (const person of searchResult.data) {
      const full = await this.personService.getPersonWithAllRelations(person.id);
      if (full) {
        fullResults.push(full);
      }
    }

    return fullResults;
  }

  // ============================================
  // Multi-Person Analytics - ALL POST
  // ============================================

  /**
   * Compare multiple timelines
   * POST /api/people/analytics/timeline
   */
  @Post('analytics/timeline')
  @ApiOperation({
    summary: PersonEndpoints.analyzeTimeline.summary,
    description: PersonEndpoints.analyzeTimeline.description
  })
  @ApiBody({
    type: TimelineAnalyticsRequest,
    description: 'Timeline analysis parameters'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Timeline analysis completed'
  })
  async analyzeTimeline(
    @Body(ValidationPipe) request: TimelineAnalyticsRequest
  ): Promise<any> {
    const query: CompareTimelinesQuery = {
      personIds: request.personIds,
      startYear: request.startYear,
      endYear: request.endYear
    };
    return this.personTimelineService.compareTimelines(query);
  }

  /**
   * Analyze multi-person network
   * POST /api/people/analytics/network
   */
  @Post('analytics/network')
  @ApiOperation({
    summary: PersonEndpoints.analyzeNetwork.summary,
    description: PersonEndpoints.analyzeNetwork.description
  })
  @ApiBody({
    type: MultiPersonNetworkAnalyticsRequest,
    description: 'Network analysis parameters'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Network analysis completed',
    type: ExploreNetworkResponse
  })
  async analyzeNetwork(
    @Body(ValidationPipe) request: MultiPersonNetworkAnalyticsRequest
  ): Promise<ExploreNetworkResponse> {
    // For now, use the single person network with the first person
    // This should be implemented properly in PersonGraphService
    if (request.personIds.length > 0) {
      const query: ExplorePersonNetworkQuery = {
        personId: request.personIds[0],
        depth: request.depth || 1,
        filters: request.filters
      };
      const result = await this.personGraphService.explorePersonNetwork(query);

      // Map ExploreNetworkResult to ExploreNetworkResponse
      const response = new ExploreNetworkResponse();
      response.centralPersonId = result.centralPersonId;
      response.explorerType = 'multi-person';
      response.graphData = result.graphData;
      response.metrics = result.metrics;

      return response;
    }

    // Empty result if no person IDs provided
    const emptyResponse = new ExploreNetworkResponse();
    emptyResponse.centralPersonId = 0;
    emptyResponse.explorerType = 'multi-person';

    return emptyResponse;
  }

  // ============================================
  // Core Operations (Dynamic :id routes - MUST BE LAST)
  // ============================================

  /**
   * Get person by ID (basic data only)
   * GET /api/people/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: PersonEndpoints.getById.summary,
    description: PersonEndpoints.getById.description
  })
  @ApiParam({
    name: 'id',
    description: 'Person ID',
    example: 1762
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Person found',
    type: PersonModel
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Person not found'
  })
  async getById(
    @Param('id', ParseIntPipe) id: number
  ): Promise<PersonModel> {
    const query: PersonGetQuery = {
      id,
      includeRelations: []
    };
    const result = await this.personService.findById(query);
    if (!result.data) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }
    return result.data;
  }

  /**
   * Get person with all relations
   * GET /api/people/:id/full
   */
  @Get(':id/full')
  @ApiOperation({
    summary: PersonEndpoints.getFullById.summary,
    description: PersonEndpoints.getFullById.description
  })
  @ApiParam({
    name: 'id',
    description: 'Person ID',
    example: 1762
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Person with all relations found',
    type: PersonFullExtendedModel
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Person not found'
  })
  async getFullById(
    @Param('id', ParseIntPipe) id: number
  ): Promise<PersonFullExtendedModel> {
    const person = await this.personService.getPersonWithAllRelations(id);
    if (!person) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }
    return person;
  }

  /**
   * Get comprehensive person detail
   * GET /api/people/:id/detail
   */
  @Get(':id/detail')
  @ApiOperation({
    summary: PersonEndpoints.getDetail.summary,
    description: PersonEndpoints.getDetail.description
  })
  @ApiParam({
    name: 'id',
    description: 'Person ID',
    example: 1762
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Comprehensive person detail found',
    type: PersonDetailResponse
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Person not found'
  })
  async getDetail(
    @Param('id', ParseIntPipe) id: number
  ): Promise<PersonDetailResponse> {
    const startTime = Date.now();
    const result = await this.personDetailService.getPersonDetail(id);
    if (!result) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }
    return new PersonDetailResponse(result, Date.now() - startTime);
  }

  /**
   * Get person detail in Harvard CBDB API format
   * GET /api/people/:id/harvard
   */
  @Get(':id/harvard')
  @ApiOperation({
    summary: 'Get person detail in Harvard CBDB API format',
    description: 'Returns person information in the exact JSON structure used by Harvard\'s official CBDB API'
  })
  @ApiParam({ name: 'id', description: 'Person ID', example: 1762 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Person detail in Harvard API format'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Person not found'
  })
  async getHarvardDetail(
    @Param('id', ParseIntPipe) id: number
  ): Promise<any> {
    const result = await this.personDetailService.getOfficialAPIDetail(id);
    if (!result) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }
    return result;
  }

  // ============================================
  // Views (Data Projections)
  // ============================================

  /**
   * Get birth/death year view
   * GET /api/people/:id/views/birth-death
   */
  @Get(':id/views/birth-death')
  @ApiOperation({
    summary: PersonEndpoints.getBirthDeathView.summary,
    description: PersonEndpoints.getBirthDeathView.description
  })
  @ApiParam({
    name: 'id',
    description: 'Person ID',
    example: 1762
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Birth/death view found',
    type: PersonBirthDeathResponse
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Person not found'
  })
  async getBirthDeathView(
    @Param('id', ParseIntPipe) id: number
  ): Promise<PersonBirthDeathResponse> {
    const startTime = Date.now();
    const data = await this.personService.getPersonBirthDeathView(id);

    if (!data) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }

    return new PersonBirthDeathResponse(
      data,
      Date.now() - startTime
    );
  }

  /**
   * Get timeline view
   * GET /api/people/:id/views/timeline
   */
  @Get(':id/views/timeline')
  @ApiOperation({
    summary: PersonEndpoints.getTimelineView.summary,
    description: PersonEndpoints.getTimelineView.description
  })
  @ApiParam({
    name: 'id',
    description: 'Person ID',
    example: 1762
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Timeline view found',
    type: GetLifeTimelineResponse
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Person not found'
  })
  async getTimelineView(
    @Param('id', ParseIntPipe) id: number,
    @Query('startYear') startYear?: string,
    @Query('endYear') endYear?: string,
    @Query('eventTypes') eventTypes?: string,
    @Query('includeRelatedEntities') includeRelatedEntities?: string,
    @Query('includeLocations') includeLocations?: string
  ): Promise<GetLifeTimelineResponse> {
    const query: GetLifeTimelineQuery = {
      personId: id,
      startYear: startYear ? parseInt(startYear, 10) : undefined,
      endYear: endYear ? parseInt(endYear, 10) : undefined,
      eventTypes: eventTypes ? eventTypes.split(',') : undefined,
      includeRelatedEntities: includeRelatedEntities === 'true',
      includeLocations: includeLocations === 'true'
    };
    const result = await this.personTimelineService.getLifeTimeline(query);

    if (!result) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }

    return new GetLifeTimelineResponse({ result });
  }

  /**
   * Get relation statistics view
   * GET /api/people/:id/views/stats
   */
  @Get(':id/views/stats')
  @ApiOperation({
    summary: PersonEndpoints.getStatsView.summary,
    description: PersonEndpoints.getStatsView.description
  })
  @ApiParam({
    name: 'id',
    description: 'Person ID',
    example: 1762
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics view found',
    type: PersonWithStatsResult
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Person not found'
  })
  async getStatsView(
    @Param('id', ParseIntPipe) id: number
  ): Promise<PersonWithStatsResult> {
    const result = await this.personService.getPersonWithStats(id);

    if (!result.data) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }

    return result;
  }

  /**
   * Analyze person's network
   * POST /api/people/:id/analytics/network
   */
  @Post(':id/analytics/network')
  @ApiOperation({
    summary: PersonEndpoints.analyzePersonNetwork.summary,
    description: PersonEndpoints.analyzePersonNetwork.description
  })
  @ApiParam({
    name: 'id',
    description: 'Person ID',
    example: 1762
  })
  @ApiBody({
    type: PersonNetworkAnalyticsRequest,
    description: 'Network analysis parameters'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Network analysis completed',
    type: ExploreNetworkResponse
  })
  async analyzePersonNetwork(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) request: PersonNetworkAnalyticsRequest
  ): Promise<ExploreNetworkResponse> {
    const query: ExplorePersonNetworkQuery = {
      personId: id,
      depth: request.depth || 1,
      relationTypes: request.relationTypes,
      includeReciprocal: request.includeReciprocal,
      filters: request.filters
    };
    const result = await this.personGraphService.explorePersonNetwork(query);

    // Map ExploreNetworkResult to ExploreNetworkResponse
    const response = new ExploreNetworkResponse();
    response.centralPersonId = result.centralPersonId;
    response.explorerType = 'person'; // Set the explorer type
    response.graphData = result.graphData;
    response.metrics = result.metrics;

    return response;
  }
}