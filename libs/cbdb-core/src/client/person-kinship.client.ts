/**
 * Type-safe client for Person-Kinship API
 */

import { BaseClient } from './base-client';
import { KinshipEndpoints } from '../endpoints/kinship.endpoints';
import { PersonKinshipsResponse } from '../domains/kinship/messages/kinship.dtos';

export class PersonKinshipClient {
  constructor(private client: BaseClient) {}

  /**
   * Get person kinships
   * Retrieve all kinship relations for a person
   * @param personId The person ID
   */
  async getPersonKinships(
    personId: number
  ): Promise<PersonKinshipsResponse> {
    return this.client.request(KinshipEndpoints.getPersonKinships, {
      params: { id: personId }
    });
  }
}