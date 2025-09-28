/**
 * Density Feature - Control row height/density
 * Using TanStack Table v8.14+ custom features API
 */

import type { TableFeature as TanstackTableFeature, Table, RowData } from '@tanstack/table-core';
import type { DensityState } from '../types/table.types';

/**
 * Density feature state
 */
export interface DensityTableState {
  density: DensityState;
}

/**
 * Density feature options
 */
export interface DensityOptions {
  enableDensity?: boolean;
  defaultDensity?: DensityState;
  onDensityChange?: (density: DensityState) => void;
}

/**
 * Density feature instance methods
 */
export interface DensityInstance {
  getDensity: () => DensityState;
  setDensity: (density: DensityState) => void;
  toggleDensity: () => void;
}

/**
 * Type augmentation for TanStack Table
 */
declare module '@tanstack/table-core' {
  interface TableState extends DensityTableState {}
  interface TableOptionsResolved<TData extends RowData> extends DensityOptions {}
  interface Table<TData extends RowData> extends DensityInstance {}
}

/**
 * Density Feature implementation
 */
export const DensityFeature: TanstackTableFeature<any> = {
  // Initial state
  getInitialState: (state): DensityTableState => {
    return {
      density: 'normal',
      ...state,
    };
  },

  // Default options
  getDefaultOptions: <TData extends RowData>(
    table: Table<TData>
  ): DensityOptions => {
    return {
      enableDensity: true,
      defaultDensity: 'normal',
      onDensityChange: (density) => {
        table.setState((old) => ({
          ...old,
          density,
        }));
      },
    };
  },

  // Create table instance methods
  createTable: <TData extends RowData>(table: Table<TData>): void => {
    // Get current density
    table.getDensity = () => {
      return table.getState().density;
    };

    // Set density
    table.setDensity = (density: DensityState) => {
      const { onDensityChange } = table.options;

      if (onDensityChange) {
        onDensityChange(density);
      } else {
        table.setState((old) => ({
          ...old,
          density,
        }));
      }
    };

    // Toggle through density options
    table.toggleDensity = () => {
      const current = table.getDensity();
      const next: DensityState =
        current === 'compact' ? 'normal' :
        current === 'normal' ? 'comfortable' :
        'compact';

      table.setDensity(next);
    };
  },
};

/**
 * Helper function to get density CSS classes
 */
export function getDensityClass(density: DensityState): string {
  const classes = {
    compact: 'data-table-density-compact',
    normal: 'data-table-density-normal',
    comfortable: 'data-table-density-comfortable',
  };
  return classes[density] || classes.normal;
}

/**
 * Helper function to get row height based on density
 */
export function getDensityHeight(density: DensityState): number {
  const heights = {
    compact: 32,
    normal: 48,
    comfortable: 64,
  };
  return heights[density] || heights.normal;
}