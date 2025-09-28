import type { Address } from './models/address.model';
import type {
  AddressInfo,
  AddressTypeInfo,
  AddressWithAddressInfo,
  AddressWithTypeInfo,
  AddressWithFullRelations
} from './models/address.model.extended';
import type { AddressResponse } from './messages/address.dtos';
import type { AddressDataWithRelations } from '../../schemas/extended/address.extended';
import { toNumberOrNull, toStringOrNull, toNumber } from '../../utils/type-conversions';

export type { AddressDataWithRelations };

/**
 * Maps BIOG_ADDR_DATA database record to pure Address domain model
 * Maps ONLY fields from the BIOG_ADDR_DATA table
 */
export function mapToAddress(record: AddressDataWithRelations): Address {
  return {
    // Core identifiers
    personId: record.c_personid,
    addressId: record.c_addr_id,
    addressType: record.c_addr_type,

    // Sequencing
    sequence: toNumber(record.c_sequence, 0),

    // Time period
    firstYear: toNumberOrNull(record.c_firstyear),
    lastYear: toNumberOrNull(record.c_lastyear),

    // Source documentation
    source: toNumberOrNull(record.c_source),
    pages: toStringOrNull(record.c_pages),
    notes: toStringOrNull(record.c_notes),

    // First year details (reign period dating)
    firstYearNhCode: toNumberOrNull(record.c_fy_nh_code),
    firstYearNhYear: toNumberOrNull(record.c_fy_nh_year),
    firstYearRange: toNumberOrNull(record.c_fy_range),
    // TODO: Change to boolean once Drizzle fixes BOOLEAN introspection
    firstYearIntercalary: String(toNumber(record.c_fy_intercalary, 0)), // Convert to string as model expects
    firstYearMonth: toNumberOrNull(record.c_fy_month),
    firstYearDay: toNumberOrNull(record.c_fy_day),
    firstYearDayGz: toNumberOrNull(record.c_fy_day_gz),

    // Last year details (reign period dating)
    lastYearNhCode: toNumberOrNull(record.c_ly_nh_code),
    lastYearNhYear: toNumberOrNull(record.c_ly_nh_year),
    lastYearRange: toNumberOrNull(record.c_ly_range),
    // TODO: Change to boolean once Drizzle fixes BOOLEAN introspection
    lastYearIntercalary: String(toNumber(record.c_ly_intercalary, 0)), // Convert to string as model expects
    lastYearMonth: toNumberOrNull(record.c_ly_month),
    lastYearDay: toNumberOrNull(record.c_ly_day),
    lastYearDayGz: toNumberOrNull(record.c_ly_day_gz),

    // Special fields
    natal: toNumberOrNull(record.c_natal),

    // Audit trail
    createdBy: toStringOrNull(record.c_created_by),
    createdDate: toStringOrNull(record.c_created_date),
    modifiedBy: toStringOrNull(record.c_modified_by),
    modifiedDate: toStringOrNull(record.c_modified_date),

    // Data management
    deleteFlag: toNumberOrNull(record.c_delete),
  };
}

/**
 * Maps ADDR_CODES record to AddressInfo domain model
 */
function mapToAddressInfo(addrCode: AddressDataWithRelations['addressInfo']): AddressInfo {
  if (!addrCode) {
    // Return empty object structure when no data
    return {
      id: 0,
      name: null,
      nameChn: null,
      adminType: null,
      xCoord: null,
      yCoord: null,
      notes: null
    };
  }

  return {
    id: addrCode.c_addr_id ?? 0,
    name: toStringOrNull(addrCode.c_name),
    nameChn: toStringOrNull(addrCode.c_name_chn),
    adminType: toStringOrNull(addrCode.c_admin_type),
    xCoord: toNumberOrNull(addrCode.x_coord),
    yCoord: toNumberOrNull(addrCode.y_coord),
    notes: toStringOrNull(addrCode.c_notes)
  };
}

/**
 * Maps BIOG_ADDR_CODES record to AddressTypeInfo domain model
 */
function mapToAddressTypeInfo(addrTypeCode: AddressDataWithRelations['addressType']): AddressTypeInfo {
  if (!addrTypeCode) {
    // Return empty object structure when no data
    return {
      code: 0,
      description: null,
      descriptionChn: null
    };
  }

  return {
    code: addrTypeCode.c_addr_type ?? 0,
    description: toStringOrNull(addrTypeCode.c_addr_desc),
    descriptionChn: toStringOrNull(addrTypeCode.c_addr_desc_chn)
  };
}

/**
 * Maps database record to AddressWithAddressInfo
 * Includes ADDR_CODES data
 */
export function mapToAddressWithAddressInfo(record: AddressDataWithRelations): AddressWithAddressInfo {
  return {
    ...mapToAddress(record),
    addressInfo: mapToAddressInfo(record.addressInfo)
  };
}

/**
 * Maps database record to AddressWithTypeInfo
 * Includes BIOG_ADDR_CODES data
 */
export function mapToAddressWithTypeInfo(record: AddressDataWithRelations): AddressWithTypeInfo {
  return {
    ...mapToAddress(record),
    addressTypeInfo: mapToAddressTypeInfo(record.addressType)
  };
}

/**
 * Maps database record to AddressWithFullRelations
 * Includes all relation data
 */
export function mapToAddressWithFullRelations(record: AddressDataWithRelations): AddressWithFullRelations {
  return {
    ...mapToAddress(record),
    addressInfo: mapToAddressInfo(record.addressInfo),
    addressTypeInfo: mapToAddressTypeInfo(record.addressType)
  };
}

/**
 * Maps database record to AddressResponse message
 * Used for API responses with optional nested relations
 */
export function mapToAddressResponse(record: AddressDataWithRelations): AddressResponse {
  const response: AddressResponse = mapToAddress(record);

  // Only include relations if they exist in the source data
  if (record.addressInfo) {
    response.addressInfo = mapToAddressInfo(record.addressInfo);
  }

  if (record.addressType) {
    response.addressTypeInfo = mapToAddressTypeInfo(record.addressType);
  }

  return response;
}

/**
 * Maps an array of BIOG_ADDR_DATA records to Address array
 */
export function mapAddressArrayToAddress(records: AddressDataWithRelations[]): Address[] {
  return records.map(mapToAddress);
}

/**
 * Maps an array of records to AddressResponse array
 */
export function mapAddressArrayToResponse(records: AddressDataWithRelations[]): AddressResponse[] {
  return records.map(mapToAddressResponse);
}