/**
 * Security Constants
 *
 * Centralized configuration for security features.
 * Change these values to adjust security behavior across the application.
 */

/**
 * Rate Limiting Configuration
 *
 */
export const RATE_LIMIT_CONFIG = {
  /** Time window (milliseconds) - Default: 60000 = 1 minute */
  TTL: 60000,

  /** Maximum requests per time window - Default: 200 requests (3.3 req/sec) */
  LIMIT: 200,

  /** Endpoints that bypass rate limiting */
  BYPASS_ENDPOINTS: [], // ['/api/health', '/health'],

  /** HTTP status code for rate limit exceeded */
  STATUS_CODE: 429,
} as const;

/**
 * IP Detection Headers
 * Priority order for extracting real client IP
 */
export const IP_HEADERS = {
  CLOUDFLARE: 'cf-connecting-ip',
  X_FORWARDED_FOR: 'x-forwarded-for',
  X_REAL_IP: 'x-real-ip',
} as const;

/**
 * Protected Endpoints Configuration
 * Endpoints restricted in web deployment mode
 */
export const PROTECTED_ENDPOINTS = {
  /** Endpoints that should be blocked in web mode */
  WEB_RESTRICTED: [
    '/api/archive',      // File system operations
    '/api/app-settings', // Application settings
  ],

  /** Error message for restricted endpoints */
  ERROR_MESSAGE: 'This endpoint is not available in web deployment mode',

  /** HTTP status code for forbidden access */
  STATUS_CODE: 403,
} as const;

/**
 * Deployment Modes
 */
export const DEPLOYMENT_MODES = {
  ELECTRON: 'electron',
  WEB: 'web',
  DEVELOPMENT: 'development',
} as const;

export type DeploymentMode = typeof DEPLOYMENT_MODES[keyof typeof DEPLOYMENT_MODES];