/**
 * Timeline Component
 *
 * A data-agnostic timeline visualization component using Observable Plot.
 * Supports multiple event types, date ranges, and interactive features.
 *
 * @example
 * ```tsx
 * const timelineData: TimelineData = {
 *   events: [
 *     { id: '1', title: 'Event 1', startDate: 1000, endDate: 1050, category: 'political' },
 *     { id: '2', title: 'Event 2', startDate: 1025, category: 'cultural' }
 *   ]
 * };
 * <Timeline data={timelineData} layout="horizontal" />
 * ```
 */

import React, { useEffect, useRef, useMemo, forwardRef, useImperativeHandle, useState } from 'react';
import * as Plot from '@observablehq/plot';
import { TimelineProps, TimelineData, TimelineEvent, TimelineControlAPI } from './Timeline.types';

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#6366f1', // indigo
  '#84cc16', // lime
];

const Timeline = forwardRef<TimelineControlAPI, TimelineProps>(({
  data,
  layout = 'vertical',
  layoutConfig = {},
  width = '100%',
  height = 400,
  enableControls = false,
  controlsConfig = {},
  showLegend = true,
  dateFormatter = (year) => year < 0 ? `${-year} BCE` : `${year} CE`,
  onEventClick,
  onEventHover,
  onTimeRangeChange,
  colorScale,
  minYear,
  maxYear
}, ref) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentZoom = useRef(1);
  const currentPan = useRef(0);
  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 400 });

  // Process timeline data for Plot
  const plotData = useMemo(() => {
    return data.events
      .filter(event => {
        // Filter out invalid years more aggressively
        const start = event.startDate;
        const end = event.endDate;

        // Exclude common invalid year markers
        const invalidYears = [0, -1, 1, 999, 9999];
        const isValidStart = start && !invalidYears.includes(start) && Math.abs(start) > 10;
        const isValidEnd = !end || (!invalidYears.includes(end) && Math.abs(end) > 10);

        // Also exclude if the year range is suspiciously small near 0
        if (start && Math.abs(start) < 100 && (!end || Math.abs(end) < 100)) {
          return false;
        }

        return isValidStart && isValidEnd;
      })
      .map(event => {
        const start = event.startDate;
        const end = event.endDate || event.startDate;

        if (layout === 'vertical') {
          return {
            ...event,
            y1: start,
            y2: end === start ? start + 0.5 : end,
            x: event.title,
            isPointEvent: !event.endDate
          };
        } else {
          return {
            ...event,
            x1: start,
            x2: end === start ? start + 0.5 : end,
            y: event.title,
            isPointEvent: !event.endDate
          };
        }
      });
  }, [data.events, layout]);

  // Calculate date range
  const dateRange = useMemo(() => {
    const dates = layout === 'vertical'
      ? plotData.flatMap(d => [d.y1, d.y2].filter(v => v !== undefined))
      : plotData.flatMap(d => [d.x1, d.x2].filter(v => v !== undefined));
    const min = minYear ?? (dates.length ? Math.min(...dates) : 0);
    const max = maxYear ?? (dates.length ? Math.max(...dates) : 2000);

    // Round to nice boundaries
    return {
      min: Math.floor(min / 10) * 10,
      max: Math.ceil(max / 10) * 10
    };
  }, [plotData, minYear, maxYear, layout]);

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerDimensions({
          width: width || 800,
          height: containerDimensions.height
        });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Get unique categories and assign colors
  const categoryColors = useMemo(() => {
    const categories = [...new Set(data.events.map(e => e.category).filter(Boolean))];
    const colors: Record<string, string> = {};

    if (typeof colorScale === 'function') {
      categories.forEach(cat => {
        if (cat) colors[cat] = colorScale(cat);
      });
    } else if (Array.isArray(colorScale)) {
      categories.forEach((cat, i) => {
        if (cat) colors[cat] = colorScale[i % colorScale.length];
      });
    } else {
      categories.forEach((cat, i) => {
        if (cat) colors[cat] = DEFAULT_COLORS[i % DEFAULT_COLORS.length];
      });
    }

    return colors;
  }, [data.events, colorScale]);

  // Render the plot
  useEffect(() => {
    if (!plotRef.current || plotData.length === 0) return;

    // Clear existing plot
    plotRef.current.innerHTML = '';

    // Get container dimensions - use observed dimensions when width is percentage
    const containerWidth = typeof width === 'number'
      ? width
      : containerDimensions.width;
    const containerHeight = typeof height === 'number' ? height : 400;

    // Apply default layout config
    const config = {
      marginTop: 40,
      marginBottom: 40,
      marginLeft: 150,
      marginRight: 40,
      showLabels: true,
      showGrid: true,
      showAxis: true,
      ...layoutConfig
    };

    // Create marks
    const marks: any[] = [];

    // Timeline bars
    if (layout === 'vertical') {
      // Vertical layout
      marks.push(
        Plot.barY(plotData, {
          y1: 'y1',
          y2: 'y2',
          x: 'x',
          fill: (d: any) => d.category ? categoryColors[d.category] : '#94a3b8',
          sort: { x: 'y1' },
          stroke: 'white',
          strokeWidth: 1,
          opacity: 0.8,
          tip: true,
          channels: {
            Title: 'title',
            Period: (d: any) => `${dateFormatter(d.y1)} - ${dateFormatter(d.y2)}`,
            Category: 'category',
            Description: 'description'
          }
        })
      );

      // Event labels
      if (config.showLabels) {
        marks.push(
          Plot.text(plotData, {
            y: 'y1',
            x: 'x',
            text: (d: any) => {
              const label = d.title;
              return label.length > 30 ? label.substring(0, 27) + '...' : label;
            },
            textAnchor: 'start',
            dy: -5,
            fontSize: 10,
            fill: '#374151',
            rotate: -45
          })
        );
      }

      // Point event markers
      marks.push(
        Plot.dot(plotData.filter((d: any) => d.isPointEvent), {
          y: 'y1',
          x: 'x',
          r: 4,
          fill: (d: any) => d.category ? categoryColors[d.category] : '#94a3b8',
          stroke: 'white',
          strokeWidth: 2
        })
      );
    } else {
      // Horizontal layout
      marks.push(
        Plot.barX(plotData, {
          x1: 'x1',
          x2: 'x2',
          y: 'y',
          fill: (d: any) => d.category ? categoryColors[d.category] : '#94a3b8',
          sort: { y: 'x1' },
          stroke: 'white',
          strokeWidth: 1,
          opacity: 0.8,
          tip: true,
          channels: {
            Title: 'title',
            Period: (d: any) => `${dateFormatter(d.x1)} - ${dateFormatter(d.x2)}`,
            Category: 'category',
            Description: 'description'
          }
        })
      );

      // Event labels
      if (config.showLabels) {
        marks.push(
          Plot.text(plotData, {
            x: 'x1',
            y: 'y',
            text: (d: any) => {
              const label = d.title;
              return label.length > 40 ? label.substring(0, 37) + '...' : label;
            },
            textAnchor: 'end',
            dx: -5,
            fontSize: 11,
            fill: '#374151'
          })
        );
      }

      // Point event markers
      marks.push(
        Plot.dot(plotData.filter((d: any) => d.isPointEvent), {
          x: 'x1',
          y: 'y',
          r: 4,
          fill: (d: any) => d.category ? categoryColors[d.category] : '#94a3b8',
          stroke: 'white',
          strokeWidth: 2
        })
      );
    }

    // Create the plot with layout-specific configuration
    const plotConfig: any = {
      width: containerWidth,
      height: containerHeight,
      marginTop: config.marginTop,
      marginBottom: config.marginBottom,
      marginLeft: config.marginLeft,
      marginRight: config.marginRight,
      marks,
      style: {
        backgroundColor: 'transparent',
        fontFamily: 'Inter, system-ui, sans-serif'
      }
    };

    if (layout === 'vertical') {
      // Vertical layout: time on Y axis
      plotConfig.y = {
        axis: config.showAxis ? 'left' : null,
        grid: config.showGrid,
        domain: [dateRange.min, dateRange.max],
        tickFormat: dateFormatter,
        label: null,
        reverse: true // Time flows down
      };
      plotConfig.x = {
        padding: 0.1,
        tickSize: 0,
        label: null,
        axis: null // Hide event names on x-axis for cleaner look
      };
      plotConfig.height = Math.max(600, plotData.length * 20); // Dynamic height based on events
      plotConfig.marginBottom = 100; // More space for rotated labels
    } else {
      // Horizontal layout: time on X axis
      plotConfig.x = {
        axis: config.showAxis ? 'top' : null,
        grid: config.showGrid,
        domain: [dateRange.min, dateRange.max],
        tickFormat: dateFormatter,
        label: null
      };
      plotConfig.y = {
        padding: 0.2,
        tickSize: 0,
        label: null
      };
    }

    const plot = Plot.plot(plotConfig);

    plotRef.current.appendChild(plot);

    // Add event handlers
    if (onEventClick || onEventHover) {
      const handleClick = (event: MouseEvent) => {
        const target = event.target as SVGElement;
        if (target.tagName === 'rect' || target.tagName === 'circle') {
          // Find corresponding event
          const rect = target.getBoundingClientRect();
          // This is simplified - in production you'd need more sophisticated hit testing
          const clickedEvent = plotData[0]; // Placeholder
          if (onEventClick) onEventClick(clickedEvent);
        }
      };

      const handleMouseOver = (event: MouseEvent) => {
        if (onEventHover) {
          // Similar hit testing logic
          const hoveredEvent = plotData[0]; // Placeholder
          onEventHover(hoveredEvent);
        }
      };

      const handleMouseOut = () => {
        if (onEventHover) onEventHover(null);
      };

      plotRef.current.addEventListener('click', handleClick);
      plotRef.current.addEventListener('mouseover', handleMouseOver);
      plotRef.current.addEventListener('mouseout', handleMouseOut);

      return () => {
        if (plotRef.current) {
          plotRef.current.removeEventListener('click', handleClick);
          plotRef.current.removeEventListener('mouseover', handleMouseOver);
          plotRef.current.removeEventListener('mouseout', handleMouseOut);
        }
      };
    }
  }, [plotData, layout, layoutConfig, width, height, dateFormatter, categoryColors, dateRange, onEventClick, onEventHover, containerDimensions]);

  // Expose control API
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      currentZoom.current *= 1.2;
      // Re-render with new zoom
    },
    zoomOut: () => {
      currentZoom.current /= 1.2;
      // Re-render with new zoom
    },
    reset: () => {
      currentZoom.current = 1;
      currentPan.current = 0;
      // Re-render
    },
    panTo: (year: number) => {
      currentPan.current = year;
      // Re-render centered on year
    },
    setTimeRange: (start: number, end: number) => {
      if (onTimeRangeChange) onTimeRangeChange(start, end);
    },
    exportImage: (format: 'png' | 'svg') => {
      // Export logic
      console.log(`Exporting as ${format}`);
    }
  }), [onTimeRangeChange]);

  if (!data || data.events.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No timeline data available
      </div>
    );
  }

  return (
    <div ref={containerRef} className="timeline-container w-full" style={{ position: 'relative' }}>
      {/* Legend */}
      {showLegend && Object.keys(categoryColors).length > 0 && (
        <div className="flex flex-wrap gap-3 p-3 bg-muted/30 rounded-lg mb-4">
          {Object.entries(categoryColors).map(([category, color]) => (
            <div key={category} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm capitalize">{category}</span>
            </div>
          ))}
        </div>
      )}

      {/* Timeline Plot */}
      <div
        ref={plotRef}
        className="timeline-plot w-full"
        style={{ height: typeof height === 'number' ? height : 'auto' }}
      />

      {/* Controls (if enabled) */}
      {enableControls && (
        <div className="timeline-controls absolute top-2 right-2 flex gap-2">
          {/* Control buttons would go here */}
        </div>
      )}
    </div>
  );
});

Timeline.displayName = 'Timeline';

export default Timeline;