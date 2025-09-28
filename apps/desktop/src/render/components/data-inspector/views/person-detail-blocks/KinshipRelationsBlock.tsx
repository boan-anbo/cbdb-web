import React from 'react';
import { Heart } from 'lucide-react';
import { Badge } from '@/render/components/ui/badge';
import {
  CBDBBlock,
  CBDBBlockActions,
  CBDBBlockContent,
  CBDBBlockHeader,
  CBDBBlockTitle,
} from '@/render/components/ui/cbdb-block';
import { KinshipWithFullRelations } from '@cbdb/core';

interface KinshipRelationsBlockProps {
  kinships: KinshipWithFullRelations[];
}

export const KinshipRelationsBlock: React.FC<KinshipRelationsBlockProps> = ({ kinships }) => {
  if (!kinships || kinships.length === 0) {
    return null;
  }

  return (
    <CBDBBlock collapsible defaultCollapsed={true} className="cbdb-detail-block">
      <CBDBBlockHeader className="text-xs">
        <CBDBBlockTitle className="flex items-center gap-2 text-xs">
          <Heart className="h-3 w-3" />
          Kinship Relations
        </CBDBBlockTitle>
        <CBDBBlockActions>
          {kinships.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {kinships.length}
            </Badge>
          )}
        </CBDBBlockActions>
      </CBDBBlockHeader>
      <CBDBBlockContent>
        <div className="space-y-2">
          {kinships.map((kinship: any, idx) => {
            // Build info items for compact display
            const infoItems = [];

            // Add life years if available (excluding -1)
            if (kinship.kinPersonInfo?.birthYear && kinship.kinPersonInfo.birthYear !== -1) {
              if (kinship.kinPersonInfo.deathYear && kinship.kinPersonInfo.deathYear !== -1) {
                infoItems.push(`${kinship.kinPersonInfo.birthYear} - ${kinship.kinPersonInfo.deathYear}`);
              } else {
                infoItems.push(`b. ${kinship.kinPersonInfo.birthYear}`);
              }
            } else if (kinship.kinPersonInfo?.deathYear && kinship.kinPersonInfo.deathYear !== -1) {
              infoItems.push(`d. ${kinship.kinPersonInfo.deathYear}`);
            }

            // Add source if available (prefer Chinese title)
            if (kinship.sourceTextInfo) {
              const sourceName = kinship.sourceTextInfo.titleChn || kinship.sourceTextInfo.title;
              if (sourceName) {
                infoItems.push(sourceName);
              }
            } else if (kinship.source) {
              // Fallback to source ID if text info not available
              infoItems.push(`Source ${kinship.source}`);
            }

            // Add pages if available and not section_id format
            if (kinship.pages && !kinship.pages.includes('section_id')) {
              infoItems.push(`p. ${kinship.pages}`);
            }

            // Add notes if meaningful (not auto-generated, not references)
            if (kinship.notes &&
                !kinship.notes.includes('LZL') &&
                !kinship.notes.includes('MasterFileLineID') &&
                kinship.notes !== '[n/a]') {
              infoItems.push(kinship.notes);
            }

            return (
              <div key={idx} className="flex items-start gap-2 py-1.5 border-b last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    {/* Relationship type badge */}
                    <Badge variant="outline" className="text-xs">
                      {kinship.kinshipTypeInfo?.kinshipTypeChn ||
                        kinship.kinshipTypeInfo?.kinshipType ||
                        `Code ${kinship.kinshipCode}`}
                    </Badge>
                    {/* Person name */}
                    <span className="font-medium text-xs">
                      {kinship.kinPersonInfo?.nameChn ||
                        kinship.kinPersonInfo?.name ||
                        `Person #${kinship.kinPersonId}`}
                    </span>
                    {/* Compact info including notes */}
                    {infoItems.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {infoItems.join(' • ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CBDBBlockContent>
    </CBDBBlock>
  );
};