/**
 * Core types for endpoint definitions
 */

export const HttpMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
} as const;

export type HttpMethod = typeof HttpMethod[keyof typeof HttpMethod];

/**
 * Endpoint definition structure
 */
export interface EndpointDef<TRequest = any, TResponse = any, TParams = any> {
  /** The HTTP method for this endpoint */
  method: HttpMethod;
  /** The path pattern for this endpoint (e.g., '/api/people/:id') */
  path: string;
  /** Request type (for body or query params) */
  request?: TRequest;
  /** Response type */
  response: TResponse;
  /** URL params type (e.g., { id: number } for ':id') */
  params?: TParams;
  /** Description for documentation */
  description?: string;
  /** Summary for documentation */
  summary?: string;
}

/**
 * Collection of related endpoints
 */
export type EndpointGroup = {
  [key: string]: EndpointDef;
};

/**
 * Type helper to extract request type from endpoint
 */
export type EndpointRequest<T> = T extends EndpointDef<infer R, any, any> ? R : never;

/**
 * Type helper to extract response type from endpoint
 */
export type EndpointResponse<T> = T extends EndpointDef<any, infer R, any> ? R : never;

/**
 * Type helper to extract params type from endpoint
 */
export type EndpointParams<T> = T extends EndpointDef<any, any, infer P> ? P : never;