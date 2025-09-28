import React from 'react';
import { X } from 'lucide-react';
import { SelectableItem } from './types';
import { cn } from '../../lib/utils';

interface SelectorItemProps {
  item: SelectableItem;
  onRemove?: () => void;
  onClick?: () => void;
  isDragging?: boolean;
  className?: string;
}

export const SelectorItem: React.FC<SelectorItemProps> = ({
  item,
  onRemove,
  onClick,
  isDragging = false,
  className,
}) => {
  const Icon = item.icon;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md',
        'bg-gray-100 dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'transition-all duration-150',
        onClick && 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700',
        isDragging && 'opacity-50',
        'group/item',
        className
      )}
      onClick={handleClick}
      title={item.sublabel}
    >
      {/* Icon */}
      {Icon && (
        <Icon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
      )}

      {/* Content */}
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
          {item.label}
        </span>
        {item.sublabel && (
          <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
            {item.sublabel}
          </span>
        )}
      </div>

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={handleRemove}
          className={cn(
            'ml-1 p-0.5 rounded',
            'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
            'hover:bg-gray-200 dark:hover:bg-gray-700',
            'opacity-0 group-hover/item:opacity-100',
            'transition-all duration-150'
          )}
          aria-label={`Remove ${item.label}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};