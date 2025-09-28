import React from 'react';
import { FileText, BookOpen, ScrollText } from 'lucide-react';

const TextsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <FileText className="size-8" />
          Historical Texts
        </h2>
        <p className="text-muted-foreground mt-2">
          Browse historical documents, writings, and literary works
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-lg border bg-card p-6">
            <BookOpen className="size-8 mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Classical Texts</h3>
            <p className="text-sm text-muted-foreground">
              Ancient philosophical and literary works
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <ScrollText className="size-8 mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Historical Records</h3>
            <p className="text-sm text-muted-foreground">
              Official histories and chronicles
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <FileText className="size-8 mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Poetry & Literature</h3>
            <p className="text-sm text-muted-foreground">
              Poems, essays, and literary collections
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Texts</h3>
          <p className="text-sm text-muted-foreground">
            Text browsing and search functionality coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default TextsPage;