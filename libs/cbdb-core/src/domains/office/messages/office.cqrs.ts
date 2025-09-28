/**
 * Office CQRS Messages - Service layer standard language
 * Queries: Read operations (Get, Search, List)
 * Commands: Actions that DO something (future: export, APP DB operations)
 * Results: Service operation responses with data + metadata
 * Events: Domain events (for future extensibility)
 *
 * NOTE: CBDB is read-only. All CBDB operations are Queries.
 */

import { Office } from '@domains/office/models/office.model';
import { OfficeWithFullRelations } from '@domains/office/models/office.model.extended';

// ============================================================================
// Queries - Read operations (ALL CBDB operations)
// ============================================================================

/**
 * Query to get offices for a person with full relations
 * Returns all offices with complete lookup data for display
 */
export class PersonOfficesQuery {
  constructor(
    public personId: number
  ) {}
}

/**
 * Query to search offices by title or type
 */
export class OfficeSearchQuery {
  constructor(
    public query: string,
    public officeType?: number,
    public limit?: number,
    public offset?: number
  ) {}
}

/**
 * Query to list offices with filters
 */
export class OfficeListQuery {
  constructor(
    public personId?: number,
    public officeType?: number,
    public startYear?: number,
    public endYear?: number,
    public limit?: number,
    public offset?: number
  ) {}
}

/**
 * Query to get office hierarchy
 */
export class OfficeHierarchyQuery {
  constructor(
    public officeId: number,
    public includeSubordinates?: boolean,
    public includeSuperiors?: boolean
  ) {}
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
 * Result for getting offices
 */
export class OfficeGetResult {
  constructor(
    public data: Office
  ) {}
}

/**
 * Result for office search operations
 */
export class OfficeSearchResult {
  constructor(
    public data: Office[],
    public total: number,
    public query: string
  ) {}
}

/**
 * Filters for office list queries
 */
export class OfficeListFilters {
  constructor(
    public personId?: number,
    public officeType?: number,
    public startYear?: number,
    public endYear?: number
  ) {}
}

/**
 * Result for listing offices
 */
export class OfficeListResult {
  constructor(
    public data: Office[],
    public total: number,
    public filters?: OfficeListFilters
  ) {}
}

/**
 * Pagination metadata for office queries
 */
export class OfficePagination {
  constructor(
    public total: number,
    public limit: number,
    public offset: number,
    public hasNext: boolean,
    public hasPrev: boolean
  ) {}
}

/**
 * Result for paginated office queries
 */
export class OfficePaginatedResult {
  constructor(
    public data: Office[],
    public pagination: OfficePagination
  ) {}
}

/**
 * Office hierarchy data structure
 */
export class OfficeHierarchyData {
  constructor(
    public office: Office,
    public superiors: Office[],
    public subordinates: Office[]
  ) {}
}

/**
 * Result for office hierarchy queries
 */
export class OfficeHierarchyResult {
  constructor(
    public data: OfficeHierarchyData
  ) {}
}

/**
 * Result for person offices query with full relations
 * Contains all offices for a person with complete data
 */
export class PersonOfficesResult {
  constructor(
    public personId: number,
    public personName: string | null,
    public personNameChn: string | null,
    public offices: OfficeWithFullRelations[],
    public totalOffices: number
  ) {}
}

// ============================================================================
// Events - Domain events (for future extensibility)
// ============================================================================

// Events would be for app-specific actions (exports, preference changes, etc.)
// Keeping minimal for now as we don't use event-driven architecture yet