/**
 * Extended types for Event domain with relation data
 */

import type { InferSelectModel } from 'drizzle-orm';
import { EVENTS_DATA, EVENT_CODES, ADDR_CODES } from '../schema';

/**
 * Base EVENTS_DATA record
 */
export type EventData = InferSelectModel<typeof EVENTS_DATA>;

/**
 * EVENT_CODES reference table
 */
export type EventCode = InferSelectModel<typeof EVENT_CODES>;

/**
 * EVENTS_DATA with joined reference data
 */
export interface EventDataWithRelations extends EventData {
  eventCode?: EventCode;
  addrCode?: InferSelectModel<typeof ADDR_CODES>;
}