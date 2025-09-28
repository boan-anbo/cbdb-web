import { z } from 'zod';

/**
 * Environment variable schemas for CBDB Desktop application
 * Used by both frontend (Electron) and backend (NestJS)
 */

// Backend-specific environment variables
export const backendEnvSchema = z.object({
  // Database configuration
  CBDB_PATH: z.string().optional(), // Optional - will be set after extraction
  APP_DB_PATH: z.string().min(1, 'Application database path is required').default('./cbdb-desktop.db'),

  // Server configuration
  PORT: z.coerce.number().positive().default(18019),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // API configuration
  API_PREFIX: z.string().default('api'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'verbose']).default('info'),

  // Optional features
  ENABLE_SWAGGER: z.coerce.boolean().default(false),
  ENABLE_GRAPHQL: z.coerce.boolean().default(false),
});

// Frontend-specific environment variables
export const frontendEnvSchema = z.object({
  // API endpoint
  VITE_API_URL: z.string().url().default('http://localhost:18019'),
  VITE_API_PREFIX: z.string().default('api'),

  // App configuration
  VITE_APP_NAME: z.string().default('CBDB Desktop'),
  VITE_APP_VERSION: z.string().regex(/^\d+\.\d+\.\d+$/).default('0.0.1'),

  // Feature flags
  VITE_ENABLE_ANALYTICS: z.coerce.boolean().default(false),
  VITE_ENABLE_DEBUG: z.coerce.boolean().default(false),

  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Electron main process environment variables
export const electronEnvSchema = z.object({
  // Window configuration
  ELECTRON_DEV_TOOLS: z.coerce.boolean().default(true),
  ELECTRON_WINDOW_WIDTH: z.coerce.number().positive().default(1200),
  ELECTRON_WINDOW_HEIGHT: z.coerce.number().positive().default(800),

  // Paths
  ELECTRON_USER_DATA_PATH: z.string().optional(),
  ELECTRON_CBDB_BUNDLE_PATH: z.string().optional(),

  // Server process
  ELECTRON_BACKEND_PORT: z.coerce.number().positive().default(18019),
  ELECTRON_BACKEND_HOST: z.string().default('localhost'),

  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Type exports
export type BackendEnv = z.infer<typeof backendEnvSchema>;
export type FrontendEnv = z.infer<typeof frontendEnvSchema>;
export type ElectronEnv = z.infer<typeof electronEnvSchema>;

/**
 * Parse and validate environment variables
 * Throws ZodError if validation fails
 */
export function parseBackendEnv(env: Record<string, string | undefined> = process.env): BackendEnv {
  return backendEnvSchema.parse(env);
}

export function parseFrontendEnv(env: Record<string, string | undefined> = process.env): FrontendEnv {
  return frontendEnvSchema.parse(env);
}

export function parseElectronEnv(env: Record<string, string | undefined> = process.env): ElectronEnv {
  return electronEnvSchema.parse(env);
}

/**
 * Safe parse functions that return result objects instead of throwing
 */
export function safeParseBackendEnv(env: Record<string, string | undefined> = process.env) {
  return backendEnvSchema.safeParse(env);
}

export function safeParseFrontendEnv(env: Record<string, string | undefined> = process.env) {
  return frontendEnvSchema.safeParse(env);
}

export function safeParseElectronEnv(env: Record<string, string | undefined> = process.env) {
  return electronEnvSchema.safeParse(env);
}

/**
 * Helper to format Zod errors for better debugging
 */
export function formatEnvErrors(errors: z.ZodError): string {
  return errors.issues
    .map((err: z.ZodIssue) => `  - ${err.path.join('.')}: ${err.message}`)
    .join('\n');
}