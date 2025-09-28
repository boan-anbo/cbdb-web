import { useState, useCallback, useEffect } from 'react';
import { InspectorViewDefinition, STORAGE_KEYS } from '../types';
import { inspectorViewRegistry } from '../registry/InspectorViewRegistry';

export const useViewOrdering = () => {
  // Initialize availableViews from registry
  const [availableViews, setAvailableViews] = useState<InspectorViewDefinition[]>([]);

  // Subscribe to registry changes
  useEffect(() => {
    const unsubscribe = inspectorViewRegistry.subscribe(views => {
      // Apply stored order if available
      const stored = localStorage.getItem(STORAGE_KEYS.VIEW_ORDER);
      if (stored) {
        try {
          const order = JSON.parse(stored) as string[];
          // Reorder views based on stored order
          const orderedViews: InspectorViewDefinition[] = [];
          order.forEach(id => {
            const view = views.find(v => v.id === id);
            if (view) orderedViews.push(view);
          });
          // Add any new views that weren't in storage
          views.forEach(view => {
            if (!orderedViews.find(v => v.id === view.id)) {
              orderedViews.push(view);
            }
          });
          setAvailableViews(orderedViews);
        } catch {
          setAvailableViews(views);
        }
      } else {
        setAvailableViews(views);
      }
    });

    return unsubscribe;
  }, []);

  // Save view order to localStorage whenever it changes
  useEffect(() => {
    const order = availableViews.map(v => v.id);
    localStorage.setItem(STORAGE_KEYS.VIEW_ORDER, JSON.stringify(order));
  }, [availableViews]);

  const reorderViews = useCallback((fromIndex: number, toIndex: number) => {
    setAvailableViews(prev => {
      const newViews = [...prev];
      const [removed] = newViews.splice(fromIndex, 1);
      newViews.splice(toIndex, 0, removed);
      return newViews;
    });
  }, []);

  return {
    availableViews,
    reorderViews
  };
};