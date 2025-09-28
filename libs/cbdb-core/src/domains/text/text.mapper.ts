/**
 * Mapper functions for Text domain
 * Transforms database records to domain models
 */

import type { Text } from './models/text.model';
import type { BiogTextDataWithRelations } from '../../schemas/extended/text.extended';

/**
 * Maps BIOG_TEXT_DATA table record to Text domain model
 * Includes related TEXT_CODES and TEXT_ROLE_CODES data
 */
export function mapBiogTextDataToText(data: BiogTextDataWithRelations): Text {
  return {
    // Primary fields from BIOG_TEXT_DATA
    personId: data.c_personid,
    textId: data.c_textid,
    roleId: data.c_role_id,

    // Temporal data
    year: data.c_year ?? null,
    nhCode: data.c_nh_code ?? null,
    nhYear: data.c_nh_year ?? null,
    rangeCode: data.c_range_code ?? null,

    // Source reference
    source: data.c_source ?? null,

    // Additional metadata
    pages: data.c_pages ?? null,
    notes: data.c_notes ?? null,

    // Audit trail
    createdBy: data.c_created_by ?? null,
    createdDate: data.c_created_date ?? null,
    modifiedBy: data.c_modified_by ?? null,
    modifiedDate: data.c_modified_date ?? null
  };
}

/**
 * Maps array of database records to Text domain models
 */
export function mapBiogTextDataArrayToText(data: BiogTextDataWithRelations[]): Text[] {
  return data.map(mapBiogTextDataToText);
}