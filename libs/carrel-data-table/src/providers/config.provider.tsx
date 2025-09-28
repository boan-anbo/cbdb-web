/**
 * DataTable Configuration Provider
 * Provides global configuration for all DataTable instances
 */

import React, { createContext, useContext, ReactNode } from 'react';
import type { UIAdapter, DensityState, SelectionMode, ExportFormat } from '../types/table.types';

/**
 * DataTable configuration
 */
export interface DataTableConfig {
  // Defaults
  defaultPageSize?: number;
  defaultPageSizes?: number[];
  defaultDensity?: DensityState;
  defaultSortOrder?: 'asc' | 'desc';
  defaultViewMode?: 'table' | 'card' | 'list' | 'grid';

  // Features
  enabledFeatures?: string[];
  featureOptions?: Record<string, any>;

  // UI
  uiAdapter?: UIAdapter;
  locale?: string;

  // Behavior
  selectionMode?: SelectionMode;
  editMode?: 'cell' | 'row' | 'inline' | 'modal';
  persistStateKey?: string;

  // Performance
  virtualScrollThreshold?: number;
  debounceMs?: number;
  cacheTimeout?: number;

  // Export
  exportFormats?: ExportFormat[];
  maxExportRows?: number;

  // Accessibility
  announceUpdates?: boolean;
  focusTrap?: boolean;
  skipLinks?: boolean;
}

/**
 * Default configuration
 */
const defaultConfig: DataTableConfig = {
  defaultPageSize: 20,
  defaultPageSizes: [10, 20, 50, 100],
  defaultDensity: 'normal',
  defaultSortOrder: 'asc',
  defaultViewMode: 'table',

  selectionMode: 'none',

  virtualScrollThreshold: 100,
  debounceMs: 300,
  cacheTimeout: 60000,

  exportFormats: ['csv', 'json'],
  maxExportRows: 10000,

  announceUpdates: true,
  focusTrap: false,
  skipLinks: true,
};

/**
 * Configuration context
 */
const DataTableConfigContext = createContext<DataTableConfig>(defaultConfig);

/**
 * Configuration provider props
 */
export interface DataTableProviderProps {
  config?: Partial<DataTableConfig>;
  children: ReactNode;
}

/**
 * DataTable Configuration Provider Component
 */
export function DataTableProvider({
  config = {},
  children
}: DataTableProviderProps) {
  const mergedConfig = React.useMemo(
    () => ({ ...defaultConfig, ...config }),
    [config]
  );

  return (
    <DataTableConfigContext.Provider value={mergedConfig}>
      {children}
    </DataTableConfigContext.Provider>
  );
}

/**
 * Hook to use DataTable configuration
 */
export function useDataTableConfig(): DataTableConfig {
  const context = useContext(DataTableConfigContext);

  if (!context) {
    console.warn('useDataTableConfig must be used within DataTableProvider');
    return defaultConfig;
  }

  return context;
}

/**
 * Hook to merge local config with global config
 */
export function useMergedConfig(localConfig?: Partial<DataTableConfig>): DataTableConfig {
  const globalConfig = useDataTableConfig();

  return React.useMemo(
    () => ({ ...globalConfig, ...localConfig }),
    [globalConfig, localConfig]
  );
}