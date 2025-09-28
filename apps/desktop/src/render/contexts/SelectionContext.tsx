import React, { createContext, useContext, useState, useCallback } from 'react';
import { SelectableItem } from '../components/selector/types';

export type SelectionMode = 'replace' | 'toggle' | 'range';

interface SelectionState {
  items: Map<string, SelectableItem>;
  order: string[];
  lastSelectedId: string | null;
  maxItems: number;
  selectorExpanded: boolean;
  isProtected: boolean;
}

interface SelectionActions {
  select: (items: SelectableItem | SelectableItem[], mode?: SelectionMode) => void;
  deselect: (ids: string | string[]) => void;
  clear: () => void;
  reorder: (fromIndex: number, toIndex: number) => void;
  setMaxItems: (max: number) => void;
  setSelectorExpanded: (expanded: boolean) => void;
  setProtected: (isProtected: boolean) => void;
  setActiveItem: (id: string) => void;
  isSelected: (ref: string) => boolean;
  getByRef: (ref: string) => SelectableItem | undefined;
  getById: (id: string) => SelectableItem | undefined;
}

interface SelectionContextValue extends SelectionState, SelectionActions {
  selectedItems: SelectableItem[];
  count: number;
}

const SelectionContext = createContext<SelectionContextValue | undefined>(undefined);

export const SelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SelectionState>({
    items: new Map(),
    order: [],
    lastSelectedId: null,
    maxItems: 10, // Default max items
    selectorExpanded: false, // Default to collapsed
    isProtected: false, // Default to unlocked
  });

  const selectedItems = state.order.map(id => state.items.get(id)).filter(Boolean) as SelectableItem[];
  const count = state.order.length;

  const select = useCallback((
    items: SelectableItem | SelectableItem[],
    mode: SelectionMode = 'replace'
  ) => {
    const itemsArray = Array.isArray(items) ? items : [items];

    setState(prev => {
      // Don't allow modifications if protected
      if (prev.isProtected) return prev;
      const newItems = new Map(prev.items);
      let newOrder = [...prev.order];
      let lastSelectedId = prev.lastSelectedId;

      if (mode === 'replace') {
        // Clear existing and add new
        newItems.clear();
        newOrder = [];

        itemsArray.forEach(item => {
          newItems.set(item.id, item);
          newOrder.push(item.id);
          lastSelectedId = item.id;
        });
      } else if (mode === 'toggle') {
        // Toggle each item
        itemsArray.forEach(item => {
          const existingByRef = Array.from(newItems.values())
            .find(existing => existing.ref === item.ref);

          if (existingByRef) {
            // Remove existing selection of this entity
            newItems.delete(existingByRef.id);
            newOrder = newOrder.filter(id => id !== existingByRef.id);

            // If we just removed the last selected, update it
            if (lastSelectedId === existingByRef.id) {
              lastSelectedId = newOrder[newOrder.length - 1] || null;
            }
          } else {
            // Add new selection
            newItems.set(item.id, item);
            newOrder.push(item.id);
            lastSelectedId = item.id;
          }
        });
      } else if (mode === 'range' && prev.lastSelectedId) {
        // Range selection (requires last selected)
        const lastItem = prev.items.get(prev.lastSelectedId);
        if (lastItem && itemsArray.length === 1) {
          // For range selection, we'd need to know the source of items
          // This would typically come from a list component
          // For now, just add the items
          itemsArray.forEach(item => {
            if (!Array.from(newItems.values()).find(existing => existing.ref === item.ref)) {
              newItems.set(item.id, item);
              newOrder.push(item.id);
              lastSelectedId = item.id;
            }
          });
        }
      }

      // Enforce max items limit
      if (newOrder.length > prev.maxItems) {
        const toRemove = newOrder.slice(0, newOrder.length - prev.maxItems);
        toRemove.forEach(id => newItems.delete(id));
        newOrder = newOrder.slice(-prev.maxItems);
      }

      return {
        items: newItems,
        order: newOrder,
        lastSelectedId,
        maxItems: prev.maxItems,
        selectorExpanded: prev.selectorExpanded,
        isProtected: prev.isProtected,
      };
    });
  }, []);

  const deselect = useCallback((ids: string | string[]) => {
    const idsArray = Array.isArray(ids) ? ids : [ids];

    setState(prev => {
      // Don't allow modifications if protected
      if (prev.isProtected) return prev;
      const newItems = new Map(prev.items);
      let newOrder = [...prev.order];
      let lastSelectedId = prev.lastSelectedId;

      idsArray.forEach(id => {
        if (newItems.has(id)) {
          newItems.delete(id);
          newOrder = newOrder.filter(orderId => orderId !== id);

          if (lastSelectedId === id) {
            lastSelectedId = newOrder[newOrder.length - 1] || null;
          }
        }
      });

      return {
        items: newItems,
        order: newOrder,
        lastSelectedId,
        maxItems: prev.maxItems,
        selectorExpanded: prev.selectorExpanded,
        isProtected: prev.isProtected,
      };
    });
  }, []);

  const clear = useCallback(() => {
    setState(prev => {
      // Don't allow modifications if protected
      if (prev.isProtected) return prev;

      return {
        items: new Map(),
        order: [],
        lastSelectedId: null,
        maxItems: prev.maxItems,
        selectorExpanded: false, // Reset to collapsed when cleared
        isProtected: false, // Reset protection when cleared
      };
    });
  }, []);

  const reorder = useCallback((fromIndex: number, toIndex: number) => {
    setState(prev => {
      // Don't allow modifications if protected
      if (prev.isProtected) return prev;

      if (fromIndex < 0 || fromIndex >= prev.order.length ||
          toIndex < 0 || toIndex >= prev.order.length) {
        return prev;
      }

      const newOrder = [...prev.order];
      const [removed] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, removed);

      return {
        ...prev,
        order: newOrder,
      };
    });
  }, []);

  const setMaxItems = useCallback((max: number) => {
    setState(prev => {
      let newItems = new Map(prev.items);
      let newOrder = [...prev.order];

      // If reducing max, remove oldest items
      if (max < prev.order.length) {
        const toRemove = prev.order.slice(0, prev.order.length - max);
        toRemove.forEach(id => newItems.delete(id));
        newOrder = newOrder.slice(-max);
      }

      return {
        items: newItems,
        order: newOrder,
        lastSelectedId: prev.lastSelectedId && newItems.has(prev.lastSelectedId)
          ? prev.lastSelectedId
          : newOrder[newOrder.length - 1] || null,
        maxItems: max,
        selectorExpanded: prev.selectorExpanded,
      };
    });
  }, []);

  const setSelectorExpanded = useCallback((expanded: boolean) => {
    setState(prev => ({
      ...prev,
      selectorExpanded: expanded,
    }));
  }, []);

  const setProtected = useCallback((isProtected: boolean) => {
    setState(prev => ({
      ...prev,
      isProtected: isProtected,
    }));
  }, []);

  const setActiveItem = useCallback((id: string) => {
    setState(prev => {
      // Only update if the item exists in selection
      if (prev.items.has(id)) {
        return {
          ...prev,
          lastSelectedId: id,
        };
      }
      return prev;
    });
  }, []);

  const isSelected = useCallback((ref: string) => {
    return Array.from(state.items.values()).some(item => item.ref === ref);
  }, [state.items]);

  const getByRef = useCallback((ref: string) => {
    return Array.from(state.items.values()).find(item => item.ref === ref);
  }, [state.items]);

  const getById = useCallback((id: string) => {
    return state.items.get(id);
  }, [state.items]);

  const value: SelectionContextValue = {
    // State
    ...state,
    selectedItems,
    count,
    // Actions
    select,
    deselect,
    clear,
    reorder,
    setMaxItems,
    setSelectorExpanded,
    setProtected,
    setActiveItem,
    isSelected,
    getByRef,
    getById,
  };

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
};

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
};

// Convenience hooks
export const useSelectedItems = () => {
  const { selectedItems } = useSelection();
  return selectedItems;
};

export const useSelectionCount = () => {
  const { count } = useSelection();
  return count;
};

export const useIsSelected = (ref: string) => {
  const { isSelected } = useSelection();
  return isSelected(ref);
};