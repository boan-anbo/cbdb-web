/**
 * Status DTOs - HTTP layer contracts
 * Requests and Responses for API communication
 */

import { Status } from '@domains/status/models/status.model';
import { PaginationInfo } from '@/common/pagination.dto';

/**
 * Request to search statuses
 */
export class SearchStatusRequest {
  constructor(
    public personId?: number,
    public limit?: number,
    public offset?: number
  ) {}
}

/**
 * HTTP response for a single status
 */
export class StatusResponse extends Status {
  // Relations will be added when extended models are created
}

/**
 * HTTP response for a list of statuss
 */
export class StatusListResponse {
  constructor(
    public data: StatusResponse[],
    public total: number
  ) {}
}

/**
 * HTTP response for paginated status search
 */
export class PaginatedStatusResponse {
  constructor(
    public data: StatusResponse[],
    public pagination: PaginationInfo
  ) {}
}
