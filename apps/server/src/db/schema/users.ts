import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { timestamps } from './timestamps.helpers';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  password: text('password').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  ...timestamps,
});

// Type inference helpers
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;