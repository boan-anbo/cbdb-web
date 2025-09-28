/**
 * Error handler configuration
 * Centralized place to define how different errors should be handled
 */

import { toast } from 'sonner';

export interface ErrorHandler {
  // Matcher to identify this type of error
  matcher: (message: string) => boolean;
  // Handler function for this error type
  handle: (error: any) => void;
}

/**
 * Registry of error handlers
 * Add new error types here without modifying the core logic
 */
// Track error counts for batch reporting
let dbErrorCount = 0;
let dbErrorResetTimeout: NodeJS.Timeout | null = null;

export const errorHandlers: ErrorHandler[] = [
  {
    // Database not initialized error
    matcher: (message) => message.includes('CBDB database not initialized'),
    handle: (error) => {
      dbErrorCount++;

      // Clear previous timeout if exists
      if (dbErrorResetTimeout) {
        clearTimeout(dbErrorResetTimeout);
      }

      // Reset counter after 5 seconds of no new errors
      dbErrorResetTimeout = setTimeout(() => {
        dbErrorCount = 0;
        dbErrorResetTimeout = null;
      }, 5000);

      // Only show toast for the first error or every 10th error
      if (dbErrorCount === 1) {
        toast.error('Database Not Initialized', {
          description: 'Please extract the CBDB database first',
          action: {
            label: 'Go to Initialize',
            onClick: () => {
              // Use a custom event instead of direct navigation
              // This allows the app to handle navigation properly
              window.dispatchEvent(new CustomEvent('navigate-to', {
                detail: { path: '/database' }
              }));
            }
          },
          duration: 10000,
          id: 'db-not-initialized', // Use a fixed ID to prevent duplicate toasts
        });
      } else if (dbErrorCount % 10 === 0) {
        // Every 10 errors, update the toast with a count
        toast.error('Database Not Initialized', {
          description: `${dbErrorCount} components have tried to access the database. Please extract the database first.`,
          id: 'db-not-initialized', // This will update the existing toast
          duration: 10000,
        });
      }
    }
  },
  {
    // Network error
    matcher: (message) => message.includes('Network error') || message.includes('Failed to fetch'),
    handle: (error) => {
      toast.error('Network Error', {
        description: 'Please check your network connection',
        action: {
          label: 'Retry',
          onClick: () => window.location.reload()
        },
        duration: 7000,
      });
    }
  },
  {
    // Permission denied
    matcher: (message) => message.includes('Permission denied') || message.includes('403'),
    handle: (error) => {
      toast.error('Permission Denied', {
        description: 'You do not have permission to perform this action',
        duration: 5000,
      });
    }
  },
  {
    // Server error
    matcher: (message) => message.includes('500') || message.includes('Internal Server Error'),
    handle: (error) => {
      toast.error('Server Error', {
        description: 'The server encountered an issue. Please try again later.',
        duration: 5000,
      });
    }
  }
];

/**
 * Default error handler for unmatched errors
 */
export const defaultErrorHandler: ErrorHandler = {
  matcher: () => true,
  handle: (error) => {
    const message = error?.message || error?.response || 'An error occurred';
    toast.error(message, {
      duration: 5000,
    });
  }
};