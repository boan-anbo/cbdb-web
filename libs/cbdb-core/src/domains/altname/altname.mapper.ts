/**
 * Mapper functions for AltName domain
 * Transforms database records to domain models
 */

import { AltName } from './models/altname.model';
import type { AltNameDataWithRelations } from '../../schemas/extended/altname.extended';

/**
 * Maps ALTNAME_DATA table record to AltName domain model
 */
export function mapAltNameDataToAltName(data: AltNameDataWithRelations): AltName {
  return new AltName(
    data.c_personid,
    data.c_alt_name ?? null,
    data.c_alt_name_chn,
    data.c_alt_name_type_code,
    // Cast to string since Drizzle incorrectly defines these as numeric
    data.altNameCode?.c_name_type_desc ? String(data.altNameCode.c_name_type_desc) : null,
    data.altNameCode?.c_name_type_desc_chn ? String(data.altNameCode.c_name_type_desc_chn) : null,
    data.c_sequence ?? null,
    data.c_source ?? null,
    data.c_pages ?? null,
    data.c_notes ?? null
  );
}

/**
 * Maps array of database records to AltName domain models
 */
export function mapAltNameDataArrayToAltName(data: AltNameDataWithRelations[]): AltName[] {
  return data.map(mapAltNameDataToAltName);
}