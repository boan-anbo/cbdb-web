/**
 * Type-safe client for Person API
 * Uses the clean intuitive endpoint pattern
 */

import { BaseClient } from './base-client';
import { PersonEndpoints } from '../endpoints/person.endpoints';
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
import {
  PersonModel,
  PersonFullExtendedModel
} from '../domains/person';

export class PersonClient {
  constructor(private client: BaseClient) { }

  // ============================================
  // Core Operations
  // ============================================

  /**
   * Get person by ID (basic data only)
   */
  async getById(id: number): Promise<PersonModel> {
    return this.client.request(PersonEndpoints.getById, {
      params: { id }
    });
  }

  /**
   * Get person with all relations
   */
  async getFullById(id: number): Promise<PersonFullExtendedModel> {
    return this.client.request(PersonEndpoints.getFullById, {
      params: { id }
    });
  }

  /**
   * Get comprehensive person detail
   */
  async getDetail(id: number): Promise<PersonDetailResponse> {
    return this.client.request(PersonEndpoints.getDetail, {
      params: { id }
    });
  }

  // ============================================
  // Views (Data Projections)
  // ============================================

  /**
   * Get birth/death year view
   */
  async getBirthDeathView(id: number): Promise<PersonBirthDeathResponse> {
    return this.client.request(PersonEndpoints.getBirthDeathView, {
      params: { id }
    });
  }

  /**
   * Get life timeline view
   */
  async getTimelineView(id: number): Promise<GetLifeTimelineResponse> {
    return this.client.request(PersonEndpoints.getTimelineView, {
      params: { id }
    });
  }

  /**
   * Get relation statistics view
   */
  async getStatsView(id: number): Promise<PersonWithStatsResult> {
    return this.client.request(PersonEndpoints.getStatsView, {
      params: { id }
    });
  }

  // ============================================
  // Analytics (Computations)
  // ============================================

  /**
   * Analyze person's network
   */
  async analyzePersonNetwork(id: number, request: PersonNetworkAnalyticsRequest): Promise<ExploreNetworkResponse> {
    return this.client.request(PersonEndpoints.analyzePersonNetwork, {
      params: { id },
      body: request
    });
  }

  // ============================================
  // List & Search Operations
  // ============================================

  /**
   * List people with filters
   */
  async list(request?: PersonListQuery): Promise<PersonListResult> {
    return this.client.request(PersonEndpoints.list, {
      query: request || {}
    });
  }

  /**
   * List people with full data
   */
  async listFull(request?: PersonListQuery): Promise<PersonFullExtendedModel[]> {
    return this.client.request(PersonEndpoints.listFull, {
      query: request || {}
    });
  }

  /**
   * Get suggestions for autocomplete
   */
  async suggestions(query?: PersonSuggestionsQuery): Promise<PersonSuggestionsResult> {
    return this.client.request(PersonEndpoints.suggestions, {
      body: query || {}
    });
  }

  /**
   * Get multiple people by IDs
   */
  async batch(request: GetPersonsByIdsRequest): Promise<PersonBatchGetResult> {
    return this.client.request(PersonEndpoints.batch, {
      body: request
    });
  }

  /**
   * Get multiple people with full data
   */
  async batchFull(request: GetPersonsByIdsRequest): Promise<PersonFullExtendedModel[]> {
    return this.client.request(PersonEndpoints.batchFull, {
      body: request
    });
  }

  /**
   * Complex search
   */
  async search(request: PersonSearchQuery): Promise<PersonListResult> {
    return this.client.request(PersonEndpoints.search, {
      body: request
    });
  }

  /**
   * Complex search with full data
   */
  async searchFull(request: PersonSearchQuery): Promise<PersonFullExtendedModel[]> {
    return this.client.request(PersonEndpoints.searchFull, {
      body: request
    });
  }

  // ============================================
  // Multi-Person Analytics
  // ============================================

  /**
   * Compare multiple timelines
   */
  async analyzeTimeline(request: TimelineAnalyticsRequest): Promise<any> {
    return this.client.request(PersonEndpoints.analyzeTimeline, {
      body: request
    });
  }

  /**
   * Analyze multi-person network
   */
  async analyzeNetwork(request: MultiPersonNetworkAnalyticsRequest): Promise<ExploreNetworkResponse> {
    return this.client.request(PersonEndpoints.analyzeNetwork, {
      body: request
    });
  }
}