/**
 * Extended schema types for Person domain
 * Types for BIOG_MAIN with relations
 */

import type { InferSelectModel } from 'drizzle-orm';
import type { BIOG_MAIN } from '../schema';

export type BiogMainRecord = InferSelectModel<typeof BIOG_MAIN>;

// Person doesn't typically have relations in the base query
// but this is here for consistency and future extensibility
export interface PersonDataWithRelations extends BiogMainRecord {
  // Future relations can be added here
}