import React from 'react';
import { History, Clock } from 'lucide-react';
import { InspectorViewDefinition, InspectorViewComponentProps } from '../types';

const HistoryInspectorView: React.FC<InspectorViewComponentProps> = ({ data, isActive }) => {
  const mockHistory = [
    { id: 1, date: '2024-01-15', action: 'Created', user: 'System' },
    { id: 2, date: '2024-01-16', action: 'Updated', user: 'Admin' },
    { id: 3, date: '2024-01-17', action: 'Reviewed', user: 'User1' },
  ];

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <History className="h-8 w-8 mb-2" />
        <p className="text-sm">No history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <Clock className="h-3 w-3" />
        History
      </h3>
      <div className="space-y-2">
        {mockHistory.map(entry => (
          <div key={entry.id} className="border-l-2 border-muted pl-3 py-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{entry.action}</span>
              <span className="text-muted-foreground">{entry.date}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              by {entry.user}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Self-contained inspector view definition
export const historyInspectorViewDef: InspectorViewDefinition = {
  id: 'core.history',
  title: 'History',
  icon: History,
  component: HistoryInspectorView,
  defaultOrder: 4,
  category: 'core',
  description: 'View change history and activity log'
};