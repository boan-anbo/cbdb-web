import React from 'react';

/**
 * Base interface for all selectable items in the application.
 * Minimal, abstract structure that can represent any entity.
 *
 * @template T The type of the entity data
 */
export interface SelectableItem<T = unknown> {
  /**
   * Unique ID for this selection instance (UUID).
   * Used to track individual selections in the selector.
   */
  readonly id: string;

  /**
   * Entity reference - can be "type:id" or any other format.
   * Uniquely identifies the entity across the application.
   */
  readonly ref: string;

  /**
   * Entity type as string (e.g., "person", "text", "timeline-point").
   * Used for filtering and type-specific operations.
   */
  readonly type: string;

  /**
   * Timestamp when this item was selected.
   */
  readonly selectedAt: Date;

  /**
   * Optional source context - where this selection came from.
   * (e.g., "search", "network", "timeline", "map")
   */
  readonly source?: string;

  /**
   * The actual entity data with proper typing.
   */
  readonly data: T;
}

/**
 * Helper function to create a SelectableItem
 */
export function createSelectableItem<T>(params: {
  ref: string;
  type: string;
  data: T;
  source?: string;
}): SelectableItem<T> {
  return {
    id: crypto.randomUUID(),
    ref: params.ref,
    type: params.type,
    selectedAt: new Date(),
    source: params.source,
    data: params.data,
  };
}

/**
 * Selection modes for different interaction patterns
 */
export enum SelectionMode {
  /** Default - replaces current selection */
  Replace = 'replace',
  /** Cmd/Ctrl+Click - adds to or removes from selection */
  Toggle = 'toggle',
  /** Shift+Click - selects range between clicks */
  Range = 'range',
  /** Adds items to selection without removing */
  Add = 'add',
}

/**
 * Selection state for the context
 */
export interface SelectionState {
  /** Map of selected items by selectionId */
  items: Map<string, SelectableItem>;
  /** Set of focused (highlighted) selectionIds within selector */
  focusedIds: Set<string>;
  /** ID of the last selected item for range selection */
  lastSelectedId: string | null;
  /** Whether selection mode is active */
  isSelectionMode: boolean;
}

/**
 * Selection statistics
 */
export interface SelectionStats {
  total: number;
  byType: Record<string, number>;
  focused: number;
}