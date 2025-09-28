/**
 * Type-safe client for Server Info API
 */

import { BaseClient } from './base-client';
import { ServerInfoEndpoints } from '../endpoints/server-info.endpoints';
import {
  ServerInfoRequest,
  ServerInfoResponse
} from '../domains/server/server-info/messages/server-info.dtos';

export class ServerInfoClient {
  constructor(private client: BaseClient) {}

  /**
   * Get server runtime information
   */
  async getInfo(request?: ServerInfoRequest): Promise<ServerInfoResponse> {
    return this.client.request(ServerInfoEndpoints.getInfo, request ? {
      query: request
    } : undefined);
  }
}