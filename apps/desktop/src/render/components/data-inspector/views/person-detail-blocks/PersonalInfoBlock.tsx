import React, { useState } from 'react';
import { User, Calendar, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/render/components/ui/badge';
import { Button } from '@/render/components/ui/button';
import {
  CBDBBlock,
  CBDBBlockActions,
  CBDBBlockContent,
  CBDBBlockHeader,
  CBDBBlockTitle,
} from '@/render/components/ui/cbdb-block';
import { Separator } from '@/render/components/ui/separator';
import { PersonModel, AltName, Event, Status } from '@cbdb/core';
import { toast } from 'sonner';

interface PersonalInfoBlockProps {
  person: PersonModel;
  alternativeNames?: AltName[];
  events?: Event[];
  statuses?: Status[];
  onRefresh: () => Promise<void>;
}

export const PersonalInfoBlock: React.FC<PersonalInfoBlockProps> = ({
  person,
  alternativeNames,
  events,
  statuses,
  onRefresh,
}) => {
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);

  // Helper function to render a data field
  const renderField = (label: string, value: any, fallback: string = '—') => {
    if (!value && value !== 0) return null;
    return (
      <div className="flex justify-between items-start py-0.5">
        <span className="text-xs text-muted-foreground">{label}:</span>
        <span className="text-xs font-medium">{value || fallback}</span>
      </div>
    );
  };

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
    <CBDBBlock className="cbdb-detail-block">
      <CBDBBlockHeader className="text-xs">
        <CBDBBlockTitle className="flex items-center gap-2 text-xs">
          <User className="h-3 w-3" />
          Personal Information
        </CBDBBlockTitle>
        <CBDBBlockActions>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={async () => {
              await onRefresh();
              toast.success('Person details refreshed');
            }}
          >
            <RefreshCw className="h-2.5 w-2.5" />
          </Button>
        </CBDBBlockActions>
      </CBDBBlockHeader>
      <CBDBBlockContent className="space-y-4">
        {/* Basic Info Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold">
              {person.nameChn || person.name}
            </span>
            {person.name && person.nameChn && (
              <span className="text-xs text-muted-foreground">
                ({person.name})
              </span>
            )}
            <Badge variant="outline" className="text-xs">
              {person.female === 1 ? 'Female' : 'Male'}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {renderField('Person ID', person.id)}
            {renderField(
              'Dynasty',
              person.dynastyNameChn ||
                person.dynastyName ||
                `Code: ${person.dynastyCode}`,
            )}
            {renderField(
              'Birth Year',
              formatYearWithNianhao(
                person.birthYear,
                person.birthYearNhNameChn,
                person.birthYearNhYear,
              ),
            )}
            {renderField(
              'Death Year',
              formatYearWithNianhao(
                person.deathYear,
                person.deathYearNhNameChn,
                person.deathYearNhYear,
              ),
            )}
            {renderField('Index Year', person.indexYear)}
            {person.indexAddrNameChn &&
              renderField('Index Address', person.indexAddrNameChn)}
            {person.ethnicityChn &&
              renderField('Ethnicity', person.ethnicityChn)}
            {person.householdStatusChn &&
              renderField('Household Status', person.householdStatusChn)}
            {person.choronymNameChn &&
              renderField('Choronym (郡望)', person.choronymNameChn)}
            {person.birthdayCalendar &&
              renderField('Birthday', person.birthdayCalendar)}
            {person.deathdayCalendar &&
              renderField('Deathday', person.deathdayCalendar)}
          </div>
        </div>

        {/* Alternative Names Section */}
        {alternativeNames && alternativeNames.length > 0 && (() => {
          // Filter out "未詳" (unknown) placeholder names
          const validAltNames = alternativeNames.filter(altName =>
            altName.altNameChn !== '未詳' &&
            altName.altName !== 'Weixiang'
          );

          if (validAltNames.length === 0) return null;

          return (
            <>
              <Separator className="my-3" />
              <div>
                <h4 className="text-xs font-medium mb-2 text-muted-foreground">
                  Alternative Names
                </h4>
                <div className="flex flex-wrap gap-2">
                  {validAltNames.map((altName, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 text-xs bg-muted/50 rounded-md px-1 py-0"
                    >
                      <Badge variant="outline" className="text-xs">
                        {altName.altNameTypeDescChn ||
                          altName.altNameTypeDesc ||
                          `Type ${altName.altNameTypeCode}`}
                      </Badge>
                      <span className="font-medium">
                        {altName.altNameChn || altName.altName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          );
        })()}

        {/* Social Status Section */}
        {statuses && statuses.length > 0 && (
          <>
            <Separator className="my-3" />
            <div>
              <h4 className="text-xs font-medium mb-2 text-muted-foreground">
                Social Status
              </h4>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status: any, idx) => {
                  // Remove square brackets from status description
                  let statusName = status.statusDescChn || status.statusDesc || `Status Code ${status.statusCode}`;
                  statusName = statusName.replace(/\[|\]/g, '');

                  // Build year range if exists
                  let yearRange = '';
                  if ((status.firstYear && status.firstYear !== -1) ||
                      (status.lastYear && status.lastYear !== -1)) {
                    const firstYear = status.firstYear && status.firstYear !== -1 ? status.firstYear : '';
                    const lastYear = status.lastYear && status.lastYear !== -1 ? status.lastYear : '';

                    if (firstYear && lastYear) {
                      yearRange = `${firstYear}-${lastYear}`;
                    } else if (firstYear) {
                      yearRange = `from ${firstYear}`;
                    } else if (lastYear) {
                      yearRange = `until ${lastYear}`;
                    }
                  }

                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 text-xs bg-muted/50 rounded-md px-1 py-0"
                    >
                      <Badge variant="outline" className="text-xs">
                        {statusName}
                      </Badge>
                      {yearRange && (
                        <span className="text-muted-foreground">
                          {yearRange}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Notes Section */}
        {person.notes && person.notes.trim() && (
          <>
            <Separator className="my-3" />
            <div>
              <h4 className="text-xs font-medium mb-2 text-muted-foreground">
                Notes
              </h4>
              <div className="text-xs text-muted-foreground">
                {(() => {
                  const lines = person.notes.split('\n').filter(line => line.trim());
                  const shouldShowToggle = lines.length > 3 || person.notes.length > 300;

                  if (!shouldShowToggle || isNotesExpanded) {
                    return (
                      <>
                        <div className="whitespace-pre-wrap">{person.notes}</div>
                        {shouldShowToggle && (
                          <Button
                            variant="link"
                            size="sm"
                            className="text-xs p-0 h-auto mt-1"
                            onClick={() => setIsNotesExpanded(false)}
                          >
                            <ChevronUp className="h-3 w-3 mr-1" />
                            Show less
                          </Button>
                        )}
                      </>
                    );
                  }

                  // Show first 3 lines or first 300 characters
                  const previewLines = lines.slice(0, 3).join('\n');
                  const preview = previewLines.length > 300
                    ? previewLines.substring(0, 297) + '...'
                    : (lines.length > 3 ? previewLines + '...' : previewLines);

                  return (
                    <>
                      <div className="whitespace-pre-wrap">{preview}</div>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs p-0 h-auto mt-1"
                        onClick={() => setIsNotesExpanded(true)}
                      >
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Show more
                      </Button>
                    </>
                  );
                })()}
              </div>
            </div>
          </>
        )}

        {/* Life Events Section */}
        {events && events.length > 0 &&
         events.some(event => event.eventNameChn || event.eventName || event.eventCode || event.eventYear) && (
          <>
            <Separator className="my-3" />
            <div>
              <h4 className="text-xs font-medium mb-2 text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Life Events
              </h4>
              <div className="space-y-2">
                {events.map((event: any, idx) => {
                  // Skip events with no meaningful data
                  if (!event.eventNameChn && !event.eventName && !event.eventCode && !event.eventYear) {
                    return null;
                  }

                  return (
                  <div
                    key={idx}
                    className="text-xs border-l-2 border-muted pl-3"
                  >
                    <div className="font-medium">
                      {event.eventNameChn ||
                        event.eventName ||
                        (event.eventCode ? `Event Code ${event.eventCode}` : 'Unnamed Event')}
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      {event.eventYear && (
                        <div>Year: {event.eventYear}</div>
                      )}
                      {event.eventPlaceChn && (
                        <div>Place: {event.eventPlaceChn}</div>
                      )}
                      {event.notes && (
                        <div className="italic">Notes: {event.notes}</div>
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