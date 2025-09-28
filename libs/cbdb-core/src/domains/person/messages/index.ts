/**
 * Person Messages Barrel Export
 * Exports all message types for the Person domain
 */

// CQRS Messages
export * from './person.cqrs';

// DTOs - Clean API Pattern (No Backward Compatibility)
export {
  // Core Requests
  GetPersonByIdRequest,
  GetPersonDetailRequest,
  GetPersonsByIdsRequest,
  // View Requests
  GetPersonBirthDeathViewRequest,
  GetPersonTimelineViewRequest,
  GetPersonStatsViewRequest,
  // Relation Requests
  PersonKinshipsRequest,
  PersonAssociationsRequest,
  PersonOfficesRequest,
  // Analytics Requests
  PersonNetworkAnalyticsRequest,
  TimelineAnalyticsRequest,
  MultiPersonNetworkAnalyticsRequest,
  // Responses
  PersonBirthDeathResponse,
  PersonBirthDeathSummaryResponse,
  PaginatedPersonResponse
} from './person.dtos';

// DTOs from person-detail.dtos
export {
  PersonDetailResult,
  PersonDetailResponse
} from './person-detail.dtos';
