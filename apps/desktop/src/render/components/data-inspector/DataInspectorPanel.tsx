import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/render/components/ui/button';
import { useDataInspector } from '@/render/contexts/DataInspectorContext';
import { Panel } from './types';
import { inspectorViewRegistry } from './registry/InspectorViewRegistry';
import { cn } from '@/render/lib/utils';

interface DataInspectorPanelProps {
  panel: Panel;
  index: number;
}

export const DataInspectorPanel: React.FC<DataInspectorPanelProps> = ({ panel, index }) => {
  const { removePanel, activeViewId, setActiveView, selectedData } = useDataInspector();
  const isActive = panel.id === activeViewId;

  const handlePanelClick = () => {
    setActiveView(panel.id);
  };

  const renderContent = () => {
    if (!panel.viewId) {
      return (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <p className="text-sm">Drop a view here</p>
        </div>
      );
    }

    const viewDef = inspectorViewRegistry.get(panel.viewId);
    if (!viewDef) {
      return (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <p className="text-sm">View not found: {panel.viewId}</p>
        </div>
      );
    }

    const ViewComponent = viewDef.component;
    return <ViewComponent data={selectedData} panelId={panel.id} isActive={isActive} />;
  };

  return (
    <div
      className={cn(
        "relative h-full w-full border-b last:border-b-0",
        isActive && "border-t-2 border-t-primary"  // Top border for active view
      )}
      onClick={handlePanelClick}
    >

      {/* Close button - always visible in top-right */}
      {panel.viewId && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 z-10 h-5 w-5 opacity-50 hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            removePanel(panel.id);
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      {/* Panel header */}
      {panel.viewId && (
        <div className={cn(
          "flex items-center border-b px-2 py-1",  // Reduced padding to py-1
          isActive ? "bg-primary/10" : "bg-muted/50"
        )}>
          <span className="text-[10px] font-medium">
            {inspectorViewRegistry.get(panel.viewId)?.title || panel.viewId}
          </span>
        </div>
      )}

      {/* Panel content */}
      <div className={cn(
        "h-full overflow-auto p-2",
        panel.viewId && "h-[calc(100%-32px)]"  // Adjusted height for smaller header
      )}>
        {renderContent()}
      </div>
    </div>
  );
};