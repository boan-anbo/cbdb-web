/**
 * Date Validation Utilities for Timeline Events
 *
 * Provides reusable guards to filter out invalid or unrealistic dates
 * from CBDB data which may contain placeholders like -9999
 */

/**
 * Valid date range for historical data
 * -3000 BCE to 2100 CE covers all reasonable historical periods
 */
export const VALID_DATE_RANGE = {
  MIN_YEAR: -3000,  // 3000 BCE
  MAX_YEAR: 2100    // 2100 CE
} as const;

/**
 * Known invalid placeholder values in CBDB
 */
export const INVALID_DATE_VALUES = {
  NO_DATE: -1,      // Common "no date" marker
  MISSING: 0,       // Another "no date" marker
  UNKNOWN: 999,     // Sometimes used for unknown
  ANCIENT: -9999    // Placeholder for unknown ancient dates
} as const;

/**
 * Check if a year is within reasonable historical bounds
 */
export function isValidHistoricalYear(year: number | null | undefined): boolean {
  if (year === null || year === undefined) {
    return true; // null/undefined are ok, means no date
  }

  // Check against known invalid placeholders
  if (year === INVALID_DATE_VALUES.ANCIENT) {
    return false;
  }

  // Check reasonable historical range
  return year >= VALID_DATE_RANGE.MIN_YEAR && year <= VALID_DATE_RANGE.MAX_YEAR;
}

/**
 * Check if a year represents "no date" (should be filtered from timeline)
 */
export function isNoDatePlaceholder(year: number | null | undefined): boolean {
  if (year === null || year === undefined) {
    return true;
  }

  return year === INVALID_DATE_VALUES.NO_DATE ||
         year === INVALID_DATE_VALUES.MISSING ||
         year === INVALID_DATE_VALUES.UNKNOWN ||
         year === INVALID_DATE_VALUES.ANCIENT;
}

/**
 * Validate a timeline event has reasonable dates
 * Returns true if the event should be included in timeline
 */
export function hasValidTimelineDates(event: {
  year?: number | null;
  startYear?: number | null;
  endYear?: number | null;
}): boolean {
  // Must have at least one date
  const hasDate = event.year || event.startYear || event.endYear;
  if (!hasDate) {
    return false;
  }

  // Check all provided dates are valid
  if (event.year && !isValidHistoricalYear(event.year)) {
    return false;
  }

  if (event.startYear && !isValidHistoricalYear(event.startYear)) {
    return false;
  }

  if (event.endYear && !isValidHistoricalYear(event.endYear)) {
    return false;
  }

  // Check if all dates are "no date" placeholders
  const yearIsPlaceholder = isNoDatePlaceholder(event.year);
  const startIsPlaceholder = isNoDatePlaceholder(event.startYear);
  const endIsPlaceholder = isNoDatePlaceholder(event.endYear);

  // If all dates present are placeholders, filter out
  if (yearIsPlaceholder && startIsPlaceholder && endIsPlaceholder) {
    return false;
  }

  return true;
}

/**
 * Clean up invalid dates in an event, replacing with null
 */
export function cleanEventDates<T extends {
  year?: number | null;
  startYear?: number | null;
  endYear?: number | null;
}>(event: T): T {
  const cleaned = { ...event };

  if (cleaned.year && !isValidHistoricalYear(cleaned.year)) {
    cleaned.year = null;
  }

  if (cleaned.startYear && !isValidHistoricalYear(cleaned.startYear)) {
    cleaned.startYear = null;
  }

  if (cleaned.endYear && !isValidHistoricalYear(cleaned.endYear)) {
    cleaned.endYear = null;
  }

  return cleaned;
}