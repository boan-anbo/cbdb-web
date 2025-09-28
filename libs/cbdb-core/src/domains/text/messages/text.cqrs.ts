/**
 * Text CQRS Messages - Service layer standard language
 * Queries: Read operations (Get, Search, List)
 * Commands: Actions that DO something (future: export, APP DB operations)
 * Results: Service operation responses with data + metadata
 * Events: Domain events (for future extensibility)
 *
 * NOTE: CBDB is read-only. All CBDB operations are Queries.
 */

import { Text } from '@domains/text/models/text.model';
import type {
  TextWithTextInfo,
  TextWithRoleInfo,
  TextWithFullRelations
} from '@domains/text/models/text.model.extended';
import {
  BaseQuery,
  SearchQuery,
  DateRangeFilter,
  ListResult,
  PaginatedResult,
  SingleResult,
  TypeInfo,
  GroupedByTypeResult
} from '@/common/query.interfaces';

// ============================================================================
// Queries - Read operations (ALL CBDB operations)
// ============================================================================

/**
 * Query to get texts by person
 */
export class TextGetByPersonQuery extends BaseQuery {
  constructor(
    public personId: number,
    public includeTextInfo?: boolean,
    public includeRoleInfo?: boolean,
    start?: number,
    limit?: number
  ) {
    super(start, limit);
  }
}

/**
 * Query to search texts by content
 */
export class TextSearchQuery extends SearchQuery {
  constructor(
    query: string,
    public textType?: number,
    accurate?: boolean,
    start?: number,
    limit?: number
  ) {
    super(query, accurate, start, limit);
  }
}

/**
 * Query to list texts with filters
 */
export class TextListQuery extends BaseQuery implements DateRangeFilter {
  constructor(
    public personId?: number,
    public textType?: number,
    public roleType?: number,
    public startYear?: number,
    public endYear?: number,
    start?: number,
    limit?: number
  ) {
    super(start, limit);
  }
}

/**
 * Query to get texts by title
 */
export class TextGetByTitleQuery extends BaseQuery {
  constructor(
    public title: string,
    public accurate?: boolean,
    public includeTextInfo?: boolean,
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
 * Result for getting texts
 */
export class TextGetResult extends SingleResult<
  Text | TextWithTextInfo | TextWithRoleInfo | TextWithFullRelations
> {}

/**
 * Result for text search operations
 */
export class TextSearchResult extends ListResult<
  Text | TextWithTextInfo | TextWithRoleInfo | TextWithFullRelations
> {
  constructor(
    data: (Text | TextWithTextInfo | TextWithRoleInfo | TextWithFullRelations)[],
    total: number,
    public query: string
  ) {
    super(data, total);
  }
}

/**
 * Result for listing texts
 */
export class TextListResult extends ListResult<
  Text | TextWithTextInfo | TextWithRoleInfo | TextWithFullRelations
> {}

/**
 * Result for paginated text queries
 */
export type TextPaginatedResult = PaginatedResult<
  Text | TextWithTextInfo | TextWithRoleInfo | TextWithFullRelations
>;

/**
 * Text type information
 */
export class TextTypeWithCount extends TypeInfo {
  // Can add text-specific fields here if needed
}

/**
 * Result for texts grouped by type
 */
export class TextByTypeResult extends GroupedByTypeResult<Text> {
  constructor(
    data: Record<number, Text[]>,
    public types: TextTypeWithCount[]
  ) {
    super(data, types);
  }
}

// ============================================================================
// Events - Domain events (for future extensibility)
// ============================================================================

// Events would be for app-specific actions (exports, preference changes, etc.)
// Keeping minimal for now as we don't use event-driven architecture yet