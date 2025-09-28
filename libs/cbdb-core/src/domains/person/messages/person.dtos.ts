import { IsNumber, IsOptional, IsString, IsNumberString, ArrayMaxSize } from 'class-validator';
/**
 * Person DTOs - HTTP layer contracts
 * Requests and Responses for API communication
 *
 * Clean API Pattern - No Backward Compatibility
 */

import { PersonBirthDeathView, PersonBirthDeathSummaryView } from '../views/person-birth-death.data-view';
import { PersonPaginatedResult } from './person.cqrs';

// ============================================
// Core DTOs that are still needed
// ============================================

/**
 * Get person by ID request
 * Used for GET /people/:id
 * Even though it only has ID now, using Request object ensures future extensibility
 */
export class GetPersonByIdRequest {
  @IsNumberString()
  id!: string;

  constructor(data?: GetPersonByIdRequest) {
    if (data) {
      this.id = data.id;
    }
  }
}

/**
 * Get person detail request
 * Used for GET /people/:id/full
 * Can be extended with options in the future
 */
export class GetPersonDetailRequest {
  @IsNumberString()
  id!: string;

  @IsOptional()
  @IsString()
  includeRelations?: string; // comma-separated list for future use

  constructor(data?: GetPersonDetailRequest) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

/**
 * Batch request for getting multiple persons by IDs
 * Used with @Body for POST /api/people/batch
 */
export class GetPersonsByIdsRequest {
  @IsNumber({}, { each: true })
  @ArrayMaxSize(500, { message: 'Maximum 500 IDs allowed per batch request' })
  ids!: number[];

  constructor(data?: GetPersonsByIdsRequest) {
    if (data) {
      this.ids = data.ids;
    }
  }
}

/**
 * Get person birth/death view request
 * Used for GET /people/:id/views/birth-death
 */
export class GetPersonBirthDeathViewRequest {
  @IsNumberString()
  id!: string;

  constructor(data?: GetPersonBirthDeathViewRequest) {
    if (data) {
      this.id = data.id;
    }
  }
}

/**
 * Get person timeline view request
 * Used for GET /people/:id/views/timeline
 */
export class GetPersonTimelineViewRequest {
  @IsNumberString()
  id!: string;

  @IsOptional()
  @IsNumberString()
  startYear?: string;

  @IsOptional()
  @IsNumberString()
  endYear?: string;

  constructor(data?: GetPersonTimelineViewRequest) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

/**
 * Get person stats view request
 * Used for GET /people/:id/views/stats
 */
export class GetPersonStatsViewRequest {
  @IsNumberString()
  id!: string;

  constructor(data?: GetPersonStatsViewRequest) {
    if (data) {
      this.id = data.id;
    }
  }
}

/**
 * Person kinships request
 * Used for GET /people/:id/kinships
 */
export class PersonKinshipsRequest {
  @IsNumberString()
  id!: string;

  @IsOptional()
  @IsString()
  type?: string;

  constructor(data?: PersonKinshipsRequest) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

/**
 * Person associations request
 * Used for GET /people/:id/associations
 */
export class PersonAssociationsRequest {
  @IsNumberString()
  id!: string;

  @IsOptional()
  @IsString()
  direction?: 'primary' | 'associated' | 'both';

  constructor(data?: PersonAssociationsRequest) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

/**
 * Person offices request
 * Used for GET /people/:id/offices
 */
export class PersonOfficesRequest {
  @IsNumberString()
  id!: string;

  @IsOptional()
  @IsString()
  type?: string;

  constructor(data?: PersonOfficesRequest) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

/**
 * Response containing person birth/death year view data
 * Used for GET /people/:id/views/birth-death
 */
export class PersonBirthDeathResponse {
  constructor(
    public data: PersonBirthDeathView | null,
    public responseTime?: number
  ) { }
}

/**
 * Paginated person response
 * Used for list/search operations
 */
export class PaginatedPersonResponse {
  constructor(
    public result: PersonPaginatedResult,
    public responseTime?: number
  ) { }
}

/**
 * Response containing summarized birth/death information for lists
 * Used in search results and person lists
 */
export class PersonBirthDeathSummaryResponse {
  constructor(
    public data: PersonBirthDeathSummaryView | null,
    public responseTime?: number
  ) { }
}

// ============================================
// Analytics Request DTOs (Complex POST bodies)
// ============================================

/**
 * Person network analytics request
 * Used with @Body for POST /api/people/:id/analytics/network
 */
export class PersonNetworkAnalyticsRequest {
  @IsOptional()
  @IsNumber()
  depth?: number;

  @IsOptional()
  @IsString({ each: true })
  relationTypes?: string[]; // ['kinship', 'association', 'office'] or undefined for all

  @IsOptional()
  includeReciprocal?: boolean;

  @IsOptional()
  filters?: {
    indexYearRange?: [number, number];
    dynasties?: number[];
    gender?: string;
  };

  constructor(data?: Partial<PersonNetworkAnalyticsRequest>) {
    Object.assign(this, data);
  }
}

/**
 * Timeline analytics request
 * Used with @Body for POST /api/people/analytics/timeline
 */
export class TimelineAnalyticsRequest {
  @IsNumber({}, { each: true })
  personIds!: number[];

  @IsOptional()
  @IsNumber()
  startYear?: number;

  @IsOptional()
  @IsNumber()
  endYear?: number;

  @IsOptional()
  @IsString({each: true})
  eventTypes?: string[];

  @IsOptional()
  includeRelatedEntities?: boolean;

  @IsOptional()
  includeLocations?: boolean;

  constructor(data?: Partial<TimelineAnalyticsRequest>) {
    Object.assign(this, data);
  }
}

/**
 * Multi-person network analytics request
 * Used with @Body for POST /api/people/analytics/network
 */
export class MultiPersonNetworkAnalyticsRequest {
  @IsNumber({}, { each: true })
  personIds!: number[];

  @IsOptional()
  @IsString({each: true})
  relationTypes?: string[];

  @IsOptional()
  @IsNumber()
  depth?: number;

  @IsOptional()
  includeInterconnections?: boolean;

  @IsOptional()
  filters?: {
    indexYearRange?: [number, number];
    dynasties?: number[];
  };

  constructor(data?: Partial<MultiPersonNetworkAnalyticsRequest>) {
    Object.assign(this, data);
  }
}