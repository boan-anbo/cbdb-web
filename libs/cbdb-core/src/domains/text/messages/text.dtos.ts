/**
 * Text DTOs - HTTP layer contracts
 * Requests and Responses for API communication
 */

import { Text } from '@domains/text/models/text.model';
import { TextInfo, TextRoleInfo } from '@domains/text/models/text.model.extended';
import { PaginationInfo } from '@/common/pagination.dto';

/**
 * Request to search texts
 */
export class SearchTextRequest {
  constructor(
    public personId?: number,
    public textId?: number,
    public roleId?: number,
    public year?: number,
    public includeTextInfo?: boolean,
    public includeRoleInfo?: boolean,
    public limit?: number,
    public offset?: number
  ) {}
}

/**
 * Request to get texts with specific relations
 */
export class GetTextWithRelationsRequest {
  constructor(
    public personId: number,
    public textId: number,
    public relations: ('textInfo' | 'roleInfo')[]
  ) {}
}

/**
 * HTTP response for a single text
 * What goes over the wire to clients
 */
export class TextResponse extends Text {
  // Optional nested relations (not flattened)
  public textInfo?: TextInfo;
  public roleInfo?: TextRoleInfo;
}

/**
 * HTTP response for a list of texts
 */
export class TextListResponse {
  constructor(
    public texts: TextResponse[],
    public total: number
  ) {}
}

/**
 * HTTP response for paginated text search
 */
export class PaginatedTextResponse {
  constructor(
    public data: TextResponse[],
    public pagination: PaginationInfo
  ) {}
}