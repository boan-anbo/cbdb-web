import React, { useState, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ArchiveManager } from './ArchiveManager';
import { MockArchiveClient, MockArchiveClientConfig } from './ArchiveManager/MockArchiveClient';
import { Button } from '@/render/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/render/components/ui/card';
import { Label } from '@/render/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/render/components/ui/select';
import { Slider } from '@/render/components/ui/slider';
import { Switch } from '@/render/components/ui/switch';
import { Separator } from '@/render/components/ui/separator';

const meta: Meta<typeof ArchiveManager> = {
  title: 'Components/ArchiveManager/Enhanced Testing',
  component: ArchiveManager,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Story: Interactive Test Console
export const InteractiveTestConsole: Story = {
  render: () => {
    const TestConsole = () => {
      const [config, setConfig] = useState<MockArchiveClientConfig>({
        initialState: 'ready',
        extractionSpeed: 'normal',
        failAtPercent: -1,
        networkDelay: 300,
        archiveSize: 146482123,
        enableLogging: true
      });

      const [key, setKey] = useState(0); // Force re-render
      const clientRef = useRef<MockArchiveClient>();

      // Create client with current config
      React.useEffect(() => {
        clientRef.current = new MockArchiveClient(config);
      }, [config]);

      const resetComponent = () => {
        setKey(prev => prev + 1);
      };

      return (
        <div className="p-8 space-y-6 bg-background">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Control Panel */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Test Controls</CardTitle>
                <CardDescription>
                  Configure the mock archive client behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Initial State */}
                <div className="space-y-2">
                  <Label>Initial State</Label>
                  <Select
                    value={config.initialState}
                    onValueChange={(value: any) =>
                      setConfig(prev => ({ ...prev, initialState: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ready">Ready to Extract</SelectItem>
                      <SelectItem value="extracted">Already Extracted</SelectItem>
                      <SelectItem value="error">Error State</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Extraction Speed */}
                <div className="space-y-2">
                  <Label>Extraction Speed</Label>
                  <Select
                    value={config.extractionSpeed}
                    onValueChange={(value: any) =>
                      setConfig(prev => ({ ...prev, extractionSpeed: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow (3x slower)</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="fast">Fast (3x faster)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Network Delay */}
                <div className="space-y-2">
                  <Label>Network Delay: {config.networkDelay}ms</Label>
                  <Slider
                    value={[config.networkDelay!]}
                    onValueChange={([value]) =>
                      setConfig(prev => ({ ...prev, networkDelay: value }))
                    }
                    min={0}
                    max={3000}
                    step={100}
                  />
                </div>

                {/* Archive Size */}
                <div className="space-y-2">
                  <Label>Archive Size (MB)</Label>
                  <Select
                    value={String(config.archiveSize)}
                    onValueChange={(value) =>
                      setConfig(prev => ({ ...prev, archiveSize: Number(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10485760">10 MB (Test)</SelectItem>
                      <SelectItem value="146482123">146 MB (Actual CBDB)</SelectItem>
                      <SelectItem value="524288000">500 MB (Large)</SelectItem>
                      <SelectItem value="1073741824">1 GB (Very Large)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fail at Percent */}
                <div className="space-y-2">
                  <Label>Simulate Failure At (%)</Label>
                  <Select
                    value={String(config.failAtPercent)}
                    onValueChange={(value) =>
                      setConfig(prev => ({ ...prev, failAtPercent: Number(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">No Failure</SelectItem>
                      <SelectItem value="25">25%</SelectItem>
                      <SelectItem value="50">50%</SelectItem>
                      <SelectItem value="75">75%</SelectItem>
                      <SelectItem value="95">95%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Enable Logging */}
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.enableLogging}
                    onCheckedChange={(checked) =>
                      setConfig(prev => ({ ...prev, enableLogging: checked }))
                    }
                  />
                  <Label>Enable Console Logging</Label>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={resetComponent}
                    className="w-full"
                    variant="outline"
                  >
                    Reset Component
                  </Button>

                  <Button
                    onClick={() => {
                      if (clientRef.current) {
                        clientRef.current.abortExtraction();
                      }
                    }}
                    className="w-full"
                    variant="destructive"
                  >
                    Abort Extraction
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Archive Manager Component */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Archive Manager Component</CardTitle>
                <CardDescription>
                  Component under test with mock client
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ArchiveManager
                  key={key}
                  archiveClient={new MockArchiveClient(config)}
                  deploymentMode="development"
                  onExtractionComplete={(path) => {
                    console.log('✅ Extraction completed:', path);
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      );
    };

    return <TestConsole />;
  },
};

// Story: Stress Test - Multiple Extractions
export const StressTest: Story = {
  render: () => {
    const StressTestStory = () => {
      const [instances] = useState(() => [
        { id: 1, speed: 'slow', size: 10485760, label: 'Small/Slow' },
        { id: 2, speed: 'normal', size: 146482123, label: 'Normal/Normal' },
        { id: 3, speed: 'fast', size: 1073741824, label: 'Large/Fast' },
      ]);

      return (
        <div className="p-8 space-y-6 bg-background">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Stress Test: Multiple Concurrent Extractions</h2>
            <p className="text-muted-foreground">
              Testing multiple extraction processes running simultaneously with different configurations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {instances.map((instance) => (
              <Card key={instance.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{instance.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ArchiveManager
                    archiveClient={new MockArchiveClient({
                      initialState: 'ready',
                      extractionSpeed: instance.speed as any,
                      archiveSize: instance.size,
                      enableLogging: false,
                    })}
                    deploymentMode="development"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    };

    return <StressTestStory />;
  },
};

// Story: Error Scenarios
export const ErrorScenarios: Story = {
  render: () => {
    const scenarios = [
      { id: 1, failAt: 25, label: 'Early Failure (25%)' },
      { id: 2, failAt: 50, label: 'Mid Failure (50%)' },
      { id: 3, failAt: 95, label: 'Late Failure (95%)' },
    ];

    return (
      <div className="p-8 space-y-6 bg-background">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Error Scenario Testing</h2>
          <p className="text-muted-foreground">
            Test how the component handles failures at different stages
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {scenarios.map((scenario) => (
            <Card key={scenario.id}>
              <CardHeader>
                <CardTitle className="text-lg">{scenario.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <ArchiveManager
                  archiveClient={new MockArchiveClient({
                    initialState: 'ready',
                    failAtPercent: scenario.failAt,
                    enableLogging: true,
                  })}
                  deploymentMode="development"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  },
};

// Story: Network Latency Simulation
export const NetworkLatencyTest: Story = {
  render: () => {
    const delays = [
      { id: 1, delay: 0, label: 'No Latency (0ms)' },
      { id: 2, delay: 500, label: 'Normal (500ms)' },
      { id: 3, delay: 2000, label: 'Slow (2s)' },
      { id: 4, delay: 5000, label: 'Very Slow (5s)' },
    ];

    return (
      <div className="p-8 space-y-6 bg-background">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Network Latency Simulation</h2>
          <p className="text-muted-foreground">
            Test component behavior with different network conditions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {delays.map((config) => (
            <Card key={config.id}>
              <CardHeader>
                <CardTitle className="text-sm">{config.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <ArchiveManager
                  archiveClient={new MockArchiveClient({
                    initialState: 'ready',
                    networkDelay: config.delay,
                    extractionSpeed: 'fast',
                    enableLogging: false,
                  })}
                  deploymentMode="development"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  },
};