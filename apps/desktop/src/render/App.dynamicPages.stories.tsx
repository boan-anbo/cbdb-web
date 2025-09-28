import React, { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MainLayout } from '@/render/layouts/MainLayout';
import { PageProvider } from '@/render/contexts/PageContext';
import { StorybookProviders } from '@/render/providers/AppProviders';
import { pageRegistry } from '@/render/registry/PageRegistry';
import { TestTube, FlaskConical, Microscope, Beaker } from 'lucide-react';

// Component that registers test pages dynamically
const AppWithDynamicPages = ({ testPages }: { testPages?: any[] }) => {
  useEffect(() => {
    // Clear existing pages first (optional - you might want to keep the default pages)
    pageRegistry.clear();

    // Register test pages dynamically
    if (testPages) {
      testPages.forEach(page => pageRegistry.register(page));
    }

    // Cleanup on unmount (optional)
    return () => {
      // You might want to restore default pages here
    };
  }, [testPages]);

  return (
    <StorybookProviders>
      <PageProvider>
        <MainLayout />
      </PageProvider>
    </StorybookProviders>
  );
};

const meta = {
  title: 'App/Dynamic Page Registration',
  component: AppWithDynamicPages,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AppWithDynamicPages>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithTestPages: Story = {
  name: 'Test Pages Registered On The Fly',
  args: {
    testPages: [
      {
        id: 'test-home',
        path: '/',
        component: () => (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Test Home</h1>
            <p className="text-gray-600">This is a dynamically registered home page for testing.</p>
          </div>
        ),
        title: 'Test Home',
        icon: TestTube,
        metadata: { isDefault: true },
        sidebar: { section: 'main', visible: false },
      },
      {
        id: 'experiment-1',
        path: '/experiment-1',
        component: () => (
          <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold">Experiment #1</h1>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-3">Test Component A</h2>
                <p>Testing new features in isolation</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-3">Test Component B</h2>
                <p>Rapid prototyping environment</p>
              </div>
            </div>
          </div>
        ),
        title: 'Experiment #1',
        icon: FlaskConical,
        sidebar: {
          section: 'main',
          order: 1,
        },
      },
      {
        id: 'lab-bench',
        path: '/lab-bench',
        component: () => (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Lab Bench</h1>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold">Quick Test Area</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Perfect for testing components before integrating them into the main app
                </p>
              </div>
              <div className="border rounded-lg p-4 bg-yellow-50">
                <h3 className="font-semibold">Experimental Zone</h3>
                <p className="text-sm text-gray-600 mt-2">
                  This page was registered dynamically in Storybook
                </p>
              </div>
            </div>
          </div>
        ),
        title: 'Lab Bench',
        icon: Microscope,
        sidebar: {
          section: 'main',
          order: 2,
        },
      },
      {
        id: 'test-legacy',
        path: '/test-legacy',
        component: () => (
          <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Legacy Test Interface</h1>
            <div className="bg-white p-6 rounded shadow">
              <p>Testing legacy components in the Legacy section</p>
            </div>
          </div>
        ),
        title: 'Legacy Test',
        icon: Beaker,
        sidebar: {
          section: 'legacy',
          order: 1,
        },
      },
    ],
  },
};

export const EmptyApp: Story = {
  name: 'Empty App (No Pages)',
  args: {
    testPages: [
      {
        id: 'empty-home',
        path: '/',
        component: () => (
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Empty App</h1>
              <p className="text-gray-600">No pages registered except this placeholder</p>
            </div>
          </div>
        ),
        title: 'Empty',
        icon: TestTube,
        metadata: { isDefault: true },
        sidebar: { section: 'main', visible: false },
      },
    ],
  },
};

export const MixedWithDefaults: Story = {
  name: 'Mix Test Pages with Defaults',
  render: () => {
    useEffect(() => {
      // First import default pages to register them
      import('@/render/pages').then(() => {
        // Then add additional test pages
        pageRegistry.register({
          id: 'storybook-test',
          path: '/storybook-test',
          component: () => (
            <div className="p-8">
              <h1 className="text-2xl font-bold text-purple-600">Storybook Test Page</h1>
              <p className="mt-4">
                This page was added on top of the default pages.
                You can see both the default pages and this test page in the sidebar.
              </p>
            </div>
          ),
          title: 'Storybook Test',
          icon: FlaskConical,
          sidebar: {
            section: 'development',
            order: 1,
          },
        });
      });
    }, []);

    return (
      <StorybookProviders>
        <PageProvider>
          <MainLayout />
        </PageProvider>
      </StorybookProviders>
    );
  },
};