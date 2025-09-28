import React from 'react';
import { useSelection } from '../../contexts/SelectionContext';
import { cn } from '../../lib/utils';
import { SelectorHeader } from './SelectorHeader';
import { SelectorContent } from './SelectorContent';
import { useSelectorSearch } from './useSelectorSearch';

interface SelectorBarProps {
  className?: string;
}

/**
 * SelectorBar Component
 *
 * A floating selector interface that displays selected items and allows users to manage them.
 *
 * Selector Policies:
 * 1. Isolation: Only selector components can access SelectionContext state
 * 2. Protection: When locked, no modifications are allowed (add/remove/reorder)
 * 3. Persistence: Global selections persist across page navigation
 * 4. Explicit Actions: Other components must explicitly add to selector via action buttons
 * 5. Domain-Agnostic: Works with any SelectableItem regardless of domain type
 */
export const SelectorBar: React.FC<SelectorBarProps> = ({ className }) => {
  const {
    selectedItems,
    count,
    clear,
    deselect,
    selectorExpanded,
    setSelectorExpanded,
    isProtected,
    setProtected,
    lastSelectedId,
    setActiveItem,
  } = useSelection();

  const { searchQuery, setSearchQuery, filteredItems } = useSelectorSearch(selectedItems);

  // Hide if no items
  if (count === 0) {
    return null;
  }

  const handleToggleExpanded = () => {
    setSelectorExpanded(!selectorExpanded);
  };

  const handleSelectItem = (itemId: string) => {
    // Set this item as the active/focused one in the context
    setActiveItem(itemId);
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900',
        'border border-gray-200 dark:border-gray-700',
        'rounded-lg',
        'shadow-2xl',
        'opacity-60 hover:opacity-100 focus-within:opacity-100',
        'transition-all duration-200 ease-in-out',
        selectorExpanded ? 'h-[400px]' : 'h-10',
        className
      )}
    >
      <SelectorHeader
        count={count}
        expanded={selectorExpanded}
        isProtected={isProtected}
        onToggleExpanded={handleToggleExpanded}
        onClear={clear}
        onToggleProtected={() => setProtected(!isProtected)}
      />

      {selectorExpanded && (
        <SelectorContent
          items={filteredItems}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onDeselect={deselect}
          onSelectItem={handleSelectItem}
          activeItemId={lastSelectedId}
        />
      )}
    </div>
  );
};