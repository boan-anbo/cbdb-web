/**
 * PersonTimelineExplorerPage Storybook Stories
 *
 * Demonstrates the full timeline explorer page with controls and visualization.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import PersonTimelineExplorerPage from './PersonTimelineExplorerPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Create a wrapper with QueryClient for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
});

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <div className="h-screen w-full bg-background">
      {children}
    </div>
  </QueryClientProvider>
);

const meta: Meta<typeof PersonTimelineExplorerPage> = {
  title: 'Pages/Analytics/PersonTimelineExplorer',
  component: PersonTimelineExplorerPage,
  decorators: [
    (Story) => (
      <PageWrapper>
        <Story />
      </PageWrapper>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Interactive timeline explorer for analyzing person life trajectories with comprehensive filtering and visualization controls.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PersonTimelineExplorerPage>;

// Default story - Wang Anshi timeline
export const Default: Story = {
  name: 'Default (Wang Anshi)',
  parameters: {
    docs: {
      description: {
        story: 'Default view showing Wang Anshi\'s timeline (ID: 1762) with all event types enabled.',
      },
    },
  },
};

// Story with mock data for offline testing
export const MockedData: Story = {
  name: 'With Mocked Data',
  parameters: {
    docs: {
      description: {
        story: 'Timeline explorer with mocked data for testing without server connection.',
      },
    },
    msw: {
      handlers: [
        // Mock the timeline API endpoint
        {
          method: 'GET',
          path: '/api/people/1762/timeline/life',
          response: {
            result: {
              timeline: {
                personId: 1762,
                personName: '王安石 (Wang Anshi)',
                birthYear: 1021,
                deathYear: 1086,
                events: [
                  {
                    personId: 1762,
                    year: 1021,
                    eventType: 'birth',
                    title: 'Birth',
                    description: 'Born in Linchuan, Jiangxi Province',
                  },
                  {
                    personId: 1762,
                    year: 1042,
                    eventType: 'entry',
                    title: 'Jinshi Degree',
                    description: 'Passed the imperial examination',
                  },
                  {
                    personId: 1762,
                    startYear: 1047,
                    endYear: 1050,
                    eventType: 'office',
                    title: 'Magistrate of Yinxian',
                    description: 'First major administrative appointment',
                    location: { name: 'Yinxian' },
                  },
                  {
                    personId: 1762,
                    startYear: 1058,
                    endYear: 1060,
                    eventType: 'office',
                    title: 'Vice Commissioner of Finance',
                    description: 'Financial administration position',
                  },
                  {
                    personId: 1762,
                    startYear: 1069,
                    endYear: 1076,
                    eventType: 'office',
                    title: 'Grand Councilor',
                    description: 'Highest government position, implemented New Policies',
                    location: { name: 'Kaifeng' },
                  },
                  {
                    personId: 1762,
                    year: 1086,
                    eventType: 'death',
                    title: 'Death',
                    description: 'Died in Jiangning (modern Nanjing)',
                    location: { name: 'Jiangning' },
                  },
                ],
              },
            },
            responseTime: 45,
          },
        },
      ],
    },
  },
};

// Interactive story with user actions
export const Interactive: Story = {
  name: 'Interactive Demo',
  parameters: {
    docs: {
      description: {
        story: 'Interactive demonstration showing filter controls and timeline interactions.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for the page to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Toggle some event types
    const officeSwitch = await canvas.findByLabelText('Office');
    await userEvent.click(officeSwitch);
    await new Promise(resolve => setTimeout(resolve, 500));
    await userEvent.click(officeSwitch);

    // Interact with year range slider (if visible)
    // This would require more complex interaction simulation
  },
};

// Loading state story
export const LoadingState: Story = {
  name: 'Loading State',
  parameters: {
    docs: {
      description: {
        story: 'Shows the loading state while fetching timeline data.',
      },
    },
    msw: {
      handlers: [
        {
          method: 'GET',
          path: '/api/people/*/timeline/life',
          delay: 5000, // Simulate slow loading
          response: {},
        },
      ],
    },
  },
};

// Error state story
export const ErrorState: Story = {
  name: 'Error State',
  parameters: {
    docs: {
      description: {
        story: 'Shows error handling when timeline data fails to load.',
      },
    },
    msw: {
      handlers: [
        {
          method: 'GET',
          path: '/api/people/*/timeline/life',
          status: 500,
          response: {
            error: 'Failed to fetch timeline data',
          },
        },
      ],
    },
  },
};

// Empty timeline story
export const EmptyTimeline: Story = {
  name: 'Empty Timeline',
  parameters: {
    docs: {
      description: {
        story: 'Shows the state when a person has no timeline events.',
      },
    },
    msw: {
      handlers: [
        {
          method: 'GET',
          path: '/api/people/*/timeline/life',
          response: {
            result: {
              timeline: {
                personId: 9999,
                personName: 'Unknown Person',
                events: [],
              },
            },
          },
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Change person ID to trigger empty state
    const input = await canvas.findByPlaceholderText('Enter ID (e.g., 1762)');
    await userEvent.clear(input);
    await userEvent.type(input, '9999');

    const searchButton = await canvas.findByRole('button', { name: /search/i });
    await userEvent.click(searchButton);
  },
};

// Dense timeline story
export const DenseTimeline: Story = {
  name: 'Dense Timeline',
  parameters: {
    docs: {
      description: {
        story: 'Shows a person with many timeline events across different categories.',
      },
    },
    msw: {
      handlers: [
        {
          method: 'GET',
          path: '/api/people/*/timeline/life',
          response: {
            result: {
              timeline: {
                personId: 1234,
                personName: 'Historical Figure',
                birthYear: 1000,
                deathYear: 1080,
                events: Array.from({ length: 50 }, (_, i) => ({
                  personId: 1234,
                  year: 1000 + i,
                  eventType: ['office', 'association', 'text', 'kinship', 'address'][i % 5],
                  title: `Event ${i + 1}`,
                  description: `Description for event ${i + 1}`,
                  ...(i % 3 === 0 && { location: { name: `Location ${i}` } }),
                  ...(i % 4 === 0 && {
                    relatedEntities: [
                      { type: 'person', id: 100 + i, name: `Person ${i}` },
                    ],
                  }),
                })),
              },
            },
          },
        },
      ],
    },
  },
};

// Filtered view story
export const FilteredView: Story = {
  name: 'Filtered View',
  parameters: {
    docs: {
      description: {
        story: 'Timeline with specific event types filtered out.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Turn off association events
    const associationSwitch = await canvas.findByLabelText('Association');
    await userEvent.click(associationSwitch);

    // Turn off kinship events
    const kinshipSwitch = await canvas.findByLabelText('Kinship');
    await userEvent.click(kinshipSwitch);
  },
};

// Mobile responsive story
export const MobileView: Story = {
  name: 'Mobile Responsive',
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Timeline explorer optimized for mobile viewing.',
      },
    },
  },
};