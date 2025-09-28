/**
 * Error handler service
 * Core logic for processing errors through registered handlers
 */

import { ClientConfig } from '@cbdb/core';
import { errorHandlers, defaultErrorHandler, ErrorHandler } from './error-handlers.config';

// Track recent errors to prevent duplicate toasts
const recentErrors = new Map<string, number>();
const ERROR_DEDUP_WINDOW = 3000; // 3 seconds
const MAX_SIMILAR_ERRORS = 3; // Max number of similar errors to show in the window

/**
 * Get a normalized error key for deduplication
 */
function getErrorKey(message: string): string {
  // Extract key parts of the error message for comparison
  if (message.includes('CBDB database not initialized')) {
    return 'db-not-initialized';
  }
  if (message.includes('Network error') || message.includes('Failed to fetch')) {
    return 'network-error';
  }
  if (message.includes('Permission denied') || message.includes('403')) {
    return 'permission-denied';
  }
  if (message.includes('500') || message.includes('Internal Server Error')) {
    return 'server-error';
  }
  // For other errors, use a truncated message as key
  return message.substring(0, 50);
}

/**
 * Check if we should show this error toast
 */
function shouldShowError(message: string): boolean {
  const key = getErrorKey(message);
  const now = Date.now();

  // Clean up old entries
  for (const [k, timestamp] of recentErrors.entries()) {
    if (now - timestamp > ERROR_DEDUP_WINDOW) {
      recentErrors.delete(k);
    }
  }

  // Check if we've shown this error recently
  const lastShown = recentErrors.get(key);
  if (lastShown && now - lastShown < ERROR_DEDUP_WINDOW) {
    // Count how many times we've shown this error in the window
    let count = 0;
    for (const [k, ] of recentErrors.entries()) {
      if (k === key) count++;
    }

    if (count >= MAX_SIMILAR_ERRORS) {
      return false; // Don't show more than MAX_SIMILAR_ERRORS of the same type
    }
  }

  // Record this error
  recentErrors.set(key, now);
  return true;
}

/**
 * Process an error through the registered handlers
 */
export function processError(error: any): void {
  const message = error?.message || error?.response || '';

  // Check if we should show this error
  if (!shouldShowError(message)) {
    // Still log for debugging but don't show toast
    if (process.env.NODE_ENV === 'development') {
      console.log('[CBDB Client Error - Suppressed duplicate]:', error);
    }
    return;
  }

  // Find the first matching handler
  const handler = errorHandlers.find(h => h.matcher(message)) || defaultErrorHandler;

  // Execute the handler
  handler.handle(error);

  // Always log for debugging (in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('[CBDB Client Error]:', error);
  }
}

/**
 * Create an error handler function for the CBDB client
 */
export function createErrorHandler(): ClientConfig['onError'] {
  return processError;
}

/**
 * Register a new error handler
 * Allows runtime registration of error handlers
 */
export function registerErrorHandler(handler: ErrorHandler, priority?: 'high' | 'low'): void {
  if (priority === 'high') {
    errorHandlers.unshift(handler);
  } else {
    errorHandlers.push(handler);
  }
}

/**
 * Remove an error handler
 */
export function unregisterErrorHandler(matcher: (message: string) => boolean): void {
  const index = errorHandlers.findIndex(h => h.matcher === matcher);
  if (index !== -1) {
    errorHandlers.splice(index, 1);
  }
}