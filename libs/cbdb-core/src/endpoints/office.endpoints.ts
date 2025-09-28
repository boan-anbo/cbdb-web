import { HttpMethod, EndpointDef } from './types';
import { API_PREFIX } from './constants';
import { PersonOfficesResponse } from '../domains/office/messages/office.dtos';

// Parameter type definitions
interface PersonIdParam {
  id: number;
}

/**
 * Office API endpoint definitions
 * Single source of truth for office-related endpoints
 */
export const OfficeEndpoints = {
  /** Get person office appointments */
  getPersonOffices: {
    method: HttpMethod.GET,
    path: `/${API_PREFIX}/people/:id/offices`,
    params: {} as PersonIdParam,
    response: undefined as unknown as PersonOfficesResponse,
    summary: 'Get person office appointments',
    description: 'Retrieve all office appointments for a person with full relations (office names, locations, appointment types, etc.)'
  } as EndpointDef<void, PersonOfficesResponse, PersonIdParam>,
};