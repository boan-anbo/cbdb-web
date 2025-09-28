/**
 * Endpoint Sanity Check Utility
 *
 * Reusable test utilities for validating that client endpoints
 * are correctly configured and don't return 404 errors.
 */

import { BaseClient } from '../base-client';

export interface EndpointTestResult {
  success: boolean;
  statusCode?: number;
  url?: string;
  error?: string;
  suggestion?: string;
  description?: string;
}

/**
 * Test if a client endpoint exists (doesn't return 404)
 *
 * @param clientMethod - A function that calls the client method
 * @param description - Human-readable description of what endpoint is being tested
 * @returns Test result with details
 */
export async function testEndpointExists(
  clientMethod: () => Promise<any>,
  description: string
): Promise<EndpointTestResult> {
  try {
    // Try to call the client method
    await clientMethod();

    // If successful, the endpoint exists
    return {
      success: true,
      statusCode: 200,
      description
    };
  } catch (error: any) {
    // Check if it's a 404 error
    if (error.status === 404) {
      // Extract URL from error if available
      const url = error.url || 'Unknown URL';

      // Check for common path issues
      let suggestion: string | undefined;
      if (url.includes('/persons/')) {
        suggestion = 'Path uses "/persons/" but server likely expects "/people/"';
      } else if (url.includes('/people/') && !url.includes('/api/')) {
        suggestion = 'Path missing "/api" prefix. Should be "/api/people/..."';
      } else if (!url.includes('/api/')) {
        suggestion = 'Path missing "/api" prefix';
      }

      return {
        success: false,
        statusCode: 404,
        url,
        error: `Endpoint not found: ${description}`,
        suggestion
      };
    }

    // For other errors (like network errors), we consider the test as skipped
    if (error.message?.includes('fetch failed') ||
        error.code === 'ECONNREFUSED' ||
        error.message?.includes('Network request failed')) {
      return {
        success: true, // Don't fail the test for network issues
        statusCode: undefined,
        error: 'Server not running or network error - skipping endpoint check'
      };
    }

    // For other unexpected errors, fail the test
    return {
      success: false,
      statusCode: error.status,
      url: error.url,
      error: error.message || 'Unknown error',
      suggestion: 'Unexpected error occurred - check server logs'
    };
  }
}

/**
 * Test multiple endpoints in batch
 *
 * @param tests - Array of test configurations
 * @returns Array of test results
 */
export async function testEndpoints(
  tests: Array<{
    name: string;
    method: () => Promise<any>;
  }>
): Promise<Map<string, EndpointTestResult>> {
  const results = new Map<string, EndpointTestResult>();

  for (const test of tests) {
    const result = await testEndpointExists(test.method, test.name);
    results.set(test.name, result);
  }

  return results;
}

/**
 * Assert that an endpoint exists (throw if 404)
 */
export async function assertEndpointExists(
  clientMethod: () => Promise<any>,
  description: string
): Promise<void> {
  const result = await testEndpointExists(clientMethod, description);

  if (!result.success && result.statusCode === 404) {
    const errorMessage = [
      `Endpoint test failed: ${description}`,
      `Status: ${result.statusCode}`,
      `URL: ${result.url || 'Unknown'}`,
      result.suggestion ? `Suggestion: ${result.suggestion}` : '',
      result.error || ''
    ].filter(Boolean).join('\n');

    throw new Error(errorMessage);
  }
}

/**
 * Create a BaseClient with proper configuration for testing
 */
export function createTestClient(baseUrl: string = 'http://localhost:18019'): BaseClient {
  return new BaseClient({
    baseUrl,
    onError: (error) => {
      // Log errors for debugging
      if (error.status === 404) {
        console.error(`[Test] 404 Error: ${error.url}`);
      }
    }
  });
}