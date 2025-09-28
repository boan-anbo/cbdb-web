import type { Status } from './models/status.model';
import type { StatusDataWithRelations } from '../../schemas/extended/status.extended';

export type { StatusDataWithRelations };

/**
 * Maps STATUS_DATA database record to StatusModel domain model
 * Maps ALL fields from the database to ensure completeness
 */
export function mapStatusDataToStatus(record: StatusDataWithRelations): Status {
  return {
    // Core identifiers
    personId: record.c_personid,
    statusCode: record.c_status_code,

    // Sequencing
    sequence: record.c_sequence || 0,

    // Time period
    firstYear: record.c_firstyear || null,
    lastYear: record.c_lastyear || null,

    // First year details (reign period dating)
    firstYearNhCode: record.c_fy_nh_code || null,
    firstYearNhYear: record.c_fy_nh_year || null,
    firstYearRange: record.c_fy_range || null,

    // Last year details (reign period dating)
    lastYearNhCode: record.c_ly_nh_code || null,
    lastYearNhYear: record.c_ly_nh_year || null,
    lastYearRange: record.c_ly_range || null,

    // Additional information
    supplement: record.c_supplement ? String(record.c_supplement) : null,

    // Source documentation
    source: record.c_source || null,
    pages: record.c_pages ? String(record.c_pages) : null,
    notes: record.c_notes ? String(record.c_notes) : null,

    // Audit trail
    createdBy: record.c_created_by ? String(record.c_created_by) : null,
    createdDate: record.c_created_date ? String(record.c_created_date) : null,
    modifiedBy: record.c_modified_by ? String(record.c_modified_by) : null,
    modifiedDate: record.c_modified_date ? String(record.c_modified_date) : null
  };
}

/**
 * Maps an array of STATUS_DATA records to Status array
 */
export function mapStatusDataArrayToStatus(records: StatusDataWithRelations[]): Status[] {
  return records.map(mapStatusDataToStatus);
}