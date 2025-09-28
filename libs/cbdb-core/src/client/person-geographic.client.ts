/**
 * Client for Person Geographic API endpoints
 *
 * Provides methods for geographic data operations including footprint,
 * network exploration, and proximity searches.
 */

import { BaseClient } from './base-client';
import { PersonGeographicEndpoints } from '../endpoints/person-geographic.endpoints';
import {
  GetGeographicFootprintRequest,
  GetGeographicFootprintResponse,
  ExploreGeographicNetworkRequest,
  ExploreGeographicNetworkResponse,
  FindPeopleByProximityRequest,
  FindPeopleByProximityResponse
} from '../domains/geographic/messages/geographic.dtos';

export class PersonGeographicClient {
  constructor(private readonly client: BaseClient) {}

  /**
   * Get a person's geographic footprint
   * Returns all addresses with coordinates for map visualization
   */
  async getGeographicFootprint(
    personId: number,
    options?: Omit<GetGeographicFootprintRequest, 'personId'>
  ): Promise<GetGeographicFootprintResponse> {
    // Build path from endpoint definition
    const path = PersonGeographicEndpoints.getGeographicFootprint.path.replace(':id', personId.toString());

    // Build query params
    const params = new URLSearchParams();
    if (options?.startYear) params.append('startYear', options.startYear.toString());
    if (options?.endYear) params.append('endYear', options.endYear.toString());
    if (options?.addressTypes) {
      options.addressTypes.forEach(type => params.append('addressTypes', type.toString()));
    }
    if (options?.includeCoordinates !== undefined) {
      params.append('includeCoordinates', options.includeCoordinates.toString());
    }

    const queryString = params.toString();
    const fullPath = queryString ? `${path}?${queryString}` : path;

    return this.client.get<GetGeographicFootprintResponse>(fullPath);
  }

  /**
   * Explore a person's geographic network
   * Combines social network with geographic visualization
   */
  async exploreGeographicNetwork(
    personId: number,
    options?: Omit<ExploreGeographicNetworkRequest, 'personId'>
  ): Promise<ExploreGeographicNetworkResponse> {
    // Build path from endpoint definition
    const path = PersonGeographicEndpoints.exploreGeographicNetwork.path.replace(':id', personId.toString());

    const body: ExploreGeographicNetworkRequest = {
      networkDepth: options?.networkDepth || 1,
      relationTypes: options?.relationTypes,
      proximityRadius: options?.proximityRadius,
      startYear: options?.startYear,
      endYear: options?.endYear
    };
    return this.client.post<ExploreGeographicNetworkRequest, ExploreGeographicNetworkResponse>(
      path,
      body
    );
  }

  /**
   * Find people within geographic proximity
   * Useful for finding people in the same region
   */
  async findPeopleByProximity(
    request: FindPeopleByProximityRequest
  ): Promise<FindPeopleByProximityResponse> {
    // Get path from endpoint definition
    const path = PersonGeographicEndpoints.findPeopleByProximity.path;

    return this.client.post<FindPeopleByProximityRequest, FindPeopleByProximityResponse>(
      path,
      request
    );
  }
}