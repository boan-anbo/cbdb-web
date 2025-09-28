/**
 * Person Geographic Endpoint Definitions
 * Defines REST API endpoints for person geographic operations
 */

import { HttpMethod, EndpointDef } from './types';
import { API_PREFIX } from './constants';
import {
  GetGeographicFootprintRequest,
  GetGeographicFootprintResponse,
  ExploreGeographicNetworkRequest,
  ExploreGeographicNetworkResponse,
  FindPeopleByProximityRequest,
  FindPeopleByProximityResponse
} from '../domains/geographic/messages/geographic.dtos';

// Parameter type definitions
interface GeographicPersonIdParam {
  id: number;
}

/**
 * Person Geographic API endpoint definitions
 * Single source of truth for geographic-related endpoints
 */
export const PersonGeographicEndpoints = {
  /** Get a person's geographic footprint */
  getGeographicFootprint: {
    method: HttpMethod.GET,
    path: `/${API_PREFIX}/people/:id/geographic/footprint`,
    request: undefined as unknown as GetGeographicFootprintRequest,
    response: undefined as unknown as GetGeographicFootprintResponse,
    summary: 'Get geographic footprint for a person',
    description: 'Retrieve all addresses with coordinates for map visualization'
  } as EndpointDef<GetGeographicFootprintRequest, GetGeographicFootprintResponse, GeographicPersonIdParam>,

  /** Explore a person's geographic network */
  exploreGeographicNetwork: {
    method: HttpMethod.POST,
    path: `/${API_PREFIX}/people/:id/geographic/network`,
    request: undefined as unknown as ExploreGeographicNetworkRequest,
    response: undefined as unknown as ExploreGeographicNetworkResponse,
    summary: 'Explore geographic network',
    description: 'Combine social network with geographic visualization'
  } as EndpointDef<ExploreGeographicNetworkRequest, ExploreGeographicNetworkResponse, GeographicPersonIdParam>,

  /** Find people within geographic proximity */
  findPeopleByProximity: {
    method: HttpMethod.POST,
    path: `/${API_PREFIX}/people/geographic/proximity`,
    request: undefined as unknown as FindPeopleByProximityRequest,
    response: undefined as unknown as FindPeopleByProximityResponse,
    summary: 'Find people by proximity',
    description: 'Find people within geographic proximity'
  } as EndpointDef<FindPeopleByProximityRequest, FindPeopleByProximityResponse>
};

/**
 * Person Geographic Controller API Endpoints (alternative format for controllers)
 * Used by PersonGeographicController with @Controller decorator
 */
export const PersonGeographicControllerAPI = {
  // Controller base path - used with @Controller decorator
  CONTROLLER_PATH: 'people',

  // Individual endpoints - relative to controller path
  GET_GEOGRAPHIC_FOOTPRINT: {
    relativePath: ':id/geographic/footprint',
    summary: 'Get geographic footprint for a person',
    description: 'Retrieve all addresses with coordinates for map visualization',
    request: undefined as unknown as GetGeographicFootprintRequest,
    response: undefined as unknown as GetGeographicFootprintResponse,
  },

  EXPLORE_GEOGRAPHIC_NETWORK: {
    relativePath: ':id/geographic/network',
    summary: 'Explore geographic network',
    description: 'Combine social network with geographic visualization',
    request: undefined as unknown as ExploreGeographicNetworkRequest,
    response: undefined as unknown as ExploreGeographicNetworkResponse,
  },

  FIND_PEOPLE_BY_PROXIMITY: {
    relativePath: 'geographic/proximity',
    summary: 'Find people by proximity',
    description: 'Find people within geographic proximity',
    request: undefined as unknown as FindPeopleByProximityRequest,
    response: undefined as unknown as FindPeopleByProximityResponse,
  }
} as const;