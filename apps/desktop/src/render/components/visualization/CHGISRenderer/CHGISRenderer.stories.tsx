import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import CHGISRenderer from './CHGISRenderer';
import type { MapMarker } from '../MapRenderer/types';

const meta: Meta<typeof CHGISRenderer> = {
  title: 'Maps/CHGISRenderer',
  component: CHGISRenderer,
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

/**
 * Basic CHGIS map showing Song Dynasty period (1070)
 */
export const SongDynasty: Story = {
  args: {
    year: 1070,
    showCounties: true,
    countyOpacity: 0.4,
    countySize: 5,
  },
};

/**
 * Tang Dynasty period (750)
 */
export const TangDynasty: Story = {
  args: {
    year: 750,
    showCounties: true,
    countyOpacity: 0.4,
    countySize: 5,
  },
};

/**
 * Ming Dynasty period (1500)
 */
export const MingDynasty: Story = {
  args: {
    year: 1500,
    showCounties: true,
    countyOpacity: 0.4,
    countySize: 5,
  },
};

/**
 * Qing Dynasty period (1800)
 */
export const QingDynasty: Story = {
  args: {
    year: 1800,
    showCounties: true,
    countyOpacity: 0.4,
    countySize: 5,
  },
};

/**
 * Interactive time slider
 */
export const WithTimeSlider: Story = {
  render: () => {
    const [year, setYear] = useState(1070);

    return (
      <div className="h-full flex flex-col">
        <div className="p-4 bg-white border-b">
          <div className="max-w-2xl mx-auto">
            <label className="block text-sm font-medium mb-2">
              Year: {year} CE
            </label>
            <input
              type="range"
              min="-221"
              max="1911"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>221 BCE (Qin)</span>
              <span>220 (Han ends)</span>
              <span>618 (Tang)</span>
              <span>960 (Song)</span>
              <span>1279 (Yuan)</span>
              <span>1368 (Ming)</span>
              <span>1644 (Qing)</span>
              <span>1911 (End)</span>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <CHGISRenderer
            year={year}
            showCounties={true}
            countyOpacity={0.4}
            countySize={5}
          />
        </div>
      </div>
    );
  },
};


/**
 * With overlay markers showing historical figures' locations
 */
export const WithHistoricalFigures: Story = {
  args: {
    year: 1070,
    showCounties: true,
    countyOpacity: 0.3,
    countySize: 4,
    markers: [
      {
        id: 'wang_anshi',
        coordinates: { longitude: 118.7969, latitude: 32.0603 },
        label: 'Wang Anshi',
        style: { color: '#FF0000', size: 12 },
        popup: { content: 'Wang Anshi (1021-1086)<br/>Song Dynasty Reformer' }
      },
      {
        id: 'su_shi',
        coordinates: { longitude: 120.1551, latitude: 30.2741 },
        label: 'Su Shi',
        style: { color: '#0066CC', size: 12 },
        popup: { content: 'Su Shi (1037-1101)<br/>Song Dynasty Poet' }
      },
      {
        id: 'sima_guang',
        coordinates: { longitude: 113.6253, latitude: 34.7466 },
        label: 'Sima Guang',
        style: { color: '#00AA00', size: 12 },
        popup: { content: 'Sima Guang (1019-1086)<br/>Song Dynasty Historian' }
      },
    ],
  },
};

/**
 * Filtered by administrative type
 */
export const FilteredByType: Story = {
  render: () => {
    const [showCounties, setShowCounties] = useState(true);
    const [showPrefectures, setShowPrefectures] = useState(true);
    const [year] = useState(1070);

    const countyTypes = [];
    if (showCounties) countyTypes.push('縣');
    if (showPrefectures) countyTypes.push('府', '州');

    return (
      <div className="h-full flex">
        <div className="w-64 p-4 bg-white border-r">
          <h3 className="font-semibold mb-3">Filter by Type</h3>
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={showCounties}
              onChange={(e) => setShowCounties(e.target.checked)}
              className="mr-2"
            />
            Counties (縣)
          </label>
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={showPrefectures}
              onChange={(e) => setShowPrefectures(e.target.checked)}
              className="mr-2"
            />
            Prefectures (府/州)
          </label>
        </div>
        <div className="flex-1">
          <CHGISRenderer
            year={year}
            showCounties={true}
            countyTypes={countyTypes.length > 0 ? countyTypes : undefined}
            countyOpacity={0.5}
            countySize={6}
          />
        </div>
      </div>
    );
  },
};

/**
 * Compare different dynasties
 */
export const DynastyComparison: Story = {
  render: () => {
    const dynasties = [
      { name: 'Han', year: 100 },
      { name: 'Tang', year: 750 },
      { name: 'Song', year: 1070 },
      { name: 'Yuan', year: 1300 },
      { name: 'Ming', year: 1500 },
      { name: 'Qing', year: 1800 },
    ];
    const [selectedDynasty, setSelectedDynasty] = useState(dynasties[2]);

    return (
      <div className="h-full flex flex-col">
        <div className="p-4 bg-white border-b">
          <div className="flex gap-2 justify-center">
            {dynasties.map(dynasty => (
              <button
                key={dynasty.name}
                onClick={() => setSelectedDynasty(dynasty)}
                className={`px-4 py-2 rounded ${
                  selectedDynasty.name === dynasty.name
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {dynasty.name} ({dynasty.year})
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <CHGISRenderer
            year={selectedDynasty.year}
            showCounties={true}
            countyOpacity={0.4}
            countySize={5}
          />
        </div>
      </div>
    );
  },
};