/**
 * Hook to listen for navigation events
 * Bridges the error handler navigation events with React Router
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Listen for navigation events from error handlers
 * This decouples error handlers from React Router
 */
export function useNavigationListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      const { path } = event.detail;
      if (path) {
        navigate(path);
      }
    };

    // Listen for navigation events
    window.addEventListener('navigate-to', handleNavigate as EventListener);

    return () => {
      window.removeEventListener('navigate-to', handleNavigate as EventListener);
    };
  }, [navigate]);
}