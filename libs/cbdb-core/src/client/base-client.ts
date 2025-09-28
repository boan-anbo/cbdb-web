/**
 * Base HTTP client for making type-safe API requests
 */

import { EndpointDef, HttpMethod } from '../endpoints/types';

export interface ClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  onRequest?: (config: RequestConfig) => void | Promise<void>;
  onResponse?: (response: Response) => void | Promise<void>;
  onError?: (error: any) => void | Promise<void>;
}

export interface RequestConfig {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
}

/**
 * Base client class for making HTTP requests
 */
export class BaseClient {
  constructor(private config: ClientConfig) {}

  /**
   * Handle HTTP error responses with better error messages
   */
  private async handleErrorResponse(response: Response, url: string, method: string): Promise<never> {
    const responseText = await response.text();

    // Parse response for structured error information
    let responseData: any;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }

    // Special handling for 404 errors
    if (response.status === 404) {
      console.error(`[CBDB Client] 404 Error - Endpoint not found: ${method} ${url}`);
      console.error(`[CBDB Client] This likely means the endpoint path is incorrect or the server controller is missing this endpoint.`);
      console.error(`[CBDB Client] Expected endpoint pattern: /api/people/... (not /api/persons/...)`);
      console.error(`[CBDB Client] Response: ${responseText}`);

      const error = new Error(
        `Endpoint not found (404): ${method} ${url}\n` +
        `The endpoint path might be incorrect. Server controllers use '/people/' not '/persons/'.`
      );
      (error as any).status = response.status;
      (error as any).statusText = response.statusText;
      (error as any).response = responseData;
      (error as any).url = url;
      throw error;
    }

    // General error handling
    console.error(`[CBDB Client] HTTP Error ${response.status}: ${method} ${url}`);
    console.error(`[CBDB Client] Response: ${responseText}`);

    const error = new Error(
      `HTTP Error ${response.status}: ${method} ${url}\n${response.statusText}`
    );
    (error as any).status = response.status;
    (error as any).statusText = response.statusText;
    (error as any).response = responseData;
    (error as any).url = url;
    (error as any).message = responseData?.message || response.statusText;
    throw error;
  }

  /**
   * Make a request based on an endpoint definition
   */
  async request<TRequest, TResponse, TParams>(
    endpoint: EndpointDef<TRequest, TResponse, TParams>,
    options?: {
      params?: TParams;
      query?: TRequest;
      body?: TRequest;
      headers?: Record<string, string>;
    }
  ): Promise<TResponse> {
    // Build URL with path params
    let url = `${this.config.baseUrl}${endpoint.path}`;
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url = url.replace(`:${key}`, String(value));
      });
    }

    // Add query params for GET requests
    if (endpoint.method === HttpMethod.GET && options?.query) {
      const queryString = this.buildQueryString(options.query);
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    // Build request config
    const requestConfig: RequestConfig = {
      url,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
        ...options?.headers
      }
    };

    // Add body for non-GET requests
    if (endpoint.method !== HttpMethod.GET && options?.body) {
      requestConfig.body = JSON.stringify(options.body);
    }

    // Call onRequest hook if provided
    if (this.config.onRequest) {
      await this.config.onRequest(requestConfig);
    }

    try {
      // Make the request
      const response = await fetch(requestConfig.url, {
        method: requestConfig.method,
        headers: requestConfig.headers,
        body: requestConfig.body
      });

      // Call onResponse hook if provided
      if (this.config.onResponse) {
        await this.config.onResponse(response);
      }

      // Check response status
      if (!response.ok) {
        await this.handleErrorResponse(response, requestConfig.url, requestConfig.method);
      }

      // Parse and return JSON response
      const data = await response.json();
      return data as TResponse;
    } catch (error) {
      // Call onError hook if provided
      if (this.config.onError) {
        await this.config.onError(error);
      }
      throw error;
    }
  }

  /**
   * Convenience method for GET requests
   */
  async get<TResponse>(
    path: string,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    const url = `${this.config.baseUrl}${path}`;

    const requestConfig: RequestConfig = {
      url,
      method: 'GET',
      headers: {
        ...this.config.headers,
        ...headers
      }
    };

    // Call onRequest hook if provided
    if (this.config.onRequest) {
      await this.config.onRequest(requestConfig);
    }

    try {
      const response = await fetch(requestConfig.url, {
        method: requestConfig.method,
        headers: requestConfig.headers
      });

      // Call onResponse hook if provided
      if (this.config.onResponse) {
        await this.config.onResponse(response);
      }

      // Check response status
      if (!response.ok) {
        await this.handleErrorResponse(response, requestConfig.url, requestConfig.method);
      }

      // Parse and return JSON response
      const data = await response.json();
      return data as TResponse;
    } catch (error) {
      // Call onError hook if provided
      if (this.config.onError) {
        await this.config.onError(error);
      }
      throw error;
    }
  }

  /**
   * Convenience method for POST requests
   */
  async post<TRequest, TResponse>(
    path: string,
    body: TRequest,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    const url = `${this.config.baseUrl}${path}`;

    const requestConfig: RequestConfig = {
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    };

    // Call onRequest hook if provided
    if (this.config.onRequest) {
      await this.config.onRequest(requestConfig);
    }

    try {
      const response = await fetch(requestConfig.url, {
        method: requestConfig.method,
        headers: requestConfig.headers,
        body: requestConfig.body
      });

      // Call onResponse hook if provided
      if (this.config.onResponse) {
        await this.config.onResponse(response);
      }

      // Check response status
      if (!response.ok) {
        await this.handleErrorResponse(response, requestConfig.url, requestConfig.method);
      }

      // Parse and return JSON response
      const data = await response.json();
      return data as TResponse;
    } catch (error) {
      // Call onError hook if provided
      if (this.config.onError) {
        await this.config.onError(error);
      }
      throw error;
    }
  }

  /**
   * Make DELETE request
   */
  async delete<TResponse>(
    path: string,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    const url = `${this.config.baseUrl}${path}`;

    const requestConfig: RequestConfig = {
      url,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
        ...headers
      }
    };

    // Call onRequest hook if provided
    if (this.config.onRequest) {
      await this.config.onRequest(requestConfig);
    }

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: requestConfig.headers
      });

      // Call onResponse hook if provided
      if (this.config.onResponse) {
        await this.config.onResponse(response);
      }

      // Check response status
      if (!response.ok) {
        await this.handleErrorResponse(response, requestConfig.url, requestConfig.method);
      }

      // Parse and return JSON response
      const data = await response.json();
      return data as TResponse;
    } catch (error) {
      // Call onError hook if provided
      if (this.config.onError) {
        await this.config.onError(error);
      }
      throw error;
    }
  }

  /**
   * Build query string from object
   */
  private buildQueryString(params: any): string {
    const entries = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    return entries.join('&');
  }
}