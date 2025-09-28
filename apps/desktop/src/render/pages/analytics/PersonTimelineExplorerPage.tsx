/**
 * PersonTimelineExplorerPage
 *
 * Interactive explorer for person life timelines with comprehensive filtering
 * and visualization controls. Uses the Timeline visualization component.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePersonTimeline } from '@/render/hooks/usePersonTimeline';
import {
  CBDBPage,
  CBDBPageHeader,
  CBDBPageTitle,
  CBDBPageDescription,
  CBDBPageContent,
} from '@/render/components/ui/cbdb-page';
import {
  CBDBBlock,
  CBDBBlockContent,
  CBDBBlockHeader,
  CBDBBlockTitle,
  CBDBBlockActions,
} from '@/render/components/ui/cbdb-block';
import Timeline from '@/render/components/visualization/Timeline/Timeline';
import TimelineList from '@/render/components/visualization/TimelineList/TimelineList';
import {
  TimelineData,
  TimelineEvent,
} from '@/render/components/visualization/Timeline/Timeline.types';
import { PersonAutocomplete } from '@/render/components/person-autocomplete';
import { Button } from '@/render/components/ui/button';
import { Label } from '@/render/components/ui/label';
import { Switch } from '@/render/components/ui/switch';
import { Slider } from '@/render/components/ui/slider';
import { Badge } from '@/render/components/ui/badge';
import { Separator } from '@/render/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/render/components/ui/tooltip';
import { cn } from '@/render/lib/utils';
import {
  Calendar,
  Clock,
  RefreshCw,
  MapPin,
  Users,
  FileText,
  Building,
  GraduationCap,
  Heart,
  BarChart3,
  LayoutList,
} from 'lucide-react';
import { toast } from 'sonner';
import { PersonSuggestionDataView } from '@cbdb/core';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/render/components/ui/toggle-group';

// Event type configurations
const EVENT_TYPE_CONFIG = {
  birth: { icon: Heart, color: '#10b981', label: 'Birth' },
  death: { icon: Heart, color: '#6b7280', label: 'Death' },
  office: { icon: Building, color: '#3b82f6', label: 'Office' },
  kinship: { icon: Users, color: '#f59e0b', label: 'Kinship' },
  association: { icon: Users, color: '#8b5cf6', label: 'Association' },
  entry: { icon: GraduationCap, color: '#ec4899', label: 'Entry/Exam' },
  text: { icon: FileText, color: '#14b8a6', label: 'Text' },
  address: { icon: MapPin, color: '#f97316', label: 'Address' },
  event: { icon: Calendar, color: '#6366f1', label: 'Event' },
};

interface FilterOptions {
  eventTypes: string[];
  startYear?: number;
  endYear?: number;
}

interface TimelineStats {
  totalEvents: number;
  eventCounts: Record<string, number>;
  dateRange: { start: number; end: number };
  lifespan?: number;
  locationsCount: number;
  relatedEntitiesCount: number;
}

const PersonTimelineExplorerPage: React.FC = () => {
  // State
  const [selectedPerson, setSelectedPerson] =
    useState<PersonSuggestionDataView | null>(() => {
      // Default to Xin Qiji
      return new PersonSuggestionDataView({
        id: 30359,
        name: 'Xin Qiji',
        nameChn: '辛棄疾',
        birthYear: null,
        deathYear: null,
        indexYear: null,
        dynastyCode: null,
        dynasty: null,
        dynastyChn: null,
      });
    });
  const [timelineLayout] = useState<'horizontal' | 'vertical'>('vertical');
  const [viewMode, setViewMode] = useState<'plot' | 'list'>('plot');

  // Store initial event counts (unfiltered) for the current person
  const [initialEventCounts, setInitialEventCounts] = useState<Record<string, number>>({});

  // Filters
  const [filters, setFilters] = useState<FilterOptions>({
    eventTypes: Object.keys(EVENT_TYPE_CONFIG),
  });

  // Get query client for cache invalidation
  const queryClient = useQueryClient();

  // Fetch timeline data using custom hook
  const { data, isLoading, error, refetch } = usePersonTimeline(
    selectedPerson?.id,
    {
      includeRelatedEntities: true,
      includeLocations: true,
      startYear: filters.startYear?.toString(),
      endYear: filters.endYear?.toString(),
      eventTypes: filters.eventTypes,
    },
    !!selectedPerson,
  );

  // Debug logging
  console.log('[PersonTimelineExplorer] State:', {
    selectedPerson: selectedPerson?.id,
    isLoading,
    error: error?.message,
    dataReceived: !!data,
    timelineEvents: data?.result?.timeline?.events?.length || 0,
  });

  // Store initial event counts when data loads with all filters enabled
  React.useEffect(() => {
    if (data?.result?.timeline && filters.eventTypes.length === Object.keys(EVENT_TYPE_CONFIG).length) {
      // We have all filters enabled - this is our baseline
      const counts: Record<string, number> = {};
      data.result.timeline.events.forEach((event) => {
        if (event.eventType) {
          counts[event.eventType] = (counts[event.eventType] || 0) + 1;
        }
      });
      setInitialEventCounts(counts);
    }
  }, [data, filters.eventTypes.length]);

  // Process timeline data for visualization
  const { timelineData, stats, personName } = useMemo(() => {
    if (!data?.result?.timeline) {
      return { timelineData: null, stats: null, personName: '' };
    }

    const timeline = data.result.timeline;
    const personName = timeline.personName || `Person ${timeline.personId}`;

    // Define event type priority for sorting within same year
    const eventPriority: Record<string, number> = {
      birth: 1, // Birth always first
      entry: 2, // Examinations/entries early
      office: 3, // Office appointments
      association: 4, // Associations
      kinship: 5, // Kinship relations
      text: 6, // Text authorship
      address: 7, // Address changes
      death: 999, // Death always last
    };

    // Convert CBDB timeline to visualization format
    const timelineEvents: TimelineEvent[] = timeline.events
      .filter((event) => {
        // Filter out events without valid dates first
        const eventYear = event.year || event.startYear;
        if (!eventYear) return false;

        // Apply event type filter
        if (!filters.eventTypes.includes(event.eventType)) return false;

        // Apply year range filter
        if (filters.startYear && eventYear < filters.startYear) return false;
        if (filters.endYear && eventYear > filters.endYear) return false;

        return true;
      })
      .sort((a, b) => {
        // Sort chronologically with special ordering for same-year events
        const yearA = a.year || a.startYear || 0;
        const yearB = b.year || b.startYear || 0;

        // Different years: sort by year
        if (yearA !== yearB) {
          return yearA - yearB;
        }

        // Same year: sort by event type priority
        const priorityA = eventPriority[a.eventType] || 50; // Default middle priority
        const priorityB = eventPriority[b.eventType] || 50;

        return priorityA - priorityB;
      })
      .map((event, index) => {
        // At this point, we know the event has a valid year
        const eventYear = event.year || event.startYear;
        return {
          id: `${event.personId}-${index}`,
          title: event.title,
          startDate: eventYear!, // We filtered out events without years above
          endDate: event.endYear,
          category: event.eventType,
          description: event.description,
          metadata: {
            location: event.location,
            relatedEntities: event.relatedEntities,
          },
        };
      });

    const timelineData: TimelineData = {
      events: timelineEvents,
      categories: Object.entries(EVENT_TYPE_CONFIG).map(([name, config]) => ({
        name,
        color: config.color,
      })),
    };

    // Calculate statistics
    const stats: TimelineStats = {
      totalEvents: timelineEvents.length,
      eventCounts: {},
      dateRange: { start: 0, end: 0 },
      lifespan: undefined,
      locationsCount: 0,
      relatedEntitiesCount: 0,
    };

    // Count events by type
    timelineEvents.forEach((event) => {
      stats.eventCounts[event.category] =
        (stats.eventCounts[event.category] || 0) + 1;
      if (event.metadata?.location) stats.locationsCount++;
      if (event.metadata?.relatedEntities?.length) {
        stats.relatedEntitiesCount += event.metadata.relatedEntities.length;
      }
    });

    // Calculate date range
    if (timelineEvents.length > 0) {
      const dates = timelineEvents
        .flatMap((e) => [e.startDate, e.endDate])
        .filter((d) => d !== undefined) as number[];
      stats.dateRange.start = Math.min(...dates);
      stats.dateRange.end = Math.max(...dates);
    }

    // Calculate lifespan if birth and death are present
    if (timeline.birthYear && timeline.deathYear) {
      stats.lifespan = timeline.deathYear - timeline.birthYear;
    }

    return { timelineData, stats, personName };
  }, [data, filters]);

  // Handlers
  const handlePersonSelect = useCallback(
    (person: PersonSuggestionDataView | null) => {
      setSelectedPerson(person);
      // Reset filters and initial counts when selecting new person
      setFilters({
        eventTypes: Object.keys(EVENT_TYPE_CONFIG),
      });
      setInitialEventCounts({});
    },
    [],
  );

  const handleEventTypeToggle = useCallback(
    (type: string, enabled: boolean) => {
      setFilters((prev) => ({
        ...prev,
        eventTypes: enabled
          ? [...prev.eventTypes, type]
          : prev.eventTypes.filter((t) => t !== type),
      }));
    },
    [],
  );

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['person-timeline', selectedPerson?.id],
    });
    refetch();
  }, [queryClient, refetch, selectedPerson]);

  // Handle timeline event interactions
  const handleEventClick = useCallback((event: TimelineEvent) => {
    console.log('Event clicked:', event);
    toast.info(`${event.title}: ${event.description || 'No description'}`);
  }, []);

  const handleEventHover = useCallback((event: TimelineEvent | null) => {
    // Could show tooltip or update a detail panel
    console.log('Event hover:', event);
  }, []);

  return (
    <CBDBPage>
      <CBDBPageHeader>
        <div className="flex items-center justify-between">
          <div>
            <CBDBPageTitle className="flex items-center gap-3">
              <Clock className="h-6 w-6" />
              Person Timeline Explorer
            </CBDBPageTitle>
            <CBDBPageDescription>
              Explore individual life trajectories through interactive timelines
            </CBDBPageDescription>
          </div>
          {personName && (
            <Badge variant="outline" className="text-lg px-4 py-2">
              {personName} (ID: {selectedPerson?.id})
            </Badge>
          )}
        </div>
      </CBDBPageHeader>

      <CBDBPageContent>
        <div className="flex flex-col gap-6">
          {/* Consolidated Controls Section */}
          <CBDBBlock collapsible>
            <CBDBBlockHeader>
              <CBDBBlockTitle>Timeline Controls</CBDBBlockTitle>
            </CBDBBlockHeader>
            <CBDBBlockContent>
              <div className="space-y-4">
                {/* First Row: Person Selection and Event Types */}
                <div className="flex flex-wrap gap-4">
                  {/* Person Selection */}
                  <div className="min-w-[250px] flex-1">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Person Selection
                      </Label>
                      <PersonAutocomplete
                        value={selectedPerson}
                        onSelect={handlePersonSelect}
                        placeholder="Select person..."
                        enableHistory={true}
                        updateSelectorOnSelect={true}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Event Type Filters - Show all types that have data in initial load */}
                  <div className="min-w-[300px] flex-1">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Event Types</Label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(EVENT_TYPE_CONFIG)
                          .filter(
                            ([type]) => (initialEventCounts[type] || 0) > 0,  // Only show if person has this event type
                          )
                          .map(([type, config]) => {
                            const Icon = config.icon;
                            // Show current filtered count / initial count
                            const currentCount = stats?.eventCounts[type] || 0;
                            const totalCount = initialEventCounts[type] || 0;
                            const isEnabled = filters.eventTypes.includes(type);

                            return (
                              <div
                                key={type}
                                className="flex items-center gap-1"
                              >
                                <Switch
                                  id={type}
                                  checked={isEnabled}
                                  onCheckedChange={(checked) =>
                                    handleEventTypeToggle(type, checked)
                                  }
                                  className="scale-75"
                                />
                                <Label
                                  htmlFor={type}
                                  className="flex items-center gap-1 text-xs cursor-pointer font-normal"
                                >
                                  <Icon
                                    className="h-3 w-3"
                                    style={{ color: config.color }}
                                  />
                                  {config.label}
                                  <Badge
                                    variant="secondary"
                                    className="text-xs h-4 px-1"
                                  >
                                    {currentCount}/{totalCount}
                                  </Badge>
                                </Label>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Second Row: Year Range */}
                <div className="w-full">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Year Range</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {filters.startYear || -500}
                      </span>
                      <Slider
                        value={[filters.startYear || -500, filters.endYear || 2000]}
                        onValueChange={(values) => {
                          setFilters((prev) => ({
                            ...prev,
                            startYear: values[0],
                            endYear: values[1],
                          }));
                        }}
                        min={-500}
                        max={2000}
                        step={10}
                        className="flex-1 max-w-xl"
                      />
                      <span className="text-xs text-muted-foreground w-12">
                        {filters.endYear || 2000}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CBDBBlockContent>
          </CBDBBlock>

          {/* Timeline Visualization with View Toggle */}
          <div className="w-full">
            <CBDBBlock>
              <CBDBBlockHeader>
                <CBDBBlockTitle>Life Timeline</CBDBBlockTitle>
                <CBDBBlockActions>
                  {stats && (
                    <>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>{stats.totalEvents} events</span>
                        {stats.lifespan && <span>{stats.lifespan} years</span>}
                        {stats.locationsCount > 0 && (
                          <span>{stats.locationsCount} locations</span>
                        )}
                        {stats.relatedEntitiesCount > 0 && (
                          <span>{stats.relatedEntitiesCount} entities</span>
                        )}
                      </div>
                      <Separator orientation="vertical" className="h-4" />
                    </>
                  )}
                  <ToggleGroup
                    type="single"
                    value={viewMode}
                    onValueChange={(value) =>
                      value && setViewMode(value as 'plot' | 'list')
                    }
                    className="gap-1"
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <ToggleGroupItem
                            value="plot"
                            aria-label="Plot view"
                            size="sm"
                            className={cn(
                              viewMode === 'plot' && 'text-primary',
                            )}
                          >
                            <BarChart3 className="h-4 w-4" />
                          </ToggleGroupItem>
                        </TooltipTrigger>
                        <TooltipContent>Timeline Plot View</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <ToggleGroupItem
                            value="list"
                            aria-label="List view"
                            size="sm"
                            className={cn(
                              viewMode === 'list' && 'text-primary',
                            )}
                          >
                            <LayoutList className="h-4 w-4" />
                          </ToggleGroupItem>
                        </TooltipTrigger>
                        <TooltipContent>Timeline List View</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </ToggleGroup>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={!selectedPerson || isLoading}
                    className="h-6 w-6 p-0"
                  >
                    <RefreshCw
                      className={cn('h-3 w-3', isLoading && 'animate-spin')}
                    />
                  </Button>
                </CBDBBlockActions>
              </CBDBBlockHeader>
              <CBDBBlockContent scrollable maxHeight="calc(100vh - 400px)">
                {isLoading ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center space-y-4">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Loading timeline...
                      </p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center space-y-4">
                      <p className="text-destructive">
                        Error loading timeline: {(error as Error).message}
                      </p>
                      <Button onClick={handleRefresh} variant="outline">
                        Try Again
                      </Button>
                    </div>
                  </div>
                ) : !timelineData || timelineData.events.length === 0 ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center space-y-4">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {!selectedPerson
                          ? 'Select a person to view their timeline'
                          : 'No timeline events found'}
                      </p>
                    </div>
                  </div>
                ) : viewMode === 'plot' ? (
                  <Timeline
                    data={timelineData}
                    layout={timelineLayout}
                    onEventClick={handleEventClick}
                    onEventHover={handleEventHover}
                    height={600}
                  />
                ) : (
                  <TimelineList
                    events={timelineData.events}
                    onEventClick={handleEventClick}
                  />
                )}
              </CBDBBlockContent>
            </CBDBBlock>
          </div>
        </div>
      </CBDBPageContent>
    </CBDBPage>
  );
};

export default PersonTimelineExplorerPage;
