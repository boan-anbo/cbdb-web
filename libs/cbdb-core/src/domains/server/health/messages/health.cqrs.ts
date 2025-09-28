/**
 * Health CQRS Messages - Service layer standard language
 * Queries and Results for health monitoring operations
 */

/**
 * Query for basic health check
 */
export class HealthCheckQuery {
  constructor(
    public includeDetails: boolean = false
  ) {}
}

/**
 * Result of health check operation
 */
export class HealthCheckResult {
  constructor(
    public healthy: boolean,
    public uptime: number,
    public timestamp: Date,
    public databases?: {
      cbdb: boolean;
      app: boolean;
    },
    public memoryUsage?: {
      heapUsed: number;
      heapTotal: number;
      rss: number;
    }
  ) {}
}

/**
 * Query for simple ping
 */
export class HealthPingQuery {}

/**
 * Result of ping operation
 */
export class HealthPingResult {
  constructor(
    public timestamp: Date
  ) {}
}