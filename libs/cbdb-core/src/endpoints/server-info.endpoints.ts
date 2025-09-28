/**
 * Server Info endpoint definitions for type-safe API client
 */

import { HttpMethod, EndpointDef } from './types';
import { API_PREFIX } from './constants';
import {
  ServerInfoRequest,
  ServerInfoResponse
} from '../domains/server/server-info/messages/server-info.dtos';

export const ServerInfoEndpoints = {
  /** Get server runtime information */
  getInfo: {
    method: HttpMethod.GET,
    path: `/${API_PREFIX}/server/info`,
    request: {} as ServerInfoRequest,
    response: undefined as unknown as ServerInfoResponse,
    summary: 'Get server runtime information',
    description: 'Get server port, URLs, uptime, and deployment information'
  } as EndpointDef<ServerInfoRequest, ServerInfoResponse>
} as const;