import type { Kinship } from './models/kinship.model';
import { KinshipCode } from './models/kinship-code.model';
import type { KinshipDataWithRelations } from '../../schemas/extended/kinship.extended';
import type { InferSelectModel } from 'drizzle-orm';
import type { KINSHIP_CODES } from '../../schemas/schema';
import { toStringOrNull } from '../../utils/type-conversions';

export type { KinshipDataWithRelations };
type KinshipCodeRecord = InferSelectModel<typeof KINSHIP_CODES>;

/**
 * Maps KIN_DATA database record to KinshipModel domain model
 * Maps ALL fields from the database to ensure completeness
 */
export function mapKinDataToKinship(record: KinshipDataWithRelations): Kinship {
  return {
    // Core identifiers
    personId: record.c_personid,
    kinPersonId: record.c_kin_id,
    kinshipCode: record.c_kin_code,

    // Source documentation
    source: record.c_source || null,
    pages: record.c_pages ? String(record.c_pages) : null,
    notes: record.c_notes ? String(record.c_notes) : null,
    autogenNotes: record.c_autogen_notes ? String(record.c_autogen_notes) : null,

    // Audit trail
    createdBy: record.c_created_by ? String(record.c_created_by) : null,
    createdDate: record.c_created_date ? String(record.c_created_date) : null,
    modifiedBy: record.c_modified_by ? String(record.c_modified_by) : null,
    modifiedDate: record.c_modified_date ? String(record.c_modified_date) : null
  };
}

/**
 * Maps an array of KIN_DATA records to Kinship array
 */
export function mapKinDataArrayToKinship(records: KinshipDataWithRelations[]): Kinship[] {
  return records.map(mapKinDataToKinship);
}

/**
 * Maps KINSHIP_CODES database record to KinshipCode domain model
 */
export function mapKinshipCodeFromDb(record: KinshipCodeRecord): KinshipCode {
  return new KinshipCode(
    record.c_kincode ?? 0,
    toStringOrNull(record.c_kinrel),
    toStringOrNull(record.c_kinrel_chn),
    toStringOrNull(record.c_kinrel_simplified),
    record.c_kin_pair1,
    record.c_kin_pair2,
    toStringOrNull(record.c_kin_pair_notes)
  );
}

/**
 * Maps an array of KINSHIP_CODES records to KinshipCode array
 */
export function mapKinshipCodeArrayFromDb(records: KinshipCodeRecord[]): KinshipCode[] {
  return records.map(mapKinshipCodeFromDb);
}