import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CbdbClient, cbdbClientManager } from '@cbdb/core';
import { getClientConfigWithErrorHandling } from '@/render/services/client-with-error-handling';

/**
 * Context for providing the CBDB API client throughout the app
 */
export const ApiClientContext = createContext<{
  client: CbdbClient | null;
  loading: boolean;
  error: Error | null;
  baseUrl: string | null;
}>({
  client: null,
  loading: true,
  error: null,
  baseUrl: null
});

export interface ApiClientProviderProps {
  children: ReactNode;
  /**
   * Optional loading component to show while initializing
   */
  loadingComponent?: ReactNode;
  /**
   * Optional error component to show on initialization failure
   */
  errorComponent?: (error: Error) => ReactNode;
}

/**
 * Provider component that initializes and provides the CBDB API client
 * Automatically detects the environment (Electron vs Web) and configures accordingly
 */
export function ApiClientProvider({
  children,
  loadingComponent,
  errorComponent
}: ApiClientProviderProps) {
  const [client, setClient] = useState<CbdbClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [baseUrl, setBaseUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initializeClient() {
      try {
        console.log('[ApiClientProvider] Starting client initialization...');

        // Get client configuration with error handling
        const config = await getClientConfigWithErrorHandling();
        console.log('[ApiClientProvider] Got client config:', { baseUrl: config.baseUrl });

        // Initialize the client manager with our error handling configuration
        await cbdbClientManager.initialize(config);
        console.log('[ApiClientProvider] Client manager initialized');

        if (!mounted) return;

        // Get the initialized client
        const apiClient = cbdbClientManager.getClient();
        const url = cbdbClientManager.getBaseUrl();

        setClient(apiClient);
        setBaseUrl(url);
        setError(null);

        console.log(`[ApiClientProvider] ✅ Client ready with baseUrl: ${url}`);
      } catch (err) {
        if (!mounted) return;

        const error = err instanceof Error ? err : new Error(String(err));
        console.error('Failed to initialize CBDB API client:', error);
        setError(error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initializeClient();

    return () => {
      mounted = false;
    };
  }, []);

  // Show loading state
  if (loading) {
    return (
      <>
        {loadingComponent || (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            Initializing API client...
          </div>
        )}
      </>
    );
  }

  // Show error state
  if (error && !client) {
    return (
      <>
        {errorComponent ? (
          errorComponent(error)
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
            Failed to initialize API client: {error.message}
          </div>
        )}
      </>
    );
  }

  return (
    <ApiClientContext.Provider value={{ client, loading, error, baseUrl }}>
      {children}
    </ApiClientContext.Provider>
  );
}

/**
 * Hook to access the CBDB API client
 * Throws if used outside of ApiClientProvider
 */
export function useApiClient(): CbdbClient {
  const { client, loading, error } = useContext(ApiClientContext);

  if (!client && !loading && !error) {
    throw new Error(
      'useApiClient must be used within ApiClientProvider'
    );
  }

  if (loading) {
    throw new Error('API client is still initializing');
  }

  if (error) {
    throw error;
  }

  if (!client) {
    throw new Error('API client not available');
  }

  return client;
}

/**
 * Hook to get the full API client context including loading and error states
 */
export function useApiClientContext() {
  return useContext(ApiClientContext);
}

/**
 * Hook to get server information
 */
export function useServerInfo() {
  const { client } = useApiClientContext();
  const [serverInfo, setServerInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!client) return;

    let mounted = true;

    async function fetchInfo() {
      try {
        setLoading(true);
        const info = await client.serverInfo.getInfo();

        if (mounted) {
          setServerInfo(info);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchInfo();

    return () => {
      mounted = false;
    };
  }, [client]);

  return { serverInfo, loading, error };
}