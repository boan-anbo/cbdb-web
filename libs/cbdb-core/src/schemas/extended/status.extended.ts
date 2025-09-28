/**
 * Extended schema types for Status domain
 * Types for STATUS_DATA with relations
 */

import type { InferSelectModel } from 'drizzle-orm';
import type { STATUS_DATA, STATUS_CODES } from '../schema';

type StatusDataRecord = InferSelectModel<typeof STATUS_DATA>;
type StatusCodeRecord = InferSelectModel<typeof STATUS_CODES>;

export interface StatusDataWithRelations extends StatusDataRecord {
  statusType?: StatusCodeRecord;
  statusCode?: StatusCodeRecord;
}