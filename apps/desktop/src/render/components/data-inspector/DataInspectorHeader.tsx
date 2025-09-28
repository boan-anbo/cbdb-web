import React from 'react';
import { ViewButton } from './ViewButton';
import { useDataInspector } from '@/render/contexts/DataInspectorContext';

export const DataInspectorHeader: React.FC = () => {
  const { availableViews } = useDataInspector();

  return (
    <div className="flex items-center gap-1 min-w-0">
      {availableViews.map((view, index) => (
        <ViewButton key={view.id} view={view} index={index} />
      ))}
    </div>
  );
};