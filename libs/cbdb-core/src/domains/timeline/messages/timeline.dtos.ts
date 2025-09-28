/**
 * Timeline DTOs
 * Request and Response objects for timeline API endpoints
 */

import { IsOptional, IsNumberString, IsArray, IsString, IsBoolean } from 'class-validator';
import { GetLifeTimelineResult, CompareTimelinesResult } from './timeline.cqrs';

/**
 * Request to get a person's life timeline
 */
export class GetLifeTimelineRequest {
  @IsOptional()
  @IsBoolean()
  includeRelatedEntities?: boolean;

  @IsOptional()
  @IsBoolean()
  includeLocations?: boolean;

  @IsOptional()
  @IsNumberString()
  startYear?: string;

  @IsOptional()
  @IsNumberString()
  endYear?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eventTypes?: string[];
}

/**
 * Response containing a person's life timeline
 */
export class GetLifeTimelineResponse {
  result: GetLifeTimelineResult;
  responseTime?: number;

  constructor(data: Partial<GetLifeTimelineResponse>) {
    this.result = data.result!;
    this.responseTime = data.responseTime;
  }
}

/**
 * Request to compare multiple persons' timelines
 */
export class CompareTimelinesRequest {
  @IsArray()
  @IsNumberString({}, { each: true })
  personIds!: string[];

  @IsOptional()
  @IsNumberString()
  startYear?: string;

  @IsOptional()
  @IsNumberString()
  endYear?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eventTypes?: string[];
}

/**
 * Response for timeline comparison
 */
export class CompareTimelinesResponse {
  result: CompareTimelinesResult;
  responseTime?: number;

  constructor(data: Partial<CompareTimelinesResponse>) {
    this.result = data.result!;
    this.responseTime = data.responseTime;
  }
}