/**
 * Extended types for Text domain with relation data
 * These types include joined data from related tables
 */

import type { InferSelectModel } from 'drizzle-orm';
import { BIOG_TEXT_DATA, TEXT_CODES, TEXT_ROLE_CODES } from '../schema';

/**
 * Base BIOG_TEXT_DATA record
 */
export type BiogTextData = InferSelectModel<typeof BIOG_TEXT_DATA>;

/**
 * TEXT_CODES reference table
 */
export type TextCode = InferSelectModel<typeof TEXT_CODES>;

/**
 * TEXT_ROLE_CODES reference table
 */
export type TextRoleCode = InferSelectModel<typeof TEXT_ROLE_CODES>;

/**
 * BIOG_TEXT_DATA with joined reference data
 * Includes text information and role descriptions
 */
export interface BiogTextDataWithRelations extends BiogTextData {
  textCode?: TextCode;
  roleCode?: TextRoleCode;
}