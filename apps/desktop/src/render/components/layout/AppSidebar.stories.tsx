import type { Meta, StoryObj } from '@storybook/react';
import { AppSidebar } from './AppSidebar';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/render/components/ui/sidebar';

const meta: Meta<typeof AppSidebar> = {
  title: 'App/Layout/AppSidebar',
  component: AppSidebar,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full">
          <Story />
          <SidebarInset>
            <header className="flex h-14 items-center gap-4 border-b px-6">
              <SidebarTrigger />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">Content Area</h2>
              </div>
            </header>
            <main className="flex-1 p-6">
              <div className="rounded-lg border bg-card p-8">
                <h3 className="text-xl font-semibold mb-2">Welcome to CBDB Desktop</h3>
                <p className="text-muted-foreground">
                  Click the menu button to toggle the sidebar. The sidebar contains
                  navigation for all the features of the China Biographical Database.
                </p>
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Collapsed: Story = {
  decorators: [
    (Story) => (
      <SidebarProvider defaultOpen={false}>
        <div className="flex h-screen w-full">
          <Story />
          <SidebarInset>
            <header className="flex h-14 items-center gap-4 border-b px-6">
              <SidebarTrigger />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">Content Area</h2>
              </div>
            </header>
            <main className="flex-1 p-6">
              <div className="rounded-lg border bg-card p-8">
                <h3 className="text-xl font-semibold mb-2">Sidebar Collapsed</h3>
                <p className="text-muted-foreground">
                  Click the menu button to expand the sidebar.
                </p>
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    ),
  ],
};

export const WithContent: Story = {
  decorators: [
    (Story) => (
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full">
          <Story />
          <SidebarInset>
            <header className="flex h-14 items-center gap-4 border-b px-6">
              <SidebarTrigger />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">People Database</h2>
              </div>
              <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md">
                Add Person
              </button>
            </header>
            <main className="flex-1 p-6">
              <div className="space-y-4">
                <div className="flex gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Search people..."
                    className="flex-1 px-4 py-2 border rounded-md"
                  />
                  <button className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md">
                    Search
                  </button>
                  <button className="px-4 py-2 text-sm border rounded-md">
                    Filter
                  </button>
                </div>

                <div className="border rounded-lg">
                  <table className="w-full">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="text-left p-4">Name</th>
                        <th className="text-left p-4">Dynasty</th>
                        <th className="text-left p-4">Birth Year</th>
                        <th className="text-left p-4">Death Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-4">Wang Anshi</td>
                        <td className="p-4">Song</td>
                        <td className="p-4">1021</td>
                        <td className="p-4">1086</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4">Su Shi</td>
                        <td className="p-4">Song</td>
                        <td className="p-4">1037</td>
                        <td className="p-4">1101</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4">Li Bai</td>
                        <td className="p-4">Tang</td>
                        <td className="p-4">701</td>
                        <td className="p-4">762</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    ),
  ],
};

export const DarkMode: Story = {
  decorators: [
    (Story) => (
      <div className="dark">
        <SidebarProvider defaultOpen={true}>
          <div className="flex h-screen w-full">
            <Story />
            <SidebarInset>
              <header className="flex h-14 items-center gap-4 border-b px-6">
                <SidebarTrigger />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">Content Area</h2>
                </div>
              </header>
              <main className="flex-1 p-6">
                <div className="rounded-lg border bg-card p-8">
                  <h3 className="text-xl font-semibold mb-2">Dark Mode</h3>
                  <p className="text-muted-foreground">
                    The sidebar adapts to dark mode automatically.
                  </p>
                </div>
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    ),
  ],
};

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    (Story) => (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <Story />
          <SidebarInset>
            <header className="flex h-14 items-center gap-4 border-b px-6">
              <SidebarTrigger />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">Mobile View</h2>
              </div>
            </header>
            <main className="flex-1 p-6">
              <div className="rounded-lg border bg-card p-8">
                <h3 className="text-xl font-semibold mb-2">Responsive Design</h3>
                <p className="text-muted-foreground">
                  On mobile devices, the sidebar becomes a sheet overlay.
                </p>
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    ),
  ],
};