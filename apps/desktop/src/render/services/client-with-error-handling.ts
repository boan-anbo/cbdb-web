/**
 * CBDB Client with global error handling using toast notifications
 */

import { CbdbClientFactory, ClientConfig } from '@cbdb/core';
import { createErrorHandler } from './error-handling/error-handler.service';
import { getDeploymentMode } from '@/render/utils/deployment';

/**
 * Get client configuration with error handling
 * This function determines the base URL based on environment
 * and attaches the modular error handler
 */
export async function getClientConfigWithErrorHandling(): Promise<ClientConfig> {
  // Check if we're in Electron environment
  if (typeof window !== 'undefined' && window.electronAPI) {
    let baseUrl: string | null = null;
    const maxRetries = 3;
    const retryDelay = 500; // ms

    // Try to get the server URL with retry logic
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        baseUrl = await window.electronAPI.getServerUrl();
        if (baseUrl) {
          console.log(`✅ Got server URL on attempt ${attempt}: ${baseUrl}`);
          break;
        }
      } catch (error) {
        console.warn(`Attempt ${attempt}/${maxRetries} failed:`, error);
      }

      // Wait before retrying (except on last attempt)
      if (attempt < maxRetries && !baseUrl) {
        console.log(`Waiting ${retryDelay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    // If we still don't have a URL, throw a descriptive error
    if (!baseUrl) {
      const error = new Error(
        `Failed to get server URL after ${maxRetries} attempts. ` +
        'The server may not be started yet or there may be an IPC communication issue.'
      );
      console.error(error);
      throw error;
    }

    console.log(`Creating client config with error handling for Electron: ${baseUrl}`);

    return {
      baseUrl,
      onError: createErrorHandler(),
    };
  }

  // Determine URL based on deployment mode
  const deploymentMode = getDeploymentMode();
  let baseUrl: string;

  if (deploymentMode === 'web') {
    // Production web deployment - use path that matches Caddy routing
    // Caddy expects /cbdb/api/* and strips /cbdb, keeping /api for backend
    baseUrl = '/cbdb';
    console.log('[ClientConfig] 🌐 Web deployment detected, using production URL:', baseUrl);
  } else {
    // Development or Storybook - use localhost
    baseUrl = 'http://localhost:18019';
    console.log(`[ClientConfig] 💻 Development mode detected, using localhost:`, baseUrl);
  }

  console.log('[ClientConfig] Final configuration:', { deploymentMode, baseUrl });

  return {
    baseUrl,
    onError: createErrorHandler(),
  };
}

/**
 * Create a CBDB client with error handling for Electron
 */
export async function createClientWithErrorHandling() {
  const config = await getClientConfigWithErrorHandling();
  return CbdbClientFactory.createWithConfig(config);
}

/**
 * Create a CBDB client with error handling for web deployment
 */
export function createWebClientWithErrorHandling(baseUrl: string) {
  return CbdbClientFactory.createWithConfig({
    baseUrl,
    onError: createErrorHandler(),
  });
}