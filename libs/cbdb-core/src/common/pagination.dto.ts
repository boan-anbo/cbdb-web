/**
 * Common pagination DTOs
 */

/**
 * Pagination info for responses
 */
export class PaginationInfo {
  constructor(
    public total: number,
    public limit: number,
    public offset: number,
    public hasNext: boolean,
    public hasPrev: boolean
  ) {}
}

/**
 * Page-based pagination info
 */
export class PagePaginationInfo {
  constructor(
    public total: number,
    public page: number,
    public pageSize: number,
    public totalPages: number
  ) {}
}