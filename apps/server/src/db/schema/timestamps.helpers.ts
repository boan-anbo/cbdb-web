import { text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * Reusable timestamp columns for SQLite tables
 * Using SQLite's datetime functions for local timezone
 */
export const timestamps = {
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now', 'localtime'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now', 'localtime'))`)
    .$onUpdate(() => new Date().toISOString()),
};

/**
 * Soft delete timestamp
 */
export const softDelete = {
  deletedAt: text('deleted_at'), // Nullable - only set when soft deleted
};