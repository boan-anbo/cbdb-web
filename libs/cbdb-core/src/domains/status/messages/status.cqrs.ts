/**
 * Status CQRS Messages - Service layer standard language
 * Queries: Read operations (Get, Search, List)
 * Commands: Actions that DO something (future: export, APP DB operations)
 * Results: Service operation responses with data + metadata
 * Events: Domain events (for future extensibility)
 *
 * NOTE: CBDB is read-only. All CBDB operations are Queries.
 */

import { Status } from '@domains/status/models/status.model';
import {
  BaseQuery,
  DateRangeFilter,
  ListResult,
  PaginatedResult,
  SingleResult,
  TypeInfo,
  GroupedByTypeResult
} from '@/common/query.interfaces';
// Extended models will be imported when created

// ============================================================================
// Queries - Read operations (ALL CBDB operations)
// ============================================================================

/**
 * Query to get statuses for a person
 */
export class StatusGetByPersonQuery extends BaseQuery {
  constructor(
    public personId: number,
    public includeStatusInfo?: boolean,
    start?: number,
    limit?: number
  ) {
    super(start, limit);
  }
}

/**
 * Query to list statuses with filters
 */
export class StatusListQuery extends BaseQuery implements DateRangeFilter {
  constructor(
    public personId?: number,
    public statusType?: number,
    public startYear?: number,
    public endYear?: number,
    start?: number,
    limit?: number
  ) {
    super(start, limit);
  }
}

/**
 * Query to get status by type
 */
export class StatusGetByTypeQuery extends BaseQuery {
  constructor(
    public statusType: number,
    public personId?: number,
    start?: number,
    limit?: number
  ) {
    super(start, limit);
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
 * Result for getting a single status
 */
export type StatusGetResult = SingleResult<Status>;

/**
 * Result for listing statuses
 */
export type StatusListResult = ListResult<Status>;

/**
 * Result for paginated status queries
 */
export type StatusPaginatedResult = PaginatedResult<Status>;

/**
 * Status type information
 */
export class StatusTypeWithCount extends TypeInfo {
  // Can add status-specific fields here if needed
}

/**
 * Result for statuses grouped by type
 */
export class StatusByTypeResult extends GroupedByTypeResult<Status> {
  constructor(
    data: Record<number, Status[]>,
    public types: StatusTypeWithCount[]
  ) {
    super(data, types);
  }
}

// ============================================================================
// Events - Domain events (for future extensibility)
// ============================================================================

// Events would be for app-specific actions (exports, preference changes, etc.)
// Keeping minimal for now as we don't use event-driven architecture yet