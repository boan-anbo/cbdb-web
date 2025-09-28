import React from 'react';
import { ChevronUp, ChevronDown, Trash2, Lock, LockOpen } from 'lucide-react';
import { Badge } from '@/render/components/ui/badge';
import { Button } from '@/render/components/ui/button';
import { selectorHeaderStyles } from './selector.styles';
import { cn } from '@/render/lib/utils';

interface SelectorHeaderProps {
  count: number;
  expanded: boolean;
  isProtected: boolean;
  onToggleExpanded: () => void;
  onClear: () => void;
  onToggleProtected: () => void;
}

export function SelectorHeader({
  count,
  expanded,
  isProtected,
  onToggleExpanded,
  onClear,
  onToggleProtected,
}: SelectorHeaderProps) {
  return (
    <div className={selectorHeaderStyles.container}>
      <button
        onClick={onToggleExpanded}
        className={selectorHeaderStyles.toggleButton}
        aria-label={expanded ? 'Collapse' : 'Expand'}
      >
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
        )}

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Selected Items
          </span>
          <Badge variant="secondary" className="h-5 px-1.5 text-xs">
            {count}
          </Badge>
        </div>
      </button>

      <div className="flex items-center gap-1">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onToggleProtected();
          }}
          variant="ghost"
          size="icon"
          className={cn(
            selectorHeaderStyles.clearButton,
            isProtected && "text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400"
          )}
          aria-label={isProtected ? "Unlock selector" : "Lock selector"}
          title={isProtected ? "Unlock selector" : "Lock selector"}
        >
          {isProtected ? (
            <Lock className="w-3.5 h-3.5" />
          ) : (
            <LockOpen className="w-3.5 h-3.5" />
          )}
        </Button>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          variant="ghost"
          size="icon"
          className={selectorHeaderStyles.clearButton}
          aria-label="Clear all"
          disabled={isProtected}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}