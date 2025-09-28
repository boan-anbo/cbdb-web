/**
 * Address DTOs - HTTP layer contracts
 * Requests and Responses for API communication
 */

import { Address } from '@domains/address/models/address.model';
import { AddressInfo, AddressTypeInfo } from '@domains/address/models/address.model.extended';
import { PaginationInfo } from '@/common/pagination.dto';

/**
 * Request to search addresses
 */
export class SearchAddressRequest {
  constructor(
    public personId?: number,
    public addressType?: number,
    public addressId?: number,
    public includeAddressInfo?: boolean,
    public includeTypeInfo?: boolean,
    public limit?: number,
    public offset?: number
  ) {}
}

/**
 * Request to get addresses with specific relations
 */
export class GetAddressWithRelationsRequest {
  constructor(
    public personId: number,
    public addressId: number,
    public relations: ('addressInfo' | 'typeInfo')[]
  ) {}
}

/**
 * HTTP response for a single address
 * What goes over the wire to clients
 */
export class AddressResponse extends Address {
  // Optional nested relations (not flattened)
  public addressInfo?: AddressInfo;
  public addressTypeInfo?: AddressTypeInfo;
}

/**
 * HTTP response for a list of addresses
 */
export class AddressListResponse {
  constructor(
    public addresses: AddressResponse[],
    public total: number
  ) {}
}

/**
 * HTTP response for paginated address search
 */
export class PaginatedAddressResponse {
  constructor(
    public data: AddressResponse[],
    public pagination: PaginationInfo
  ) {}
}