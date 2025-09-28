import React from 'react';
import { useDataInspector } from '@/render/contexts/DataInspectorContext';
import { cn } from '@/render/lib/utils';

interface DataInspectorSidePanelProps {
  className?: string;
}

export const DataInspectorSidePanel: React.FC<DataInspectorSidePanelProps> = ({
  className
}) => {
  const { availableViews, openInspector, replaceActiveView, panels } = useDataInspector();

  const handleViewClick = (viewId: string) => {
    // If no panels exist, we need to add one
    if (panels.length === 0) {
      replaceActiveView(viewId); // This will create the first panel
    } else {
      replaceActiveView(viewId);
    }
    openInspector();
  };

  return (
    <div
      className={cn(
        "absolute top-2 bottom-2 right-2 z-20 w-[35px] bg-sidebar rounded-lg border shadow-sm opacity-70 hover:opacity-100 transition-opacity",
        className
      )}
      data-inspector="side-panel"
    >
      {/* Simple vertical layout */}
      <div className="flex flex-col items-center pt-2 gap-0.5">
        {availableViews.map((view) => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => handleViewClick(view.id)}
              className="w-full px-1 py-2 flex flex-col items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer group relative"
              title={view.title}
            >
              <Icon className="h-3.5 w-3.5" />
              <span
                className="text-[8px] mt-1 leading-none text-center text-muted-foreground group-hover:text-accent-foreground"
                style={{
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed'
                }}
              >
                {view.title}
              </span>

              {/* Tooltip on hover */}
              <div className="absolute left-full ml-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {view.title}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};