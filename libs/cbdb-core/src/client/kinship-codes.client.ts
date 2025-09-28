/**
 * Type-safe client for Kinship Codes API
 */

import { BaseClient } from './base-client';
import { KinshipEndpoints } from '../endpoints/kinship.endpoints';
import { KinshipCodesResponse } from '../domains/kinship/messages/kinship.dtos';

export class KinshipCodesClient {
  constructor(private client: BaseClient) {}

  /**
   * Get all kinship codes for caching
   * Returns all kinship code mappings for frontend context
   */
  async getAllKinshipCodes(): Promise<KinshipCodesResponse> {
    return this.client.request(KinshipEndpoints.getAllKinshipCodes);
  }
}