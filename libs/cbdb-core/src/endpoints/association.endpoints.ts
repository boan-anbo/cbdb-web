import { HttpMethod, EndpointDef } from './types';
import { API_PREFIX } from './constants';
import { PersonAssociationsResponse } from '../domains/association/messages/association.dtos';

// Parameter type definitions
interface PersonIdParam {
  id: number;
}

// Query type definitions
interface AssociationDirectionQuery {
  direction?: 'primary' | 'associated';
}

/**
 * Association API endpoint definitions
 * Single source of truth for association-related endpoints
 */
export const AssociationEndpoints = {
  /** Get person associations */
  getPersonAssociations: {
    method: HttpMethod.GET,
    path: `/${API_PREFIX}/people/:id/associations`,
    params: {} as PersonIdParam,
    response: undefined as unknown as PersonAssociationsResponse,
    summary: 'Get person associations',
    description: 'Retrieve all associations for a person with full relations (associated persons, kinship info, locations, dates, etc.)'
  } as EndpointDef<AssociationDirectionQuery, PersonAssociationsResponse, PersonIdParam>,
};