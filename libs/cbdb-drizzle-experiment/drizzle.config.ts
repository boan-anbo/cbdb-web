import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './drizzle/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: '../../cbdb_sql_db/latest.db',
  },
  introspect: {
    casing: 'preserve', // Keep original database column names
  },
  verbose: true,
  strict: true,
});