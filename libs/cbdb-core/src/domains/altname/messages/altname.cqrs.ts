/**
 * AltName CQRS Messages - Service layer standard language
 * Queries: Read operations (Get, Search, List)
 * Commands: Actions that DO something (future: export, APP DB operations)
 * Results: Service operation responses with data + metadata
 * Events: Domain events (for future extensibility)
 *
 * NOTE: CBDB is read-only. All CBDB operations are Queries.
 */

import { AltName } from '@domains/altname/models/altname.model';
import {
  BaseQuery,
  SearchQuery,
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
 * Query to get alternative names for a person
 */
export class AltNameGetByPersonQuery extends BaseQuery {
  constructor(
    public personId: number,
    public includeTypeInfo?: boolean,
    start?: number,
    limit?: number
  ) {
    super(start, limit);
  }
}

/**
 * Query to search alternative names
 */
export class AltNameSearchQuery extends SearchQuery {
  constructor(
    query: string,
    public nameType?: number,
    accurate?: boolean,
    start?: number,
    limit?: number
  ) {
    super(query, accurate, start, limit);
  }
}

/**
 * Query to list alternative names with filters
 */
export class AltNameListQuery extends BaseQuery {
  constructor(
    public personId?: number,
    public nameType?: number,
    start?: number,
    limit?: number
  ) {
    super(start, limit);
  }
}

/**
 * Query to get alternative names by type
 */
export class AltNameGetByTypeQuery extends BaseQuery {
  constructor(
    public nameType: number,
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
 * Result for getting alternative names
 */
export type AltNameGetResult = SingleResult<AltName>;

/**
 * Result for alternative name search operations
 */
export class AltNameSearchResult extends ListResult<AltName> {
  constructor(
    data: AltName[],
    total: number,
    public query: string
  ) {
    super(data, total);
  }
}

/**
 * Result for listing alternative names
 */
export type AltNameListResult = ListResult<AltName>;

/**
 * Result for paginated alternative name queries
 */
export type AltNamePaginatedResult = PaginatedResult<AltName>;

/**
 * Alternative name type information
 */
export class AltNameTypeWithCount extends TypeInfo {
  // Can add altname-specific fields here if needed
}

/**
 * Result for alternative names grouped by type
 */
export class AltNameByTypeResult extends GroupedByTypeResult<AltName> {
  constructor(
    data: Record<number, AltName[]>,
    public types: AltNameTypeWithCount[]
  ) {
    super(data, types);
  }
}

/**
 * Result for person's all alternative names organized by type
 */
export class AltNamesByPersonResult {
  constructor(
    public personId: number,
    public names: {
      zi?: AltName[];        // 字
      hao?: AltName[];       // 号
      shi?: AltName[];       // 谥
      bieming?: AltName[];   // 别名
      other?: AltName[];     // 其他
    },
    public total: number
  ) {}
}

// ============================================================================
// Events - Domain events (for future extensibility)
// ============================================================================

// Events would be for app-specific actions (exports, preference changes, etc.)
// Keeping minimal for now as we don't use event-driven architecture yet