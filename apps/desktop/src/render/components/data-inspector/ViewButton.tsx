import React, { useState } from 'react';
import { Button } from '@/render/components/ui/button';
import { useDataInspector } from '@/render/contexts/DataInspectorContext';
import { InspectorViewDefinition } from '@/render/components/data-inspector/types';
import { cn } from '@/render/lib/utils';

interface ViewButtonProps {
  view: InspectorViewDefinition;
  index: number;
  className?: string;
}

export const ViewButton: React.FC<ViewButtonProps> = ({ view, index, className }) => {
  const { setDraggedViewId, replaceActiveView, reorderViews, availableViews } = useDataInspector();
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const Icon = view.icon;

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    setDraggedViewId(view.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', view.id);
    e.dataTransfer.setData('source', 'menubar');
    e.dataTransfer.setData('index', index.toString());
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedViewId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const source = e.dataTransfer.types.includes('source') ? 'menubar' : 'panel';

    if (source === 'menubar') {
      // Reordering within menubar
      e.dataTransfer.dropEffect = 'move';

      // Calculate drop position based on mouse position
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const position = x < width / 2 ? 'before' : 'after';
      setDropPosition(position);
    } else {
      // Dropping from panel - just replace
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDragLeave = () => {
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop propagation to allow panel drops
    setDropPosition(null);

    const droppedViewId = e.dataTransfer.getData('text/plain');
    const source = e.dataTransfer.getData('source');

    if (source === 'menubar') {
      // Reordering - get the source index
      const fromIndex = parseInt(e.dataTransfer.getData('index'));
      if (!isNaN(fromIndex) && fromIndex !== index) {
        // Calculate target index based on drop position
        const toIndex = dropPosition === 'before' ? index : index + 1;
        const adjustedToIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
        reorderViews(fromIndex, adjustedToIndex);
      }
    }
    // Remove the else clause - non-menubar drops should bubble up to panel container
  };

  const handleClick = () => {
    replaceActiveView(view.id);
  };

  return (
    <div className="relative">
      {/* Drop indicator - before */}
      {dropPosition === 'before' && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary z-10" />
      )}

      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-6 cursor-pointer px-2",  // Changed from cursor-move to cursor-pointer
          isDragging && "opacity-50 cursor-move",  // Use move cursor only when dragging
          className
        )}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        title={`${view.title} - Click to add or drag to reorder`}
      >
        <Icon className="h-3 w-3 mr-1" />
        <span className="text-[10px]">{view.title}</span>
      </Button>

      {/* Drop indicator - after */}
      {dropPosition === 'after' && (
        <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-primary z-10" />
      )}
    </div>
  );
};