import React from 'react';
import { Settings } from 'lucide-react';
import { Input } from '@/render/components/ui/input';
import { Label } from '@/render/components/ui/label';
import { InspectorViewDefinition, InspectorViewComponentProps } from '../types';

const PropertiesInspectorView: React.FC<InspectorViewComponentProps> = ({ data, isActive }) => {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Settings className="h-8 w-8 mb-2" />
        <p className="text-sm">No properties available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Properties</h3>
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="id" className="text-xs">ID</Label>
          <Input
            id="id"
            value={data.id || 'N/A'}
            readOnly
            className="h-7 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="name" className="text-xs">Name</Label>
          <Input
            id="name"
            value={data.name || 'N/A'}
            readOnly
            className="h-7 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="type" className="text-xs">Type</Label>
          <Input
            id="type"
            value={data.type || 'N/A'}
            readOnly
            className="h-7 text-xs"
          />
        </div>
      </div>
    </div>
  );
};

// Self-contained inspector view definition
export const propertiesInspectorViewDef: InspectorViewDefinition = {
  id: 'core.properties',
  title: 'Properties',
  icon: Settings,
  component: PropertiesInspectorView,
  defaultOrder: 2,
  category: 'core',
  description: 'View and edit properties of the selected item'
};