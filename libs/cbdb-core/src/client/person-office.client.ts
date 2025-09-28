/**
 * Type-safe client for Person-Office API
 */

import { BaseClient } from './base-client';
import { OfficeEndpoints } from '../endpoints/office.endpoints';
import { PersonOfficesResponse } from '../domains/office/messages/office.dtos';

export class PersonOfficeClient {
  constructor(private client: BaseClient) {}

  /**
   * Get person office appointments
   * Retrieve all office appointments with full relations
   */
  async getPersonOffices(personId: number): Promise<PersonOfficesResponse> {
    return this.client.request(OfficeEndpoints.getPersonOffices, {
      params: { id: personId }
    });
  }
}