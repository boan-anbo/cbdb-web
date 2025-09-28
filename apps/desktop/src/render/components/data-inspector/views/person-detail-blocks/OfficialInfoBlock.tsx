import React from 'react';
import { Building2 } from 'lucide-react';
import { Badge } from '@/render/components/ui/badge';
import {
  CBDBBlock,
  CBDBBlockActions,
  CBDBBlockContent,
  CBDBBlockHeader,
  CBDBBlockTitle,
} from '@/render/components/ui/cbdb-block';
import { Separator } from '@/render/components/ui/separator';
import { OfficeWithFullRelations, Entry } from '@cbdb/core';

interface OfficialInfoBlockProps {
  offices?: OfficeWithFullRelations[];
  entries?: Entry[];
}

export const OfficialInfoBlock: React.FC<OfficialInfoBlockProps> = ({
  offices,
  entries,
}) => {
  if ((!offices || offices.length === 0) && (!entries || entries.length === 0)) {
    return null;
  }

  // Sort offices by firstYear (ascending)
  const sortedOffices = offices ? [...offices].sort((a, b) => {
    const yearA = a.firstYear && a.firstYear !== -1 ? a.firstYear : 9999;
    const yearB = b.firstYear && b.firstYear !== -1 ? b.firstYear : 9999;
    return yearA - yearB;
  }) : [];

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
          <Building2 className="h-3 w-3" />
          Office
        </CBDBBlockTitle>
        <CBDBBlockActions>
          <Badge variant="secondary" className="text-xs">
            {(entries?.length || 0) + (sortedOffices?.length || 0)}
          </Badge>
        </CBDBBlockActions>
      </CBDBBlockHeader>
      <CBDBBlockContent className="space-y-4">
        {/* Entry Method Section */}
        {entries && entries.length > 0 && (
          <div>
            <h4 className="text-xs font-medium mb-2 text-muted-foreground">
              Entry
            </h4>
            <div className="space-y-2">
              {entries.map((entry: any, idx) => {
                const entryInfoItems = [];

                if (entry.year && entry.year !== -1) {
                  entryInfoItems.push(`${entry.year}`);
                }

                if (entry.age && entry.age !== -1) {
                  entryInfoItems.push(`Age ${entry.age}`);
                }

                if (entry.examRank) {
                  entryInfoItems.push(`Rank ${entry.examRank}`);
                }

                return (
                  <div key={`entry-${idx}`} className="flex items-start gap-2 py-1.5 border-b last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-medium text-xs">
                          {entry.entryDescChn || entry.entryDesc || `Entry Code ${entry.entryCode}`}
                        </span>
                        {entryInfoItems.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {entryInfoItems.join(' • ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Offices Section */}
        {sortedOffices.length > 0 && (
          <>
            {entries && entries.length > 0 && (
              <Separator className="my-3" />
            )}
            <div>
              <h4 className="text-xs font-medium mb-2 text-muted-foreground">
                Offices
              </h4>
              <div className="space-y-2">
                {sortedOffices.map((office: any, idx) => {
                // Build compact info items
                const infoItems = [];

                // Add appointment type if exists and not 未詳
                if (office.appointmentTypeInfo &&
                    office.appointmentTypeInfo.nameChn !== '未詳' &&
                    office.appointmentTypeInfo.name !== '未詳') {
                  infoItems.push(office.appointmentTypeInfo.nameChn || office.appointmentTypeInfo.name);
                }

                // Add period with nianhao if exists (excluding -1 values)
                if ((office.firstYear && office.firstYear !== -1) ||
                    (office.lastYear && office.lastYear !== -1)) {
                  const firstYear = office.firstYear && office.firstYear !== -1 ? office.firstYear : null;
                  const lastYear = office.lastYear && office.lastYear !== -1 ? office.lastYear : null;

                  let periodStr = '';
                  if (firstYear && lastYear) {
                    // Format with nianhao if available
                    const firstYearStr = office.firstYearNianHao?.nameChn && office.firstYearNhYear ?
                      `${firstYear} (${office.firstYearNianHao.nameChn} ${office.firstYearNhYear})` :
                      String(firstYear);
                    const lastYearStr = office.lastYearNianHao?.nameChn && office.lastYearNhYear ?
                      `${lastYear} (${office.lastYearNianHao.nameChn} ${office.lastYearNhYear})` :
                      String(lastYear);
                    periodStr = `${firstYearStr} - ${lastYearStr}`;
                  } else if (firstYear) {
                    const firstYearStr = office.firstYearNianHao?.nameChn && office.firstYearNhYear ?
                      `${firstYear} (${office.firstYearNianHao.nameChn} ${office.firstYearNhYear})` :
                      String(firstYear);
                    periodStr = `from ${firstYearStr}`;
                  } else if (lastYear) {
                    const lastYearStr = office.lastYearNianHao?.nameChn && office.lastYearNhYear ?
                      `${lastYear} (${office.lastYearNianHao.nameChn} ${office.lastYearNhYear})` :
                      String(lastYear);
                    periodStr = `until ${lastYearStr}`;
                  }

                  if (periodStr) {
                    infoItems.push(periodStr);
                  }
                }

                // Add location if exists
                if (office.postingAddressInfo &&
                    office.postingAddressInfo.nameChn !== '未詳') {
                  infoItems.push(office.postingAddressInfo.nameChn || office.postingAddressInfo.name);
                }

                // Add assume office info if meaningful (not 未詳)
                if (office.assumeOfficeInfo &&
                    office.assumeOfficeInfo.descriptionChn !== '未詳' &&
                    office.assumeOfficeInfo.description !== '未詳') {
                  infoItems.push(office.assumeOfficeInfo.descriptionChn || office.assumeOfficeInfo.description);
                }

                // Add pages only if not section_id format
                if (office.pages && !office.pages.includes('section_id')) {
                  infoItems.push(`p. ${office.pages}`);
                }

                // Check if notes contain useful info (not LZL references, not duplicate of office name)
                const officeName = office.officeInfo?.nameChn || office.officeInfo?.nameEng;
                const hasUsefulNotes = office.notes &&
                  !office.notes.includes('LZL') &&
                  !office.notes.includes('MasterFileLineID') &&
                  office.notes !== officeName &&
                  office.notes !== '[n/a]';

                return (
                  <div key={idx} className="flex items-start gap-2 py-1.5 border-b last:border-0">
                    {/* Office title */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-medium text-xs">
                          {office.officeInfo?.nameChn ||
                            office.officeInfo?.nameEng ||
                            `Office #${office.officeId}`}
                        </span>
                        {infoItems.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {infoItems.join(' • ')}
                          </span>
                        )}
                      </div>

                      {/* Only show notes if meaningful */}
                      {hasUsefulNotes && (
                        <div className="text-xs text-muted-foreground italic mt-0.5">
                          {office.notes.includes('Hartwell defined') ?
                            office.notes :
                            `Note: ${office.notes}`}
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