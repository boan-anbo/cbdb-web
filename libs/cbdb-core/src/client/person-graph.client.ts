/**
 * PersonGraphClient - Client for person graph/network operations
 *
 * Handles all graph-related API calls for person network exploration,
 * including kinship networks, association networks, and multi-person analysis.
 */

import { BaseClient } from './base-client';
import {
  NetworkExplorationOptions,
  NetworkExplorationResponse,
  AssociationNetworkOptions,
  DirectNetworkOptions,
  MultiPersonNetworkOptions,
  MultiPersonNetworkResponse
} from '../domains/graph';
import { API_PREFIX } from '../endpoints/constants';

/**
 * Client for person graph/network operations
 */
export class PersonGraphClient {
  constructor(private client: BaseClient) { }
  /**
   * Explore network around a single person
   * @param personId - The person ID to explore from
   * @param options - Network exploration options
   */
  async exploreNetwork(
    personId: number,
    options?: NetworkExplorationOptions
  ): Promise<NetworkExplorationResponse> {
    const params = new URLSearchParams();

    if (options?.depth) params.append('depth', options.depth.toString());

    // Convert boolean flags to relationTypes array
    const relationTypes: string[] = [];
    if (options?.includeKinship !== false) relationTypes.push('kinship');
    if (options?.includeAssociation !== false) relationTypes.push('association');
    if (options?.includeOffice === true) relationTypes.push('office'); // Default false for office

    // Only add relationTypes if it's not all three (which is the default)
    if (relationTypes.length > 0 && relationTypes.length < 3) {
      relationTypes.forEach(type => params.append('relationTypes', type));
    } else if (relationTypes.length === 3) {
      // If all three are included, don't send the parameter (server default is all)
    }

    if (options?.maxNodes) params.append('maxNodes', options.maxNodes.toString());
    if (options?.dynastyCode) params.append('dynastyCode', options.dynastyCode.toString());
    if (options?.yearRange?.start) params.append('yearStart', options.yearRange.start.toString());
    if (options?.yearRange?.end) params.append('yearEnd', options.yearRange.end.toString());

    return this.client.get(`/${API_PREFIX}/people/${personId}/explore/network?${params.toString()}`);
  }

  /**
   * Explore association network around a person
   * @param personId - The person ID
   * @param options - Association network options
   */
  async exploreAssociationNetwork(
    personId: number,
    options?: AssociationNetworkOptions
  ): Promise<NetworkExplorationResponse> {
    const params = new URLSearchParams();

    if (options?.depth) params.append('depth', options.depth.toString());
    if (options?.associationTypes?.length) {
      params.append('types', options.associationTypes.join(','));
    }
    if (options?.includeReciprocal !== undefined) {
      params.append('includeReciprocal', options.includeReciprocal.toString());
    }

    return this.client.get(`/${API_PREFIX}/people/${personId}/explore/association-network?${params.toString()}`);
  }

  /**
   * Explore direct network connections
   * @param personId - The person ID
   * @param options - Direct network options
   */
  async exploreDirectNetwork(
    personId: number,
    options?: DirectNetworkOptions
  ): Promise<NetworkExplorationResponse> {
    const params = new URLSearchParams();

    if (options?.directOnly !== undefined) {
      params.append('directOnly', options.directOnly.toString());
    }
    if (options?.relationshipTypes?.length) {
      params.append('types', options.relationshipTypes.join(','));
    }

    return this.client.get(`/${API_PREFIX}/people/${personId}/explore/direct-network?${params.toString()}`);
  }

  /**
   * Build multi-person network analysis
   * @param personIds - Array of person IDs to analyze
   * @param options - Multi-person network options
   */
  async buildMultiPersonNetwork(
    personIds: number[],
    options?: MultiPersonNetworkOptions
  ): Promise<MultiPersonNetworkResponse> {
    return this.client.post(`/${API_PREFIX}/people/network/multi-person`, {
      personIds,
      ...options
    });
  }

  /**
   * Explore kinship network (family tree) around a person
   * @param personId - The person ID
   * @param depth - How many generations to explore (default: 1)
   */
  async exploreKinshipNetwork(
    personId: number,
    depth: number = 1
  ): Promise<NetworkExplorationResponse> {
    const params = new URLSearchParams();
    params.append('depth', depth.toString());

    // Use the dedicated kinship-network endpoint
    return this.client.get(`/${API_PREFIX}/people/${personId}/kinship-network?${params.toString()}`);
  }

  /**
   * Get suggested persons for network exploration
   * @param query - Search query
   * @param limit - Maximum results
   */
  async searchPersonsForNetwork(
    query: string,
    limit: number = 10
  ): Promise<Array<{ id: number; name: string; nameChn?: string; dynasty?: string }>> {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', limit.toString());

    return this.client.get(`/${API_PREFIX}/people/search/network?${params.toString()}`);
  }

  /**
   * Get network statistics for a person
   * @param personId - The person ID
   */
  async getNetworkStats(personId: number): Promise<{
    kinshipCount: number;
    associationCount: number;
    officeCount: number;
    totalConnections: number;
    networkDensity?: number;
  }> {
    return this.client.get(`/${API_PREFIX}/people/${personId}/network/stats`);
  }
}