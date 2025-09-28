import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { DataInspectorLayout } from './DataInspectorLayout';
import { DataInspectorProvider, useDataInspector } from '@/render/contexts/DataInspectorContext';
import { registerCoreInspectorViews } from './registry/registerCoreViews';

// Initialize core views for Storybook
registerCoreInspectorViews();

const meta = {
  title: 'Components/DataInspector',
  component: DataInspectorLayout,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <DataInspectorProvider>
        <div className="h-screen w-screen bg-background">
          <Story />
        </div>
      </DataInspectorProvider>
    ),
  ],
} satisfies Meta<typeof DataInspectorLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: () => (
    <DataInspectorLayout>
      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-3xl font-bold">Main Content Area</h1>
          <p className="text-muted-foreground">
            This is the main content area. The Data Inspector is initially closed.
            Click the rail on the right edge to open it.
          </p>
          <div className="rounded-lg border p-4">
            <h2 className="mb-2 text-lg font-semibold">Test Instructions:</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Click the rail on the right edge to toggle the inspector</li>
              <li>Click view buttons in the header to replace the active view</li>
              <li>Drag and drop view buttons to specific positions</li>
              <li>With 0 views: Drop anywhere to add first view</li>
              <li>With 1 view: Drop top/bottom to create split</li>
              <li>With 2 views: Drop top/bottom to replace that view</li>
              <li>Click the X on each panel to close it</li>
              <li>Resize panels using the resize handles</li>
            </ul>
          </div>
        </div>
      </div>
    </DataInspectorLayout>
  ),
};

export const OpenByDefault: Story = {
  args: {},
  decorators: [
    (Story) => {
      // Use effect to open inspector after mount
      const { toggleInspector } = useDataInspector();
      React.useEffect(() => {
        toggleInspector();
      }, []);
      return <Story />;
    },
  ],
  render: () => (
    <DataInspectorLayout>
      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-3xl font-bold">Inspector Open</h1>
          <p className="text-muted-foreground">
            The Data Inspector starts open in this story. You can interact with the view buttons to test the drag and drop functionality.
          </p>
        </div>
      </div>
    </DataInspectorLayout>
  ),
};

export const WithContent: Story = {
  args: {},
  render: () => (
    <DataInspectorLayout>
      <div className="h-full w-full overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold">Sample Data View</h1>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-semibold">Person Details</h3>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Name:</dt>
                  <dd>王安石 (Wang Anshi)</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Dynasty:</dt>
                  <dd>Song (宋)</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Birth:</dt>
                  <dd>1021</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Death:</dt>
                  <dd>1086</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-semibold">Relations</h3>
              <ul className="space-y-1 text-sm">
                <li>• Father: 王益</li>
                <li>• Son: 王雱</li>
                <li>• Associates: 苏轼, 欧阳修</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Biography</h3>
            <p className="text-sm text-muted-foreground">
              Wang Anshi was a Chinese economist, philosopher, poet, and politician during the Song dynasty.
              He served as chancellor and attempted major and controversial socioeconomic reforms known as the New Policies.
              These reforms included increased currency circulation, breaking up of private monopolies, and early forms
              of government regulation and social welfare programs.
            </p>
          </div>
        </div>
      </div>
    </DataInspectorLayout>
  ),
};