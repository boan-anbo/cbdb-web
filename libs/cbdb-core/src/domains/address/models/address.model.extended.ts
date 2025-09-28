/**
 * Extended Address models with nested relations
 * These models include related data from joined tables
 * All arrays are required (use [] for empty, never undefined)
 */

import { Address } from './address.model';

/**
 * Address location information from ADDR_CODES table
 */
export class AddressInfo {
  constructor(
    public id: number,
    public name: string | null,
    public nameChn: string | null,
    public adminType: string | null,
    public xCoord: number | null,
    public yCoord: number | null,
    public notes: string | null
  ) {}
}

/**
 * Address type information from BIOG_ADDR_CODES table
 */
export class AddressTypeInfo {
  constructor(
    public code: number,
    public description: string | null,
    public descriptionChn: string | null
  ) {}
}

/**
 * Address with location information
 * Includes data from ADDR_CODES join
 */
export class AddressWithAddressInfo extends Address {
  public addressInfo: AddressInfo = new AddressInfo(0, null, null, null, null, null, null);
}

/**
 * Address with type information
 * Includes data from BIOG_ADDR_CODES join
 */
export class AddressWithTypeInfo extends Address {
  public addressTypeInfo: AddressTypeInfo = new AddressTypeInfo(0, null, null);
}

/**
 * Address with all relations loaded
 * Includes both ADDR_CODES and BIOG_ADDR_CODES data
 */
export class AddressWithFullRelations extends Address {
  public addressInfo: AddressInfo = new AddressInfo(0, null, null, null, null, null, null);
  public addressTypeInfo: AddressTypeInfo = new AddressTypeInfo(0, null, null);
}