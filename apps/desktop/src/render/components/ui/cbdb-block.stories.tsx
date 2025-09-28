import type { Meta, StoryObj } from '@storybook/react';
import {
  CBDBBlock,
  CBDBBlockHeader,
  CBDBBlockTitle,
  CBDBBlockDescription,
  CBDBBlockContent,
  CBDBBlockFooter
} from './cbdb-block';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';

const meta = {
  title: 'CBDB UI Components/CBDBBlock',
  component: CBDBBlock,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Compact, space-efficient block components that extend shadcn Card with CBDB-specific styling for uniformity across the application.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes'
    }
  },
} satisfies Meta<typeof CBDBBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic block
export const Basic: Story = {
  render: () => (
    <CBDBBlock className="w-[350px]">
      <CBDBBlockHeader>
        <CBDBBlockTitle>Basic Block</CBDBBlockTitle>
        <CBDBBlockDescription>
          A simple CBDB block with compact styling
        </CBDBBlockDescription>
      </CBDBBlockHeader>
      <CBDBBlockContent>
        <p className="text-sm">
          This is the content area of the block. Notice how the spacing is more compact than regular cards.
        </p>
      </CBDBBlockContent>
    </CBDBBlock>
  ),
};

// Block with footer
export const WithFooter: Story = {
  render: () => (
    <CBDBBlock className="w-[350px]">
      <CBDBBlockHeader>
        <CBDBBlockTitle>Block with Footer</CBDBBlockTitle>
        <CBDBBlockDescription>
          This block includes a footer section
        </CBDBBlockDescription>
      </CBDBBlockHeader>
      <CBDBBlockContent>
        <p className="text-sm">Main content goes here</p>
      </CBDBBlockContent>
      <CBDBBlockFooter>
        <Button size="sm" variant="outline">Cancel</Button>
        <Button size="sm" className="ml-auto">Save</Button>
      </CBDBBlockFooter>
    </CBDBBlock>
  ),
};

// Form block
export const FormBlock: Story = {
  render: () => (
    <CBDBBlock className="w-[400px]">
      <CBDBBlockHeader>
        <CBDBBlockTitle>Search & Filters</CBDBBlockTitle>
        <CBDBBlockDescription>
          Find people in the CBDB database
        </CBDBBlockDescription>
      </CBDBBlockHeader>
      <CBDBBlockContent className="space-y-3">
        <div>
          <Label htmlFor="search" className="text-xs">Person ID</Label>
          <Input
            id="search"
            placeholder="Enter person ID (e.g., 1762)"
            className="h-8 text-sm mt-1"
          />
        </div>
        <div>
          <Label htmlFor="name" className="text-xs">Name</Label>
          <Input
            id="name"
            placeholder="Enter name in Chinese or English"
            className="h-8 text-sm mt-1"
          />
        </div>
      </CBDBBlockContent>
      <CBDBBlockFooter>
        <Button size="sm" className="w-full">Search</Button>
      </CBDBBlockFooter>
    </CBDBBlock>
  ),
};

// Stats block
export const StatsBlock: Story = {
  render: () => (
    <CBDBBlock className="w-[350px]">
      <CBDBBlockHeader>
        <CBDBBlockTitle>Network Statistics</CBDBBlockTitle>
      </CBDBBlockHeader>
      <CBDBBlockContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">Total Nodes</p>
          </div>
          <div>
            <div className="text-2xl font-bold">5,678</div>
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
  ),
};

// Multiple blocks layout
export const MultipleBlocks: Story = {
  render: () => (
    <div className="space-y-4 w-[400px]">
      <CBDBBlock>
        <CBDBBlockHeader>
          <CBDBBlockTitle>First Block</CBDBBlockTitle>
          <CBDBBlockDescription>Compact spacing example</CBDBBlockDescription>
        </CBDBBlockHeader>
        <CBDBBlockContent>
          <p className="text-sm">Notice the reduced padding compared to regular cards.</p>
        </CBDBBlockContent>
      </CBDBBlock>

      <CBDBBlock>
        <CBDBBlockHeader>
          <CBDBBlockTitle>Second Block</CBDBBlockTitle>
          <CBDBBlockDescription>Another compact block</CBDBBlockDescription>
        </CBDBBlockHeader>
        <CBDBBlockContent>
          <p className="text-sm">These blocks are designed for space efficiency.</p>
        </CBDBBlockContent>
      </CBDBBlock>

      <CBDBBlock>
        <CBDBBlockHeader>
          <CBDBBlockTitle>Third Block</CBDBBlockTitle>
        </CBDBBlockHeader>
        <CBDBBlockContent>
          <p className="text-sm">Perfect for dense information displays.</p>
        </CBDBBlockContent>
      </CBDBBlock>
    </div>
  ),
};

// Comparison with regular Card
export const ComparisonWithCard: Story = {
  render: () => {
    const { Card, CardHeader, CardTitle, CardDescription, CardContent } = require('./card');
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold mb-2">Regular shadcn Card (default padding)</h3>
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>Regular Card</CardTitle>
              <CardDescription>Standard shadcn card with default spacing</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This has more generous padding (p-6)</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">CBDB Block (compact padding)</h3>
          <CBDBBlock className="w-[350px]">
            <CBDBBlockHeader>
              <CBDBBlockTitle>CBDB Block</CBDBBlockTitle>
              <CBDBBlockDescription>Compact CBDB block with tighter spacing</CBDBBlockDescription>
            </CBDBBlockHeader>
            <CBDBBlockContent>
              <p className="text-sm">This has compact padding (p-3) for space efficiency</p>
            </CBDBBlockContent>
          </CBDBBlock>
        </div>
      </div>
    );
  },
};

// Empty state
export const EmptyState: Story = {
  render: () => (
    <CBDBBlock className="w-[350px]">
      <CBDBBlockContent className="text-center py-8">
        <p className="text-sm text-muted-foreground">No data available</p>
      </CBDBBlockContent>
    </CBDBBlock>
  ),
};

// Loading state
export const LoadingState: Story = {
  render: () => (
    <CBDBBlock className="w-[350px]">
      <CBDBBlockHeader>
        <CBDBBlockTitle>Loading...</CBDBBlockTitle>
      </CBDBBlockHeader>
      <CBDBBlockContent>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
        </div>
      </CBDBBlockContent>
    </CBDBBlock>
  ),
};