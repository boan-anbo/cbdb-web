import React, { useState, useRef } from 'react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/render/components/ui/resizable';
import { useDataInspector } from '@/render/contexts/DataInspectorContext';
import { DataInspectorPanel } from './DataInspectorPanel';
import { DropZone } from './DropZone';

export const DataInspectorContent: React.FC = () => {
  const { panels, draggedViewId, addPanel, updatePanelContent } = useDataInspector();
  const [dropZone, setDropZone] = useState<'top' | 'bottom' | null>(null);
  const [panelSizes, setPanelSizes] = useState<number[]>([50, 50]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move'; // Changed to match ViewButton's effectAllowed

    // Calculate drop zone based on mouse position and actual panel sizes
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    if (panels.length === 2) {
      // Use actual panel sizes for calculation
      const topPanelHeight = height * (panelSizes[0] / 100);
      setDropZone(y < topPanelHeight ? 'top' : 'bottom');
    } else {
      // Default to half for 0 or 1 panels
      const half = height / 2;
      setDropZone(y < half ? 'top' : 'bottom');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the container entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropZone(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop propagation to prevent interference

    const viewId = e.dataTransfer.getData('text/plain');
    const currentDropZone = dropZone; // Capture the current drop zone before clearing

    // Use viewId directly since it contains the view ID regardless of source
    if (viewId) {
      if (panels.length === 0) {
        // No panels, add first one
        addPanel(viewId);
      } else if (panels.length === 1) {
        // One panel, create split - use captured drop zone
        addPanel(viewId, currentDropZone || 'bottom');
      } else if (panels.length === 2) {
        // Two panels, replace based on captured zone
        const targetIndex = currentDropZone === 'top' ? 0 : 1;
        updatePanelContent(panels[targetIndex].id, viewId);
      }
    }

    setDropZone(null);
  };

  if (panels.length === 0) {
    return (
      <div
        className="relative flex h-full items-center justify-center p-4 text-center"
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move'; // Match ViewButton's effectAllowed
          // For empty state, we don't need to track zones
        }}
        onDragLeave={handleDragLeave}
      >
        {/* Single full drop zone for empty state */}
        {draggedViewId && (
          <div className="absolute inset-0 pointer-events-none bg-primary/10 border-2 border-dashed border-primary/50 flex items-center justify-center z-[1000]">
            <div className="rounded bg-primary/90 px-3 py-1.5 text-sm text-primary-foreground">
              Add View
            </div>
          </div>
        )}
        <div className="text-muted-foreground">
          <p className="text-sm">No views open</p>
          <p className="text-xs mt-2">Click or drag a view button above to add content</p>
        </div>
      </div>
    );
  }

  // Container with drop zones for 1 or 2 panels
  return (
    <div
      ref={containerRef}
      className="relative h-full w-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop zones at container level */}
      {draggedViewId && (
        <>
          <DropZone
            zone="top"
            active={dropZone === 'top'}
            panelCount={panels.length}
            height={panels.length === 2 ? `${panelSizes[0]}%` : '50%'}
            isDuplicate={panels.length === 2 && panels[0].viewId === draggedViewId}
          />
          <DropZone
            zone="bottom"
            active={dropZone === 'bottom'}
            panelCount={panels.length}
            height={panels.length === 2 ? `${panelSizes[1]}%` : '50%'}
            isDuplicate={panels.length === 2 && panels[1].viewId === draggedViewId}
          />
        </>
      )}

      {panels.length === 1 ? (
        // Single panel, no resizing needed
        <div className="h-full w-full">
          <DataInspectorPanel panel={panels[0]} index={0} />
        </div>
      ) : (
        // Multiple panels with vertical resizing
        <ResizablePanelGroup
          direction="vertical"
          className="h-full w-full"
          onLayout={(sizes) => setPanelSizes(sizes)}
        >
          {panels.map((panel, index) => (
            <React.Fragment key={panel.id}>
              <ResizablePanel
                defaultSize={panel.size || (100 / panels.length)}
                minSize={10}
              >
                <DataInspectorPanel panel={panel} index={index} />
              </ResizablePanel>
              {index < panels.length - 1 && <ResizableHandle withHandle />}
            </React.Fragment>
          ))}
        </ResizablePanelGroup>
      )}
    </div>
  );
};