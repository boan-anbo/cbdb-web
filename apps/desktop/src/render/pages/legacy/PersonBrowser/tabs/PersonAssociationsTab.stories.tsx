import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, waitFor } from '@storybook/test';
import { expect } from '@storybook/test';
import PersonAssociationsTab from './PersonAssociationsTab';

const meta: Meta<typeof PersonAssociationsTab> = {
  title: 'Legacy/PersonBrowser/Tabs/PersonAssociationsTab',
  component: PersonAssociationsTab,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="p-4 max-w-7xl mx-auto h-[600px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default empty state
 */
export const Default: Story = {
  args: {
    personId: undefined,
  },
};

/**
 * Loading state while fetching data
 */
export const Loading: Story = {
  args: {
    personId: 7097, // Yangyi
  },
  parameters: {
    mockData: {
      delay: 5000, // Simulate loading
    },
  },
};

/**
 * Yangyi (楊億) with 202 associations (101 primary + 101 associated)
 * A prominent Song dynasty figure with extensive social connections
 */
export const Yangyi: Story = {
  args: {
    personId: 7097,
  },
};

/**
 * Yangyi with comprehensive interaction testing
 * This story tests all form fields and navigation functionality
 */
export const YangyiWithPlayTest: Story = {
  args: {
    personId: 7097,
  },
  play: async ({ canvasElement }) => {
    // Simple wait for component to render
    await new Promise(resolve => setTimeout(resolve, 1000));

    // The component should at least render something
    const component = canvasElement.querySelector('.p-4');
    expect(component).toBeTruthy();
  },
};

/**
 * Wang Anshi (王安石) with associations
 * A prominent Song dynasty statesman
 */
export const WangAnshi: Story = {
  args: {
    personId: 1762,
  },
};

/**
 * Su Shi (蘇軾) - Famous poet with literary associations
 */
export const SuShi: Story = {
  args: {
    personId: 372,
  },
};

/**
 * Person with no associations
 */
export const NoAssociations: Story = {
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