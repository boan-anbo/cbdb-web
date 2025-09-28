/**
 * Person Timeline Controller
 * Handles timeline-related endpoints for persons
 */

import { Controller, Get, Post, Query, Param, Body, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  GetLifeTimelineQuery,
  GetLifeTimelineRequest,
  GetLifeTimelineResponse,
  CompareTimelinesQuery,
  CompareTimelinesRequest,
  CompareTimelinesResponse,
  PersonTimelineControllerAPI
} from '@cbdb/core';
import { PersonTimelineService } from './person-timeline.service';

@ApiTags('Person Timeline')
@Controller(PersonTimelineControllerAPI.CONTROLLER_PATH)
export class PersonTimelineController {
  constructor(private readonly personTimelineService: PersonTimelineService) {}

  @Get(PersonTimelineControllerAPI.GET_LIFE_TIMELINE.relativePath)
  @ApiOperation({
    summary: PersonTimelineControllerAPI.GET_LIFE_TIMELINE.summary,
    description: PersonTimelineControllerAPI.GET_LIFE_TIMELINE.description
  })
  @ApiResponse({ status: 200, description: 'Timeline retrieved successfully' })
  async getLifeTimeline(
    @Param('id') id: string,
    @Query(ValidationPipe) query: GetLifeTimelineRequest
  ): Promise<GetLifeTimelineResponse> {
    const startTime = Date.now();

    const result = await this.personTimelineService.getLifeTimeline(
      new GetLifeTimelineQuery({
        personId: Number(id),
        includeRelatedEntities: query.includeRelatedEntities,
        includeLocations: query.includeLocations,
        startYear: query.startYear ? Number(query.startYear) : undefined,
        endYear: query.endYear ? Number(query.endYear) : undefined,
        eventTypes: query.eventTypes
      })
    );

    return new GetLifeTimelineResponse({
      result,
      responseTime: Date.now() - startTime
    });
  }

  @Post(PersonTimelineControllerAPI.COMPARE_TIMELINES.relativePath)
  @ApiOperation({
    summary: PersonTimelineControllerAPI.COMPARE_TIMELINES.summary,
    description: PersonTimelineControllerAPI.COMPARE_TIMELINES.description
  })
  @ApiResponse({ status: 200, description: 'Timeline comparison completed successfully' })
  async compareTimelines(
    @Body(ValidationPipe) request: CompareTimelinesRequest
  ): Promise<CompareTimelinesResponse> {
    const startTime = Date.now();

    const result = await this.personTimelineService.compareTimelines(
      new CompareTimelinesQuery({
        personIds: request.personIds.map(Number),
        startYear: request.startYear ? Number(request.startYear) : undefined,
        endYear: request.endYear ? Number(request.endYear) : undefined,
        eventTypes: request.eventTypes
      })
    );

    return new CompareTimelinesResponse({
      result,
      responseTime: Date.now() - startTime
    });
  }
}