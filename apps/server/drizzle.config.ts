import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema/*.ts',
  out: './drizzle/migrations',
  dbCredentials: {
    url: './cbdb-desktop.db',
  },
  verbose: true,
  strict: true,
});