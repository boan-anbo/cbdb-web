/**
 * TanStack Table custom features collection
 * Using v8.14+ custom features API
 */

export * from './density.feature';
export * from './export.feature';
export * from './column-pinning.feature';
export * from './row-grouping.feature';
export * from './virtualization.feature';
export * from './keyboard-navigation.feature';

// Re-export as collection for easy use
import { DensityFeature } from './density.feature';
import { ExportFeature } from './export.feature';
import { ColumnPinningFeature } from './column-pinning.feature';
import { RowGroupingFeature } from './row-grouping.feature';
import { VirtualizationFeature } from './virtualization.feature';
import { KeyboardNavigationFeature } from './keyboard-navigation.feature';

export const DEFAULT_FEATURES = [
  DensityFeature,
  ExportFeature,
  ColumnPinningFeature,
  RowGroupingFeature,
  VirtualizationFeature,
  KeyboardNavigationFeature,
];

// Future features to implement:
// - SelectionFeature (advanced selection modes)
// - EditingFeature (inline editing)
// - FullscreenFeature (fullscreen mode)