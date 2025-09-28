/**
 * Type-safe client for Person-Association API
 */

import { BaseClient } from './base-client';
import { AssociationEndpoints } from '../endpoints/association.endpoints';
import { PersonAssociationsResponse } from '../domains/association/messages/association.dtos';

export class PersonAssociationClient {
  constructor(private client: BaseClient) {}

  /**
   * Get person associations
   * Retrieve all associations with full relations
   * @param personId The person ID
   * @param direction Optional: 'primary' (person is c_personid), 'associated' (person is c_assoc_id), or undefined (both)
   */
  async getPersonAssociations(
    personId: number,
    direction?: 'primary' | 'associated'
  ): Promise<PersonAssociationsResponse> {
    return this.client.request(AssociationEndpoints.getPersonAssociations, {
      params: { id: personId },
      query: direction ? { direction } : undefined
    });
  }
}