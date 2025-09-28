import { cn } from '../../lib/utils';
import { SELECTOR_OPACITY, SELECTOR_TRANSITIONS, SELECTOR_HEIGHTS } from './selector.constants';

/**
 * Style utilities for the Selector component system
 */

/**
 * Base styles for the selector bar container
 */
export const selectorBarStyles = {
  base: cn(
    'bg-white dark:bg-gray-900',
    'border border-gray-200 dark:border-gray-700',
    'rounded-lg',
    'shadow-2xl'
  ),

  transition: 'transition-all duration-200 ease-in-out',

  opacity: (isHovered: boolean, isFocused: boolean) => {
    if (isHovered || isFocused) return 'opacity-100';
    return 'opacity-60';
  },

  height: (isExpanded: boolean) => {
    return isExpanded ? 'h-[400px]' : 'h-10';
  },
};

/**
 * Header styles for the selector bar
 */
export const selectorHeaderStyles = {
  container: 'flex items-center justify-between h-10 px-3 border-b border-gray-200 dark:border-gray-800',

  toggleButton: cn(
    'flex items-center gap-2 flex-1 text-left',
    'hover:bg-gray-50 dark:hover:bg-gray-800/50',
    '-mx-3 px-3 h-10',
    'transition-colors duration-150',
    'cursor-pointer'
  ),

  clearButton: cn(
    'h-6 w-6',
    'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
    'ml-2 z-10'
  ),
};

/**
 * Item styles for selectable items
 */
export const selectorItemStyles = {
  base: cn(
    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md',
    'bg-gray-100 dark:bg-gray-800',
    'border border-gray-200 dark:border-gray-700',
    'transition-all duration-150'
  ),

  clickable: 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700',

  dragging: 'opacity-50',

  selected: 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500',

  removeButton: cn(
    'ml-1 p-0.5 rounded',
    'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
    'hover:bg-gray-200 dark:hover:bg-gray-700',
    'opacity-0 group-hover/item:opacity-100',
    'transition-all duration-150'
  ),
};

/**
 * Command list styles
 */
export const commandStyles = {
  container: 'border-0 bg-transparent',

  input: 'border-b border-gray-100 dark:border-gray-800',

  list: 'max-h-[300px] overflow-y-auto',

  item: cn(
    'group cursor-pointer',
    'hover:bg-gray-50 dark:hover:bg-gray-800/50'
  ),

  removeButton: cn(
    'h-6 w-6 p-0',
    'opacity-0 group-hover:opacity-100',
    'transition-opacity duration-200'
  ),
};

/**
 * Layout styles for floating positioning
 */
export const layoutStyles = {
  floatingContainer: 'fixed bottom-4 left-0 right-0 z-50 pointer-events-none',

  mobileWrapper: 'px-4 pointer-events-auto',

  desktopWrapper: (sidebarOpen: boolean) => ({
    spacer: sidebarOpen ? 'w-[240px] shrink-0' : 'w-12 shrink-0',
    content: 'flex-1 px-6 pointer-events-auto',
    inner: 'max-w-7xl mx-auto',
  }),

  mainContentPadding: (hasSelection: boolean, isExpanded: boolean) => {
    if (!hasSelection) return '';
    return isExpanded
      ? 'pb-[416px]'
      : 'pb-[56px]';
  },
};

/**
 * Variant system for different states
 */
export type SelectorVariant = 'default' | 'compact' | 'minimal';

export const getSelectorVariant = (variant: SelectorVariant = 'default') => {
  const variants = {
    default: {
      container: selectorBarStyles.base,
      header: selectorHeaderStyles.container,
      item: selectorItemStyles.base,
    },
    compact: {
      container: cn(selectorBarStyles.base, 'shadow-lg'),
      header: cn(selectorHeaderStyles.container, 'h-8 px-2'),
      item: cn(selectorItemStyles.base, 'px-2 py-0.5 text-xs'),
    },
    minimal: {
      container: cn(
        'bg-white/90 dark:bg-gray-900/90',
        'border border-gray-100 dark:border-gray-800',
        'rounded-md',
        'shadow-sm backdrop-blur-sm'
      ),
      header: cn(selectorHeaderStyles.container, 'border-0'),
      item: cn(selectorItemStyles.base, 'bg-transparent border-0'),
    },
  };

  return variants[variant];
};