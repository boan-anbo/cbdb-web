/**
 * Type-safe client for Server API (health, status, etc.)
 */

import { BaseClient } from './base-client';
import { HealthEndpoints } from '../endpoints/health.endpoints';
import {
  HealthCheckResponse,
  HealthInfoRequest,
  PingResponse
} from '../domains/server/health/messages/health.dtos';

export class ServerClient {
  constructor(private client: BaseClient) {}

  /**
   * Basic health check
   */
  async checkHealth(): Promise<HealthCheckResponse> {
    return this.client.request(HealthEndpoints.checkHealth);
  }

  /**
   * Simple ping for connectivity
   */
  async ping(): Promise<PingResponse> {
    return this.client.request(HealthEndpoints.ping);
  }

  /**
   * Get detailed health information
   */
  async getHealthDetails(request?: HealthInfoRequest): Promise<HealthCheckResponse> {
    return this.client.request(HealthEndpoints.getDetails, request ? {
      query: request
    } : undefined);
  }
}