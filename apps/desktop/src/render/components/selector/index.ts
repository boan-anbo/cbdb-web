// Main components
export { SelectorBar } from './SelectorBar';
export { SelectorItem } from './SelectorItem';

// Sub-components
export { SelectorHeader } from './SelectorHeader';
export { SelectorContent } from './SelectorContent';

// Types
export type { SelectableItem } from './types';
export { createSelectableItem } from './types';

// Hooks
export { useSelectorSearch } from './useSelectorSearch';

// Display system
export {
  getSelectableItemDisplay,
  selectorDisplayRegistry,
  type SelectableItemDisplay,
} from './selector-display-registry';

// Integration
export * from './integration';

// Registry (if it still exists)
export { EntityRegistry, ENTITY_TYPES } from './selector.registry';

// Constants
export * from './selector.constants';
export * from './selector.styles';

// Legacy exports (to be removed after migration)
export { selectableItemFactories } from './entities';
export { useSelectable, useSelectionKeyboard } from './hooks';