import React from 'react';
import { Award } from 'lucide-react';
import { Badge } from '@/render/components/ui/badge';
import {
  CBDBBlock,
  CBDBBlockActions,
  CBDBBlockContent,
  CBDBBlockHeader,
  CBDBBlockTitle,
} from '@/render/components/ui/cbdb-block';
import { Status } from '@cbdb/core';

interface SocialStatusBlockProps {
  statuses?: Status[];
}

export const SocialStatusBlock: React.FC<SocialStatusBlockProps> = ({
  statuses,
}) => {
  if (!statuses || statuses.length === 0) {
    return null;
  }

  return (
    <CBDBBlock collapsible defaultCollapsed={true}>
      <CBDBBlockHeader>
        <CBDBBlockTitle className="flex items-center gap-2">
          <Award className="h-4 w-4" />
          Social Status
        </CBDBBlockTitle>
        <CBDBBlockActions>
          <Badge variant="secondary" className="text-xs">
            {statuses.length}
          </Badge>
        </CBDBBlockActions>
      </CBDBBlockHeader>
      <CBDBBlockContent>
        <div className="space-y-2">
          {statuses.map((status: any, idx) => {
            // Build compact info items for statuses
            const statusInfoItems = [];

            // Add period if exists (excluding -1 values)
            if ((status.firstYear && status.firstYear !== -1) ||
                (status.lastYear && status.lastYear !== -1)) {
              const firstYear = status.firstYear && status.firstYear !== -1 ? status.firstYear : null;
              const lastYear = status.lastYear && status.lastYear !== -1 ? status.lastYear : null;

              if (firstYear && lastYear) {
                statusInfoItems.push(`${firstYear} - ${lastYear}`);
              } else if (firstYear) {
                statusInfoItems.push(String(firstYear));
              } else if (lastYear) {
                statusInfoItems.push(`until ${lastYear}`);
              }
            }

            if (status.pages && !status.pages.includes('section_id')) {
              statusInfoItems.push(`p. ${status.pages}`);
            }

            return (
              <div key={idx} className="flex items-start gap-2 py-1.5 border-b last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-medium text-xs">
                      {status.statusDescChn ||
                        status.statusDesc ||
                        `Status Code ${status.statusCode}`}
                    </span>
                    {statusInfoItems.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {statusInfoItems.join(' • ')}
                      </span>
                    )}
                  </div>
                  {/* Only show notes if meaningful */}
                  {status.notes && status.notes !== '[n/a]' && (
                    <div className="text-xs text-muted-foreground italic mt-0.5">
                      Note: {status.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CBDBBlockContent>
    </CBDBBlock>
  );
};