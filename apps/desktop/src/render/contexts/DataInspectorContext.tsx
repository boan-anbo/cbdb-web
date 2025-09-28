import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Panel, InspectorViewDefinition } from '@/render/components/data-inspector/types';
import { useViewOrdering } from '@/render/components/data-inspector/hooks/useViewOrdering';
import { useLocalStorage, STORAGE_KEYS } from '@/render/hooks/use-local-storage';

interface DataInspectorContextValue {
  // State
  isOpen: boolean;
  panels: Panel[];
  activeViewId: string | null;
  draggedViewId: string | null;
  selectedData: any;
  availableViews: InspectorViewDefinition[];
  autoOpenOnSelection: boolean;

  // Actions
  toggleInspector: () => void;
  openInspector: () => void;
  closeInspector: () => void;
  setActiveView: (panelId: string | null) => void;
  setDraggedViewId: (viewId: string | null) => void;
  addPanel: (viewId: string, position?: 'top' | 'bottom', targetPanelId?: string) => void;
  removePanel: (panelId: string) => void;
  updatePanelContent: (panelId: string, viewId: string) => void;
  replaceActiveView: (viewId: string) => void;
  splitPanel: (panelId: string, viewId: string, position: 'top' | 'bottom') => void;
  setSelectedData: (data: any) => void;
  reorderViews: (fromIndex: number, toIndex: number) => void;
  setAutoOpenOnSelection: (value: boolean) => void;
}

const DataInspectorContext = createContext<DataInspectorContextValue | null>(null);

export const useDataInspector = () => {
  const context = useContext(DataInspectorContext);
  if (!context) {
    throw new Error('useDataInspector must be used within DataInspectorProvider');
  }
  return context;
};

interface DataInspectorProviderProps {
  children: ReactNode;
}

export const DataInspectorProvider: React.FC<DataInspectorProviderProps> = ({ children }) => {
  // Use localStorage for persistent state, default to false (hidden) for first visit
  const [isOpen, setIsOpen] = useLocalStorage(STORAGE_KEYS.DATA_INSPECTOR_OPEN, false);
  const [autoOpenOnSelection, setAutoOpenOnSelection] = useLocalStorage(STORAGE_KEYS.DATA_INSPECTOR_AUTO_OPEN, true);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [draggedViewId, setDraggedViewId] = useState<string | null>(null);
  const [selectedData, setSelectedData] = useState<any>(null);

  // Use the extracted hook for view ordering
  const { availableViews, reorderViews } = useViewOrdering();

  const toggleInspector = useCallback(() => {
    setIsOpen(prev => !prev);
  }, [setIsOpen]);

  const openInspector = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const closeInspector = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const setActiveView = useCallback((panelId: string | null) => {
    setActiveViewId(panelId);
  }, []);

  const replaceActiveView = useCallback((viewId: string) => {
    if (!activeViewId) {
      // No active view, add first panel
      const newPanel: Panel = {
        id: `panel-${Date.now()}`,
        viewId,
        size: 100
      };
      setPanels([newPanel]);
      setActiveViewId(newPanel.id);
    } else {
      // Don't replace if it's the same view to preserve state
      setPanels(prev => {
        const activePanel = prev.find(p => p.id === activeViewId);
        if (activePanel?.viewId === viewId) {
          return prev; // No change needed
        }
        return prev.map(p =>
          p.id === activeViewId ? { ...p, viewId } : p
        );
      });
    }
  }, [activeViewId]);

  const addPanel = useCallback((viewId: string, position: 'top' | 'bottom' = 'bottom', targetPanelId?: string) => {
    const newPanelId = `panel-${Date.now()}`;

    setPanels(prev => {
      if (prev.length === 0) {
        // First panel
        const newPanel: Panel = {
          id: newPanelId,
          viewId,
          size: 100
        };
        return [newPanel];
      }

      if (prev.length === 1) {
        // Split single panel - allow same view to be shown twice
        const newPanel: Panel = {
          id: newPanelId,
          viewId,
          size: 50
        };

        const updatedPanels = position === 'top'
          ? [newPanel, { ...prev[0], size: 50 }]
          : [{ ...prev[0], size: 50 }, newPanel];

        return updatedPanels;
      }

      // Two panels - replace based on position
      if (prev.length === 2) {
        const targetIndex = position === 'top' ? 0 : 1;
        // Don't replace if it's the same view to preserve state
        if (prev[targetIndex].viewId === viewId) {
          return prev;
        }
        return prev.map((p, i) =>
          i === targetIndex ? { ...p, viewId } : p
        );
      }

      return prev;
    });

    // Set new panel as active
    if (panels.length < 2) {
      setActiveViewId(newPanelId);
    }
  }, [panels.length]);

  const removePanel = useCallback((panelId: string) => {
    setPanels(prev => {
      const filtered = prev.filter(p => p.id !== panelId);

      // Update active view if necessary
      if (panelId === activeViewId) {
        if (filtered.length > 0) {
          setActiveViewId(filtered[0].id);
        } else {
          setActiveViewId(null);
        }
      }

      // Recalculate sizes if panels remain
      if (filtered.length > 0) {
        const size = 100 / filtered.length;
        return filtered.map(p => ({ ...p, size }));
      }

      return [];
    });
  }, [activeViewId]);

  const updatePanelContent = useCallback((panelId: string, viewId: string) => {
    setPanels(prev => {
      const targetPanel = prev.find(p => p.id === panelId);
      // Don't update if it's the same view to preserve state
      if (targetPanel?.viewId === viewId) {
        return prev;
      }
      return prev.map(p =>
        p.id === panelId ? { ...p, viewId } : p
      );
    });
  }, []);

  const splitPanel = useCallback((panelId: string, viewId: string, position: 'top' | 'bottom') => {
    addPanel(viewId, position, panelId);
  }, [addPanel]);

  const value: DataInspectorContextValue = {
    isOpen,
    panels,
    activeViewId,
    draggedViewId,
    selectedData,
    availableViews,
    autoOpenOnSelection,
    toggleInspector,
    openInspector,
    closeInspector,
    setActiveView,
    setDraggedViewId,
    addPanel,
    removePanel,
    updatePanelContent,
    replaceActiveView,
    splitPanel,
    setSelectedData,
    reorderViews,
    setAutoOpenOnSelection,
  };

  return (
    <DataInspectorContext.Provider value={value}>
      {children}
    </DataInspectorContext.Provider>
  );
};