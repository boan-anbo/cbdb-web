/**
 * Health endpoint definitions for type-safe API client
 */

import { HttpMethod, EndpointDef } from './types';
import { HealthControllerAPI } from './health.controller-api';
import { API_PREFIX } from './constants';
import {
  HealthCheckResponse,
  PingResponse,
  HealthInfoRequest
} from '../domains/server/health/messages/health.dtos';

export const HealthEndpoints = {
  /** Basic health check */
  checkHealth: {
    method: HttpMethod.GET,
    path: `/${API_PREFIX}/${HealthControllerAPI.CONTROLLER_PATH}`,
    request: undefined,
    response: undefined as unknown as HealthCheckResponse,
    summary: 'Check health status',
    description: 'Get basic health status of the server'
  } as EndpointDef<void, HealthCheckResponse>,

  /** Simple ping for connectivity */
  ping: {
    method: HttpMethod.GET,
    path: `/${API_PREFIX}/${HealthControllerAPI.CONTROLLER_PATH}/${HealthControllerAPI.PING.relativePath}`,
    request: undefined,
    response: undefined as unknown as PingResponse,
    summary: 'Ping server',
    description: 'Simple ping for connectivity check'
  } as EndpointDef<void, PingResponse>,

  /** Get detailed health information */
  getDetails: {
    method: HttpMethod.GET,
    path: `/${API_PREFIX}/${HealthControllerAPI.CONTROLLER_PATH}/${HealthControllerAPI.DETAILS.relativePath}`,
    request: {} as HealthInfoRequest,
    response: undefined as unknown as HealthCheckResponse,
    summary: 'Get detailed health info',
    description: 'Get detailed health information with optional service and resource status'
  } as EndpointDef<HealthInfoRequest, HealthCheckResponse>
} as const;