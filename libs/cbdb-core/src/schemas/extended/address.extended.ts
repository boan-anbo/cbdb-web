/**
 * Extended schema types for Address domain
 * Types for BIOG_ADDR_DATA with relations
 */

import type { InferSelectModel } from 'drizzle-orm';
import type { BIOG_ADDR_DATA, BIOG_ADDR_CODES, ADDR_CODES } from '../schema';

type BiogAddrDataRecord = InferSelectModel<typeof BIOG_ADDR_DATA>;
type BiogAddrCodeRecord = InferSelectModel<typeof BIOG_ADDR_CODES>;
type AddrCodeRecord = InferSelectModel<typeof ADDR_CODES>;

export interface AddressDataWithRelations extends BiogAddrDataRecord {
  addressType?: BiogAddrCodeRecord;
  addressInfo?: AddrCodeRecord;
}

// Export for reuse in other domains
export type { AddrCodeRecord };