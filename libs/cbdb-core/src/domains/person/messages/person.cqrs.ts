/**
 * Person CQRS Messages - Service layer standard language
 * Queries: Read operations (Get, Search, List)
 * Commands: Actions that DO something (future: export, APP DB operations)
 * Results: Service operation responses with data + metadata
 * Events: Domain events (for future extensibility)
 *
 * NOTE: CBDB is read-only. All CBDB operations are Queries.
 */

import { IsOptional, IsString, IsNumberString, IsBoolean, Min, Max, ArrayMaxSize, IsNumber } from 'class-validator';
import { PersonModel } from '../models/person.model';
import { PersonSuggestionDataView } from '../views/person-suggestion.data-view';
import {
  ListResult,
  PaginatedResult,
  SingleResult,
  BatchResult
} from '@/common/query.interfaces';
import { RelationStat } from '@/common/relation-stats';
// Extended models will be imported when created
// import type { PersonWithKinships, PersonWithAddresses, PersonWithFullRelations } from '../models/person.model.extended';

// ============================================================================
// Queries - Read operations (ALL CBDB operations)
// ============================================================================

/**
 * Query to get a person by ID
 */
export class PersonGetQuery {
  constructor(
    public id: number,
    public includeRelations?: string[] // ['kinships', 'addresses', 'offices']
  ) { }
}

/**
 * Query to search persons by text/name
 * For complex search via POST
 */
export class PersonSearchQuery {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumberString()
  dynastyCode?: string;

  @IsOptional()
  @IsString()
  gender?: 'male' | 'female';

  @IsOptional()
  @IsNumberString()
  @Min(0)
  offset?: string;

  @IsOptional()
  @IsNumberString()
  @Min(1)
  @Max(1000)  // Max 1000 records per request
  limit?: string;

  @IsOptional()
  @IsNumberString()
  yearFrom?: string;

  @IsOptional()
  @IsNumberString()
  yearTo?: string;

  @IsOptional()
  accurate?: boolean;

  constructor(data?: Partial<PersonSearchQuery>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

/**
 * Query to list persons with filters
 * Used directly with @Query decorator in controllers
 * ValidationPipe with transform will convert strings to proper types
 */
export class PersonListQuery {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumberString()
  dynastyCode?: string;

  @IsOptional()
  @IsString()
  gender?: 'male' | 'female';

  @IsOptional()
  @IsNumberString()
  @Min(0)
  start?: string;  // offset

  @IsOptional()
  @IsNumberString()
  @Min(1)
  @Max(1000)  // Max 1000 records per request
  limit?: string;

  @IsOptional()
  @IsNumberString()
  startYear?: string;

  @IsOptional()
  @IsNumberString()
  endYear?: string;

  @IsOptional()
  accurate?: boolean;

  constructor(data?: Partial<PersonListQuery>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

/**
 * Query for autocomplete/suggestions
 * Optimized for typeahead performance
 */
export class PersonSuggestionsQuery {
  @IsOptional()
  @IsString()
  query?: string;  // The search query

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(200)  // Max 200 for autocomplete suggestions
  limit?: number;  // Usually small for suggestions (5-10)

  @IsOptional()
  @IsBoolean()
  sortByImportance?: boolean;  // Sort by number of connections (default: true)

  constructor(data?: Partial<PersonSuggestionsQuery>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

/**
 * Query to get multiple persons by IDs
 */
export class PersonBatchGetQuery {
  @IsNumber({}, { each: true })
  @ArrayMaxSize(500)  // Max 500 IDs per batch request
  ids: number[];

  @IsOptional()
  includeRelations?: string[];

  constructor(ids: number[], includeRelations?: string[]) {
    this.ids = ids;
    this.includeRelations = includeRelations;
  }
}

// ============================================================================
// Commands - Actions (Future: exports, APP DB operations)
// ============================================================================

// Commands will be added when we implement:
// - Export functionality
// - APP DB operations (user preferences, bookmarks, etc.)
// - System operations

// ============================================================================
// Results - Service operation responses
// ============================================================================

/**
 * Result for getting a single person
 */
export type PersonGetResult = SingleResult<PersonModel>; // Will expand to include extended models

/**
 * Result for person search operations
 * Extends ListResult with search-specific metadata
 */
export class PersonSearchResult extends ListResult<PersonModel> {
  constructor(
    data: PersonModel[],
    total: number,
    public query: string
  ) {
    super(data, total);
  }
}

/**
 * Result for listing persons
 * Uses standard ListResult with filters metadata
 */
export class PersonListResult extends ListResult<PersonModel> {
  constructor(
    data: PersonModel[],
    total: number,
    public filters?: {
      name?: string;
      dynastyCode?: number;
      startYear?: number;
      endYear?: number;
      gender?: string;
    }
  ) {
    super(data, total);
  }
}

/**
 * Result for batch get operations
 */
export type PersonBatchGetResult = BatchResult<PersonModel>;

/**
 * Result for paginated person queries
 */
export type PersonPaginatedResult = PaginatedResult<PersonModel>;

/**
 * Relation stats for a person - includes counts AND IDs
 * This is the unified stats structure (no separate counts)
 */
export class PersonRelationStats {
  constructor(
    public kinships: RelationStat,
    public addresses: RelationStat,
    public offices: RelationStat,
    public entries: RelationStat,
    public statuses: RelationStat,
    public associations: RelationStat,
    public texts: RelationStat,
    public events: RelationStat,
    public altNames: RelationStat
  ) { }
}

/**
 * Result for autocomplete suggestions
 * Returns PersonSuggestionDataView - lightweight projection for performance
 */
export class PersonSuggestionsResult {
  constructor(
    public suggestions: PersonSuggestionDataView[],
    public total: number,
    public query: string
  ) { }
}

/**
 * Result for person with relation stats (counts + IDs)
 */
export class PersonWithStatsResult extends SingleResult<PersonModel> {
  constructor(
    data: PersonModel | null,
    public stats?: PersonRelationStats
  ) {
    super(data);
  }
}

// ============================================================================
// Events - Domain events (for future extensibility)
// ============================================================================

// Events would be for app-specific actions (exports, preference changes, etc.)
// Keeping minimal for now as we don't use event-driven architecture yet