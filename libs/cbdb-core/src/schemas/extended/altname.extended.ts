/**
 * Extended types for AltName domain with relation data
 */

import type { InferSelectModel } from 'drizzle-orm';
import { ALTNAME_DATA, ALTNAME_CODES } from '../schema';

/**
 * Base ALTNAME_DATA record
 */
export type AltNameData = InferSelectModel<typeof ALTNAME_DATA>;

/**
 * ALTNAME_CODES reference table
 */
export type AltNameCode = InferSelectModel<typeof ALTNAME_CODES>;

/**
 * ALTNAME_DATA with joined reference data
 */
export interface AltNameDataWithRelations extends AltNameData {
  altNameCode?: AltNameCode;
}