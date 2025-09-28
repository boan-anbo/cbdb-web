import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * App Settings table for storing application-wide configuration
 * Uses a single-row pattern with id=1 for global settings
 */
export const appSettings = sqliteTable('app_settings', {
  id: integer('id').primaryKey().default(1), // Always use id=1 for single row

  // CBDB Configuration
  lastUsedCbdbPath: text('last_used_cbdb_path'), // Nullable - path to last opened CBDB file
  cbdbOpenedAt: text('cbdb_opened_at'), // Nullable - when CBDB was last opened

  // Extracted Database Tracking
  extractedDbPath: text('extracted_db_path'), // Path to extracted database
  extractedDbChecksum: text('extracted_db_checksum'), // MD5 checksum of source archive
  extractedDbSize: integer('extracted_db_size'), // Size of extracted database in bytes
  extractedAt: text('extracted_at'), // When database was extracted

  // App Preferences
  theme: text('theme').default('light'), // 'light' | 'dark' | 'system'
  language: text('language').default('en'), // UI language preference

  // Window State (for restoring window position/size)
  windowState: text('window_state'), // JSON string with window bounds

  // Timestamps
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now', 'localtime'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now', 'localtime'))`)
    .$onUpdate(() => new Date().toISOString()),
});

// Type inference helper
export type AppSettings = typeof appSettings.$inferSelect;
export type NewAppSettings = typeof appSettings.$inferInsert;