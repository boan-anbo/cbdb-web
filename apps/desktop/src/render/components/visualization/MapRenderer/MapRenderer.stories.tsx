import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import MapRenderer from './MapRenderer';
import { MapData, MapMarker } from './types';

const meta: Meta<typeof MapRenderer> = {
  title: 'Maps/MapRenderer',
  component: MapRenderer,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: '600px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for basic map
const basicMarkers: MapMarker[] = [
  {
    id: 'beijing',
    coordinates: { longitude: 116.4074, latitude: 39.9042 },
    label: 'Beijing',
    style: { color: '#ff0000', size: 15 },
    popup: { content: '<strong>Beijing</strong><br/>Capital of China' }
  },
  {
    id: 'shanghai',
    coordinates: { longitude: 121.4737, latitude: 31.2304 },
    label: 'Shanghai',
    style: { color: '#0066cc', size: 12 },
    popup: { content: '<strong>Shanghai</strong><br/>Major port city' }
  },
  {
    id: 'xian',
    coordinates: { longitude: 108.9398, latitude: 34.3416 },
    label: "Xi'an",
    style: { color: '#00aa00', size: 10 },
    popup: { content: "<strong>Xi'an</strong><br/>Ancient capital" }
  },
];

/**
 * Basic map with default OpenStreetMap tiles
 */
export const Basic: Story = {
  args: {
    config: {
      center: { longitude: 105, latitude: 35 },
      zoom: 4,
    },
  },
};

/**
 * Map with markers
 */
export const WithMarkers: Story = {
  args: {
    data: {
      markers: basicMarkers,
    },
    config: {
      center: { longitude: 110, latitude: 35 },
      zoom: 4,
    },
  },
};

/**
 * Map with permanent labels
 */
export const WithLabels: Story = {
  args: {
    data: {
      markers: basicMarkers.map(m => ({
        ...m,
        style: {
          ...m.style,
          showLabel: true,
        }
      })),
    },
    config: {
      center: { longitude: 110, latitude: 35 },
      zoom: 4,
    },
  },
};

/**
 * Interactive map with click events
 */
export const Interactive: Story = {
  args: {
    data: {
      markers: basicMarkers,
    },
    config: {
      center: { longitude: 110, latitude: 35 },
      zoom: 4,
    },
    events: {
      onMarkerClick: (marker) => {
        console.log('Marker clicked:', marker);
        alert(`You clicked on ${marker.label || marker.id}`);
      },
      onMarkerHover: (marker) => {
        console.log('Marker hover:', marker);
      },
      onMapClick: (coordinates) => {
        console.log('Map clicked at:', coordinates);
      },
    },
  },
};

/**
 * Map with different marker styles
 */
export const ColoredMarkers: Story = {
  args: {
    data: {
      markers: [
        {
          id: 1,
          coordinates: { longitude: 116.4074, latitude: 39.9042 },
          style: { color: '#ff0000', size: 20 },
          popup: { content: 'Large red marker' }
        },
        {
          id: 2,
          coordinates: { longitude: 121.4737, latitude: 31.2304 },
          style: { color: '#00ff00', size: 15 },
          popup: { content: 'Medium green marker' }
        },
        {
          id: 3,
          coordinates: { longitude: 113.2644, latitude: 23.1291 },
          style: { color: '#0000ff', size: 10 },
          popup: { content: 'Small blue marker' }
        },
        {
          id: 4,
          coordinates: { longitude: 106.5507, latitude: 29.5647 },
          style: { color: '#ffaa00', size: 12 },
          popup: { content: 'Orange marker' }
        },
        {
          id: 5,
          coordinates: { longitude: 108.9398, latitude: 34.3416 },
          style: { color: '#ff00ff', size: 14 },
          popup: { content: 'Purple marker' }
        },
      ],
    },
    config: {
      center: { longitude: 110, latitude: 30 },
      zoom: 4,
    },
  },
};

/**
 * Dense map with many markers
 */
export const ManyMarkers: Story = {
  args: {
    data: {
      markers: Array.from({ length: 50 }, (_, i) => ({
        id: `marker-${i}`,
        coordinates: {
          longitude: 100 + Math.random() * 20,
          latitude: 25 + Math.random() * 20,
        },
        style: {
          color: `hsl(${Math.random() * 360}, 70%, 50%)`,
          size: 8 + Math.random() * 8,
        },
        popup: { content: `Point ${i + 1}` }
      })),
    },
    config: {
      center: { longitude: 110, latitude: 35 },
      zoom: 4,
    },
  },
};

/**
 * Map with lines connecting cities
 */
export const WithLines: Story = {
  args: {
    data: {
      markers: basicMarkers,
      lines: [
        {
          id: 'beijing-shanghai',
          coordinates: [
            { longitude: 116.4074, latitude: 39.9042 },
            { longitude: 121.4737, latitude: 31.2304 },
          ],
          style: { color: '#0066cc', width: 2 },
        },
        {
          id: 'shanghai-xian',
          coordinates: [
            { longitude: 121.4737, latitude: 31.2304 },
            { longitude: 108.9398, latitude: 34.3416 },
          ],
          style: { color: '#00aa00', width: 2 },
        },
        {
          id: 'xian-beijing',
          coordinates: [
            { longitude: 108.9398, latitude: 34.3416 },
            { longitude: 116.4074, latitude: 39.9042 },
          ],
          style: { color: '#ff0000', width: 2 },
        },
      ],
    },
    config: {
      center: { longitude: 113, latitude: 35 },
      zoom: 4.5,
    },
  },
};

/**
 * Empty map ready for data
 */
export const Empty: Story = {
  args: {
    config: {
      center: { longitude: 105, latitude: 35 },
      zoom: 3,
    },
    className: 'empty-map',
  },
};