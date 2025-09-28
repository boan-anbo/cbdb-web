/**
 * DataTable Configuration Provider
 * Provides centralized configuration and defaults for DataTable instances
 *
 * @module providers/table-config
 * @since 1.0.0
 */

import React, { createContext, useContext, ReactNode } from 'react';
import type {
  UIAdapter,
  TableConfig,
  DensityState,
  SelectionMode,
  ExportFormat,
  ViewMode,
  FilterOperator,
} from '../types/table.types';

/**
 * DataTable configuration interface
 * Defines all configurable options for the table system
 *
 * @interface DataTableConfig
 * @example
 * ```typescript
 * const config: DataTableConfig = {
 *   defaultPageSize: 20,
 *   defaultDensity: 'normal',
 *   uiAdapter: ShadcnAdapter,
 *   locale: 'en-US',
 *   enabledFeatures: ['sorting', 'filtering', 'export']
 * };
 * ```
 */
export interface DataTableConfig {
  // Default values
  /**
   * Default number of rows per page
   * @default 20
   */
  defaultPageSize?: number;

  /**
   * Default row density setting
   * @default 'normal'
   */
  defaultDensity?: DensityState;

  /**
   * Default sort order for columns
   * @default 'asc'
   */
  defaultSortOrder?: 'asc' | 'desc';

  /**
   * Default selection mode
   * @default 'none'
   */
  defaultSelectionMode?: SelectionMode;

  /**
   * Default view mode
   * @default 'table'
   */
  defaultViewMode?: ViewMode;

  // Features configuration
  /**
   * List of enabled features
   * Features not in this list will be disabled by default
   */
  enabledFeatures?: string[];

  /**
   * Feature-specific options
   * Key-value pairs for configuring individual features
   */
  featureOptions?: Record<string, any>;

  // UI Configuration
  /**
   * UI adapter for rendering components
   * Required for proper table rendering
   */
  uiAdapter?: UIAdapter;

  /**
   * Custom theme configuration
   */
  theme?: TableTheme;

  /**
   * Locale for internationalization
   * @default 'en-US'
   */
  locale?: string;

  /**
   * Date format string
   * @default 'MM/DD/YYYY'
   */
  dateFormat?: string;

  /**
   * Number format options
   */
  numberFormat?: {
    decimal?: string;
    thousands?: string;
    currency?: string;
  };

  // Behavior configuration
  /**
   * Edit mode configuration
   * @default 'none'
   */
  editMode?: 'none' | 'cell' | 'row' | 'inline' | 'modal';

  /**
   * Key to use for persisting table state
   * If provided, table state will be saved to localStorage
   */
  persistStateKey?: string;

  /**
   * Whether to persist column settings
   * @default true
   */
  persistColumns?: boolean;

  /**
   * Whether to persist filter settings
   * @default false
   */
  persistFilters?: boolean;

  /**
   * Whether to persist sorting settings
   * @default false
   */
  persistSorting?: boolean;

  // Performance configuration
  /**
   * Row count threshold for enabling virtual scrolling
   * @default 100
   */
  virtualScrollThreshold?: number;

  /**
   * Debounce delay for search/filter inputs (ms)
   * @default 300
   */
  debounceMs?: number;

  /**
   * Maximum rows to export at once
   * @default 10000
   */
  maxExportRows?: number;

  /**
   * Enable request batching for better performance
   * @default true
   */
  enableBatching?: boolean;

  // Export configuration
  /**
   * Available export formats
   * @default ['csv', 'json']
   */
  exportFormats?: ExportFormat[];

  /**
   * Custom export filename generator
   */
  exportFilename?: (date: Date) => string;

  /**
   * Whether to include headers in export
   * @default true
   */
  exportIncludeHeaders?: boolean;

  // Filter configuration
  /**
   * Available filter operators by data type
   */
  filterOperators?: {
    text?: FilterOperator[];
    number?: FilterOperator[];
    date?: FilterOperator[];
    boolean?: FilterOperator[];
  };

  /**
   * Default filter operator by data type
   */
  defaultFilterOperator?: {
    text?: FilterOperator;
    number?: FilterOperator;
    date?: FilterOperator;
    boolean?: FilterOperator;
  };

  // Accessibility configuration
  /**
   * Whether to announce table updates to screen readers
   * @default true
   */
  announceUpdates?: boolean;

  /**
   * Whether to trap focus within the table
   * @default false
   */
  focusTrap?: boolean;

  /**
   * ARIA labels for table elements
   */
  ariaLabels?: {
    table?: string;
    toolbar?: string;
    pagination?: string;
    columnMenu?: string;
    filterMenu?: string;
    exportMenu?: string;
  };

  // Callbacks
  /**
   * Global error handler
   */
  onError?: (error: Error) => void;

  /**
   * Global success handler
   */
  onSuccess?: (message: string) => void;

  /**
   * Analytics event handler
   */
  onAnalytics?: (event: string, data?: any) => void;
}

/**
 * Theme configuration for the table
 */
export interface TableTheme {
  /**
   * Color scheme
   */
  colors?: {
    primary?: string;
    secondary?: string;
    success?: string;
    warning?: string;
    error?: string;
    info?: string;
    background?: string;
    surface?: string;
    text?: string;
    border?: string;
  };

  /**
   * Spacing values
   */
  spacing?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };

  /**
   * Border radius values
   */
  borderRadius?: {
    sm?: string;
    md?: string;
    lg?: string;
  };

  /**
   * Font settings
   */
  typography?: {
    fontFamily?: string;
    fontSize?: {
      xs?: string;
      sm?: string;
      md?: string;
      lg?: string;
      xl?: string;
    };
    fontWeight?: {
      light?: number;
      normal?: number;
      medium?: number;
      bold?: number;
    };
  };

  /**
   * Custom CSS classes
   */
  classes?: {
    root?: string;
    table?: string;
    header?: string;
    body?: string;
    row?: string;
    cell?: string;
    toolbar?: string;
    pagination?: string;
  };
}

/**
 * Default configuration values
 */
const defaultConfig: DataTableConfig = {
  // Defaults
  defaultPageSize: 20,
  defaultDensity: 'normal',
  defaultSortOrder: 'asc',
  defaultSelectionMode: 'none',
  defaultViewMode: 'table',

  // Features
  enabledFeatures: [
    'sorting',
    'filtering',
    'pagination',
    'columnVisibility',
    'export',
    'density',
    'selection',
  ],

  // UI
  locale: 'en-US',
  dateFormat: 'MM/DD/YYYY',
  numberFormat: {
    decimal: '.',
    thousands: ',',
    currency: '$',
  },

  // Behavior
  editMode: 'none',
  persistColumns: true,
  persistFilters: false,
  persistSorting: false,

  // Performance
  virtualScrollThreshold: 100,
  debounceMs: 300,
  maxExportRows: 10000,
  enableBatching: true,

  // Export
  exportFormats: ['csv', 'json'],
  exportIncludeHeaders: true,
  exportFilename: (date) =>
    `table-export-${date.toISOString().split('T')[0]}`,

  // Filter operators
  filterOperators: {
    text: ['contains', 'startsWith', 'endsWith', 'eq', 'neq'],
    number: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'],
    date: ['eq', 'before', 'after', 'between'],
    boolean: ['eq'],
  },

  defaultFilterOperator: {
    text: 'contains',
    number: 'eq',
    date: 'eq',
    boolean: 'eq',
  },

  // Accessibility
  announceUpdates: true,
  focusTrap: false,
  ariaLabels: {
    table: 'Data table',
    toolbar: 'Table toolbar',
    pagination: 'Table pagination',
    columnMenu: 'Column options',
    filterMenu: 'Filter options',
    exportMenu: 'Export options',
  },
};

/**
 * Configuration context
 */
const DataTableConfigContext = createContext<DataTableConfig>(defaultConfig);

/**
 * Provider component props
 */
export interface DataTableProviderProps {
  /**
   * Configuration object
   */
  config?: Partial<DataTableConfig>;

  /**
   * Child components
   */
  children: ReactNode;
}

/**
 * DataTable configuration provider component
 * Provides configuration context to all child DataTable instances
 *
 * @component
 * @example
 * ```tsx
 * <DataTableProvider config={myConfig}>
 *   <DataTable columns={columns} dataSource={dataSource} />
 * </DataTableProvider>
 * ```
 */
export function DataTableProvider({
  config = {},
  children
}: DataTableProviderProps) {
  const mergedConfig = React.useMemo(
    () => ({ ...defaultConfig, ...config }),
    [config]
  );

  React.useEffect(() => {
    // Initialize persistence if configured
    if (mergedConfig.persistStateKey) {
      initializePersistence(mergedConfig);
    }

    // Set up global error handler
    if (mergedConfig.onError) {
      window.addEventListener('error', (e) => {
        mergedConfig.onError!(new Error(e.message));
      });
    }

    // Analytics initialization
    if (mergedConfig.onAnalytics) {
      mergedConfig.onAnalytics('datatable_provider_initialized', {
        features: mergedConfig.enabledFeatures,
        locale: mergedConfig.locale,
      });
    }
  }, [mergedConfig]);

  return (
    <DataTableConfigContext.Provider value={mergedConfig}>
      {children}
    </DataTableConfigContext.Provider>
  );
}

/**
 * Hook to access DataTable configuration
 * Must be used within a DataTableProvider
 *
 * @hook
 * @returns {DataTableConfig} The current configuration
 * @throws {Error} If used outside of DataTableProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const config = useDataTableConfig();
 *   return <div>Page size: {config.defaultPageSize}</div>;
 * }
 * ```
 */
export function useDataTableConfig(): DataTableConfig {
  const context = useContext(DataTableConfigContext);

  if (!context) {
    console.warn(
      'useDataTableConfig must be used within a DataTableProvider. ' +
      'Falling back to default configuration.'
    );
    return defaultConfig;
  }

  return context;
}

/**
 * Hook to check if a feature is enabled
 *
 * @hook
 * @param {string} feature - Feature name to check
 * @returns {boolean} Whether the feature is enabled
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isExportEnabled = useFeature('export');
 *   if (isExportEnabled) {
 *     return <ExportButton />;
 *   }
 *   return null;
 * }
 * ```
 */
export function useFeature(feature: string): boolean {
  const config = useDataTableConfig();
  return config.enabledFeatures?.includes(feature) ?? false;
}

/**
 * Hook to get feature-specific options
 *
 * @hook
 * @param {string} feature - Feature name
 * @returns {any} Feature options
 *
 * @example
 * ```tsx
 * function ExportButton() {
 *   const exportOptions = useFeatureOptions('export');
 *   const formats = exportOptions?.formats || ['csv', 'json'];
 *   // Use formats...
 * }
 * ```
 */
export function useFeatureOptions(feature: string): any {
  const config = useDataTableConfig();
  return config.featureOptions?.[feature];
}

/**
 * Initialize persistence for table state
 */
function initializePersistence(config: DataTableConfig): void {
  const key = config.persistStateKey;
  if (!key) return;

  // Check for existing state
  const existingState = localStorage.getItem(key);
  if (existingState) {
    try {
      const parsed = JSON.parse(existingState);
      // Validate and migrate if needed
      migratePersistedState(parsed);
    } catch (error) {
      console.error('Failed to parse persisted state:', error);
      localStorage.removeItem(key);
    }
  }
}

/**
 * Migrate persisted state to current version
 */
function migratePersistedState(state: any): any {
  // Add migration logic here as schema changes
  return state;
}

/**
 * Merge configurations with proper type checking
 *
 * @param {DataTableConfig} base - Base configuration
 * @param {Partial<DataTableConfig>} override - Override configuration
 * @returns {DataTableConfig} Merged configuration
 */
export function mergeConfigs(
  base: DataTableConfig,
  override: Partial<DataTableConfig>
): DataTableConfig {
  return {
    ...base,
    ...override,
    // Deep merge nested objects
    theme: { ...base.theme, ...override.theme },
    numberFormat: { ...base.numberFormat, ...override.numberFormat },
    filterOperators: { ...base.filterOperators, ...override.filterOperators },
    defaultFilterOperator: {
      ...base.defaultFilterOperator,
      ...override.defaultFilterOperator
    },
    ariaLabels: { ...base.ariaLabels, ...override.ariaLabels },
  };
}

// Export configuration builder for convenience
export class DataTableConfigBuilder {
  private config: Partial<DataTableConfig> = {};

  withDefaults(
    pageSize?: number,
    density?: DensityState,
    sortOrder?: 'asc' | 'desc'
  ): this {
    if (pageSize) this.config.defaultPageSize = pageSize;
    if (density) this.config.defaultDensity = density;
    if (sortOrder) this.config.defaultSortOrder = sortOrder;
    return this;
  }

  withFeatures(...features: string[]): this {
    this.config.enabledFeatures = features;
    return this;
  }

  withUIAdapter(adapter: UIAdapter): this {
    this.config.uiAdapter = adapter;
    return this;
  }

  withTheme(theme: TableTheme): this {
    this.config.theme = theme;
    return this;
  }

  withPersistence(key: string, options?: {
    columns?: boolean;
    filters?: boolean;
    sorting?: boolean;
  }): this {
    this.config.persistStateKey = key;
    if (options?.columns !== undefined) this.config.persistColumns = options.columns;
    if (options?.filters !== undefined) this.config.persistFilters = options.filters;
    if (options?.sorting !== undefined) this.config.persistSorting = options.sorting;
    return this;
  }

  withPerformance(options: {
    virtualScrollThreshold?: number;
    debounceMs?: number;
    maxExportRows?: number;
  }): this {
    Object.assign(this.config, options);
    return this;
  }

  build(): DataTableConfig {
    return mergeConfigs(defaultConfig, this.config);
  }
}

// Re-export for convenience
export { defaultConfig };