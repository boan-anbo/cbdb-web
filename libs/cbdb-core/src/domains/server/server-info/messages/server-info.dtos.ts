/**
 * Server Info DTOs - HTTP layer contracts for server runtime information
 * Requests and Responses for server info API communication
 */

import { IsOptional, IsBoolean } from 'class-validator';

/**
 * Server runtime information response
 */
export class ServerInfoResponse {
  constructor(
    public port: number,
    public baseUrl: string,
    public apiUrl: string,
    public startTime: Date,
    public uptime: number,
    public deployment: 'electron' | 'web' | 'development',
    public version: string,
    public environment?: string,
    public features?: {
      archiveEnabled: boolean;
      docsEnabled: boolean;
      ipcEnabled: boolean;
    },
    public database?: {
      isInitialized: boolean;
      location?: string;
    }
  ) {}
}

/**
 * Request for server info with optional details
 */
export class ServerInfoRequest {
  @IsOptional()
  @IsBoolean()
  includeFeatures?: boolean;

  constructor(data?: ServerInfoRequest) {
    if (data) {
      this.includeFeatures = data.includeFeatures;
    }
  }
}