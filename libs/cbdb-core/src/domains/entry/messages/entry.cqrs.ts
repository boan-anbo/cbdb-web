/**
 * Entry CQRS Messages - Service layer standard language
 * Queries: Read operations (Get, Search, List)
 * Commands: Actions that DO something (future: export, APP DB operations)
 * Results: Service operation responses with data + metadata
 * Events: Domain events (for future extensibility)
 *
 * NOTE: CBDB is read-only. All CBDB operations are Queries.
 */

import { Entry } from '@domains/entry/models/entry.model';
// Extended models will be imported when created

// ============================================================================
// Queries - Read operations (ALL CBDB operations)
// ============================================================================

/**
 * Query to get entries for a person
 */
export class EntryGetByPersonQuery {
  constructor(
    public personId: number,
    public includeEntryInfo?: boolean,
    public limit?: number,
    public offset?: number
  ) {}
}

/**
 * Query to search entries by text
 */
export class EntrySearchQuery {
  constructor(
    public query: string,
    public entryType?: number,
    public limit?: number,
    public offset?: number
  ) {}
}

/**
 * Query to list entries with filters
 */
export class EntryListQuery {
  constructor(
    public personId?: number,
    public entryType?: number,
    public startYear?: number,
    public endYear?: number,
    public limit?: number,
    public offset?: number
  ) {}
}

/**
 * Query to get entry by examination year
 */
export class EntryGetByYearQuery {
  constructor(
    public year: number,
    public examType?: number,
    public limit?: number,
    public offset?: number
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
 * Result for getting entries
 */
export class EntryGetResult {
  constructor(
    public data: Entry
  ) {}
}

/**
 * Result for entry search operations
 */
export class EntrySearchResult {
  constructor(
    public data: Entry[],
    public total: number,
    public query: string
  ) {}
}

/**
 * Filters for entry list queries
 */
export class EntryListFilters {
  constructor(
    public personId?: number,
    public entryType?: number,
    public startYear?: number,
    public endYear?: number
  ) {}
}

/**
 * Result for listing entries
 */
export class EntryListResult {
  constructor(
    public data: Entry[],
    public total: number,
    public filters?: EntryListFilters
  ) {}
}

/**
 * Pagination metadata for entry queries
 */
export class EntryPagination {
  constructor(
    public total: number,
    public limit: number,
    public offset: number,
    public hasNext: boolean,
    public hasPrev: boolean
  ) {}
}

/**
 * Result for paginated entry queries
 */
export class EntryPaginatedResult {
  constructor(
    public data: Entry[],
    public pagination: EntryPagination
  ) {}
}

/**
 * Entry type with count information
 */
export class EntryTypeWithCount {
  constructor(
    public code: number,
    public description: string | null,
    public count: number
  ) {}
}

/**
 * Result for entries grouped by examination type
 */
export class EntryByTypeResult {
  constructor(
    public data: Record<number, Entry[]>,
    public types: EntryTypeWithCount[]
  ) {}
}

// ============================================================================
// Events - Domain events (for future extensibility)
// ============================================================================

// Events would be for app-specific actions (exports, preference changes, etc.)
// Keeping minimal for now as we don't use event-driven architecture yet