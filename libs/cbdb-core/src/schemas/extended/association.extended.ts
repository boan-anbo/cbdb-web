/**
 * Extended schema types for Association domain
 * Types for ASSOC_DATA with relations
 * Based on SCHEMA_ANNOTATED.md relationships
 */

import type { InferSelectModel } from 'drizzle-orm';
import type {
  ASSOC_DATA,
  ASSOC_CODES,
  BIOG_MAIN,
  ADDR_CODES,
  TEXT_CODES
} from '../schema';

type AssocDataRecord = InferSelectModel<typeof ASSOC_DATA>;
type AssocCodeRecord = InferSelectModel<typeof ASSOC_CODES>;
type BiogMainRecord = InferSelectModel<typeof BIOG_MAIN>;
type AddrCodeRecord = InferSelectModel<typeof ADDR_CODES>;
type TextCodeRecord = InferSelectModel<typeof TEXT_CODES>;

/**
 * Association data with all related tables
 * Includes pivot data and related entities
 */
export interface AssociationDataWithRelations extends AssocDataRecord {
  // Association type information
  assocCode?: AssocCodeRecord;

  // Associated person information
  assocPerson?: BiogMainRecord;

  // Kinship person information (if association involves kinship)
  kinPerson?: BiogMainRecord;

  // Associated kinship person information
  assocKinPerson?: BiogMainRecord;

  // Tertiary person information
  tertiaryPerson?: BiogMainRecord;

  // Address information if association is linked to a place
  addrCode?: AddrCodeRecord;

  // Source text information
  sourceText?: TextCodeRecord;
}