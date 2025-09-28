import React from 'react';
import { X } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/render/components/ui/command';
import { Button } from '@/render/components/ui/button';
import { SelectableItem } from './types';
import { getSelectableItemDisplay } from './selector-display-registry';
import { EntityRegistry, type EntityType } from './selector.registry';
import { cn } from '@/render/lib/utils';

interface SelectorContentProps {
  items: SelectableItem[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onDeselect: (id: string) => void;
  onSelectItem?: (id: string) => void;
  activeItemId?: string | null;
}

interface GroupedItems {
  [type: string]: SelectableItem[];
}

export function SelectorContent({
  items,
  searchQuery,
  onSearchChange,
  onDeselect,
  onSelectItem,
  activeItemId,
}: SelectorContentProps) {
  // Group items by type
  const groupedItems: GroupedItems = {};
  items.forEach(item => {
    if (!groupedItems[item.type]) {
      groupedItems[item.type] = [];
    }
    groupedItems[item.type].push(item);
  });

  return (
    <Command className="border-0 bg-transparent">
      <CommandInput
        placeholder="Search selected items..."
        value={searchQuery}
        onValueChange={onSearchChange}
        className="border-b border-gray-100 dark:border-gray-800"
      />

      <CommandList className="max-h-[300px] overflow-y-auto">
        {items.length === 0 ? (
          <CommandEmpty>No items match your search.</CommandEmpty>
        ) : (
          <>
            {Object.entries(groupedItems).map(([type, typeItems], index) => (
              <SelectorGroup
                key={type}
                type={type}
                items={typeItems}
                showSeparator={index > 0}
                onDeselect={onDeselect}
                onSelectItem={onSelectItem}
                activeItemId={activeItemId}
              />
            ))}
          </>
        )}
      </CommandList>
    </Command>
  );
}

interface SelectorGroupProps {
  type: string;
  items: SelectableItem[];
  showSeparator: boolean;
  onDeselect: (id: string) => void;
  onSelectItem?: (id: string) => void;
  activeItemId?: string | null;
}

function SelectorGroup({
  type,
  items,
  showSeparator,
  onDeselect,
  onSelectItem,
  activeItemId,
}: SelectorGroupProps) {
  const Icon = EntityRegistry.getIcon(type as EntityType);
  const groupLabel = EntityRegistry.getLabel(type as EntityType, true);

  return (
    <React.Fragment>
      {showSeparator && <CommandSeparator />}
      <CommandGroup heading={groupLabel}>
        {items.map((item) => (
          <SelectorItem
            key={item.id}
            item={item}
            icon={Icon}
            onDeselect={onDeselect}
            onSelectItem={onSelectItem}
            isActive={activeItemId === item.id}
          />
        ))}
      </CommandGroup>
    </React.Fragment>
  );
}

interface SelectorItemProps {
  item: SelectableItem;
  icon: React.ComponentType<{ className?: string }>;
  onDeselect: (id: string) => void;
  onSelectItem?: (id: string) => void;
  isActive?: boolean;
}

function SelectorItem({ item, icon: Icon, onDeselect, onSelectItem, isActive }: SelectorItemProps) {
  const display = getSelectableItemDisplay(item);

  return (
    <CommandItem
      value={item.id}
      onSelect={(value) => {
        // Click on item should set it as active, not remove it
        if (onSelectItem) {
          onSelectItem(value);
        }
      }}
      className={cn(
        'group cursor-pointer transition-colors',
        isActive
          ? 'bg-primary/10 border-l-2 border-primary data-[selected=true]:bg-primary/10'
          : 'data-[selected=true]:bg-accent/50'
      )}
    >
      <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{display.label}</div>
        {display.sublabel && (
          <div className="text-xs text-gray-500 truncate">{display.sublabel}</div>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onDeselect(item.id);
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <X className="w-3 h-3" />
      </Button>
    </CommandItem>
  );
}