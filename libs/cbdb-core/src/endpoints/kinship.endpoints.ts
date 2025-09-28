/**
 * Kinship Endpoints Definition
 * Centralized endpoint definitions for kinship-related operations
 */

import { EndpointDef, HttpMethod } from './types';
import { API_PREFIX } from './constants';
import { KinshipCodesResponse, KinshipCodeResponse, PersonKinshipsResponse } from '../domains/kinship/messages/kinship.dtos';

export const KinshipEndpoints = {
  /**
   * Get all kinship codes for caching
   */
  getAllKinshipCodes: {
    path: `/${API_PREFIX}/kinship/codes`,
    method: HttpMethod.GET,
    response: {} as KinshipCodesResponse,
    description: 'Retrieve all kinship code mappings for frontend caching'
  } as EndpointDef<void, KinshipCodesResponse>,

  /**
   * Get a specific kinship code by ID
   */
  getKinshipCode: {
    path: `/${API_PREFIX}/kinship/codes/:code`,
    method: HttpMethod.GET,
    response: {} as KinshipCodeResponse,
    description: 'Get a specific kinship code mapping by code ID'
  } as EndpointDef<void, KinshipCodeResponse, { code: number }>,

  /**
   * Get kinships for a person
   */
  getPersonKinships: {
    path: `/${API_PREFIX}/people/:id/kinships`,
    method: HttpMethod.GET,
    response: {} as PersonKinshipsResponse,
    description: 'Get all kinship relations for a person'
  } as EndpointDef<void, PersonKinshipsResponse, { id: number }>
} as const;