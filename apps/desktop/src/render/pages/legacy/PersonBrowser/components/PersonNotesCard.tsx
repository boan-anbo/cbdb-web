import React, { useState, useMemo } from 'react';
import {
  CBDBBlock,
  CBDBBlockContent,
  CBDBBlockHeader,
  CBDBBlockTitle,
} from '@/render/components/ui/cbdb-block';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/render/components/ui/collapsible';
import { Button } from '@/render/components/ui/button';
import { PersonModel } from '@cbdb/core';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface PersonNotesCardProps {
  fullPersonData: PersonModel | null;
  isLoadingPerson: boolean;
}

const CHARACTER_LIMIT = 500; // Show first 500 characters before truncating

export function PersonNotesCard({
  fullPersonData,
  isLoadingPerson,
}: PersonNotesCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { truncatedNotes, needsTruncation } = useMemo(() => {
    if (!fullPersonData?.notes) return { truncatedNotes: '', needsTruncation: false };

    const notes = fullPersonData.notes;
    const needsTruncation = notes.length > CHARACTER_LIMIT;

    if (!needsTruncation) {
      return { truncatedNotes: notes, needsTruncation: false };
    }

    // Find a good break point near the character limit
    let truncateAt = CHARACTER_LIMIT;
    const nearestPeriod = notes.lastIndexOf('.', CHARACTER_LIMIT + 50);
    const nearestComma = notes.lastIndexOf(',', CHARACTER_LIMIT + 50);

    if (nearestPeriod > CHARACTER_LIMIT - 50) {
      truncateAt = nearestPeriod + 1;
    } else if (nearestComma > CHARACTER_LIMIT - 50) {
      truncateAt = nearestComma + 1;
    }

    return {
      truncatedNotes: notes.substring(0, truncateAt).trim() + '...',
      needsTruncation: true
    };
  }, [fullPersonData?.notes]);
  return (
    <CBDBBlock className="w-full" collapsible defaultCollapsed={false}>
      <CBDBBlockHeader>
        <CBDBBlockTitle>Person Notes</CBDBBlockTitle>
      </CBDBBlockHeader>
      <CBDBBlockContent>
        {isLoadingPerson ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading notes...</span>
          </div>
        ) : fullPersonData?.notes ? (
          <div>
            {needsTruncation ? (
              <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <div className="prose prose-base dark:prose-invert max-w-none">
                  <span className="text-base leading-7 text-foreground">
                    {isOpen ? fullPersonData.notes : truncatedNotes}
                  </span>
                  {!isOpen && (
                    <CollapsibleTrigger asChild>
                      <button className="text-primary hover:underline ml-1 text-base">
                        more
                      </button>
                    </CollapsibleTrigger>
                  )}
                </div>
                {isOpen && (
                  <CollapsibleTrigger asChild>
                    <button className="text-primary hover:underline ml-1 text-base">
                      less
                    </button>
                  </CollapsibleTrigger>
                )}
              </Collapsible>
            ) : (
              <div className="prose prose-base dark:prose-invert max-w-none">
                <p className="text-base leading-7 text-foreground m-0">
                  {fullPersonData.notes}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-base text-muted-foreground italic m-0">
            No notes available for this person
          </p>
        )}
      </CBDBBlockContent>
    </CBDBBlock>
  );
}