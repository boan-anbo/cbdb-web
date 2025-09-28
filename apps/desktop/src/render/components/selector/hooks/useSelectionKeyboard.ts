import { useEffect, useCallback } from 'react';
import { useSelection } from '../../../contexts/SelectionContext';

interface UseSelectionKeyboardOptions {
  enabled?: boolean;
  onClear?: () => void;
  onSelectAll?: () => void;
}

export const useSelectionKeyboard = ({
  enabled = true,
  onClear,
  onSelectAll,
}: UseSelectionKeyboardOptions = {}) => {
  const { clear, count } = useSelection();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Escape to clear selection
      if (e.key === 'Escape' && count > 0) {
        e.preventDefault();
        clear();
        onClear?.();
        return;
      }

      // Cmd/Ctrl+A to select all (if handler provided)
      if ((e.metaKey || e.ctrlKey) && e.key === 'a' && onSelectAll) {
        e.preventDefault();
        onSelectAll();
        return;
      }

      // Cmd/Ctrl+D to deselect all
      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && count > 0) {
        e.preventDefault();
        clear();
        onClear?.();
        return;
      }
    },
    [enabled, clear, count, onClear, onSelectAll]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);

  return {
    handleKeyDown,
  };
};