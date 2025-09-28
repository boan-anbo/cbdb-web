/**
 * Health Controller API Definition
 * Centralized endpoint definitions for health monitoring
 */

export const HealthControllerAPI = {
  CONTROLLER_PATH: 'health',

  /**
   * Basic health check endpoint
   */
  CHECK: {
    relativePath: '',
    method: 'GET' as const,
    description: 'Get health status of the server'
  },

  /**
   * Simple ping endpoint for connectivity check
   */
  PING: {
    relativePath: 'ping',
    method: 'GET' as const,
    description: 'Simple ping for connectivity check'
  },

  /**
   * Detailed health information
   */
  DETAILS: {
    relativePath: 'details',
    method: 'GET' as const,
    description: 'Get detailed health information'
  }
} as const;