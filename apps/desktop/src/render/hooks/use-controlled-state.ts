import { useState, useCallback, useMemo } from 'react';

interface UseControlledStateProps<T> {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
}

/**
 * Custom hook for managing controlled/uncontrolled component state
 * Automatically detects if component is controlled based on value prop
 */
export function useControlledState<T>({
  value: controlledValue,
  defaultValue,
  onChange,
}: UseControlledStateProps<T>) {
  const [internalValue, setInternalValue] = useState<T | undefined>(defaultValue);

  // Determine if component is controlled
  const isControlled = controlledValue !== undefined;

  // Get the current value
  const value = isControlled ? controlledValue : internalValue;

  // Update value handler
  const setValue = useCallback((newValue: T) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  }, [isControlled, onChange]);

  return [value, setValue, isControlled] as const;
}