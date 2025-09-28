/**
 * Person Timeline API Client
 * Type-safe client for timeline operations
 */

import { BaseClient } from './base-client';
import { TimelineEndpoints } from '../endpoints';
import {
  GetLifeTimelineRequest,
  GetLifeTimelineResponse,
  CompareTimelinesRequest,
  CompareTimelinesResponse
} from '../domains/timeline/messages';

export class PersonTimelineClient {
  constructor(private readonly client: BaseClient) {}

  /**
   * Get a person's life timeline
   */
  async getLifeTimeline(
    personId: number,
    options?: Omit<GetLifeTimelineRequest, 'personId'>
  ): Promise<GetLifeTimelineResponse> {
    const path = TimelineEndpoints.getLifeTimeline.path.replace(':id', personId.toString());

    // Build query string from options
    const params = new URLSearchParams();
    if (options?.includeRelatedEntities !== undefined) {
      params.append('includeRelatedEntities', String(options.includeRelatedEntities));
    }
    if (options?.includeLocations !== undefined) {
      params.append('includeLocations', String(options.includeLocations));
    }
    if (options?.startYear) params.append('startYear', options.startYear);
    if (options?.endYear) params.append('endYear', options.endYear);
    if (options?.eventTypes?.length) {
      options.eventTypes.forEach(type => params.append('eventTypes', type));
    }

    const queryString = params.toString();
    const fullPath = queryString ? `${path}?${queryString}` : path;

    return this.client.get<GetLifeTimelineResponse>(fullPath);
  }

  /**
   * Compare multiple persons' timelines
   */
  async compareTimelines(
    request: CompareTimelinesRequest
  ): Promise<CompareTimelinesResponse> {
    return this.client.post<CompareTimelinesRequest, CompareTimelinesResponse>(
      TimelineEndpoints.compareTimelines.path,
      request
    );
  }
}