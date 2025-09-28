import React, { ReactNode, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/render/components/ui/button';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/render/components/ui/resizable';
import { useDataInspector } from '@/render/contexts/DataInspectorContext';
import { useSelection } from '@/render/contexts/SelectionContext';
import { DataInspectorHeader } from './DataInspectorHeader';
import { DataInspectorContent } from './DataInspectorContent';
import { DataInspectorSidePanel } from './DataInspectorSidePanel';
import { MoreViewsMenu } from './MoreViewsMenu';
import { cn } from '@/render/lib/utils';
import { INSPECTOR_DEFAULTS } from './types';

interface DataInspectorLayoutProps {
  children: ReactNode;
  className?: string;
}

export const DataInspectorLayout: React.FC<DataInspectorLayoutProps> = ({
  children,
  className
}) => {
  const { isOpen, closeInspector, openInspector, panels, addPanel, autoOpenOnSelection } = useDataInspector();
  const { selectedItems } = useSelection();

  // Track the last selection that triggered auto-open to avoid re-opening immediately
  const [lastAutoOpenedSelectionId, setLastAutoOpenedSelectionId] = useState<string | null>(null);

  // Auto-open inspector when person is selected
  useEffect(() => {
    // Only run if auto-open is enabled
    if (!autoOpenOnSelection) return;

    // Check if any person is selected
    const personSelections = selectedItems.filter(item => item.type === 'person');
    const hasPersonSelection = personSelections.length > 0;

    if (!hasPersonSelection) {
      // Reset tracking when no person is selected
      setLastAutoOpenedSelectionId(null);
      return;
    }

    // Get a unique identifier for current selection
    const currentSelectionId = personSelections.map(p => p.id).sort().join(',');

    // Auto-open if:
    // 1. Inspector is closed
    // 2. Has person selection
    // 3. This is a different selection than what triggered the last auto-open
    if (!isOpen && hasPersonSelection && currentSelectionId !== lastAutoOpenedSelectionId) {
      openInspector();
      setLastAutoOpenedSelectionId(currentSelectionId);

      // Add default PersonDetailView if no panels exist
      if (panels.length === 0) {
        addPanel('core.person-detail');
      }
    }

    // When inspector is open, keep tracking current selection
    if (isOpen) {
      setLastAutoOpenedSelectionId(currentSelectionId);
    }
  }, [selectedItems, isOpen, panels.length, autoOpenOnSelection, openInspector, addPanel, lastAutoOpenedSelectionId]);

  return (
    <div className={cn("relative flex h-full w-full", className)}>
      {/* Persistent Side Panel - only when closed */}
      {!isOpen && (
        <DataInspectorSidePanel />
      )}

      <ResizablePanelGroup
        direction="horizontal"
        className="h-full w-full"
      >
        <ResizablePanel
          defaultSize={isOpen ? INSPECTOR_DEFAULTS.MAIN_DEFAULT_SIZE_OPEN : INSPECTOR_DEFAULTS.MAIN_DEFAULT_SIZE_CLOSED}
          minSize={INSPECTOR_DEFAULTS.MAIN_MIN_SIZE}
          className={cn(!isOpen && "pr-[49px]")} // Add padding when inspector is closed: 35px panel + 8px margin + 4px gap + 2px for scrollbar
        >
          {children}
        </ResizablePanel>

        {isOpen && (
          <>
            <ResizableHandle
              withHandle={false}
              className="w-0.5 bg-transparent hover:bg-border/50 transition-colors"
              onDoubleClick={closeInspector}
              title="Drag to resize • Double-click to close"
            />
            <ResizablePanel
              defaultSize={INSPECTOR_DEFAULTS.DEFAULT_SIZE}
              minSize={INSPECTOR_DEFAULTS.MIN_SIZE}
              maxSize={INSPECTOR_DEFAULTS.MAX_SIZE}
              className="relative group"
              data-inspector="panel"
            >
              <div className="absolute top-2 bottom-2 right-2 left-2 bg-sidebar rounded-lg border shadow-sm overflow-hidden flex flex-col min-w-0">
                {/* Header with view buttons and close */}
                <div className="flex items-center border-b p-1 gap-1 min-w-0">  {/* Reduced padding from p-2 to p-1 */}
                  {/* Left section - More menu */}
                  <div className="flex-shrink-0">
                    <MoreViewsMenu />
                  </div>

                  {/* Middle section - view buttons with ellipsis on overflow */}
                  <div className="relative flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center gap-1 overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      <DataInspectorHeader />
                    </div>
                    {/* Ellipsis gradient for overflow indication */}
                    <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-r from-transparent to-muted/30" />
                  </div>

                  {/* Right section - close button */}
                  <div className="flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={closeInspector}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Content area with panels */}
                <div className="flex-1 overflow-hidden">
                  <DataInspectorContent />
                </div>
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};