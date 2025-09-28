import type { Meta, StoryObj } from '@storybook/react';
import { MainLayout } from '@/render/layouts/MainLayout';

const meta: Meta<typeof MainLayout> = {
  title: 'Layout/MainLayout',
  component: MainLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The main layout component with sidebar navigation and routing. This is the primary layout structure for the application.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Default Layout (Home)',
  parameters: {
    docs: {
      description: {
        story:
          'The default layout showing the home page with sidebar navigation.',
      },
    },
  },
};

export const PersonSearchPage: Story = {
  name: 'Person Search Page',
  parameters: {
    initialRoute: '/person-search',
    docs: {
      description: {
        story: 'Layout showing the person search page.',
      },
    },
  },
};

export const SettingsPage: Story = {
  name: 'Settings Page',
  parameters: {
    initialRoute: '/settings',
    docs: {
      description: {
        story: 'Layout showing the settings page.',
      },
    },
  },
};

export const MobileView: Story = {
  name: 'Mobile View',
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story:
          'Mobile responsive view where the sidebar becomes a sheet overlay.',
      },
    },
  },
};

export const TabletView: Story = {
  name: 'Tablet View',
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Tablet view with adapted sidebar width.',
      },
    },
  },
};

export const DarkMode: Story = {
  name: 'Dark Mode',
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'The layout in dark mode theme.',
      },
    },
  },
};

export const LargeScreen: Story = {
  name: 'Large Screen (4K)',
  parameters: {
    viewport: {
      defaultViewport: 'lg',
    },
    docs: {
      description: {
        story: 'Layout optimized for large 4K displays.',
      },
    },
  },
};