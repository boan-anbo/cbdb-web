import { HttpMethod, EndpointDef } from './types';
import { API_PREFIX } from './constants';
import {
  PersonModel,
  PersonFullExtendedModel
} from '../domains/person';
import {
  PersonListResult,
  PersonBatchGetResult,
  PersonWithStatsResult,
  PersonListQuery,
  PersonSearchQuery,
  PersonSuggestionsQuery,
  PersonSuggestionsResult
} from '../domains/person/messages/person.cqrs';
import {
  PersonBirthDeathResponse,
  GetPersonsByIdsRequest,
  PersonNetworkAnalyticsRequest,
  TimelineAnalyticsRequest,
  MultiPersonNetworkAnalyticsRequest
} from '../domains/person/messages/person.dtos';
import {
  PersonDetailResponse
} from '../domains/person/messages/person-detail.dtos';
import {
  GetLifeTimelineResponse
} from '../domains/timeline/messages/timeline.dtos';
import {
  ExploreNetworkResponse
} from '../domains/graph/messages/graph.dtos';

// Parameter type definitions
interface PersonIdParam {
  id: number;
}

/**
 * Person API endpoint definitions - Clean intuitive pattern
 * Single source of truth for all person-related endpoints
 */
export const PersonEndpoints = {
  // ============================================
  // Core Operations
  // ============================================

  /** Get person by ID (basic data only) */
  getById: {
    method: HttpMethod.GET,
    path: `/${API_PREFIX}/people/:id`,
    params: {} as PersonIdParam,
    response: undefined as unknown as PersonModel,
    summary: 'Get person by ID',
    description: 'Retrieve basic person data without relations'
  } as EndpointDef<void, PersonModel, PersonIdParam>,

  /** Get person with all relations */
  getFullById: {
    method: HttpMethod.GET,
    path: `/${API_PREFIX}/people/:id/full`,
    params: {} as PersonIdParam,
    response: undefined as unknown as PersonFullExtendedModel,
    summary: 'Get person with all relations',
    description: 'Retrieve complete person data including all relations (kinships, offices, addresses, etc.)'
  } as EndpointDef<void, PersonFullExtendedModel, PersonIdParam>,

  /** Get comprehensive person detail */
  getDetail: {
    method: HttpMethod.GET,
    path: `/${API_PREFIX}/people/:id/detail`,
    params: {} as PersonIdParam,
    response: undefined as unknown as PersonDetailResponse,
    summary: 'Get comprehensive person detail',
    description: 'Retrieve comprehensive person details including all relations with full extended models and statistics'
  } as EndpointDef<void, PersonDetailResponse, PersonIdParam>,

  // ============================================
  // Views (Data Projections)
  // ============================================

  /** Get birth/death view */
  getBirthDeathView: {
    method: HttpMethod.GET,
    path: `/${API_PREFIX}/people/:id/views/birth-death`,
    params: {} as PersonIdParam,
    response: undefined as unknown as PersonBirthDeathResponse,
    summary: 'Get birth/death year view',
    description: 'Retrieve birth, death, floruit, and index year information in a specialized view'
  } as EndpointDef<void, PersonBirthDeathResponse, PersonIdParam>,

  /** Get timeline view */
  getTimelineView: {
    method: HttpMethod.GET,
    path: `/${API_PREFIX}/people/:id/views/timeline`,
    params: {} as PersonIdParam,
    response: undefined as unknown as GetLifeTimelineResponse,
    summary: 'Get life timeline view',
    description: 'Retrieve chronological timeline of all life events'
  } as EndpointDef<void, GetLifeTimelineResponse, PersonIdParam>,

  /** Get statistics view */
  getStatsView: {
    method: HttpMethod.GET,
    path: `/${API_PREFIX}/people/:id/views/stats`,
    params: {} as PersonIdParam,
    response: undefined as unknown as PersonWithStatsResult,
    summary: 'Get relation statistics view',
    description: 'Retrieve counts and statistics about person\'s relations'
  } as EndpointDef<void, PersonWithStatsResult, PersonIdParam>,

  // ============================================
  // Analytics (Computations) - ALL POST
  // ============================================

  /** Analyze person's network */
  analyzePersonNetwork: {
    method: HttpMethod.POST,
    path: `/${API_PREFIX}/people/:id/analytics/network`,
    params: {} as PersonIdParam,
    request: {} as PersonNetworkAnalyticsRequest,
    response: undefined as unknown as ExploreNetworkResponse,
    summary: 'Analyze person\'s network',
    description: 'Compute and analyze network connections for a person with configurable parameters'
  } as EndpointDef<PersonNetworkAnalyticsRequest, ExploreNetworkResponse, PersonIdParam>,

  // ============================================
  // List & Search Operations
  // ============================================

  /** List people with filters */
  list: {
    method: HttpMethod.GET,
    path: `/${API_PREFIX}/people/list`,
    request: {} as PersonListQuery,
    response: undefined as unknown as PersonListResult,
    summary: 'List people with filters',
    description: 'Retrieve list of people with optional filters (name, dynasty, year range, etc.)'
  } as EndpointDef<PersonListQuery, PersonListResult>,

  /** List people with full data */
  listFull: {
    method: HttpMethod.GET,
    path: `/${API_PREFIX}/people/list/full`,
    request: {} as PersonListQuery,
    response: undefined as unknown as PersonFullExtendedModel[],
    summary: 'List people with all relations',
    description: 'Retrieve list of people with complete data including all relations'
  } as EndpointDef<PersonListQuery, PersonFullExtendedModel[]>,

  /** Get suggestions for autocomplete */
  suggestions: {
    method: HttpMethod.POST,
    path: `/${API_PREFIX}/people/suggestions`,
    request: {} as PersonSuggestionsQuery,
    response: undefined as unknown as PersonSuggestionsResult,
    summary: 'Get person suggestions',
    description: 'Get limited suggestions for autocomplete/typeahead functionality'
  } as EndpointDef<PersonSuggestionsQuery, PersonSuggestionsResult>,

  /** Get specific people by IDs */
  batch: {
    method: HttpMethod.POST,
    path: `/${API_PREFIX}/people/batch`,
    request: {} as GetPersonsByIdsRequest,
    response: undefined as unknown as PersonBatchGetResult,
    summary: 'Get multiple people by IDs',
    description: 'Retrieve multiple specific people by providing an array of IDs'
  } as EndpointDef<GetPersonsByIdsRequest, PersonBatchGetResult>,

  /** Get specific people with full data */
  batchFull: {
    method: HttpMethod.POST,
    path: `/${API_PREFIX}/people/batch/full`,
    request: {} as GetPersonsByIdsRequest,
    response: undefined as unknown as PersonFullExtendedModel[],
    summary: 'Get multiple people with all relations',
    description: 'Retrieve multiple specific people with complete data including all relations'
  } as EndpointDef<GetPersonsByIdsRequest, PersonFullExtendedModel[]>,

  /** Complex search */
  search: {
    method: HttpMethod.POST,
    path: `/${API_PREFIX}/people/search`,
    request: {} as PersonSearchQuery,
    response: undefined as unknown as PersonListResult,
    summary: 'Complex people search',
    description: 'Search for people using complex criteria and combinations'
  } as EndpointDef<PersonSearchQuery, PersonListResult>,

  /** Complex search with full data */
  searchFull: {
    method: HttpMethod.POST,
    path: `/${API_PREFIX}/people/search/full`,
    request: {} as PersonSearchQuery,
    response: undefined as unknown as PersonFullExtendedModel[],
    summary: 'Complex search with all relations',
    description: 'Search for people and retrieve complete data including all relations'
  } as EndpointDef<PersonSearchQuery, PersonFullExtendedModel[]>,

  // ============================================
  // Multi-Person Analytics - ALL POST
  // ============================================

  /** Compare multiple timelines */
  analyzeTimeline: {
    method: HttpMethod.POST,
    path: `/${API_PREFIX}/people/analytics/timeline`,
    request: {} as TimelineAnalyticsRequest,
    response: undefined as unknown as any, // TimelineComparisonResponse
    summary: 'Compare multiple timelines',
    description: 'Analyze and compare timelines of multiple people'
  } as EndpointDef<TimelineAnalyticsRequest, any>,

  /** Analyze multi-person network */
  analyzeNetwork: {
    method: HttpMethod.POST,
    path: `/${API_PREFIX}/people/analytics/network`,
    request: {} as MultiPersonNetworkAnalyticsRequest,
    response: undefined as unknown as ExploreNetworkResponse,
    summary: 'Analyze multi-person network',
    description: 'Compute and analyze network connections between multiple people'
  } as EndpointDef<MultiPersonNetworkAnalyticsRequest, ExploreNetworkResponse>

} as const;

/**
 * Type-safe interface that controllers should implement
 */
export interface IPersonController {
  // Core
  getById(id: number): Promise<PersonModel>;
  getFullById(id: number): Promise<PersonFullExtendedModel>;
  getDetail(id: number): Promise<PersonDetailResponse>;

  // Views
  getBirthDeathView(id: number): Promise<PersonBirthDeathResponse>;
  getTimelineView(id: number): Promise<GetLifeTimelineResponse>;
  getStatsView(id: number): Promise<PersonWithStatsResult>;

  // Analytics
  analyzePersonNetwork(id: number, request: PersonNetworkAnalyticsRequest): Promise<ExploreNetworkResponse>;

  // List & Search
  list(query: PersonListQuery): Promise<PersonListResult>;
  listFull(query: PersonListQuery): Promise<PersonFullExtendedModel[]>;
  batch(request: GetPersonsByIdsRequest): Promise<PersonBatchGetResult>;
  batchFull(request: GetPersonsByIdsRequest): Promise<PersonFullExtendedModel[]>;
  search(query: PersonSearchQuery): Promise<PersonListResult>;
  searchFull(query: PersonSearchQuery): Promise<PersonFullExtendedModel[]>;

  // Multi-person Analytics
  analyzeTimeline(request: TimelineAnalyticsRequest): Promise<any>;
  analyzeNetwork(request: MultiPersonNetworkAnalyticsRequest): Promise<ExploreNetworkResponse>;
}