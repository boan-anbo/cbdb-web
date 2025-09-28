/**
 * Health DTOs - HTTP layer contracts for health monitoring
 * Requests and Responses for health check API communication
 */

import { IsBoolean, IsOptional } from 'class-validator';

/**
 * Health check response with service status
 */
export class HealthCheckResponse {
  constructor(
    public status: 'ok' | 'error',
    public timestamp: Date,
    public uptime: number,
    public environment: string,
    public version?: string,
    public services?: {
      cbdbDatabase?: {
        status: 'connected' | 'disconnected';
        path?: string;
        size?: number;
        tables?: number;
      };
      appDatabase?: {
        status: 'connected' | 'disconnected';
        path?: string;
      };
    },
    public resources?: {
      memory?: {
        used: number;
        total: number;
        percentage: number;
      };
      cpu?: {
        usage: number;
      };
    }
  ) {}
}

/**
 * Simple ping response for basic connectivity check
 */
export class PingResponse {
  constructor(
    public status: 'pong',
    public timestamp: Date
  ) {}
}

/**
 * Detailed health info request
 * Can optionally request specific service checks
 */
export class HealthInfoRequest {
  @IsOptional()
  @IsBoolean()
  includeServices?: boolean;

  @IsOptional()
  @IsBoolean()
  includeResources?: boolean;

  constructor(data?: HealthInfoRequest) {
    if (data) {
      this.includeServices = data.includeServices;
      this.includeResources = data.includeResources;
    }
  }
}