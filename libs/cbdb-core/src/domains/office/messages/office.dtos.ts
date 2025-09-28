/**
 * Office DTOs - HTTP layer contracts
 * Requests and Responses for API communication
 */

import { IsNumberString, IsOptional } from 'class-validator';
import { Office } from '@domains/office/models/office.model';
import { OfficeWithFullRelations } from '@domains/office/models/office.model.extended';
import { PaginationInfo } from '@/common/pagination.dto';

/**
 * Request to search offices
 */
export class SearchOfficeRequest {
  constructor(
    public personId?: number,
    public limit?: number,
    public offset?: number
  ) {}
}

/**
 * HTTP response for a single office
 */
export class OfficeResponse extends Office {
  // Relations will be added when extended models are created
}

/**
 * HTTP response for a list of offices
 */
export class OfficeListResponse {
  constructor(
    public data: OfficeResponse[],
    public total: number
  ) {}
}

/**
 * HTTP response for paginated office search
 */
export class PaginatedOfficeResponse {
  constructor(
    public data: OfficeResponse[],
    public pagination: PaginationInfo
  ) {}
}

/**
 * Request to get offices for a specific person
 * Used with @Query for GET requests
 */
export class GetPersonOfficesRequest {
  @IsOptional()
  @IsNumberString()
  id?: string;

  constructor(data?: GetPersonOfficesRequest) {
    if (data) {
      this.id = data.id;
    }
  }
}

/**
 * Response containing person's office appointments with full relations
 */
export class PersonOfficesResponse {
  personId: number;
  personName: string | null;
  personNameChn: string | null;
  totalOffices: number;
  offices: OfficeWithFullRelations[];
  responseTime?: number;

  constructor(data: PersonOfficesResponse) {
    this.personId = data.personId;
    this.personName = data.personName;
    this.personNameChn = data.personNameChn;
    this.totalOffices = data.totalOffices;
    this.offices = data.offices;
    this.responseTime = data.responseTime;
  }
}
