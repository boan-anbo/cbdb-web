import type { Meta, StoryObj } from '@storybook/react';
import PersonOfficesTab from './PersonOfficesTab';

const meta: Meta<typeof PersonOfficesTab> = {
  title: 'Legacy/PersonBrowser/Tabs/PersonOfficesTab',
  component: PersonOfficesTab,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="p-4 max-w-7xl mx-auto">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state with no person selected
 */
export const Default: Story = {
  args: {
    personId: null,
  },
};

/**
 * Loading state while fetching data
 */
export const Loading: Story = {
  args: {
    personId: 1762, // Wang Anshi
  },
  parameters: {
    mockData: {
      delay: 5000, // Simulate loading
    },
  },
};

/**
 * Wang Anshi (王安石) with 41 office appointments
 * A prominent Song dynasty statesman with extensive government service
 */
export const WangAnshi: Story = {
  args: {
    personId: 1762,
  },
};

/**
 * Su Shi (蘇軾) - Famous poet and official
 */
export const SuShi: Story = {
  args: {
    personId: 372,
  },
};

/**
 * Person with no office appointments
 */
export const NoOffices: Story = {
  args: {
    personId: 999999, // Non-existent person
  },
};

/**
 * Error state when API fails
 */
export const Error: Story = {
  args: {
    personId: -1, // Invalid ID to trigger error
  },
};