/**
 * TimelineList Component
 *
 * A card-based list view of timeline events, grouped by year.
 * Alternative to the plot visualization for timeline data.
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/render/components/ui/card';
import { Badge } from '@/render/components/ui/badge';
import { Separator } from '@/render/components/ui/separator';
import { ScrollArea } from '@/render/components/ui/scroll-area';
import {
  Calendar, MapPin, Users, FileText, Building,
  GraduationCap, Heart, Home, User
} from 'lucide-react';
import { cn } from '@/render/lib/utils';

// Event type configurations
const EVENT_ICONS: Record<string, any> = {
  birth: Heart,
  death: Heart,
  office: Building,
  kinship: Users,
  association: Users,
  entry: GraduationCap,
  text: FileText,
  address: MapPin,
  event: Calendar,
};

const EVENT_COLORS: Record<string, string> = {
  birth: '#10b981',
  death: '#6b7280',
  office: '#3b82f6',
  kinship: '#f59e0b',
  association: '#8b5cf6',
  entry: '#ec4899',
  text: '#14b8a6',
  address: '#f97316',
  event: '#6366f1',
};

interface TimelineEvent {
  id: string;
  title: string;
  startDate: number;
  endDate?: number;
  category: string;
  description?: string;
  metadata?: {
    location?: any;
    relatedEntities?: any[];
  };
}

interface TimelineListProps {
  events: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
  className?: string;
}

export const TimelineList: React.FC<TimelineListProps> = ({
  events,
  onEventClick,
  className
}) => {
  // Group events by year
  const groupedEvents = useMemo(() => {
    const groups = new Map<number, TimelineEvent[]>();

    events.forEach(event => {
      const year = event.startDate;
      if (!groups.has(year)) {
        groups.set(year, []);
      }
      groups.get(year)!.push(event);
    });

    // Sort years and events within each year
    const sortedGroups = Array.from(groups.entries())
      .sort(([yearA], [yearB]) => yearA - yearB)
      .map(([year, yearEvents]) => ({
        year,
        events: yearEvents
      }));

    return sortedGroups;
  }, [events]);

  const formatYear = (year: number) => {
    if (year < 0) {
      return `${Math.abs(year)} BCE`;
    }
    return `${year} CE`;
  };

  const getEventIcon = (category: string) => {
    const Icon = EVENT_ICONS[category] || Calendar;
    return Icon;
  };

  return (
    <ScrollArea className={cn("h-[600px] pr-4", className)}>
      <div className="space-y-4">
        {groupedEvents.map(({ year, events: yearEvents }) => (
          <div key={year} className="space-y-2">
            {/* Year Header */}
            <div className="flex items-center gap-4 py-2">
              <div className="h-px flex-1 bg-border" />
              <Badge variant="outline" className="text-base font-semibold px-4 py-1">
                {formatYear(year)}
              </Badge>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Events for this year */}
            <div className="space-y-3">
              {yearEvents.map((event) => {
                const Icon = getEventIcon(event.category);
                const color = EVENT_COLORS[event.category] || '#6b7280';

                return (
                  <Card
                    key={event.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      "border-l-4"
                    )}
                    style={{ borderLeftColor: color }}
                    onClick={() => onEventClick?.(event)}
                  >
                    <CardHeader className="pb-2 pt-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Icon
                            className="h-4 w-4 mt-0.5"
                            style={{ color }}
                          />
                          <CardTitle className="text-base">
                            {event.title}
                          </CardTitle>
                        </div>
                        {event.endDate && event.endDate !== event.startDate && (
                          <Badge variant="secondary" className="text-xs">
                            {formatYear(event.startDate)} - {formatYear(event.endDate)}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    {(event.metadata?.location || event.metadata?.relatedEntities?.length) && (
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2">
                          {event.metadata?.location && (
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              {event.metadata.location.name || 'Location'}
                            </Badge>
                          )}

                          {event.metadata?.relatedEntities?.map((entity, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              <User className="h-3 w-3 mr-1" />
                              {entity.name || `Person ${entity.id}`}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))}

        {groupedEvents.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            No events to display
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default TimelineList;