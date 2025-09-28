/**
 * Person Timeline Endpoint Definitions
 * Defines REST API endpoints for person timeline operations
 */

import {
  GetLifeTimelineRequest,
  GetLifeTimelineResponse,
  CompareTimelinesRequest,
  CompareTimelinesResponse
} from '../domains/timeline/messages';

/**
 * Person Timeline Controller API Endpoints
 * Used by PersonTimelineController
 */
export const PersonTimelineControllerAPI = {
  // Controller base path - used with @Controller decorator
  CONTROLLER_PATH: 'people',

  // Individual endpoints - relative to controller path
  GET_LIFE_TIMELINE: {
    relativePath: ':id/timeline/life',
    summary: 'Get life timeline for a person',
    description: 'Retrieve chronological timeline of all life events for a person',
    request: undefined as unknown as GetLifeTimelineRequest,
    response: undefined as unknown as GetLifeTimelineResponse,
  },

  COMPARE_TIMELINES: {
    relativePath: 'timeline/compare',
    summary: 'Compare multiple timelines',
    description: 'Compare timelines of multiple persons to find overlaps and shared events',
    request: undefined as unknown as CompareTimelinesRequest,
    response: undefined as unknown as CompareTimelinesResponse,
  }
} as const;