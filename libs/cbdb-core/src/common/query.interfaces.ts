/**
 * Common Query Classes
 * Reusable classes for pagination, filtering, and query options
 * These match Drizzle patterns but don't depend on Drizzle directly
 */

/**
 * Basic pagination options matching Drizzle's limit/offset pattern
 * Used by backend repositories with validatePagination()
 */
export class PaginationOptions {
  constructor(
    /** Number of records to skip (offset in SQL) */
    public start?: number,
    /** Maximum number of records to return */
    public limit?: number
  ) {}
}

/**
 * Standard pagination metadata returned in results
 * Provides client with navigation information
 */
export class PaginationMetadata {
  constructor(
    /** Total number of records matching the query */
    public total: number,
    /** Maximum number of records returned */
    public limit: number,
    /** Number of records skipped */
    public offset: number,
    /** Whether more records exist after this page */
    public hasNext: boolean,
    /** Whether records exist before this page */
    public hasPrev: boolean
  ) {}
}

/**
 * Base query class for all read operations
 * Combines common filtering and pagination options
 */
export class BaseQuery extends PaginationOptions {
  // Base class that all queries extend
}

/**
 * Text search query options
 */
export class SearchQuery extends BaseQuery {
  constructor(
    /** Search query string */
    public query: string,
    /** Whether to perform exact match vs fuzzy search */
    public accurate?: boolean,
    /** From BaseQuery */
    start?: number,
    limit?: number
  ) {
    super(start, limit);
  }
}

/**
 * Date range filter options
 */
export class DateRangeFilter {
  constructor(
    /** Start year of the range */
    public startYear?: number,
    /** End year of the range */
    public endYear?: number
  ) {}
}

/**
 * Standard result wrapper with pagination
 * T is the type of data being returned
 */
export class PaginatedResult<T> {
  constructor(
    /** Array of result items */
    public data: T[],
    /** Pagination metadata */
    public pagination: PaginationMetadata
  ) {}
}

/**
 * Standard list result with total count
 * Used when full pagination metadata isn't needed
 */
export class ListResult<T> {
  constructor(
    /** Array of result items */
    public data: T[],
    /** Total number of records matching the query */
    public total: number
  ) {}
}

/**
 * Single item result wrapper
 * Provides consistent structure for single entity queries
 */
export class SingleResult<T> {
  constructor(
    /** The requested item, or null if not found */
    public data: T | null
  ) {}
}

/**
 * Batch operation result
 * Used for operations on multiple IDs
 */
export class BatchResult<T> {
  constructor(
    /** Successfully retrieved items */
    public data: T[],
    /** IDs that were found */
    public found: number[],
    /** IDs that were not found */
    public notFound: number[]
  ) {}
}

/**
 * Type info with count
 * Used for grouped results by type/category
 */
export class TypeInfo {
  constructor(
    /** Type code/ID */
    public code: number,
    /** Human-readable description */
    public description: string | null,
    /** Number of items of this type */
    public count: number
  ) {}
}

/**
 * Grouped result by type
 * Used when returning items organized by category
 */
export class GroupedByTypeResult<T> {
  constructor(
    /** Items grouped by type code */
    public data: Record<number, T[]>,
    /** Type information with counts */
    public types: TypeInfo[]
  ) {}
}