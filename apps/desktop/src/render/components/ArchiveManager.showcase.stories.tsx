import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ArchiveManager } from './ArchiveManager';
import { MockArchiveClient } from './ArchiveManager/MockArchiveClient';

const meta: Meta<typeof ArchiveManager> = {
  title: 'Components/ArchiveManager/Showcase',
  component: ArchiveManager,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Showcase: Beautiful Extracted State
export const ExtractedState: Story = {
  args: {
    archiveClient: new MockArchiveClient({ initialState: 'extracted', enableLogging: false }),
    deploymentMode: 'development',
  },
};

// Showcase: Ready to Extract State
export const ReadyState: Story = {
  args: {
    archiveClient: new MockArchiveClient({ initialState: 'ready', enableLogging: false }),
    deploymentMode: 'development',
  },
};

// Showcase: Extraction in Progress
export const ExtractingState: Story = {
  render: () => {
    const ExtractingDemo = () => {
      const [isExtracting, setIsExtracting] = React.useState(false);

      React.useEffect(() => {
        const timer = setTimeout(() => {
          const extractButton = document.querySelector('button[class*="ml-auto"]') as HTMLButtonElement;
          if (extractButton && !isExtracting) {
            setIsExtracting(true);
            extractButton.click();
          }
        }, 1500);
        return () => clearTimeout(timer);
      }, [isExtracting]);

      return (
        <ArchiveManager
          archiveClient={new MockArchiveClient({
            initialState: 'ready',
            extractionSpeed: 'normal',
            enableLogging: false
          })}
          deploymentMode='development'
        />
      );
    };

    return <ExtractingDemo />;
  },
};

// Showcase: Loading State
export const LoadingState: Story = {
  render: () => {
    class SlowLoadingClient extends MockArchiveClient {
      async getStatus() {
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds
        return super.getStatus();
      }
    }

    return (
      <ArchiveManager
        archiveClient={new SlowLoadingClient({ enableLogging: false })}
        deploymentMode='development'
      />
    );
  },
};

// Showcase: Error State
export const ErrorState: Story = {
  args: {
    archiveClient: new MockArchiveClient({ initialState: 'error', enableLogging: false }),
    deploymentMode: 'development',
  },
};