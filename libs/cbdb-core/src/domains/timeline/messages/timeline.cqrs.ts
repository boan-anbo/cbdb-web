/**
 * Timeline CQRS Messages
 * Commands, Queries, and Results for timeline operations
 */

import { LifeTimeline } from '../models';

/**
 * Query to get a person's life timeline
 */
export class GetLifeTimelineQuery {
  personId: number;
  includeRelatedEntities?: boolean;
  includeLocations?: boolean;
  startYear?: number;
  endYear?: number;
  eventTypes?: string[];

  constructor(data: Partial<GetLifeTimelineQuery>) {
    this.personId = data.personId!;
    this.includeRelatedEntities = data.includeRelatedEntities ?? true;
    this.includeLocations = data.includeLocations ?? true;
    this.startYear = data.startYear;
    this.endYear = data.endYear;
    this.eventTypes = data.eventTypes;
  }
}

/**
 * Result containing a person's life timeline
 */
export class GetLifeTimelineResult {
  timeline: LifeTimeline;
  metadata?: {
    dataSourcesUsed: string[];
    processingTimeMs?: number;
    incompleteDates?: number;
  };

  constructor(data: Partial<GetLifeTimelineResult>) {
    this.timeline = data.timeline!;
    this.metadata = data.metadata;
  }
}

/**
 * Query to compare multiple persons' timelines
 */
export class CompareTimelinesQuery {
  personIds: number[];
  startYear?: number;
  endYear?: number;
  eventTypes?: string[];

  constructor(data: Partial<CompareTimelinesQuery>) {
    this.personIds = data.personIds || [];
    this.startYear = data.startYear;
    this.endYear = data.endYear;
    this.eventTypes = data.eventTypes;
  }
}

/**
 * Result for timeline comparison
 */
export class CompareTimelinesResult {
  timelines: LifeTimeline[];
  overlappingPeriods?: {
    startYear: number;
    endYear: number;
    personIds: number[];
  }[];
  sharedEvents?: {
    year: number;
    eventType: string;
    personIds: number[];
  }[];

  constructor(data: Partial<CompareTimelinesResult>) {
    this.timelines = data.timelines || [];
    this.overlappingPeriods = data.overlappingPeriods;
    this.sharedEvents = data.sharedEvents;
  }
}