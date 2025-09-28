/**
 * Association CQRS Messages - Service layer standard language
 * Queries: Read operations (Get, Search, List)
 * Commands: Actions that DO something (future: export, APP DB operations)
 * Results: Service operation responses with data + metadata
 * Events: Domain events (for future extensibility)
 *
 * NOTE: CBDB is read-only. All CBDB operations are Queries.
 */

import { AssociationModel } from '@domains/association/models/association.model';
import type {
  AssociationFullExtendedModel
} from '@domains/association/models/association.model.extended';
// Base classes defined locally until common types are available
class BaseQuery {}
class SearchQuery extends BaseQuery {
  constructor(public readonly query: string, public readonly limit?: number, public readonly offset?: number) { super(); }
}
class DateRangeFilter {
  constructor(public readonly from?: number, public readonly to?: number) {}
}
class BaseResult {}
class PaginatedResult<T> extends BaseResult {
  constructor(public readonly data: T[], public readonly pagination: any) { super(); }
}

// ============ QUERIES (Read Operations) ============

/**
 * Query to get association by ID
 */
export class AssociationGetQuery extends BaseQuery {
  constructor(public readonly associationId: number) {
    super();
  }
}

/**
 * Query to search associations
 */
export class AssociationSearchQuery extends SearchQuery {
  constructor(
    query: string,
    public readonly personId?: number,
    public readonly associationType?: number,
    public readonly dateRange?: DateRangeFilter,
    limit?: number,
    offset?: number
  ) {
    super(query, limit, offset);
  }
}

/**
 * Query to list associations for a person
 */
export class AssociationListByPersonQuery extends BaseQuery {
  constructor(
    public readonly personId: number,
    public readonly includeRelations: boolean = false,
    public readonly limit?: number,
    public readonly offset?: number
  ) {
    super();
  }
}

/**
 * Query to get associations between two people
 */
export class AssociationBetweenPeopleQuery extends BaseQuery {
  constructor(
    public readonly person1Id: number,
    public readonly person2Id: number,
    public readonly includeKinship: boolean = false
  ) {
    super();
  }
}

/**
 * Query to get associations by type
 */
export class AssociationByTypeQuery extends BaseQuery {
  constructor(
    public readonly typeCode: number,
    public readonly limit?: number,
    public readonly offset?: number
  ) {
    super();
  }
}

/**
 * Query to get association statistics for a person
 */
export class AssociationStatsQuery extends BaseQuery {
  constructor(
    public readonly personId: number,
    public readonly groupBy: 'type' | 'period' | 'person' = 'type'
  ) {
    super();
  }
}

// ============ RESULTS (Service Responses) ============

/**
 * Result for single association
 */
export class AssociationGetResult extends BaseResult {
  constructor(
    public readonly data: AssociationModel | null,
    public readonly includesRelations: boolean = false
  ) {
    super();
  }
}

export class AssociationGetWithRelationsResult extends BaseResult {
  constructor(
    public readonly data: AssociationFullExtendedModel | null
  ) {
    super();
  }
}

/**
 * Result for association search
 */
export class AssociationSearchResult extends BaseResult {
  constructor(
    public readonly data: AssociationModel[],
    public readonly total: number,
    public readonly query: string,
    public readonly filters?: any
  ) {
    super();
  }
}

export class AssociationSearchWithRelationsResult extends BaseResult {
  constructor(
    public readonly data: AssociationFullExtendedModel[],
    public readonly total: number,
    public readonly query: string,
    public readonly filters?: any
  ) {
    super();
  }
}

/**
 * Result for association list
 */
export class AssociationListResult extends BaseResult {
  constructor(
    public readonly data: AssociationModel[],
    public readonly personId: number
  ) {
    super();
  }
}

export class AssociationListWithRelationsResult extends BaseResult {
  constructor(
    public readonly data: AssociationFullExtendedModel[],
    public readonly personId: number
  ) {
    super();
  }
}

/**
 * Paginated result for associations
 */
export class AssociationPaginatedResult extends PaginatedResult<AssociationModel> {
  constructor(
    data: AssociationModel[],
    total: number,
    limit: number,
    offset: number,
    public readonly personId?: number,
    public readonly filters?: any
  ) {
    super(data, { total, limit, offset });
  }
}

/**
 * Result for association statistics
 */
export class AssociationStatsResult extends BaseResult {
  constructor(
    public readonly stats: any,
    public readonly personId: number,
    public readonly groupBy: string
  ) {
    super();
  }
}

/**
 * Result for associations between people
 */
export class AssociationBetweenPeopleResult extends BaseResult {
  constructor(
    public readonly associations: AssociationModel[],
    public readonly person1Id: number,
    public readonly person2Id: number,
    public readonly kinships?: any[]
  ) {
    super();
  }
}

/**
 * Result for person associations query with full relations
 * Contains all associations for a person with complete data
 * Similar to PersonOfficesResult pattern
 */
export class PersonAssociationsResult extends BaseResult {
  constructor(
    public personId: number,
    public personName: string | null,
    public personNameChn: string | null,
    public associations: AssociationFullExtendedModel[],
    public totalAssociations: number
  ) {
    super();
  }
}

// ============ COMMANDS (Future: Actions) ============
// CBDB is read-only, but we might have commands for:
// - Exporting association data
// - Saving association preferences in APP DB
// - Generating association reports

// ============ EVENTS (Future: Domain Events) ============
// For future event-driven features:
// - AssociationViewedEvent
// - AssociationExportedEvent
// - AssociationAnalyzedEvent