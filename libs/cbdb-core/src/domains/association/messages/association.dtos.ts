/**
 * Association DTOs - HTTP layer contracts
 * Requests and Responses for API communication
 */

import { IsNumberString, IsOptional } from 'class-validator';
import { AssociationModel } from '@domains/association/models/association.model';
import {
  AssociationTypeInfo,
  AssocPersonInfo,
  AssociationAddressInfo,
  AssociationFullExtendedModel
} from '@domains/association/models/association.model.extended';
import { PaginationInfo, PagePaginationInfo } from '@/common/pagination.dto';

/**
 * Request to search associations
 */
export class SearchAssociationRequest {
  constructor(
    public personId?: number,
    public assocCode?: number,
    public assocPersonId?: number,
    public startYear?: number,
    public endYear?: number,
    public includeTypeInfo?: boolean,
    public includePersonInfo?: boolean,
    public includeKinInfo?: boolean,
    public includeAddressInfo?: boolean,
    public limit?: number,
    public offset?: number
  ) {}
}

/**
 * Request to get associations with specific relations
 */
export class GetAssociationWithRelationsRequest {
  constructor(
    public personId: number,
    public assocId: number,
    public relations: ('associationTypeInfo' | 'assocPersonInfo' | 'kinPersonInfo' | 'assocKinPersonInfo' | 'addressInfo')[]
  ) {}
}

/**
 * Request to get associations by person ID
 */
export class GetAssociationsByPersonRequest {
  constructor(
    public personId: number,
    public limit?: number,
    public offset?: number,
    public includeRelatedPersons?: boolean
  ) {}
}

/**
 * Request to search associations
 */
export class SearchAssociationsRequest {
  constructor(
    public personIds?: number[],
    public assocCodes?: number[],
    public startYear?: number,
    public endYear?: number,
    public limit?: number,
    public offset?: number
  ) {}
}

/**
 * HTTP response for a single association
 * What goes over the wire to clients
 */
export class AssociationResponse extends AssociationModel {
  // Optional nested relations (not flattened)
  public associationTypeInfo?: AssociationTypeInfo;
  public assocPersonInfo?: AssocPersonInfo;
  public kinPersonInfo?: AssocPersonInfo;
  public assocKinPersonInfo?: AssocPersonInfo;
  public addressInfo?: AssociationAddressInfo;
}

/**
 * HTTP response for a list of associations
 */
export class AssociationListResponse {
  constructor(
    public associations: AssociationResponse[],
    public total: number
  ) {}
}

/**
 * HTTP response containing associations for a person
 */
export class AssociationsResponse {
  constructor(
    public associations: AssociationResponse[],
    public total: number,
    public personId: number
  ) {}
}

/**
 * Request to get associations for a specific person
 * Used with @Query for GET requests
 */
export class GetPersonAssociationsRequest {
  @IsOptional()
  @IsNumberString()
  id?: string;

  constructor(data?: GetPersonAssociationsRequest) {
    if (data) {
      this.id = data.id;
    }
  }
}

/**
 * Response containing person's associations with full relations
 */
export class PersonAssociationsResponse {
  personId: number;
  personName: string | null;
  personNameChn: string | null;
  totalAssociations: number;
  associations: AssociationFullExtendedModel[];
  responseTime?: number;

  constructor(data: PersonAssociationsResponse) {
    this.personId = data.personId;
    this.personName = data.personName;
    this.personNameChn = data.personNameChn;
    this.totalAssociations = data.totalAssociations;
    this.associations = data.associations;
    this.responseTime = data.responseTime;
  }
}

/**
 * HTTP response for paginated association search
 */
export class PaginatedAssociationResponse {
  constructor(
    public data: AssociationResponse[],
    public pagination: PaginationInfo
  ) {}
}

/**
 * HTTP response for paginated associations
 */
export class PaginatedAssociationsResponse {
  constructor(
    public data: AssociationResponse[],
    public pagination: PagePaginationInfo
  ) {}
}

/**
 * Association type stats
 */
export class AssociationTypeStats {
  constructor(
    public code: number,
    public type: string,
    public typeChn: string,
    public count: number
  ) {}
}

/**
 * Association period stats
 */
export class AssociationPeriodStats {
  constructor(
    public startYear: number,
    public endYear: number,
    public count: number
  ) {}
}

/**
 * Association statistics response
 */
export class AssociationStatsResponse {
  constructor(
    public personId: number,
    public totalAssociations: number,
    public byType: AssociationTypeStats[],
    public byPeriod: AssociationPeriodStats[]
  ) {}
}

/**
 * Network node
 */
export class NetworkNode {
  constructor(
    public id: number,
    public name: string,
    public nameChn: string,
    public type: 'primary' | 'associated'
  ) {}
}

/**
 * Association network edge for graph visualization
 * Domain-specific edge type for association networks
 */
export class AssociationNetworkEdge {
  constructor(
    public source: number,
    public target: number,
    public type: number,
    public typeName: string,
    public typeNameChn: string,
    public year?: number
  ) {}
}

/**
 * Network analysis response
 */
export class AssociationNetworkResponse {
  constructor(
    public nodes: NetworkNode[],
    public edges: AssociationNetworkEdge[]
  ) {}
}