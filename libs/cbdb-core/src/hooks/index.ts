/**
 * React Query Hooks for CBDB
 * Export all hooks and utilities for data fetching
 */

// Person hooks
export * from './use-person';

// Provider and configuration
export * from './query-provider';

// Re-export commonly used React Query utilities
export {
  useQuery,
  useMutation,
  useQueries,
  useQueryClient,
  useIsFetching,
  useIsMutating,
  QueryClient,
  QueryClientProvider,
  // Types
  type UseQueryOptions,
  type UseMutationOptions,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';