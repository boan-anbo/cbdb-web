import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import GISExplorerPage from './GISExplorerPage';
import { mockPersonLocations, getMockLocationsByPersons, getMockLocationsByPeriod } from './mockData/mockPersonLocations';

const meta: Meta<typeof GISExplorerPage> = {
  title: 'Analytics/GIS/GISExplorer',
  component: GISExplorerPage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: '800px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view with all mock Song Dynasty figures
 */
export const Default: Story = {
  args: {
    initialLocations: mockPersonLocations,
  },
};

/**
 * Single person journey - Wang Anshi
 */
export const WangAnshi: Story = {
  args: {
    initialLocations: getMockLocationsByPersons([1]),
  },
};

/**
 * Multiple persons - Su Shi and Zhu Xi
 */
export const PoetsAndPhilosophers: Story = {
  args: {
    initialLocations: getMockLocationsByPersons([2, 3]),
  },
  parameters: {
    docs: {
      description: {
        story: 'Showing locations for Su Shi (poet) and Zhu Xi (philosopher)',
      },
    },
  },
};

/**
 * Early Song period (960-1100)
 */
export const EarlySong: Story = {
  args: {
    initialLocations: getMockLocationsByPeriod(960, 1100),
  },
  parameters: {
    docs: {
      description: {
        story: 'Locations from the early Song Dynasty period (960-1100)',
      },
    },
  },
};

/**
 * Southern Song period (1127-1279)
 */
export const SouthernSong: Story = {
  args: {
    initialLocations: getMockLocationsByPeriod(1127, 1279),
  },
  parameters: {
    docs: {
      description: {
        story: 'Locations from the Southern Song Dynasty period (1127-1279)',
      },
    },
  },
};

/**
 * Military figure - Yue Fei
 */
export const YueFei: Story = {
  args: {
    initialLocations: getMockLocationsByPersons([5]),
  },
  parameters: {
    docs: {
      description: {
        story: 'Locations for General Yue Fei, showing birthplace, death place, and burial site',
      },
    },
  },
};

/**
 * Comparison view - Reformers and Conservatives
 */
export const ReformersVsConservatives: Story = {
  args: {
    initialLocations: getMockLocationsByPersons([1, 4]), // Wang Anshi (reformer) vs Sima Guang (conservative)
  },
  parameters: {
    docs: {
      description: {
        story: 'Comparing locations of Wang Anshi (reformer) and Sima Guang (conservative)',
      },
    },
  },
};

/**
 * Dense data - All locations
 */
export const AllLocations: Story = {
  args: {
    initialLocations: mockPersonLocations,
  },
  parameters: {
    docs: {
      description: {
        story: 'All available location data for Song Dynasty figures',
      },
    },
  },
};