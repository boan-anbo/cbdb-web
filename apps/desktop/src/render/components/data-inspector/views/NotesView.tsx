import React, { useState } from 'react';
import { StickyNote, Plus } from 'lucide-react';
import { Button } from '@/render/components/ui/button';
import { Textarea } from '@/render/components/ui/textarea';
import { InspectorViewDefinition, InspectorViewComponentProps } from '../types';

const NotesInspectorView: React.FC<InspectorViewComponentProps> = ({ data, isActive }) => {
  const [notes, setNotes] = useState('');

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <StickyNote className="h-8 w-8 mb-2" />
        <p className="text-sm">No notes</p>
        <p className="text-xs mt-1">Select an item to add notes</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <StickyNote className="h-3 w-3" />
          Notes
        </h3>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <Textarea
        placeholder="Add your notes here..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="min-h-[100px] text-xs resize-none"
      />
      <div className="space-y-2">
        <div className="rounded-md bg-muted p-2">
          <p className="text-xs text-muted-foreground">Previous note (example)</p>
          <p className="text-xs mt-1">This is an example of a saved note.</p>
        </div>
      </div>
    </div>
  );
};

// Self-contained inspector view definition
export const notesInspectorViewDef: InspectorViewDefinition = {
  id: 'core.notes',
  title: 'Notes',
  icon: StickyNote,
  component: NotesInspectorView,
  defaultOrder: 5,
  category: 'core',
  description: 'Add and manage notes for the selected item'
};