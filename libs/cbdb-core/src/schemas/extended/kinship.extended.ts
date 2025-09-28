/**
 * Extended schema types for Kinship domain
 * Types for KIN_DATA with relations
 */

import type { InferSelectModel } from 'drizzle-orm';
import type { KIN_DATA, KINSHIP_CODES, BIOG_MAIN } from '../schema';

type KinDataRecord = InferSelectModel<typeof KIN_DATA>;
type KinshipCodeRecord = InferSelectModel<typeof KINSHIP_CODES>;
type BiogMainRecord = InferSelectModel<typeof BIOG_MAIN>;

export interface KinshipDataWithRelations extends KinDataRecord {
  kinshipCode?: KinshipCodeRecord;
  kinPerson?: BiogMainRecord;
}