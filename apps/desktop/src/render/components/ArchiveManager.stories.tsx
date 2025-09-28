import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ArchiveManager } from './ArchiveManager';
import { ArchiveClient } from '@cbdb/core';
import type {
  ArchiveStatusResponse,
  ArchiveInfoResponse,
  ArchiveProgressEvent,
  OpenLocationResponse,
  CleanExtractedResponse
} from '@cbdb/core';

const meta: Meta<typeof ArchiveManager> = {
  title: 'Components/ArchiveManager',
  component: ArchiveManager,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[700px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock client for stories
class MockArchiveClient extends ArchiveClient {
  private mockState: 'ready' | 'extracted' | 'error';
  private onProgress?: (event: ArchiveProgressEvent) => void;

  constructor(state: 'ready' | 'extracted' | 'error' = 'ready') {
    super({ baseUrl: 'http://mock' });
    this.mockState = state;
  }

  async getStatus(): Promise<ArchiveStatusResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (this.mockState === 'error') {
      throw new Error('Failed to connect to server');
    }

    return {
      exists: true,
      extracted: this.mockState === 'extracted',
      archivePath: '/Users/demo/cbdb-desktop/resources/database/latest.7z',
      extractedPath: this.mockState === 'extracted'
        ? '/Users/demo/.cbdb-desktop/databases/cbdb/latest.db'
        : undefined,
      archiveSize: 1234567890,
      extractedSize: this.mockState === 'extracted' ? 4567890123 : undefined,
      checksum: this.mockState === 'extracted' ? 'a1b2c3d4e5f6' : undefined,
      lastModified: new Date('2024-01-15T10:30:00Z')
    };
  }

  async getInfo(): Promise<ArchiveInfoResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      archivePath: '/Users/demo/cbdb-desktop/resources/database/latest.7z',
      fileName: 'latest.7z',
      fileSize: 1234567890,
      sizeFormatted: '1.15 GB',
      compressionRatio: this.mockState === 'extracted' ? 3.7 : undefined,
      contents: {
        files: ['latest.db', 'README.txt', 'LICENSE'],
        totalFiles: 3
      }
    };
  }

  async openLocation(location: 'archive' | 'extracted'): Promise<OpenLocationResponse> {
    console.log(`Opening ${location} location...`);
    return {
      success: true,
      path: location === 'archive'
        ? '/Users/demo/cbdb-desktop/resources/database'
        : '/Users/demo/.cbdb-desktop/databases/cbdb'
    };
  }

  async extractWithProgress(
    onProgress: (event: ArchiveProgressEvent) => void,
    request?: any
  ): Promise<void> {
    this.onProgress = onProgress;

    // Simulate extraction progress
    let percent = 0;
    const interval = setInterval(() => {
      percent += 10;

      if (percent <= 100) {
        onProgress({
          type: 'progress',
          percent,
          file: `data/file_${percent}.db`,
          speed: `${25 + Math.random() * 10} MB/s`
        });
      }

      if (percent >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onProgress({
            type: 'complete',
            extractedPath: '/Users/demo/.cbdb-desktop/databases/cbdb/latest.db',
            duration: 45000
          });
          this.mockState = 'extracted';
        }, 500);
      }
    }, 500);
  }

  async cleanExtracted(): Promise<CleanExtractedResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    this.mockState = 'ready';
    return {
      success: true,
      freedSpace: 4567890123
    };
  }
}

// Story: Ready to Extract
export const ReadyToExtract: Story = {
  args: {
    archiveClient: new MockArchiveClient('ready'),
    deploymentMode: 'development', // Force development mode for Storybook
    onExtractionComplete: (path) => {
      console.log('Extraction completed:', path);
    }
  },
};

// Story: Already Extracted
export const AlreadyExtracted: Story = {
  args: {
    archiveClient: new MockArchiveClient('extracted'),
    deploymentMode: 'development',
  },
};

// Story: Error State
export const ErrorState: Story = {
  args: {
    archiveClient: new MockArchiveClient('error'),
    deploymentMode: 'development',
  },
};

// Story: Extracting (Interactive)
export const Extracting: Story = {
  render: () => {
    const ExtractingStory = () => {
      const [isExtracting, setIsExtracting] = React.useState(false);

      // Create a custom mock client that auto-starts extraction
      class AutoExtractClient extends MockArchiveClient {
        constructor() {
          super('ready');
        }

        async getStatus(): Promise<ArchiveStatusResponse> {
          const status = await super.getStatus();

          // Auto-start extraction after initial load
          if (!isExtracting) {
            setTimeout(() => {
              setIsExtracting(true);
              // Trigger extraction by clicking the button
              const extractButton = document.querySelector('button[class*="ml-auto"]') as HTMLButtonElement;
              if (extractButton) {
                extractButton.click();
              }
            }, 1000);
          }

          return status;
        }
      }

      return (
        <ArchiveManager
          archiveClient={new AutoExtractClient()}
          deploymentMode='development'
          onExtractionComplete={(path) => {
            console.log('Extraction completed:', path);
            setIsExtracting(false);
          }}
        />
      );
    };

    return <ExtractingStory />;
  },
};

// Story: Loading State
export const Loading: Story = {
  render: () => {
    const LoadingStory = () => {
      const [client] = React.useState(() => {
        class SlowClient extends MockArchiveClient {
          async getStatus(): Promise<ArchiveStatusResponse> {
            // Longer delay to show loading state
            await new Promise(resolve => setTimeout(resolve, 3000));
            return super.getStatus();
          }
        }
        return new SlowClient('ready');
      });

      return <ArchiveManager archiveClient={client} deploymentMode='development' />;
    };

    return <LoadingStory />;
  },
};

// Story: With All Features
export const FullFeatured: Story = {
  parameters: {
    docs: {
      description: {
        story: 'This story shows all features of the ArchiveManager component with interactive controls.',
      },
    },
  },
  render: () => {
    const InteractiveStory = () => {
      const [state, setState] = React.useState<'ready' | 'extracted'>('ready');

      const client = React.useMemo(() => {
        class InteractiveClient extends MockArchiveClient {
          constructor() {
            super(state);
          }

          async extractWithProgress(
            onProgress: (event: ArchiveProgressEvent) => void,
            request?: any
          ): Promise<void> {
            await super.extractWithProgress(onProgress, request);
            setState('extracted');
          }

          async cleanExtracted(): Promise<CleanExtractedResponse> {
            const result = await super.cleanExtracted();
            setState('ready');
            return result;
          }
        }
        return new InteractiveClient();
      }, [state]);

      return (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Current State: <span className="font-medium">{state}</span>
          </div>
          <ArchiveManager
            archiveClient={client}
            deploymentMode='development'
            onExtractionComplete={(path) => {
              console.log('Extraction completed:', path);
            }}
          />
        </div>
      );
    };

    return <InteractiveStory />;
  },
};