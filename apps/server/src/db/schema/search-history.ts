import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * Search History table for tracking user searches within CBDB
 */
export const searchHistory = sqliteTable('search_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  // Search details
  searchQuery: text('search_query').notNull(),
  searchType: text('search_type').notNull(), // 'person' | 'place' | 'office' | 'text' | 'all'
  resultsCount: integer('results_count').default(0),

  // Context
  cbdbPath: text('cbdb_path'), // Which CBDB file was being searched

  // Timestamps
  searchedAt: text('searched_at')
    .notNull()
    .default(sql`(datetime('now', 'localtime'))`),
});

// Type inference helpers
export type SearchHistory = typeof searchHistory.$inferSelect;
export type NewSearchHistory = typeof searchHistory.$inferInsert;