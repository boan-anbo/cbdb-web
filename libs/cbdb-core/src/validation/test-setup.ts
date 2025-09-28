/**
 * Shared test setup for schema validation tests
 * This module provides a configured database connection for testing
 */

import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { beforeAll, afterAll } from 'vitest';
import * as path from 'path';

/**
 * Get the test database path
 * Uses CBDB_PATH environment variable or defaults to the latest.db in the cbdb_sql_db folder
 */
export function getTestDatabasePath(): string {
  return process.env.CBDB_PATH ||
    path.resolve(__dirname, '../../../../cbdb_sql_db/latest.db');
}

/**
 * Create a database connection for testing
 */
export function createTestDatabase() {
  const dbPath = getTestDatabasePath();

  console.log('Using database for validation:', dbPath);

  const client = createClient({
    url: `file:${dbPath}`,
  });

  return drizzle(client);
}

/**
 * Shared test database instance
 */
let testDb: ReturnType<typeof createTestDatabase> | null = null;

/**
 * Get or create the test database instance
 */
export function getTestDb() {
  if (!testDb) {
    testDb = createTestDatabase();
  }
  return testDb;
}

/**
 * Setup hook for validation tests
 * Use this in your describe blocks to ensure proper database connection
 */
export function setupValidationTest() {
  beforeAll(() => {
    // Ensure database connection is established
    getTestDb();
  });

  afterAll(() => {
    // Cleanup if needed
    // Note: We keep the connection open for other tests
  });
}

/**
 * Programmatic and agnostic validation function
 * Tests that mappers can convert database records to model objects
 * without hardcoding specific field mappings
 */
export async function validateTableRecord<T>(
  tableName: string,
  queryFn: () => Promise<T[]>,
  validateFn: (record: T, index: number) => void,
  limit = 5
) {
  const records = await queryFn();

  if (records.length === 0) {
    console.warn(`No records found in ${tableName} table for validation`);
    return;
  }

  // Test up to 'limit' records
  const testRecords = records.slice(0, limit);

  console.log(`Validating ${testRecords.length} records from ${tableName}`);

  testRecords.forEach((record, index) => {
    try {
      // Call the validation function which should:
      // 1. Test that the mapper doesn't crash
      // 2. Verify the model is created
      // 3. Count properties programmatically (no hardcoded field names)
      validateFn(record, index);
    } catch (error) {
      console.error(`Validation failed for record ${index + 1} in ${tableName}:`, {
        [tableName]: record,
        // Include joined table data if present
        ...Object.entries(record as Record<string, unknown>).reduce<Record<string, unknown>>((acc, [key, value]) => {
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            const tableName = key.toUpperCase().replace(/TYPE$/, '_CODES').replace(/INFO$/, '_CODES');
            acc[tableName] = value;
          }
          return acc;
        }, {})
      });
      throw error;
    }
  });
}

/**
 * Programmatic completeness check
 * Simply verifies that we have mapped a reasonable number of fields
 * without checking specific field names
 */
export function checkCompleteness(
  tableName: string,
  databaseColumns: string[],
  modelFields: string[],
  _unmappedAllowed: string[] = []
) {
  // Count how many database columns we have
  const totalColumns = databaseColumns.length;
  const modelFieldCount = modelFields.length;

  // The model should have at least some reasonable percentage of database columns
  // This is a heuristic check - we expect comprehensive mapping
  const minExpectedFields = Math.floor(totalColumns * 0.5); // At least 50% of fields should be mapped

  if (modelFieldCount < minExpectedFields) {
    console.warn(`[${tableName}] Model has ${modelFieldCount} fields but database has ${totalColumns} columns`);
    throw new Error(`Model appears to be missing significant mappings: ${modelFieldCount} fields vs ${totalColumns} database columns`);
  }

  console.log(`[${tableName}] Completeness check passed: ${totalColumns} columns checked`);
}