import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/render/components/ui/dropdown-menu';
import { Button } from '@/render/components/ui/button';
import { useDataInspector } from '@/render/contexts/DataInspectorContext';
import { cn } from '@/render/lib/utils';

export const MoreViewsMenu: React.FC = () => {
  const { setDraggedViewId, replaceActiveView, availableViews, autoOpenOnSelection, setAutoOpenOnSelection } = useDataInspector();
  const [open, setOpen] = useState(false);

  const handleDragStart = (e: React.DragEvent, viewId: string, index: number) => {
    setDraggedViewId(viewId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', viewId);
    e.dataTransfer.setData('source', 'menubar');
    e.dataTransfer.setData('index', index.toString());
    // Close the dropdown when dragging starts
    setOpen(false);
  };

  const handleDragEnd = () => {
    setDraggedViewId(null);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2"
          title="More views"
        >
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {availableViews.map((view, index) => {
          const Icon = view.icon;
          return (
            <DropdownMenuItem
              key={view.id}
              className={cn(
                "cursor-move flex items-center gap-2",
                "hover:bg-accent hover:text-accent-foreground"
              )}
              draggable
              onDragStart={(e) => handleDragStart(e, view.id, index)}
              onDragEnd={handleDragEnd}
              onClick={() => {
                replaceActiveView(view.id);
                setOpen(false);
              }}
            >
              <Icon className="h-3 w-3" />
              <span className="text-[10px]">{view.title}</span>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        <DropdownMenuCheckboxItem
          checked={autoOpenOnSelection}
          onCheckedChange={setAutoOpenOnSelection}
          onSelect={(e) => e.preventDefault()} // Prevent dropdown from closing
        >
          <span className="text-[10px]">Auto-open on selection</span>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};