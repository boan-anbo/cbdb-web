import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import CHGISHistoricalMap from './CHGISHistoricalMap';
import type { MapMarker } from '../MapRenderer/types';

const meta = {
  title: 'Maps/CHGISHistoricalMap',
  component: CHGISHistoricalMap,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CHGISHistoricalMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicMap: Story = {
  name: 'Basic Historical Map',
  args: {
    year: 1070,
    displayMode: 'dots',
  },
};

export const RegionsMode: Story = {
  name: 'Regions Display Mode',
  args: {
    year: 1070,
    displayMode: 'regions',
  },
};

export const FilteredByType: Story = {
  name: 'Filtered by Prefecture (府)',
  args: {
    year: 1070,
    displayMode: 'dots',
    adminTypes: ['府'],
  },
};

export const WithPersonMarkers: Story = {
  name: 'With Historical Figures',
  args: {
    year: 1070,
    displayMode: 'dots',
    markers: [
      {
        id: 'person_1',
        coordinates: { longitude: 120.15, latitude: 30.28 },
        label: 'Su Shi (苏轼)',
        style: {
          color: '#DC143C',
          size: 10,
        },
        popup: {
          content: `
            <div>
              <strong>Su Shi (苏轼)</strong><br/>
              1037-1101<br/>
              Poet, painter, calligrapher<br/>
              Hangzhou Prefecture
            </div>
          `
        }
      },
      {
        id: 'person_2',
        coordinates: { longitude: 113.26, latitude: 23.13 },
        label: 'Wang Anshi (王安石)',
        style: {
          color: '#DC143C',
          size: 10,
        },
        popup: {
          content: `
            <div>
              <strong>Wang Anshi (王安石)</strong><br/>
              1021-1086<br/>
              Reformist Chancellor<br/>
              Guangzhou Prefecture
            </div>
          `
        }
      },
      {
        id: 'person_3',
        coordinates: { longitude: 116.39, latitude: 39.90 },
        label: 'Sima Guang (司马光)',
        style: {
          color: '#DC143C',
          size: 10,
        },
        popup: {
          content: `
            <div>
              <strong>Sima Guang (司马光)</strong><br/>
              1019-1086<br/>
              Historian, politician<br/>
              Capital region
            </div>
          `
        }
      }
    ] as MapMarker[],
    showCoastline: true,
  },
};

export const InteractiveExplorer: Story = {
  name: 'Interactive Explorer',
  render: () => {
    const [year, setYear] = React.useState(1070);
    const [displayMode, setDisplayMode] = React.useState<'dots' | 'regions'>('dots');

    return (
      <div className="h-full relative">
        <CHGISHistoricalMap
          year={year}
          displayMode={displayMode}
        />

        <div className="absolute top-20 left-4 bg-white/95 p-4 rounded-lg shadow-lg" style={{ width: '300px' }}>
          <h3 className="text-lg font-bold mb-3">Dynasty Timeline</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Year: {year} CE
              <span className="ml-2 text-xs text-gray-500">
                {year < 0 ? 'Pre-Imperial' :
                 year < 220 ? 'Han Dynasty' :
                 year < 589 ? 'Period of Disunion' :
                 year < 618 ? 'Sui Dynasty' :
                 year < 907 ? 'Tang Dynasty' :
                 year < 960 ? 'Five Dynasties' :
                 year < 1279 ? 'Song Dynasty' :
                 year < 1368 ? 'Yuan Dynasty' :
                 year < 1644 ? 'Ming Dynasty' :
                 'Qing Dynasty'}
              </span>
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
              <span>221 BCE</span>
              <span>1911 CE</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Display Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => setDisplayMode('dots')}
                className={`px-3 py-1 rounded text-sm ${
                  displayMode === 'dots'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Points
              </button>
              <button
                onClick={() => setDisplayMode('regions')}
                className={`px-3 py-1 rounded text-sm ${
                  displayMode === 'regions'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Regions
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-600">
            <div className="font-semibold mb-1">Quick Jump:</div>
            <div className="grid grid-cols-2 gap-1">
              <button onClick={() => setYear(-206)} className="text-left hover:text-blue-500">Han (206 BCE)</button>
              <button onClick={() => setYear(750)} className="text-left hover:text-blue-500">Tang (750)</button>
              <button onClick={() => setYear(1070)} className="text-left hover:text-blue-500">Song (1070)</button>
              <button onClick={() => setYear(1300)} className="text-left hover:text-blue-500">Yuan (1300)</button>
              <button onClick={() => setYear(1500)} className="text-left hover:text-blue-500">Ming (1500)</button>
              <button onClick={() => setYear(1750)} className="text-left hover:text-blue-500">Qing (1750)</button>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

