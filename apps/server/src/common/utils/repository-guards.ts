/**
 * Type guards and validators for repository layer
 * Ensures runtime type safety for database operations
 */

/**
 * Validates pagination parameters for Drizzle ORM
 * Throws if parameters are not valid numbers
 */
export function validatePagination(params: {
  start?: number;
  limit?: number;
}): { start: number; limit: number } {
  const start = params.start ?? 0;
  const limit = params.limit ?? 100;

  if (!Number.isInteger(start) || start < 0) {
    throw new Error(`Invalid start parameter: ${start}. Must be a non-negative integer.`);
  }

  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error(`Invalid limit parameter: ${limit}. Must be a positive integer.`);
  }

  if (limit > 1000) {
    throw new Error(`Limit parameter ${limit} exceeds maximum of 1000.`);
  }

  return { start, limit };
}

/**
 * Type guard to ensure a value is a valid number for database queries
 */
export function assertNumber(value: unknown, fieldName: string): number {
  const num = Number(value);
  if (Number.isNaN(num)) {
    throw new Error(`${fieldName} must be a valid number, got: ${value}`);
  }
  return num;
}

/**
 * Type guard to ensure a value is a valid integer
 */
export function assertInteger(value: unknown, fieldName: string): number {
  const num = assertNumber(value, fieldName);
  if (!Number.isInteger(num)) {
    throw new Error(`${fieldName} must be an integer, got: ${num}`);
  }
  return num;
}

/**
 * Safe wrapper for Drizzle limit/offset operations
 * Ensures both values are present and valid when using offset
 */
export function safePagination<T>(
  query: T,
  pagination: { start: number; limit: number }
): T {
  const { start, limit } = validatePagination(pagination);

  // SQLite requires LIMIT when using OFFSET
  // This wrapper ensures we always have valid numeric values
  if (start > 0 && !limit) {
    throw new Error('Cannot use OFFSET without LIMIT in SQLite');
  }

  return query;
}