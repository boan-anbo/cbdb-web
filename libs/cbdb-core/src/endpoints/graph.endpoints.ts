/**
 * Graph API Endpoints
 * Defines preset explorer endpoints for graph visualization features
 */

import { EndpointDef } from './types';
import {
  ExploreAssociationNetworkRequest,
  ExploreDirectNetworkRequest,
  ExplorePersonNetworkRequest,
  ExploreNetworkResponse
} from '../domains/graph/messages/graph.dtos';

interface PersonIdParam {
  id: string;
}

import { API_PREFIX } from './constants';

/**
 * Preset Explorer Endpoints (Tier 2)
 * Pre-configured graph explorations for common network analysis patterns
 */
export const GraphEndpoints = {
  /** Explore a person's association network */
  exploreAssociationNetwork: {
    method: 'GET' as const,
    path: `${API_PREFIX ? '/' + API_PREFIX : ''}/people/:id/explore/association-network`,
    pathParams: ['id'] as const,
    request: {} as ExploreAssociationNetworkRequest,
    response: undefined as unknown as ExploreNetworkResponse,
    summary: 'Explore association network',
    description: 'Get a person\'s network of associations and relationships, optimized for visualization'
  } as EndpointDef<ExploreAssociationNetworkRequest, ExploreNetworkResponse, PersonIdParam>,

  /** Explore a person's direct relationships */
  exploreDirectNetwork: {
    method: 'GET' as const,
    path: `${API_PREFIX ? '/' + API_PREFIX : ''}/people/:id/explore/direct-network`,
    pathParams: ['id'] as const,
    request: {} as ExploreDirectNetworkRequest,
    response: undefined as unknown as ExploreNetworkResponse,
    summary: 'Explore direct relationships',
    description: 'Get a person\'s immediate connections including family, colleagues, and associates'
  } as EndpointDef<ExploreDirectNetworkRequest, ExploreNetworkResponse, PersonIdParam>,

  /** Explore a person's network (generic, flexible) */
  explorePersonNetwork: {
    method: 'GET' as const,
    path: `/${API_PREFIX}/people/:id/explore/network`,
    pathParams: ['id'] as const,
    request: {} as ExplorePersonNetworkRequest,
    response: undefined as unknown as ExploreNetworkResponse,
    summary: 'Explore person network',
    description: 'Flexible network exploration with configurable depth, relationship types, and filters. Showcases the full power of the graph system.'
  } as EndpointDef<ExplorePersonNetworkRequest, ExploreNetworkResponse, PersonIdParam>
} as const;

// Export type for use in client
export type GraphEndpointsType = typeof GraphEndpoints;