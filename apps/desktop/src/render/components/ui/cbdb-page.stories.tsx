import type { Meta, StoryObj } from '@storybook/react';
import {
  CBDBPage,
  CBDBPageHeader,
  CBDBPageTitle,
  CBDBPageDescription,
  CBDBPageActions,
  CBDBPageContent,
  CBDBPageSection,
  CBDBPageSidebar,
  CBDBPageLayout
} from './cbdb-page';
import { CBDBBlock, CBDBBlockHeader, CBDBBlockTitle, CBDBBlockContent } from './cbdb-block';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Badge } from './badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Search, Download, RefreshCw, Settings } from 'lucide-react';

const meta = {
  title: 'CBDB UI Components/CBDBPage',
  component: CBDBPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Consistent page structure components for all pages in the CBDB application.'
      }
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CBDBPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic page structure
export const Basic: Story = {
  render: () => (
    <CBDBPage>
      <CBDBPageHeader>
        <CBDBPageTitle>Page Title</CBDBPageTitle>
        <CBDBPageDescription>
          This is a description of what this page does or contains.
        </CBDBPageDescription>
      </CBDBPageHeader>
      <CBDBPageContent>
        <CBDBBlock>
          <CBDBBlockHeader>
            <CBDBBlockTitle>Content Block</CBDBBlockTitle>
          </CBDBBlockHeader>
          <CBDBBlockContent>
            <p>Main page content goes here.</p>
          </CBDBBlockContent>
        </CBDBBlock>
      </CBDBPageContent>
    </CBDBPage>
  ),
};

// Page with actions
export const WithActions: Story = {
  render: () => (
    <CBDBPage>
      <CBDBPageHeader>
        <div className="flex items-center justify-between">
          <div>
            <CBDBPageTitle>Person Database</CBDBPageTitle>
            <CBDBPageDescription>
              Browse and search historical figures in the CBDB database
            </CBDBPageDescription>
          </div>
          <CBDBPageActions>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Search className="w-4 h-4 mr-2" />
              Advanced Search
            </Button>
          </CBDBPageActions>
        </div>
      </CBDBPageHeader>
      <CBDBPageContent>
        <CBDBBlock>
          <CBDBBlockContent>
            <p>Database content here...</p>
          </CBDBBlockContent>
        </CBDBBlock>
      </CBDBPageContent>
    </CBDBPage>
  ),
};

// Page with sections
export const WithSections: Story = {
  render: () => (
    <CBDBPage>
      <CBDBPageHeader>
        <CBDBPageTitle>Analytics Dashboard</CBDBPageTitle>
        <CBDBPageDescription>
          Comprehensive analytics and insights from the CBDB database
        </CBDBPageDescription>
      </CBDBPageHeader>
      <CBDBPageContent>
        <CBDBPageSection title="Overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CBDBBlock>
              <CBDBBlockContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-sm text-muted-foreground">Total Records</p>
              </CBDBBlockContent>
            </CBDBBlock>
            <CBDBBlock>
              <CBDBBlockContent>
                <div className="text-2xl font-bold">567</div>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </CBDBBlockContent>
            </CBDBBlock>
            <CBDBBlock>
              <CBDBBlockContent>
                <div className="text-2xl font-bold">89%</div>
                <p className="text-sm text-muted-foreground">Data Quality</p>
              </CBDBBlockContent>
            </CBDBBlock>
          </div>
        </CBDBPageSection>

        <CBDBPageSection title="Recent Activity">
          <CBDBBlock>
            <CBDBBlockHeader>
              <CBDBBlockTitle>Activity Log</CBDBBlockTitle>
            </CBDBBlockHeader>
            <CBDBBlockContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">User searched for "Wang Anshi"</span>
                  <span className="text-xs text-muted-foreground">2 min ago</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Database updated with 50 new records</span>
                  <span className="text-xs text-muted-foreground">1 hour ago</span>
                </div>
              </div>
            </CBDBBlockContent>
          </CBDBBlock>
        </CBDBPageSection>
      </CBDBPageContent>
    </CBDBPage>
  ),
};

// Page with sidebar
export const WithSidebar: Story = {
  render: () => (
    <CBDBPage>
      <CBDBPageHeader>
        <CBDBPageTitle>Person Details</CBDBPageTitle>
        <CBDBPageDescription>
          Detailed information about Wang Anshi (王安石)
        </CBDBPageDescription>
      </CBDBPageHeader>
      <CBDBPageLayout>
        <CBDBPageContent>
          <Tabs defaultValue="biography">
            <TabsList>
              <TabsTrigger value="biography">Biography</TabsTrigger>
              <TabsTrigger value="relationships">Relationships</TabsTrigger>
              <TabsTrigger value="offices">Offices</TabsTrigger>
            </TabsList>
            <TabsContent value="biography" className="mt-4">
              <CBDBBlock>
                <CBDBBlockContent>
                  <h3 className="font-semibold mb-2">Basic Information</h3>
                  <p className="text-sm">
                    Wang Anshi (1021-1086) was a Chinese economist, philosopher, poet, and politician...
                  </p>
                </CBDBBlockContent>
              </CBDBBlock>
            </TabsContent>
            <TabsContent value="relationships" className="mt-4">
              <CBDBBlock>
                <CBDBBlockContent>
                  <p>Relationship data...</p>
                </CBDBBlockContent>
              </CBDBBlock>
            </TabsContent>
            <TabsContent value="offices" className="mt-4">
              <CBDBBlock>
                <CBDBBlockContent>
                  <p>Office history...</p>
                </CBDBBlockContent>
              </CBDBBlock>
            </TabsContent>
          </Tabs>
        </CBDBPageContent>

        <CBDBPageSidebar>
          <CBDBBlock>
            <CBDBBlockHeader>
              <CBDBBlockTitle>Quick Facts</CBDBBlockTitle>
            </CBDBBlockHeader>
            <CBDBBlockContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Dynasty</Label>
                  <p className="text-sm font-medium">Song (宋)</p>
                </div>
                <div>
                  <Label className="text-xs">Birth Year</Label>
                  <p className="text-sm font-medium">1021</p>
                </div>
                <div>
                  <Label className="text-xs">Death Year</Label>
                  <p className="text-sm font-medium">1086</p>
                </div>
              </div>
            </CBDBBlockContent>
          </CBDBBlock>

          <CBDBBlock>
            <CBDBBlockHeader>
              <CBDBBlockTitle>Actions</CBDBBlockTitle>
            </CBDBBlockHeader>
            <CBDBBlockContent className="space-y-2">
              <Button className="w-full" size="sm">View Network</Button>
              <Button className="w-full" variant="outline" size="sm">Export Data</Button>
            </CBDBBlockContent>
          </CBDBBlock>
        </CBDBPageSidebar>
      </CBDBPageLayout>
    </CBDBPage>
  ),
};

// Complex explorer page
export const ExplorerPage: Story = {
  render: () => (
    <CBDBPage>
      <CBDBPageHeader>
        <CBDBPageTitle>Person Relations Explorer</CBDBPageTitle>
        <CBDBPageDescription>
          Explore all types of relationships - kinship, associations, and offices - in the CBDB database
        </CBDBPageDescription>
      </CBDBPageHeader>

      <CBDBPageContent>
        {/* Search & Filters */}
        <CBDBBlock>
          <CBDBBlockHeader>
            <CBDBBlockTitle>Search & Filters</CBDBBlockTitle>
          </CBDBBlockHeader>
          <CBDBBlockContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="person-search" className="text-xs">Person ID</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="person-search"
                    placeholder="Enter person ID (e.g., 1762)"
                    className="flex-1 h-8 text-sm"
                  />
                  <Button size="sm" className="h-8">
                    <Search className="w-3 h-3 mr-1" />
                    Search
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Badge variant="secondary">445 People</Badge>
                <Badge variant="secondary">444 Connections</Badge>
                <Badge variant="outline">Depth: 1</Badge>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-3 h-3 mr-1" />
                  Settings
                </Button>
              </div>
            </div>
          </CBDBBlockContent>
        </CBDBBlock>

        {/* Network Visualization */}
        <CBDBBlock className="min-h-[500px]">
          <CBDBBlockHeader>
            <CBDBBlockTitle>Network Visualization</CBDBBlockTitle>
          </CBDBBlockHeader>
          <CBDBBlockContent className="h-[500px] bg-muted/10 flex items-center justify-center">
            <p className="text-muted-foreground">Graph visualization would appear here</p>
          </CBDBBlockContent>
        </CBDBBlock>

        {/* Statistics */}
        <CBDBBlock>
          <CBDBBlockHeader>
            <CBDBBlockTitle>Network Statistics</CBDBBlockTitle>
          </CBDBBlockHeader>
          <CBDBBlockContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold">445</div>
                <p className="text-xs text-muted-foreground">Total Nodes</p>
              </div>
              <div>
                <div className="text-2xl font-bold">444</div>
                <p className="text-xs text-muted-foreground">Total Edges</p>
              </div>
              <div>
                <div className="text-2xl font-bold">0.234</div>
                <p className="text-xs text-muted-foreground">Network Density</p>
              </div>
              <div>
                <div className="text-2xl font-bold">4.5</div>
                <p className="text-xs text-muted-foreground">Avg. Connections</p>
              </div>
            </div>
          </CBDBBlockContent>
        </CBDBBlock>
      </CBDBPageContent>
    </CBDBPage>
  ),
};

// Empty state
export const EmptyState: Story = {
  render: () => (
    <CBDBPage>
      <CBDBPageHeader>
        <CBDBPageTitle>Search Results</CBDBPageTitle>
        <CBDBPageDescription>
          No results found for your search criteria
        </CBDBPageDescription>
      </CBDBPageHeader>
      <CBDBPageContent>
        <CBDBBlock>
          <CBDBBlockContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search terms
            </p>
            <Button>
              <Search className="w-4 h-4 mr-2" />
              New Search
            </Button>
          </CBDBBlockContent>
        </CBDBBlock>
      </CBDBPageContent>
    </CBDBPage>
  ),
};

// Loading state
export const LoadingState: Story = {
  render: () => (
    <CBDBPage>
      <CBDBPageHeader>
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
        </div>
      </CBDBPageHeader>
      <CBDBPageContent>
        <CBDBBlock>
          <CBDBBlockContent>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
            </div>
          </CBDBBlockContent>
        </CBDBBlock>
      </CBDBPageContent>
    </CBDBPage>
  ),
};