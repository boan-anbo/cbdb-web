import { HttpMethod, EndpointDef } from './types';
import { API_PREFIX } from './constants';
import {
  GetLifeTimelineRequest,
  GetLifeTimelineResponse,
  CompareTimelinesRequest,
  CompareTimelinesResponse
} from '../domains/timeline/messages';

// Parameter type definitions
interface TimelinePersonIdParam {
  id: number;
}

/**
 * Timeline API endpoint definitions
 * Single source of truth for timeline-related endpoints
 */
export const TimelineEndpoints = {
  /** Get a person's life timeline */
  getLifeTimeline: {
    method: HttpMethod.GET,
    path: `/${API_PREFIX}/people/:id/timeline/life`,
    request: undefined as unknown as GetLifeTimelineRequest,
    response: undefined as unknown as GetLifeTimelineResponse,
    summary: 'Get life timeline for a person',
    description: 'Retrieve chronological timeline of all life events for a person'
  } as EndpointDef<GetLifeTimelineRequest, GetLifeTimelineResponse, TimelinePersonIdParam>,

  /** Compare multiple persons' timelines */
  compareTimelines: {
    method: HttpMethod.POST,
    path: `/${API_PREFIX}/timelines/compare`,
    request: undefined as unknown as CompareTimelinesRequest,
    response: undefined as unknown as CompareTimelinesResponse,
    summary: 'Compare multiple timelines',
    description: 'Compare timelines of multiple persons to find overlaps and shared events'
  } as EndpointDef<CompareTimelinesRequest, CompareTimelinesResponse>
};