/**
 * React Query Provider Configuration
 * Sets up QueryClient with optimal defaults for CBDB Desktop
 */

import React from 'react';
import {
  QueryClient,
  QueryClientProvider,
  QueryClientProviderProps,
  isServer
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BaseClient } from '../client/base-client';
import { CbdbClient } from '../client';

// Extend window to include our client
declare global {
  interface Window {
    cbdbClient?: CbdbClient;
  }
}

/**
 * Create a new QueryClient with CBDB-optimized defaults
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With local SQLite, data is fast - use longer stale times
        staleTime: 5 * 60 * 1000, // 5 minutes
        // Cache data for 10 minutes
        gcTime: 10 * 60 * 1000,
        // Retry failed queries once
        retry: 1,
        // Disable refetch on window focus for desktop app
        refetchOnWindowFocus: false,
        // Keep previous data while fetching new data
        keepPreviousData: true,
      },
      mutations: {
        // Show optimistic updates immediately
        retry: 0,
      },
    },
  });
}

// Singleton client for browser
let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Get or create QueryClient instance
 * - Server: Always create new instance (for SSR if needed)
 * - Browser: Reuse singleton to prevent re-creation on React suspense
 */
export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

interface CbdbQueryProviderProps {
  children: React.ReactNode;
  /**
   * Base API URL for the CBDB server
   * @default 'http://localhost:3902'
   */
  apiUrl?: string;
  /**
   * Custom QueryClient instance
   * If not provided, a default one will be created
   */
  queryClient?: QueryClient;
  /**
   * Enable React Query DevTools
   * @default true in development
   */
  enableDevtools?: boolean;
}

/**
 * CBDB Query Provider
 * Wraps the app with React Query and initializes the CBDB client
 */
export function CbdbQueryProvider({
  children,
  apiUrl = 'http://localhost:3902',
  queryClient: customQueryClient,
  enableDevtools = process.env.NODE_ENV === 'development'
}: CbdbQueryProviderProps) {
  // Get or create query client
  const queryClient = React.useMemo(
    () => customQueryClient || getQueryClient(),
    [customQueryClient]
  );

  // Initialize CBDB client and attach to window
  React.useEffect(() => {
    if (!window.cbdbClient) {
      window.cbdbClient = new CbdbClient({ baseURL: apiUrl });
    }
  }, [apiUrl]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {enableDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

/**
 * Hook to access the CBDB client
 */
export function useCbdbClient(): CbdbClient {
  if (!window.cbdbClient) {
    throw new Error(
      'CBDB Client not initialized. Make sure your app is wrapped with CbdbQueryProvider'
    );
  }
  return window.cbdbClient;
}

/**
 * Error boundary for React Query
 * Provides better error handling for data fetching
 */
export class QueryErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Query Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} />;
      }
      return (
        <div className="error-boundary">
          <h2>Something went wrong loading data.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error?.toString()}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}