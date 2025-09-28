/**
 * PersonDetailView Storybook Stories
 *
 * Interactive stories for testing and developing the PersonDetailView component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SelectionProvider } from '@/render/contexts/SelectionContext';
import { DataInspectorProvider } from '@/render/contexts/DataInspectorContext';
import { personDetailInspectorViewDef } from './PersonDetailView';
import { InspectorViewComponentProps } from '../types';
import React from 'react';

// Create a mock query client for stories
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 5 * 60 * 1000,
    }
  }
});

// Mock wrapper component with all required providers
const StoryWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queryClient] = React.useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SelectionProvider>
        <DataInspectorProvider>
          <div style={{ height: '100vh', width: '100%', background: '#f5f5f5' }}>
            <div style={{
              width: '400px',
              height: '100%',
              borderLeft: '1px solid #e0e0e0',
              background: 'white',
              overflow: 'hidden'
            }}>
              {children}
            </div>
          </div>
        </DataInspectorProvider>
      </SelectionProvider>
    </QueryClientProvider>
  );
};

const meta: Meta<typeof personDetailInspectorViewDef.component> = {
  title: 'Data Inspector/PersonDetailView',
  component: personDetailInspectorViewDef.component,
  decorators: [
    (Story) => (
      <StoryWrapper>
        <Story />
      </StoryWrapper>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<InspectorViewComponentProps>;

// Default story with Wang Anshi (ID: 1762)
export const WangAnshi: Story = {
  name: 'Wang Anshi (Default)',
  args: {
    isActive: true,
    data: undefined,
  },
  render: (args) => {
    const PersonDetailView = personDetailInspectorViewDef.component;
    return <PersonDetailView {...args} />;
  },
};

// Story with different person selection
export const DifferentPerson: Story = {
  name: 'Different Person (ID: 1)',
  args: {
    isActive: true,
    data: undefined,
  },
  render: (args) => {
    const PersonDetailView = personDetailInspectorViewDef.component;

    // You can modify the component to accept a prop for testing different person IDs
    // For now, it will use the default Wang Anshi
    return (
      <div>
        <div style={{ padding: '10px', background: '#fffbf0', borderBottom: '1px solid #ffe8cc' }}>
          <small>Note: To test different people, select them in the main app. This story shows the default (Wang Anshi)</small>
        </div>
        <PersonDetailView {...args} />
      </div>
    );
  },
};

// Story showing loading state
export const LoadingState: Story = {
  name: 'Loading State',
  args: {
    isActive: true,
    data: undefined,
  },
  render: (args) => {
    const PersonDetailView = personDetailInspectorViewDef.component;

    // This will naturally show loading state when fetching data
    return <PersonDetailView {...args} />;
  },
};

// Story with inspector inactive
export const InactiveView: Story = {
  name: 'Inactive View',
  args: {
    isActive: false,
    data: undefined,
  },
  render: (args) => {
    const PersonDetailView = personDetailInspectorViewDef.component;
    return (
      <div>
        <div style={{ padding: '10px', background: '#f0f0f0', borderBottom: '1px solid #d0d0d0' }}>
          <small>This view is inactive (isActive=false)</small>
        </div>
        <PersonDetailView {...args} />
      </div>
    );
  },
};

// Story with all sections expanded
export const AllSectionsExpanded: Story = {
  name: 'All Sections Expanded',
  args: {
    isActive: true,
    data: undefined,
  },
  render: (args) => {
    const PersonDetailView = personDetailInspectorViewDef.component;

    return (
      <div>
        <div style={{ padding: '10px', background: '#f0f9ff', borderBottom: '1px solid #bae6fd' }}>
          <small>Tip: Click on section headers to expand/collapse them</small>
        </div>
        <PersonDetailView {...args} />
      </div>
    );
  },
};

// Story demonstrating responsiveness
export const ResponsiveWidth: Story = {
  name: 'Responsive Width',
  args: {
    isActive: true,
    data: undefined,
  },
  decorators: [
    (Story) => (
      <StoryWrapper>
        <div style={{ display: 'flex', height: '100vh' }}>
          <div style={{
            width: '300px',
            borderRight: '1px solid #e0e0e0',
            background: 'white',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '10px', background: '#f5f5f5' }}>
              <small>Narrow (300px)</small>
            </div>
            <Story />
          </div>
          <div style={{
            width: '500px',
            borderRight: '1px solid #e0e0e0',
            background: 'white',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '10px', background: '#f5f5f5' }}>
              <small>Wide (500px)</small>
            </div>
            <Story />
          </div>
        </div>
      </StoryWrapper>
    ),
  ],
};