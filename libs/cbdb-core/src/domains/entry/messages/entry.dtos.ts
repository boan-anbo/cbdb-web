/**
 * Entry DTOs - HTTP layer contracts
 * Requests and Responses for API communication
 */

import { Entry } from '@domains/entry/models/entry.model';
import { PaginationInfo } from '@/common/pagination.dto';

/**
 * Request to search entries
 */
export class SearchEntryRequest {
  constructor(
    public personId?: number,
    public limit?: number,
    public offset?: number
  ) {}
}

/**
 * HTTP response for a single entry
 */
export class EntryResponse extends Entry {
  // Relations will be added when extended models are created
}

/**
 * HTTP response for a list of entries
 */
export class EntryListResponse {
  constructor(
    public data: EntryResponse[],
    public total: number
  ) {}
}

/**
 * HTTP response for paginated entry search
 */
export class PaginatedEntryResponse {
  constructor(
    public data: EntryResponse[],
    public pagination: PaginationInfo
  ) {}
}
