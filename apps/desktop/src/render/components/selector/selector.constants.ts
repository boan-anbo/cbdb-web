/**
 * Constants for the Selector component system
 */

// Layout dimensions
export const SELECTOR_HEIGHTS = {
  expanded: 400,
  collapsed: 40,
  header: 40,
  commandList: 300,
  badge: 20,
  button: 24,
  iconButton: 24,
} as const;

// Padding adjustments for main content when selector is visible
export const SELECTOR_PADDING = {
  expanded: 416, // expanded height + gap
  collapsed: 56, // collapsed height + gap
  gap: 16,
} as const;

// Opacity levels
export const SELECTOR_OPACITY = {
  idle: 0.6,
  hover: 1.0,
  active: 1.0,
  dragging: 0.5,
  hidden: 0,
} as const;

// Animation durations (ms)
export const SELECTOR_TRANSITIONS = {
  opacity: 200,
  height: 200,
  all: 200,
  colors: 150,
} as const;

// Size constraints
export const SELECTOR_LIMITS = {
  maxItems: 10,
  maxSearchResults: 50,
} as const;

// Icon sizes
export const SELECTOR_ICON_SIZES = {
  chevron: 'w-3.5 h-3.5',
  entity: 'w-4 h-4',
  button: 'w-3.5 h-3.5',
  remove: 'w-3 h-3',
  item: 'w-3.5 h-3.5',
} as const;

// Text sizes
export const SELECTOR_TEXT_SIZES = {
  header: 'text-xs',
  item: 'text-sm',
  sublabel: 'text-xs',
  badge: 'text-xs',
} as const;

// Z-index layers
export const SELECTOR_Z_INDEX = {
  floating: 50,
  dropdown: 40,
  overlay: 30,
  button: 10,
} as const;