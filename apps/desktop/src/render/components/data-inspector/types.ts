import React from 'react';

// Core types for the inspector view system
export interface InspectorViewComponentProps {
  data: any; // The selected data being inspected
  panelId: string;
  isActive: boolean;
}

export interface InspectorViewDefinition {
  id: string; // Unique identifier (e.g., 'core.details', 'custom.analytics')
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<InspectorViewComponentProps>;
  defaultOrder?: number; // For initial ordering
  category?: string; // For grouping (e.g., 'core', 'custom', 'debug')
  permissions?: string[]; // Future: role-based view access
  description?: string; // For tooltips/help
}

export interface Panel {
  id: string;
  viewId: string | null; // View ID from registry
  size?: number;
}

export const INSPECTOR_DEFAULTS = {
  DEFAULT_SIZE: 30,  // Inspector takes 30% of width
  MIN_SIZE: 15,
  MAX_SIZE: 60,
  MAIN_MIN_SIZE: 40,
  MAIN_DEFAULT_SIZE_OPEN: 70,  // Main content takes 70% when inspector is open
  MAIN_DEFAULT_SIZE_CLOSED: 100,
} as const;

export const STORAGE_KEYS = {
  VIEW_ORDER: 'dataInspector.viewOrder',
} as const;