/**
 * Kinship DTOs - HTTP layer contracts
 * Requests and Responses for API communication
 */

import { Kinship } from '@domains/kinship/models/kinship.model';
import { KinshipTypeInfo, KinPersonInfo } from '@domains/kinship/models/kinship.model.extended';
import { PaginationInfo } from '@/common/pagination.dto';
import { KinshipCodeListResult } from './kinship.cqrs';

/**
 * Request to search kinships
 */
export class SearchKinshipRequest {
  constructor(
    public personId?: number,
    public kinPersonId?: number,
    public kinshipCode?: number,
    public includeTypeInfo?: boolean,
    public includePersonInfo?: boolean,
    public limit?: number,
    public offset?: number
  ) {}
}

/**
 * Request to get kinships with specific relations
 */
export class GetKinshipWithRelationsRequest {
  constructor(
    public personId: number,
    public relations: ('typeInfo' | 'personInfo')[]
  ) {}
}

/**
 * HTTP response for a single kinship relation
 * What goes over the wire to clients
 */
export class KinshipResponse extends Kinship {
  // Optional nested relations (not flattened)
  public kinshipTypeInfo?: KinshipTypeInfo;
  public kinPersonInfo?: KinPersonInfo;
}

/**
 * HTTP response for a list of kinship relations
 */
export class KinshipListResponse {
  constructor(
    public kinships: KinshipResponse[],
    public total: number
  ) {}
}

/**
 * HTTP response for paginated kinship search
 */
export class PaginatedKinshipResponse {
  constructor(
    public data: KinshipResponse[],
    public pagination: PaginationInfo
  ) {}
}

/**
 * Request to get all kinship codes
 * No parameters needed - returns all codes for caching
 */
export class GetKinshipCodesRequest {
  // Empty - gets all codes
}

/**
 * HTTP response for kinship codes list
 * Used for frontend caching of reference data
 */
export class KinshipCodesResponse {
  constructor(
    public result: KinshipCodeListResult
  ) {}
}

/**
 * HTTP response for a single kinship code
 */
export class KinshipCodeResponse {
  constructor(
    public data: import('../models/kinship-code.model').KinshipCode | null
  ) {}
}

/**
 * Request to get person's kinships
 */
export class GetPersonKinshipsRequest {
  constructor(
    public personId: number
  ) {}
}

/**
 * HTTP response for person's kinships
 * Contains all kinship relations for a person
 */
export class PersonKinshipsResponse {
  constructor(
    public personId: number,
    public personName: string | null,
    public personNameChn: string | null,
    public totalKinships: number,
    public kinships: KinshipResponse[],
    public responseTime?: number
  ) {}
}