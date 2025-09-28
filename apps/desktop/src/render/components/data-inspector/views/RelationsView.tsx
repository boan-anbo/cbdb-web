import React from 'react';
import { GitBranch, Users, ArrowRight } from 'lucide-react';
import { InspectorViewDefinition, InspectorViewComponentProps } from '../types';

const RelationsInspectorView: React.FC<InspectorViewComponentProps> = ({ data, isActive }) => {
  const mockRelations = [
    { id: 1, type: 'Parent', name: 'John Doe', relation: 'Father' },
    { id: 2, type: 'Sibling', name: 'Jane Doe', relation: 'Sister' },
    { id: 3, type: 'Child', name: 'Jim Doe', relation: 'Son' },
  ];

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <GitBranch className="h-8 w-8 mb-2" />
        <p className="text-sm">No relations data</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <Users className="h-3 w-3" />
        Relations
      </h3>
      <div className="space-y-2">
        {mockRelations.map(relation => (
          <div
            key={relation.id}
            className="flex items-center justify-between rounded-md border p-2 text-xs hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{relation.relation}:</span>
              <span className="font-medium">{relation.name}</span>
            </div>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Self-contained inspector view definition
export const relationsInspectorViewDef: InspectorViewDefinition = {
  id: 'core.relations',
  title: 'Relations',
  icon: GitBranch,
  component: RelationsInspectorView,
  defaultOrder: 3,
  category: 'core',
  description: 'View relationships and connections'
};