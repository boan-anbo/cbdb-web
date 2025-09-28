/**
 * CBDB Desktop Controller API Definitions
 * Type-safe controller path and method definitions
 */

import { HttpMethod } from './types';

/**
 * Controller path definition with type safety
 */
export interface ControllerPath<TParams = any, TQuery = any, TBody = any, TReturn = any> {
  /** Full path including base route (e.g., '/api/people/search') */
  fullPath: string;
  /** Relative path within controller (e.g., 'search') */
  relativePath: string;
  /** HTTP method */
  method: HttpMethod;
  /** Controller method name */
  methodName: string;
  /** URL parameters type */
  parameters?: TParams;
  /** Query parameters type */
  query?: TQuery;
  /** Request body type */
  body?: TBody;
  /** Return type */
  returnType?: TReturn;
}

/**
 * Controller API definition structure
 */
export interface ControllerAPI {
  /** Base path for the controller */
  BASE_PATH: string;
  /** Root endpoint */
  ROOT: ControllerPath;
  /** All endpoints as const */
  [key: string]: ControllerPath | string;
}

/**
 * Helper to create type-safe controller paths
 */
export function defineControllerAPI<T extends ControllerAPI>(api: T): Readonly<T> {
  return Object.freeze(api);
}

/**
 * Helper to build full path from base and relative
 */
export function buildPath(basePath: string, relativePath: string): string {
  if (relativePath === '' || relativePath === '/') {
    return basePath;
  }
  const base = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  const relative = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${base}${relative}`;
}