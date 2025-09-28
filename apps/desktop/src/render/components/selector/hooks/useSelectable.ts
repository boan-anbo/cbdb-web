import { useCallback, useMemo } from 'react';
import { useSelection } from '../../../contexts/SelectionContext';
import { SelectableItem } from '../types';

interface UseSelectableOptions {
  item: SelectableItem;
  onSelect?: (item: SelectableItem) => void;
  onDeselect?: (item: SelectableItem) => void;
}

export const useSelectable = ({ item, onSelect, onDeselect }: UseSelectableOptions) => {
  const { select, deselect, isSelected, getByEntityId } = useSelection();

  const selected = useMemo(() => isSelected(item.entityId), [isSelected, item.entityId]);

  const handleSelect = useCallback(
    (e?: React.MouseEvent | React.KeyboardEvent) => {
      const mode = e?.metaKey || e?.ctrlKey
        ? 'toggle'
        : e?.shiftKey
        ? 'range'
        : 'replace';

      if (mode === 'toggle' && selected) {
        // Find the actual selectionId for this entity
        const existingItem = getByEntityId(item.entityId);
        if (existingItem) {
          deselect(existingItem.selectionId);
          onDeselect?.(item);
        }
      } else {
        select(item, mode);
        onSelect?.(item);
      }
    },
    [select, deselect, selected, item, onSelect, onDeselect, getByEntityId]
  );

  const handleToggle = useCallback(() => {
    if (selected) {
      // Find the actual selectionId for this entity
      const existingItem = getByEntityId(item.entityId);
      if (existingItem) {
        deselect(existingItem.selectionId);
        onDeselect?.(item);
      }
    } else {
      select(item, 'toggle');
      onSelect?.(item);
    }
  }, [select, deselect, selected, item, onSelect, onDeselect, getByEntityId]);

  return {
    selected,
    handleSelect,
    handleToggle,
  };
};