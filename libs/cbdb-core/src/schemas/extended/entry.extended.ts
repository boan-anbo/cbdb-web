/**
 * Extended schema types for Entry domain
 * Types for ENTRY_DATA with relations
 */

import type { InferSelectModel } from 'drizzle-orm';
import type { ENTRY_DATA, ENTRY_CODES, BIOG_MAIN, ADDRESSES } from '../schema';

type EntryDataRecord = InferSelectModel<typeof ENTRY_DATA>;
type EntryCodeRecord = InferSelectModel<typeof ENTRY_CODES>;
type BiogMainRecord = InferSelectModel<typeof BIOG_MAIN>;
type AddressRecord = InferSelectModel<typeof ADDRESSES>;

export interface EntryDataWithRelations extends EntryDataRecord {
  entryType?: EntryCodeRecord;
  kinPerson?: BiogMainRecord;
  assocPerson?: BiogMainRecord;
  entryLocation?: AddressRecord;
  entryCode?: EntryCodeRecord;
}