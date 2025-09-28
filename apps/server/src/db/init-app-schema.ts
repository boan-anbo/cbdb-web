import { Client } from '@libsql/client';

/**
 * Initialize app database schema using raw SQL
 *
 * TODO: Replace with Drizzle's programmatic schema push once the "no such column: table" issue is resolved
 * Track issue: https://github.com/drizzle-team/drizzle-orm/discussions/1901
 * Expected in Drizzle 1.0: Use pushSQLiteSchema or generateSQLiteMigration without errors
 *
 * @param client - LibSQL client instance
 */
export async function initializeAppSchema(client: Client): Promise<void> {
  // Create app_settings table with current schema
  await client.execute(`
    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      last_used_cbdb_path TEXT,
      cbdb_opened_at TEXT,
      extracted_db_path TEXT,
      extracted_db_checksum TEXT,
      extracted_db_size INTEGER,
      extracted_at TEXT,
      theme TEXT DEFAULT 'light',
      language TEXT DEFAULT 'en',
      window_state TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')) NOT NULL,
      updated_at TEXT DEFAULT (datetime('now', 'localtime')) NOT NULL
    )
  `);

  // Create users table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')) NOT NULL,
      updated_at TEXT DEFAULT (datetime('now', 'localtime')) NOT NULL
    )
  `);

  // Create recent_files table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS recent_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_path TEXT NOT NULL,
      accessed_at TEXT DEFAULT (datetime('now', 'localtime')) NOT NULL,
      file_type TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')) NOT NULL
    )
  `);

  // Create search_history table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS search_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      search_term TEXT NOT NULL,
      search_type TEXT,
      results_count INTEGER,
      searched_at TEXT DEFAULT (datetime('now', 'localtime')) NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime')) NOT NULL
    )
  `);
}