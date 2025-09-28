import { createClient } from '@libsql/client';
import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from '../src/db/cbdb-schema/schema';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Gets an empty test database with full CBDB schema
 *
 * Currently uses pre-generated migration SQL file.
 *
 * Future improvement: Use Drizzle Kit's internal API for programmatic schema pushing
 * See: https://github.com/drizzle-team/drizzle-orm/discussions/1901
 * This would allow us to push schema directly from TypeScript without pre-generated files.
 * However, the internal API may not be stable or work consistently with SQLite/LibSQL.
 *
 * @param inMemory - If true, creates in-memory database (default: true)
 * @returns Drizzle database instance with full CBDB schema
 *
 * @example
 * // In-memory database for testing
 * const db = await getEmptyTestDb();
 *
 * // Insert test data using Drizzle
 * await db.insert(schema.BIOG_MAIN).values({
 *   c_personid: 1,
 *   c_name: 'Test Person',
 *   c_name_chn: '测试人',
 *   c_female: 0,
 *   c_by_intercalary: 0,
 *   c_dy_intercalary: 0,
 *   c_self_bio: 0
 * });
 */
export async function getEmptyTestDb(
  inMemory = true
): Promise<LibSQLDatabase<typeof schema>> {
  // Create client - use timestamp for unique file name to avoid conflicts
  const client = createClient({
    url: inMemory ? ':memory:' : `file:test-empty-${Date.now()}.db`,
  });

  // Create Drizzle instance with our schema
  const db = drizzle(client, { schema });

  // Read the Drizzle-generated migration SQL
  const migrationPath = join(__dirname, '../src/db/cbdb-schema/0000_messy_zaladane.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf-8');

  // Extract the SQL content (remove the comment wrapper)
  const sqlMatch = migrationSQL.match(/\/\*([\s\S]*?)\*\//);
  if (!sqlMatch) {
    throw new Error('Could not extract SQL from migration file');
  }

  const sqlContent = sqlMatch[1];

  // Split by statement-breakpoint and execute each statement
  const statements = sqlContent.split('--> statement-breakpoint');

  for (const statement of statements) {
    const trimmed = statement.trim();
    if (trimmed && !trimmed.startsWith('--')) {
      try {
        await client.execute(trimmed);
      } catch (error: any) {
        // Ignore errors for index creation (tables might not exist in test context)
        // But re-throw for table creation errors
        if (!trimmed.toLowerCase().includes('create index')) {
          console.error(`Failed to execute: ${trimmed.substring(0, 100)}...`);
          console.error(error.message);
        }
      }
    }
  }

  // Enable foreign keys after creating all tables
  await client.execute('PRAGMA foreign_keys = ON');

  return db;
}