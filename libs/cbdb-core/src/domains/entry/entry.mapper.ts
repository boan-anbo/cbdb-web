import type { Entry } from './models/entry.model';
import type { EntryDataWithRelations } from '../../schemas/extended/entry.extended';

export type { EntryDataWithRelations };

/**
 * TODO: [Architecture] Implement four-level mapping pattern for Entry domain
 * - Follow the pattern established in person.mapper.ts:
 *   1. toTableModel() - Maps to EntryTableModel (raw database)
 *   2. toModel() - Maps to EntryModel with trivial joins (THE DEFAULT)
 *   3. toExtendedModel() - Maps to EntryExtendedModel with entity relations
 *   4. toDataView() - Maps to purpose-specific DataViews
 * - Export as entryMapper object with these methods
 * - Remove standalone functions in favor of mapper object methods
 * - See personMapper for reference implementation
 */

/**
 * Maps ENTRY_DATA database record to EntryModel domain model
 * Maps ALL fields from the database to ensure completeness
 *
 * TODO: [Refactor] Move this function into entryMapper.toModel()
 * - Should accept both raw record and ENTRY_CODES join result
 * - Should return EntryModel with entryCodeInfo populated
 */
export function mapEntryDataToEntry(record: EntryDataWithRelations): Entry {
  return {
    // Core identifiers
    personId: record.c_personid,
    entryCode: record.c_entry_code,

    // Sequencing
    sequence: record.c_sequence || 0,

    // Examination details
    examRank: record.c_exam_rank ? String(record.c_exam_rank) : null,
    examField: record.c_exam_field ? String(record.c_exam_field) : null,
    attemptCount: record.c_attempt_count || null,

    // Kinship connections (hereditary privilege)
    kinCode: record.c_kin_code || 0,
    kinId: record.c_kin_id || 0,

    // Social connections (recommendations, patronage)
    assocCode: record.c_assoc_code || 0,
    assocId: record.c_assoc_id || 0,

    // Time information
    year: record.c_year || 0,
    age: record.c_age || null,
    nianhaoId: record.c_nianhao_id || null,
    entryNhYear: record.c_entry_nh_year || null,
    entryRange: record.c_entry_range || null,

    // Institution information
    instCode: record.c_inst_code || 0,
    instNameCode: record.c_inst_name_code || 0,

    // Location
    entryAddrId: record.c_entry_addr_id || null,

    // Family status
    parentalStatus: record.c_parental_status || null,

    // Source documentation
    source: record.c_source || null,
    pages: record.c_pages ? String(record.c_pages) : null,
    notes: record.c_notes ? String(record.c_notes) : null,
    postingNotes: record.c_posting_notes ? String(record.c_posting_notes) : null,

    // Audit trail
    createdBy: record.c_created_by ? String(record.c_created_by) : null,
    createdDate: record.c_created_date ? String(record.c_created_date) : null,
    modifiedBy: record.c_modified_by ? String(record.c_modified_by) : null,
    modifiedDate: record.c_modified_date ? String(record.c_modified_date) : null
  };
}

/**
 * Maps an array of ENTRY_DATA records to Entry array
 */
export function mapEntryDataArrayToEntry(records: EntryDataWithRelations[]): Entry[] {
  return records.map(mapEntryDataToEntry);
}