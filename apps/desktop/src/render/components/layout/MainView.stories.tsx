import type { Meta, StoryObj } from '@storybook/react';
import { MainView } from './MainView';
import { Button } from '@/render/components/ui/button';
import { Input } from '@/render/components/ui/input';
import { Badge } from '@/render/components/ui/badge';
import {
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  RefreshCwIcon,
  PlusIcon,
  SettingsIcon,
  BellIcon,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
} from '@/render/components/ui/sidebar';

const meta: Meta<typeof MainView> = {
  title: 'App/Layout/MainView',
  component: MainView,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <SidebarProvider defaultOpen={false}>
        <div className="flex h-screen w-full">
          {/* Minimal sidebar for trigger button to work */}
          <Sidebar className="w-0">
            <SidebarContent />
          </Sidebar>
          <div className="flex-1">
            <Story />
          </div>
        </div>
      </SidebarProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="p-6">
        <div className="rounded-lg border bg-card p-8">
          <h2 className="text-2xl font-bold mb-4">Welcome to CBDB Desktop</h2>
          <p className="text-muted-foreground">
            The China Biographical Database (CBDB) is a freely accessible relational database
            with biographical information about approximately 515,000 individuals.
          </p>
        </div>
      </div>
    ),
  },
};

export const WithHeaderActions: Story = {
  args: {
    title: 'People Database',
    headerActions: (
      <>
        <Button variant="outline" size="sm">
          <FilterIcon className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <Button size="sm">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Person
        </Button>
      </>
    ),
    children: (
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, place, or dynasty..."
                className="w-full"
              />
            </div>
            <Button>
              <SearchIcon className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
          <div className="rounded-lg border">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Dynasty</th>
                  <th className="text-left p-4">Birth Year</th>
                  <th className="text-left p-4">Death Year</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4">Wang Anshi 王安石</td>
                  <td className="p-4">Song</td>
                  <td className="p-4">1021</td>
                  <td className="p-4">1086</td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm">View</Button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Su Shi 蘇軾</td>
                  <td className="p-4">Song</td>
                  <td className="p-4">1037</td>
                  <td className="p-4">1101</td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm">View</Button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Li Bai 李白</td>
                  <td className="p-4">Tang</td>
                  <td className="p-4">701</td>
                  <td className="p-4">762</td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm">View</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    ),
  },
};

export const Dashboard: Story = {
  args: {
    title: 'Dashboard',
    headerActions: (
      <>
        <Badge variant="secondary">Last sync: 2 hours ago</Badge>
        <Button variant="outline" size="sm">
          <RefreshCwIcon className="h-4 w-4" />
        </Button>
      </>
    ),
    children: (
      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="text-2xl font-bold">515,243</div>
            <p className="text-sm text-muted-foreground">Total People</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="text-2xl font-bold">7,549</div>
            <p className="text-sm text-muted-foreground">Dynasties</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="text-2xl font-bold">18,395</div>
            <p className="text-sm text-muted-foreground">Places</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="text-2xl font-bold">892,471</div>
            <p className="text-sm text-muted-foreground">Relationships</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm">Database connected</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-sm">15 new queries today</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-sm">Index optimization pending</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start">
                <SearchIcon className="h-4 w-4 mr-2" />
                Quick Search
              </Button>
              <Button variant="outline" className="justify-start">
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" className="justify-start">
                <FilterIcon className="h-4 w-4 mr-2" />
                Advanced Query
              </Button>
              <Button variant="outline" className="justify-start">
                <SettingsIcon className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    ),
  },
};

export const SearchView: Story = {
  args: {
    title: 'Search Database',
    children: (
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Search</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input placeholder="Enter person's name..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Dynasty</label>
                  <Input placeholder="e.g., Tang, Song..." />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Year Range</label>
                  <div className="flex gap-2">
                    <Input placeholder="From" />
                    <Input placeholder="To" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Place</label>
                <Input placeholder="Enter location..." />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline">Clear</Button>
                <Button>Search</Button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-3">Recent Searches</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 hover:bg-muted rounded">
                <span className="text-sm">Wang Anshi - Song Dynasty</span>
                <Button variant="ghost" size="sm">View</Button>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-muted rounded">
                <span className="text-sm">Officials in Tang Dynasty</span>
                <Button variant="ghost" size="sm">View</Button>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-muted rounded">
                <span className="text-sm">Poets from 700-800 CE</span>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
};

export const EmptyState: Story = {
  args: {
    title: 'Search Results',
    children: (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center max-w-md">
          <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Results Found</h2>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search criteria or browse the database using the sidebar navigation.
          </p>
          <Button>New Search</Button>
        </div>
      </div>
    ),
  },
};

export const WithoutHeader: Story = {
  args: {
    showHeader: false,
    children: (
      <div className="p-6">
        <div className="rounded-lg border bg-card p-8">
          <h2 className="text-2xl font-bold mb-4">Full Screen Content</h2>
          <p className="text-muted-foreground">
            This view doesn't have a header, giving more space for content.
          </p>
        </div>
      </div>
    ),
  },
};

export const WithNotifications: Story = {
  args: {
    title: 'Notifications',
    headerActions: (
      <>
        <Badge>5 New</Badge>
        <Button variant="ghost" size="sm">
          <BellIcon className="h-4 w-4" />
        </Button>
      </>
    ),
    children: (
      <div className="p-6">
        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4 flex items-start gap-4">
            <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
            <div className="flex-1">
              <p className="font-medium">Database Update</p>
              <p className="text-sm text-muted-foreground">
                500 new records have been added to the Tang Dynasty collection.
              </p>
              <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 flex items-start gap-4">
            <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
            <div className="flex-1">
              <p className="font-medium">Export Complete</p>
              <p className="text-sm text-muted-foreground">
                Your data export is ready for download.
              </p>
              <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 flex items-start gap-4">
            <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2" />
            <div className="flex-1">
              <p className="font-medium">System Maintenance</p>
              <p className="text-sm text-muted-foreground">
                Scheduled maintenance will occur tomorrow at 2:00 AM UTC.
              </p>
              <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
};

export const DarkMode: Story = {
  args: {
    title: 'Dark Mode View',
    children: (
      <div className="p-6">
        <div className="rounded-lg border bg-card p-8">
          <h2 className="text-2xl font-bold mb-4">Dark Mode Support</h2>
          <p className="text-muted-foreground">
            The MainView component adapts to dark mode automatically.
          </p>
        </div>
      </div>
    ),
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <SidebarProvider defaultOpen={false}>
          <div className="flex h-screen w-full">
            <Sidebar className="w-0">
              <SidebarContent />
            </Sidebar>
            <div className="flex-1">
              <Story />
            </div>
          </div>
        </SidebarProvider>
      </div>
    ),
  ],
};