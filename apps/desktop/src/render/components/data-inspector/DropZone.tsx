import React from 'react';
import { cn } from '@/render/lib/utils';

interface DropZoneProps {
  zone: 'top' | 'bottom';
  active: boolean;
  panelCount: number;
  height?: string;
  isDuplicate?: boolean;  // Whether this would be a duplicate view
}

export const DropZone: React.FC<DropZoneProps> = ({ zone, active, panelCount, height = '50%', isDuplicate = false }) => {
  const getStyles = () => {
    const base = "absolute left-0 right-0 pointer-events-none transition-all duration-200 z-[1000]";  // Added z-[1000]

    // Different styling for duplicate (disabled) state
    const activeStyles = active && isDuplicate
      ? "bg-destructive/20 border-destructive"
      : active
      ? "bg-primary/20 border-primary"
      : "";

    switch (zone) {
      case 'top':
        return cn(
          base,
          "top-0",
          active && "border-t-2",
          activeStyles
        );
      case 'bottom':
        return cn(
          base,
          "bottom-0",
          active && "border-b-2",
          activeStyles
        );
    }
  };

  const getLabel = () => {
    // Show disabled message when it's a duplicate replacement
    if (isDuplicate && panelCount === 2) {
      return 'Already Showing';
    }

    if (panelCount === 0) {
      return 'Add View';
    } else if (panelCount === 1) {
      return zone === 'top' ? 'Insert Above' : 'Insert Below';
    } else {
      return zone === 'top' ? 'Replace Top' : 'Replace Bottom';
    }
  };

  return (
    <div className={getStyles()} style={{ height }}>
      {active && (
        <div className="flex h-full items-center justify-center">
          <div className={cn(
            "rounded px-2 py-1 text-xs",
            isDuplicate && panelCount === 2
              ? "bg-destructive/90 text-destructive-foreground"
              : "bg-primary/90 text-primary-foreground"
          )}>
            {getLabel()}
          </div>
        </div>
      )}
    </div>
  );
};