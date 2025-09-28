/**
 * PersonRelationsExplorerPage Stories
 *
 * Interactive testing for the unified person relations explorer
 * These stories connect to the real backend server for data.
 */

import type { Meta, StoryObj } from '@storybook/react';
import PersonRelationsExplorerPage from './PersonRelationsExplorerPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { expect, within } from '@storybook/test';

// Create a wrapper with providers
const StoryWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const meta: Meta<typeof PersonRelationsExplorerPage> = {
  title: 'Pages/Analytics/PersonRelationsExplorer',
  component: PersonRelationsExplorerPage,
  decorators: [
    (Story) => (
      <StoryWrapper>
        <Story />
      </StoryWrapper>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Person Relations Explorer for visualizing kinship, associations, and office relationships from the CBDB database. Requires backend server running on port 18019.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view with Wang Anshi's network
 * Requires backend server running on port 18019
 */
export const Default: Story = {
  name: 'Default Explorer',
  parameters: {
    docs: {
      description: {
        story:
          "The default person relations explorer showing Wang Anshi's network with all relation types enabled. Connects to real backend at http://localhost:18019",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check that the main components are rendered
    await expect(
      canvas.getByText('Person Relations Explorer'),
    ).toBeInTheDocument();
    await expect(canvas.getByText('Search & Filters')).toBeInTheDocument();
    await expect(canvas.getByText('Network Visualization')).toBeInTheDocument();

    // Wait for the network to load - it should show statistics, not an error
    // If there's a 404 or other error, this test should FAIL
    await new Promise(resolve => setTimeout(resolve, 2000)); // Give time for API call

    // Check that we don't have an error message
    const errorElement = canvas.queryByText(/error|Error|404|failed|Failed/i);
    if (errorElement) {
      throw new Error(`Network failed to load: ${errorElement.textContent}`);
    }

    // Check that we have network stats (indicates successful load)
    // The component shows "X People" and "Y Connections" when data loads
    const peopleText = await canvas.findByText(/People/i, {}, { timeout: 5000 });
    expect(peopleText).toBeInTheDocument();

    const connectionsText = await canvas.findByText(/Connections/i, {}, { timeout: 5000 });
    expect(connectionsText).toBeInTheDocument();
  },
};

/**
 * Test with different person IDs by changing the input field
 */
export const InteractiveExplorer: Story = {
  name: 'Interactive Explorer',
  parameters: {
    docs: {
      description: {
        story:
          'Interactive explorer where you can search for different persons by ID. Try person IDs like 1762 (Wang Anshi), 526, 1294, etc.',
      },
    },
  },
};
