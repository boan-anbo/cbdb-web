import type { Meta, StoryObj } from '@storybook/react';
import { within, waitFor, expect } from '@storybook/test';
import PersonBirthDeathTab from './PersonBirthDeathTab';

const meta = {
  title: 'Legacy/PersonBrowser/Tabs/PersonBirthDeathTab',
  component: PersonBirthDeathTab,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Birth/Death Year tab component that fetches and displays person biographical data. Replicates the Access Person Browser Birth/Death Year tab.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    personId: {
      control: 'number',
      description: 'The ID of the person to display',
    }
  }
} satisfies Meta<typeof PersonBirthDeathTab>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default story with Wang Anshi (王安石)
 * Shows complete birth/death data with Nian Hao reign periods
 */
export const WangAnshi: Story = {
  args: {
    personId: 1762
  },
  parameters: {
    docs: {
      description: {
        story: 'Wang Anshi (王安石, 1021-1086) - Song Dynasty politician and poet with complete birth/death data'
      }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for data to load
    await waitFor(async () => {
      // Should not show loading message after data loads
      const loadingMessage = canvas.queryByText(/Loading birth\/death data/);
      expect(loadingMessage).toBeNull();

      // Should show some birth/death content
      const content = canvasElement.querySelector('.space-y-4');
      expect(content).toBeTruthy();
    }, { timeout: 5000 });
  }
};

/**
 * Person with floruit years - Pi Rixiu (皮日休)
 * Shows data for someone with approximate dates and floruit years
 */
export const WithFloruitYears: Story = {
  args: {
    personId: 3702
  },
  parameters: {
    docs: {
      description: {
        story: 'Pi Rixiu (皮日休, ca. 834-883) - Tang Dynasty poet with approximate dates and floruit years'
      }
    }
  }
};

/**
 * Person with minimal data
 * Shows how the component handles sparse data
 */
export const MinimalData: Story = {
  args: {
    personId: 1
  },
  parameters: {
    docs: {
      description: {
        story: 'Person ID 1 - Shows component behavior with minimal biographical data'
      }
    }
  }
};

/**
 * No person selected
 * Shows the empty state when no person ID is provided
 */
export const NoPersonSelected: Story = {
  args: {
    personId: null
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state shown when no person is selected'
      }
    }
  }
};

/**
 * Invalid person ID
 * Shows error handling for non-existent person
 */
export const InvalidPerson: Story = {
  args: {
    personId: 99999999
  },
  parameters: {
    docs: {
      description: {
        story: 'Error state when person ID does not exist in database'
      }
    }
  }
};

/**
 * Loading state demonstration
 * The loading state appears briefly while fetching from the real server
 */
export const LoadingState: Story = {
  args: {
    personId: 1762
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows loading state briefly before data loads from the real server API.'
      }
    }
  }
};