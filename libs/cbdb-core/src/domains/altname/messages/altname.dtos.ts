/**
 * AltName DTOs - HTTP layer contracts
 * Requests and Responses for API communication
 */

import { AltName } from '@domains/altname/models/altname.model';
import { PaginationInfo } from '@/common/pagination.dto';

/**
 * Request to search altnames
 */
export class SearchAltNameRequest {
  constructor(
    public personId?: number,
    public limit?: number,
    public offset?: number
  ) {}
}

/**
 * HTTP response for a single altname
 */
export class AltNameResponse extends AltName {
  // Relations will be added when extended models are created
}

/**
 * HTTP response for a list of altnames
 */
export class AltNameListResponse {
  constructor(
    public data: AltNameResponse[],
    public total: number
  ) {}
}

/**
 * HTTP response for paginated altname search
 */
export class PaginatedAltNameResponse {
  constructor(
    public data: AltNameResponse[],
    public pagination: PaginationInfo
  ) {}
}
