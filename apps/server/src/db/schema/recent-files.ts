import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * Recent Files table for tracking recently opened CBDB files
 */
export const recentFiles = sqliteTable('recent_files', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  // File information
  filePath: text('file_path').notNull().unique(), // Full path to CBDB file
  fileName: text('file_name').notNull(), // Display name
  fileSize: integer('file_size'), // Size in bytes

  // Access tracking
  lastOpenedAt: text('last_opened_at')
    .notNull()
    .default(sql`(datetime('now', 'localtime'))`),
  openCount: integer('open_count').default(1).notNull(),

  // Metadata
  isFavorite: integer('is_favorite', { mode: 'boolean' }).default(false).notNull(),
  notes: text('notes'), // User notes about this database

  // Timestamps
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now', 'localtime'))`),
});

// Type inference helpers
export type RecentFile = typeof recentFiles.$inferSelect;
export type NewRecentFile = typeof recentFiles.$inferInsert;