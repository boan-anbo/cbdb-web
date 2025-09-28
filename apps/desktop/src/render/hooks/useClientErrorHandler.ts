/**
 * Hook to initialize CBDB client with global error handling
 * This keeps the error handling logic separate from the main providers
 */

import { useEffect } from 'react';
import { cbdbClientManager } from '@cbdb/core';
import { getClientConfigWithErrorHandling } from '@/render/services/client-with-error-handling';

/**
 * Initialize the CBDB client with error handling
 * This should be called once at the app root level
 */
export function useClientErrorHandler() {
  useEffect(() => {
    let mounted = true;

    const initializeClient = async () => {
      try {
        // Skip if already initialized
        if (cbdbClientManager.isInitialized()) {
          return;
        }

        // Get configuration with error handling
        const config = await getClientConfigWithErrorHandling();

        // Initialize the client manager with error handling
        await cbdbClientManager.initialize(config);

        if (mounted) {
          console.log('CBDB client initialized with error handling');
        }
      } catch (error) {
        console.error('Failed to initialize CBDB client with error handling:', error);
        // Don't throw - let the app continue and handle errors as they occur
      }
    };

    initializeClient();

    return () => {
      mounted = false;
    };
  }, []); // Run once on mount
}