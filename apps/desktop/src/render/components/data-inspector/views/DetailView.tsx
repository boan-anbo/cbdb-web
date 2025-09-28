import React from 'react';
import { FileText } from 'lucide-react';
import { InspectorViewDefinition, InspectorViewComponentProps } from '../types';

const DetailInspectorView: React.FC<InspectorViewComponentProps> = ({ data, isActive }) => {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <FileText className="h-8 w-8 mb-2" />
        <p className="text-sm">No data selected</p>
        <p className="text-xs mt-1">Select an item to view details</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Details</h3>
        <div className="space-y-2">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{key}:</span>
              <span className="font-mono">{JSON.stringify(value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Self-contained inspector view definition
export const detailInspectorViewDef: InspectorViewDefinition = {
  id: 'core.details',
  title: 'Details',
  icon: FileText,
  component: DetailInspectorView,
  defaultOrder: 1,
  category: 'core',
  description: 'View detailed information about the selected item'
};