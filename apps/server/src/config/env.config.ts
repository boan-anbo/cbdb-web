import { parseBackendEnv, ZodError } from '@cbdb/core';
import * as dotenv from 'dotenv';

// Load .env file
dotenv.config();

/**
 * Parse and validate environment variables at application startup
 * This runs synchronously when the module is imported
 */
let config: ReturnType<typeof parseBackendEnv>;

try {
  config = parseBackendEnv(process.env);

  console.log('✅ Environment variables validated successfully');
  console.log('  - NODE_ENV:', config.NODE_ENV);
  console.log('  - PORT:', config.PORT);
  console.log('  - CBDB_PATH:', config.CBDB_PATH || '(not set - Electron will handle)');
  console.log('  - APP_DB_PATH:', config.APP_DB_PATH);
} catch (error) {
  console.error('❌ Environment validation failed:');
  if (error instanceof ZodError) {
    // Format the errors directly since formatEnvErrors might have issues
    const formattedErrors = error.issues
      .map(err => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n');
    console.error(formattedErrors);
  } else {
    console.error(error);
  }
  process.exit(1);
}

/**
 * Typed, validated environment configuration
 * Import this in your modules to access environment variables
 */
export const envConfig = config;