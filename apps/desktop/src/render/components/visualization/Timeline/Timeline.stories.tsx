/**
 * Timeline Component Storybook Stories
 *
 * Demonstrates various configurations and use cases of the Timeline visualization component.
 */

import type { Meta, StoryObj } from '@storybook/react';
import Timeline from './Timeline';
import { TimelineData } from './Timeline.types';

const meta: Meta<typeof Timeline> = {
  title: 'Visualization/Timeline',
  component: Timeline,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    layout: {
      control: 'select',
      options: ['horizontal', 'vertical', 'grouped'],
    },
    width: {
      control: 'text',
    },
    height: {
      control: 'number',
    },
    showLegend: {
      control: 'boolean',
    },
    enableControls: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Timeline>;

// Sample data: Chinese Dynasties
const dynastyData: TimelineData = {
  events: [
    { id: '1', title: 'Qin Dynasty', startDate: -221, endDate: -206, category: 'unified', description: 'First unified Chinese empire' },
    { id: '2', title: 'Han Dynasty', startDate: -206, endDate: 220, category: 'unified', description: 'Golden age of Chinese culture' },
    { id: '3', title: 'Three Kingdoms', startDate: 220, endDate: 280, category: 'divided', description: 'Period of disunion' },
    { id: '4', title: 'Jin Dynasty', startDate: 266, endDate: 420, category: 'unified', description: 'Brief reunification' },
    { id: '5', title: 'Northern and Southern', startDate: 420, endDate: 589, category: 'divided', description: 'Division period' },
    { id: '6', title: 'Sui Dynasty', startDate: 581, endDate: 618, category: 'unified', description: 'Short-lived reunification' },
    { id: '7', title: 'Tang Dynasty', startDate: 618, endDate: 907, category: 'unified', description: 'Cultural zenith' },
    { id: '8', title: 'Five Dynasties', startDate: 907, endDate: 960, category: 'divided', description: 'Period of political upheaval' },
    { id: '9', title: 'Song Dynasty', startDate: 960, endDate: 1279, category: 'unified', description: 'Economic prosperity' },
    { id: '10', title: 'Yuan Dynasty', startDate: 1271, endDate: 1368, category: 'foreign', description: 'Mongol rule' },
    { id: '11', title: 'Ming Dynasty', startDate: 1368, endDate: 1644, category: 'unified', description: 'Restoration of Han rule' },
    { id: '12', title: 'Qing Dynasty', startDate: 1636, endDate: 1912, category: 'foreign', description: 'Manchu rule' },
  ],
  categories: [
    { name: 'unified', color: '#3b82f6', label: 'Unified Dynasty' },
    { name: 'divided', color: '#ef4444', label: 'Division Period' },
    { name: 'foreign', color: '#f59e0b', label: 'Foreign Rule' },
  ],
};

// Sample data: Person's life events (Wang Anshi)
const personalTimelineData: TimelineData = {
  events: [
    { id: '1', title: 'Birth', startDate: 1021, category: 'life', description: 'Born in Linchuan, Jiangxi' },
    { id: '2', title: 'Jinshi Degree', startDate: 1042, category: 'education', description: 'Passed imperial examination' },
    { id: '3', title: 'Magistrate of Yinxian', startDate: 1047, endDate: 1050, category: 'office', description: 'First major appointment' },
    { id: '4', title: 'Vice Commissioner', startDate: 1058, endDate: 1060, category: 'office', description: 'Finance commission' },
    { id: '5', title: 'Grand Councilor', startDate: 1070, endDate: 1074, category: 'office', description: 'Highest office, reform period' },
    { id: '6', title: 'New Policies Reform', startDate: 1069, endDate: 1076, category: 'political', description: 'Major reform program' },
    { id: '7', title: 'Second Term', startDate: 1075, endDate: 1076, category: 'office', description: 'Brief return to power' },
    { id: '8', title: 'Retirement', startDate: 1076, endDate: 1086, category: 'life', description: 'Retired to Jiangning' },
    { id: '9', title: 'Death', startDate: 1086, category: 'life', description: 'Died in Jiangning' },
  ],
  categories: [
    { name: 'life', color: '#10b981', label: 'Life Event' },
    { name: 'education', color: '#8b5cf6', label: 'Education' },
    { name: 'office', color: '#3b82f6', label: 'Official Position' },
    { name: 'political', color: '#f59e0b', label: 'Political Activity' },
  ],
};

// Sample data: Historical events timeline
const historicalEventsData: TimelineData = {
  events: [
    { id: '1', title: 'Battle of Red Cliffs', startDate: 208, category: 'military', description: 'Decisive battle' },
    { id: '2', title: 'An Lushan Rebellion', startDate: 755, endDate: 763, category: 'rebellion', description: 'Major Tang dynasty rebellion' },
    { id: '3', title: 'Invention of Printing', startDate: 868, category: 'cultural', description: 'First printed book' },
    { id: '4', title: 'Wang Anshi Reforms', startDate: 1069, endDate: 1076, category: 'political', description: 'New Policies' },
    { id: '5', title: 'Mongol Invasion', startDate: 1205, endDate: 1279, category: 'military', description: 'Conquest of China' },
    { id: '6', title: 'Zheng He Voyages', startDate: 1405, endDate: 1433, category: 'exploration', description: 'Maritime expeditions' },
    { id: '7', title: 'Manchu Conquest', startDate: 1618, endDate: 1683, category: 'military', description: 'Qing takeover' },
    { id: '8', title: 'Opium Wars', startDate: 1839, endDate: 1860, category: 'military', description: 'Wars with Britain' },
    { id: '9', title: 'Taiping Rebellion', startDate: 1850, endDate: 1864, category: 'rebellion', description: 'Major civil war' },
    { id: '10', title: 'Xinhai Revolution', startDate: 1911, endDate: 1912, category: 'political', description: 'End of imperial rule' },
  ],
};

// Empty state data
const emptyData: TimelineData = {
  events: [],
};

// Dense timeline with many events
const denseTimelineData: TimelineData = {
  events: Array.from({ length: 50 }, (_, i) => ({
    id: `event-${i}`,
    title: `Event ${i + 1}`,
    startDate: 1000 + i * 10 + Math.floor(Math.random() * 5),
    endDate: 1000 + i * 10 + 5 + Math.floor(Math.random() * 10),
    category: ['political', 'cultural', 'military', 'economic'][i % 4],
    description: `Description for event ${i + 1}`,
  })),
};

// Primary story: Chinese Dynasties
export const ChineseDynasties: Story = {
  args: {
    data: dynastyData,
    layout: 'horizontal',
    height: 500,
    showLegend: true,
    enableControls: false,
    dateFormatter: (year) => year < 0 ? `${-year} BCE` : `${year} CE`,
  },
};

// Personal timeline story
export const PersonalTimeline: Story = {
  args: {
    data: personalTimelineData,
    layout: 'horizontal',
    height: 400,
    showLegend: true,
    layoutConfig: {
      marginLeft: 200,
      showLabels: true,
    },
  },
};

// Historical events story
export const HistoricalEvents: Story = {
  args: {
    data: historicalEventsData,
    layout: 'horizontal',
    height: 450,
    showLegend: true,
    colorScale: {
      military: '#ef4444',
      rebellion: '#f59e0b',
      cultural: '#3b82f6',
      political: '#10b981',
      exploration: '#8b5cf6',
    } as any,
  },
};

// Dense timeline story
export const DenseTimeline: Story = {
  args: {
    data: denseTimelineData,
    layout: 'horizontal',
    height: 800,
    showLegend: false,
    layoutConfig: {
      marginLeft: 120,
      showLabels: false,
    },
  },
};

// Empty state story
export const EmptyState: Story = {
  args: {
    data: emptyData,
    layout: 'horizontal',
    height: 400,
  },
};

// Interactive story with event handlers
export const Interactive: Story = {
  args: {
    data: personalTimelineData,
    layout: 'horizontal',
    height: 400,
    showLegend: true,
    enableControls: true,
    onEventClick: (event) => {
      console.log('Event clicked:', event);
      alert(`Clicked: ${event.title}`);
    },
    onEventHover: (event) => {
      console.log('Event hover:', event);
    },
    onTimeRangeChange: (start, end) => {
      console.log('Time range changed:', start, end);
    },
  },
};

// Custom styled timeline
export const CustomStyling: Story = {
  args: {
    data: {
      events: [
        { id: '1', title: 'Project Start', startDate: 2020, category: 'milestone' },
        { id: '2', title: 'Phase 1', startDate: 2020, endDate: 2021, category: 'phase' },
        { id: '3', title: 'Phase 2', startDate: 2021, endDate: 2022, category: 'phase' },
        { id: '4', title: 'Phase 3', startDate: 2022, endDate: 2023, category: 'phase' },
        { id: '5', title: 'Launch', startDate: 2023, category: 'milestone' },
        { id: '6', title: 'Post-Launch', startDate: 2023, endDate: 2024, category: 'phase' },
      ],
    },
    layout: 'horizontal',
    height: 300,
    showLegend: true,
    colorScale: {
      milestone: '#dc2626',
      phase: '#2563eb',
    } as any,
    layoutConfig: {
      marginLeft: 150,
      showGrid: true,
    },
  },
};

// Compact timeline
export const Compact: Story = {
  args: {
    data: {
      events: dynastyData.events.slice(0, 5),
    },
    layout: 'horizontal',
    height: 250,
    showLegend: false,
    layoutConfig: {
      marginTop: 20,
      marginBottom: 20,
      marginLeft: 100,
      showLabels: true,
    },
  },
};