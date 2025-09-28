import type { Meta, StoryObj } from '@storybook/react';
import PersonKinshipsTab from './PersonKinshipsTab';

const meta: Meta<typeof PersonKinshipsTab> = {
  title: 'Legacy/PersonBrowser/Tabs/PersonKinshipsTab',
  component: PersonKinshipsTab,
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
 * Wang Anshi (王安石) with kinship relations
 * Note: Access shows 136 relations, but current DB has 25
 */
export const WangAnshi: Story = {
  args: {
    personId: 1762,
  },
};

/**
 * Su Shi (蘇軾) - Famous poet with family relations
 */
export const SuShi: Story = {
  args: {
    personId: 372,
  },
};

/**
 * Pi Rixiu (皮日休) - Tang dynasty poet
 */
export const PiRixiu: Story = {
  args: {
    personId: 3702,
  },
};

/**
 * Person with no kinship relations
 */
export const NoKinships: Story = {
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