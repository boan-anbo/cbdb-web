/**
 * Utility functions for safe type conversions from database values
 *
 * WHY THIS EXISTS:
 * Drizzle ORM's SQLite introspection has a known issue where BOOLEAN columns
 * are converted to `numeric()` instead of `integer({ mode: 'boolean' })`.
 * This results in fields being typed as `string | number` instead of `number`.
 *
 * See: https://github.com/drizzle-team/drizzle-orm/issues/2539
 *
 * The CBDB database uses BOOLEAN(2) columns for fields like:
 * - c_female (0 = male, 1 = female)
 * - c_by_intercalary (0 = regular month, 1 = intercalary/leap month)
 * - c_dy_intercalary (0 = regular month, 1 = intercalary/leap month)
 * - c_self_bio (0 = no self biography, 1 = has self biography)
 *
 * SQLite actually stores these as integers, but Drizzle's introspection
 * incorrectly maps them to numeric() which accepts any value.
 *
 * TODO: Remove these utilities once Drizzle fixes the introspection issue
 * and we regenerate our schema with proper integer({ mode: 'boolean' }) types.
 *
 * FIXME: Update schema generation to use integer({ mode: 'boolean' }) for
 * BOOLEAN columns once Drizzle supports it in introspection.
 */

/**
 * Safely converts a database numeric value to a number.
 *
 * Handles:
 * - String numbers: "123" → 123
 * - Numbers: 123 → 123
 * - Empty strings: "" → defaultValue
 * - null/undefined → defaultValue
 * - Invalid strings: "abc" → defaultValue
 *
 * @param value - The value from database (could be string, number, null, undefined)
 * @param defaultValue - Default value to use when parsing fails
 * @returns Parsed integer or default value
 */
export function toNumber(value: unknown, defaultValue: number = 0): number {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return defaultValue;
  }

  // Already a number
  if (typeof value === 'number') {
    return isNaN(value) ? defaultValue : value;
  }

  // Convert to string and parse
  const str = String(value).trim();

  // Empty string
  if (str === '') {
    return defaultValue;
  }

  // Parse as integer
  const parsed = parseInt(str, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Safely converts a database numeric value to a boolean.
 *
 * Handles:
 * - Numbers: 0 → false, 1 → true, other → based on truthiness
 * - Strings: "0" → false, "1" → true, "" → false
 * - null/undefined → false
 *
 * @param value - The value from database
 * @returns Boolean value
 */
export function toBoolean(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '' || trimmed === '0') {
      return false;
    }
    return true;
  }

  return Boolean(value);
}

/**
 * Safely converts a database value to a string.
 *
 * Handles:
 * - Strings: pass through
 * - Numbers: convert to string
 * - null/undefined → null
 *
 * @param value - The value from database
 * @returns String value or null
 */
export function toStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return String(value);
}

/**
 * Safely converts a database value to a number or null.
 *
 * Similar to toNumber but returns null for invalid values instead of a default.
 *
 * @param value - The value from database
 * @returns Parsed number or null
 */
export function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }

  const str = String(value).trim();
  if (str === '') {
    return null;
  }

  const parsed = parseInt(str, 10);
  return isNaN(parsed) ? null : parsed;
}