import React from 'react';
import { Users, BookOpen } from 'lucide-react';
import { Badge } from '@/render/components/ui/badge';
import {
  CBDBBlock,
  CBDBBlockActions,
  CBDBBlockContent,
  CBDBBlockHeader,
  CBDBBlockTitle,
} from '@/render/components/ui/cbdb-block';
import { Separator } from '@/render/components/ui/separator';
import { AssociationFullExtendedModel, Text } from '@cbdb/core';

interface SocialLiteraryBlockProps {
  associations?: AssociationFullExtendedModel[];
  texts?: Text[];
}

export const SocialLiteraryBlock: React.FC<SocialLiteraryBlockProps> = ({
  associations,
  texts,
}) => {
  const hasData =
    (associations && associations.length > 0) ||
    (texts && texts.length > 0);

  if (!hasData) {
    return null;
  }

  // Calculate total count
  const totalCount =
    (associations?.length || 0) + (texts?.length || 0);

  // Helper to format year with nianhao
  const formatYearWithNianhao = (
    year: number | null,
    nhName: string | null,
    nhYear: number | null,
  ) => {
    if (!year) return '—';
    let result = String(year);
    if (nhName && nhYear) {
      result += ` (${nhName} ${nhYear})`;
    }
    return result;
  };

  return (
    <CBDBBlock collapsible defaultCollapsed={true} className="cbdb-detail-block">
      <CBDBBlockHeader className="text-xs">
        <CBDBBlockTitle className="flex items-center gap-2 text-xs">
          <Users className="h-3 w-3" />
          Social Associations
        </CBDBBlockTitle>
        <CBDBBlockActions>
          {totalCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {totalCount}
            </Badge>
          )}
        </CBDBBlockActions>
      </CBDBBlockHeader>
      <CBDBBlockContent className="space-y-4">
        {/* Social Associations Section */}
        {associations && associations.length > 0 && (
          <div className="space-y-2">
              {associations.map((assoc: any, idx) => {
                // Check if we have meaningful via information (not 未詳)
                const hasVia = assoc.kinPersonInfo &&
                  assoc.kinPersonInfo.nameChn !== '未詳' &&
                  assoc.kinPersonInfo.name !== '未詳';

                const hasAssocVia = assoc.assocKinPersonInfo &&
                  assoc.assocKinPersonInfo.nameChn !== '未詳' &&
                  assoc.assocKinPersonInfo.name !== '未詳';

                // Build compact info items
                const infoItems = [];

                // Add period if exists (excluding -1 which means unknown)
                if ((assoc.firstYear && assoc.firstYear !== -1) ||
                    (assoc.lastYear && assoc.lastYear !== -1)) {
                  const firstYear = assoc.firstYear && assoc.firstYear !== -1 ? assoc.firstYear : null;
                  const lastYear = assoc.lastYear && assoc.lastYear !== -1 ? assoc.lastYear : null;

                  if (firstYear && lastYear) {
                    infoItems.push(`${firstYear} - ${lastYear}`);
                  } else if (firstYear) {
                    infoItems.push(String(firstYear));
                  } else if (lastYear) {
                    infoItems.push(String(lastYear));
                  }
                }

                // Add via information if meaningful
                if (hasVia) {
                  const viaName = assoc.kinPersonInfo.nameChn || assoc.kinPersonInfo.name;
                  const kinType = assoc.kinTypeInfo?.kinshipTypeChn || assoc.kinTypeInfo?.kinshipType;
                  infoItems.push(`via ${viaName}${kinType ? ` (${kinType})` : ''}`);
                }

                // Add text title if exists
                if (assoc.textTitle && assoc.textTitle !== '[n/a]') {
                  infoItems.push(assoc.textTitle);
                }

                // Add pages if exists
                if (assoc.pages) {
                  infoItems.push(`p. ${assoc.pages}`);
                }

                // Get association type and replace Y with the person's name
                let associationType = assoc.associationTypeInfo?.assocTypeChn ||
                  assoc.associationTypeInfo?.assocType ||
                  `Code ${assoc.assocCode}`;

                // Replace Y with the actual person name in the association type
                if (associationType.includes('Y')) {
                  const personName = assoc.assocPersonInfo?.nameChn ||
                    assoc.assocPersonInfo?.name ||
                    `Person #${assoc.assocPersonId}`;
                  associationType = associationType.replace(/Y/g, ` ${personName} `);
                }

                return (
                  <div key={idx} className="flex items-start gap-2 py-1.5 border-b last:border-0">
                    {/* Association type badge with Y replaced */}
                    <Badge variant="outline" className="text-xs shrink-0">
                      {associationType}
                    </Badge>

                    {/* Person name and details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-medium text-xs">
                          {assoc.assocPersonInfo?.nameChn ||
                            assoc.assocPersonInfo?.name ||
                            `Person #${assoc.assocPersonId}`}
                        </span>
                        {infoItems.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {infoItems.join(' • ')}
                          </span>
                        )}
                      </div>

                      {/* Only show notes if they exist, are meaningful, and not duplicate */}
                      {assoc.notes &&
                       assoc.notes !== '[n/a]' &&
                       !assoc.notes.includes('Assoc count') &&
                       assoc.notes !== assoc.textTitle &&
                       !assoc.textTitle?.includes(assoc.notes) &&
                       !assoc.notes.includes(assoc.textTitle) && (
                        <div className="text-xs text-muted-foreground italic mt-0.5">
                          {assoc.notes}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Text Associations Section */}
        {texts && texts.length > 0 && (
          <>
            {associations && associations.length > 0 && (
              <Separator className="my-3" />
            )}
            <div>
              <h4 className="text-xs font-medium mb-2 text-muted-foreground flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                Literary Works & Texts
              </h4>
              <div className="space-y-2">
                {texts.map((text: any, idx) => {
                  // Build compact info items for texts (excluding role since it's in badge)
                  const textInfoItems = [];

                  if (text.year && text.year !== -1) {
                    textInfoItems.push(String(text.year));
                  }

                  if (text.pages) {
                    textInfoItems.push(`p. ${text.pages}`);
                  }

                  return (
                    <div key={idx} className="flex items-start gap-2 py-1.5 border-b last:border-0">
                      {/* Text type/role badge if available */}
                      {text.textRoleChn && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          {text.textRoleChn}
                        </Badge>
                      )}

                      {/* Text title and details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-medium text-xs">
                            {text.textNameChn ||
                              text.textName ||
                              `Text #${text.textId}`}
                          </span>
                          {textInfoItems.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {textInfoItems.join(' • ')}
                            </span>
                          )}
                        </div>

                        {/* Only show notes if meaningful */}
                        {text.notes && text.notes !== '[n/a]' && (
                          <div className="text-xs text-muted-foreground italic mt-0.5">
                            {text.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CBDBBlockContent>
    </CBDBBlock>
  );
};