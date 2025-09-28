import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MainLayout } from '@/render/layouts/MainLayout';
import { PageProvider } from '@/render/contexts/PageContext';
import { StorybookProviders } from '@/render/providers/AppProviders';

// Component that combines providers without Router (Storybook provides its own)
const AppForStorybook = () => {
  return (
    <StorybookProviders>
      <PageProvider>
        <MainLayout />
      </PageProvider>
    </StorybookProviders>
  );
};

const meta = {
  title: 'App/Full Application',
  component: AppForStorybook,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AppForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Full App with All Pages',
};