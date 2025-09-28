import {
  DYNASTIES,
  NIAN_HAO,
  ETHNICITY_TRIBE_CODES,
  CHORONYM_CODES,
  HOUSEHOLD_STATUS_CODES,
  INDEXYEAR_TYPE_CODES,
  BIOG_ADDR_CODES,
  YEAR_RANGE_CODES,
  GANZHI_CODES,
  ADDR_CODES,
  BIOG_MAIN
} from '@cbdb/core';
import { InferSelectModel } from 'drizzle-orm';

/**
 * Type-safe batch denorm data structure for optimized PersonModel fetching
 * Eliminates the 'any' type while maintaining full type safety
 */
export interface BatchDenormData {
  person: InferSelectModel<typeof BIOG_MAIN>;
  dynasty?: InferSelectModel<typeof DYNASTIES>;
  birthNh?: InferSelectModel<typeof NIAN_HAO>;
  deathNh?: InferSelectModel<typeof NIAN_HAO>;
  flourishedStartNh?: InferSelectModel<typeof NIAN_HAO>;
  flourishedEndNh?: InferSelectModel<typeof NIAN_HAO>;
  ethnicity?: InferSelectModel<typeof ETHNICITY_TRIBE_CODES>;
  choronym?: InferSelectModel<typeof CHORONYM_CODES>;
  householdStatus?: InferSelectModel<typeof HOUSEHOLD_STATUS_CODES>;
  indexYearType?: InferSelectModel<typeof INDEXYEAR_TYPE_CODES>;
  indexAddrType?: InferSelectModel<typeof BIOG_ADDR_CODES>;
  indexAddr?: InferSelectModel<typeof ADDR_CODES>;
  birthYearRange?: InferSelectModel<typeof YEAR_RANGE_CODES>;
  deathYearRange?: InferSelectModel<typeof YEAR_RANGE_CODES>;
  birthYearDayGanzhi?: InferSelectModel<typeof GANZHI_CODES>;
  deathYearDayGanzhi?: InferSelectModel<typeof GANZHI_CODES>;
}

/**
 * Lookup maps for O(1) access during batch assembly
 */
export interface DenormLookupMaps {
  dynastyMap: Map<number, InferSelectModel<typeof DYNASTIES>>;
  nianHaoMap: Map<number, InferSelectModel<typeof NIAN_HAO>>;
  ethnicityMap: Map<number, InferSelectModel<typeof ETHNICITY_TRIBE_CODES>>;
  choronymMap: Map<number, InferSelectModel<typeof CHORONYM_CODES>>;
  householdStatusMap: Map<number, InferSelectModel<typeof HOUSEHOLD_STATUS_CODES>>;
  indexYearTypeMap: Map<string, InferSelectModel<typeof INDEXYEAR_TYPE_CODES>>;
  indexAddrTypeMap: Map<number, InferSelectModel<typeof BIOG_ADDR_CODES>>;
  indexAddrMap: Map<number, InferSelectModel<typeof ADDR_CODES>>;
  yearRangeMap: Map<number, InferSelectModel<typeof YEAR_RANGE_CODES>>;
  ganzhiMap: Map<number, InferSelectModel<typeof GANZHI_CODES>>;
}