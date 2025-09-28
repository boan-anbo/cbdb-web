/**
 * Provider for initializing client error handling
 * Keeps error handling setup separate from other app concerns
 */

import React, { ReactNode } from 'react';
import { useClientErrorHandler } from '@/render/hooks/useClientErrorHandler';
import { useNavigationListener } from '@/render/hooks/useNavigationListener';

interface ClientErrorProviderProps {
  children: ReactNode;
}

/**
 * Provider that initializes CBDB client with error handling
 * This should wrap the app to ensure error handling is set up early
 * Also bridges error handler navigation events with React Router
 */
export const ClientErrorProvider: React.FC<ClientErrorProviderProps> = ({ children }) => {
  // Initialize client error handling
  useClientErrorHandler();

  // Listen for navigation events from error handlers
  useNavigationListener();

  // This provider doesn't create a context, just ensures initialization
  return <>{children}</>;
};