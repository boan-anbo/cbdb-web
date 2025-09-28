import { defineConfig } from 'drizzle-kit';
import { envConfig } from './src/config/env.config';

/**
 * Drizzle configuration for CBDB database introspection
 * This is used to generate TypeScript schema from the CBDB SQLite database
 */
export default defineConfig({
  out: './src/db/cbdb-schema',
  schema: './src/db/cbdb-schema/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: envConfig.CBDB_PATH,
  },
  introspect: {
    casing: 'preserve', // Keep original database column names
  },
  verbose: true,
  strict: true,
});