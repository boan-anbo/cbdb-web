/**
 * LayoutControls Component
 * 
 * Provides UI controls for selecting and configuring graph layout algorithms.
 * Includes presets for common use cases and advanced options for fine-tuning.
 */

import React, { FC, useState } from 'react';
import { Button } from '@/render/components/ui/button';
import { Label } from '@/render/components/ui/label';
import { Slider } from '@/render/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/render/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/render/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/render/components/ui/tabs';
import { Switch } from '@/render/components/ui/switch';
import { Separator } from '@/render/components/ui/separator';
import { LayoutType, LayoutConfig } from '@/render/components/visualization/NetworkGraph/NetworkGraph.types';
import { GitBranch, Circle, Grid, Shuffle, TreePine, Orbit } from 'lucide-react';

interface LayoutControlsProps {
  currentLayout: LayoutType;
  layoutConfig: LayoutConfig;
  onLayoutChange: (layout: LayoutType) => void;
  onConfigChange: (config: LayoutConfig) => void;
  onApply?: () => void;
  disabled?: boolean;
}

interface LayoutPreset {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  layout: LayoutType;
  config: LayoutConfig;
}

const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    name: 'Force-Directed',
    description: 'Organic layout with natural clustering',
    icon: GitBranch,
    layout: 'force',
    config: {
      force: {
        gravity: 1,
        scalingRatio: 10,
        iterations: 100,
        barnesHutOptimize: true
      }
    }
  },
  {
    name: 'Hierarchical',
    description: 'Tree-like structure for organizational data',
    icon: TreePine,
    layout: 'tree',
    config: {
      tree: {
        orientation: 'vertical',
        levelDistance: 150,
        nodeDistance: 100
      }
    }
  },
  {
    name: 'Radial',
    description: 'Concentric circles from a central node',
    icon: Orbit,
    layout: 'radial',
    config: {
      radial: {
        levelDistance: 150,
        angleStart: 0,
        angleEnd: 2 * Math.PI
      }
    }
  },
  {
    name: 'Circular',
    description: 'Nodes arranged in a circle',
    icon: Circle,
    layout: 'circular',
    config: {
      circular: {
        scale: 500,
        angleStart: 0,
        angleEnd: 2 * Math.PI
      }
    }
  },
  {
    name: 'Grid',
    description: 'Regular grid arrangement',
    icon: Grid,
    layout: 'grid',
    config: {
      grid: {
        columns: 0, // Auto-calculate
        spacing: 150
      }
    }
  },
  {
    name: 'Random',
    description: 'Random placement for testing',
    icon: Shuffle,
    layout: 'random',
    config: {
      random: {
        scale: 500,
        center: 0.5
      }
    }
  }
];

export const LayoutControls: FC<LayoutControlsProps> = ({
  currentLayout,
  layoutConfig,
  onLayoutChange,
  onConfigChange,
  onApply,
  disabled = false
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [localConfig, setLocalConfig] = useState<LayoutConfig>(layoutConfig);

  const handlePresetSelect = (preset: LayoutPreset) => {
    setSelectedPreset(preset.name);
    onLayoutChange(preset.layout);
    setLocalConfig(preset.config);
    onConfigChange(preset.config);
  };

  const handleConfigUpdate = (updates: Partial<LayoutConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  const renderAdvancedOptions = () => {
    switch (currentLayout) {
      case 'force':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="gravity">Gravity</Label>
              <Slider
                id="gravity"
                min={0.1}
                max={10}
                step={0.1}
                value={[localConfig.force?.gravity || 1]}
                onValueChange={([v]) => 
                  handleConfigUpdate({ force: { ...localConfig.force, gravity: v } })
                }
                disabled={disabled}
              />
              <span className="text-sm text-muted-foreground">
                {localConfig.force?.gravity || 1}
              </span>
            </div>

            <div>
              <Label htmlFor="scalingRatio">Scaling Ratio</Label>
              <Slider
                id="scalingRatio"
                min={1}
                max={50}
                step={1}
                value={[localConfig.force?.scalingRatio || 10]}
                onValueChange={([v]) => 
                  handleConfigUpdate({ force: { ...localConfig.force, scalingRatio: v } })
                }
                disabled={disabled}
              />
              <span className="text-sm text-muted-foreground">
                {localConfig.force?.scalingRatio || 10}
              </span>
            </div>

            <div>
              <Label htmlFor="iterations">Iterations</Label>
              <Slider
                id="iterations"
                min={10}
                max={500}
                step={10}
                value={[localConfig.force?.iterations || 100]}
                onValueChange={([v]) => 
                  handleConfigUpdate({ force: { ...localConfig.force, iterations: v } })
                }
                disabled={disabled}
              />
              <span className="text-sm text-muted-foreground">
                {localConfig.force?.iterations || 100}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="optimize">Barnes-Hut Optimization</Label>
              <Switch
                id="optimize"
                checked={localConfig.force?.barnesHutOptimize !== false}
                onCheckedChange={(checked) => 
                  handleConfigUpdate({ force: { ...localConfig.force, barnesHutOptimize: checked } })
                }
                disabled={disabled}
              />
            </div>
          </div>
        );

      case 'tree':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="orientation">Orientation</Label>
              <Select
                value={localConfig.tree?.orientation || 'vertical'}
                onValueChange={(value) => 
                  handleConfigUpdate({ tree: { ...localConfig.tree, orientation: value as 'vertical' | 'horizontal' } })
                }
                disabled={disabled}
              >
                <SelectTrigger id="orientation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vertical">Vertical</SelectItem>
                  <SelectItem value="horizontal">Horizontal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="levelDistance">Level Distance</Label>
              <Slider
                id="levelDistance"
                min={50}
                max={300}
                step={10}
                value={[localConfig.tree?.levelDistance || 150]}
                onValueChange={([v]) => 
                  handleConfigUpdate({ tree: { ...localConfig.tree, levelDistance: v } })
                }
                disabled={disabled}
              />
              <span className="text-sm text-muted-foreground">
                {localConfig.tree?.levelDistance || 150}px
              </span>
            </div>

            <div>
              <Label htmlFor="nodeDistance">Node Distance</Label>
              <Slider
                id="nodeDistance"
                min={50}
                max={200}
                step={10}
                value={[localConfig.tree?.nodeDistance || 100]}
                onValueChange={([v]) => 
                  handleConfigUpdate({ tree: { ...localConfig.tree, nodeDistance: v } })
                }
                disabled={disabled}
              />
              <span className="text-sm text-muted-foreground">
                {localConfig.tree?.nodeDistance || 100}px
              </span>
            </div>
          </div>
        );

      case 'radial':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="radialDistance">Ring Distance</Label>
              <Slider
                id="radialDistance"
                min={50}
                max={300}
                step={10}
                value={[localConfig.radial?.levelDistance || 150]}
                onValueChange={([v]) => 
                  handleConfigUpdate({ radial: { ...localConfig.radial, levelDistance: v } })
                }
                disabled={disabled}
              />
              <span className="text-sm text-muted-foreground">
                {localConfig.radial?.levelDistance || 150}px
              </span>
            </div>
          </div>
        );

      case 'circular':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="circularScale">Circle Size</Label>
              <Slider
                id="circularScale"
                min={100}
                max={1000}
                step={50}
                value={[localConfig.circular?.scale || 500]}
                onValueChange={([v]) => 
                  handleConfigUpdate({ circular: { ...localConfig.circular, scale: v } })
                }
                disabled={disabled}
              />
              <span className="text-sm text-muted-foreground">
                {localConfig.circular?.scale || 500}px
              </span>
            </div>
          </div>
        );

      case 'grid':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="gridColumns">Columns (0 = auto)</Label>
              <Slider
                id="gridColumns"
                min={0}
                max={20}
                step={1}
                value={[localConfig.grid?.columns || 0]}
                onValueChange={([v]) => 
                  handleConfigUpdate({ grid: { ...localConfig.grid, columns: v } })
                }
                disabled={disabled}
              />
              <span className="text-sm text-muted-foreground">
                {localConfig.grid?.columns || 'Auto'}
              </span>
            </div>

            <div>
              <Label htmlFor="gridSpacing">Spacing</Label>
              <Slider
                id="gridSpacing"
                min={50}
                max={300}
                step={10}
                value={[localConfig.grid?.spacing || 150]}
                onValueChange={([v]) => 
                  handleConfigUpdate({ grid: { ...localConfig.grid, spacing: v } })
                }
                disabled={disabled}
              />
              <span className="text-sm text-muted-foreground">
                {localConfig.grid?.spacing || 150}px
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Graph Layout</CardTitle>
        <CardDescription>
          Choose a layout algorithm to organize the network visualization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="presets">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {LAYOUT_PRESETS.map((preset) => {
                const Icon = preset.icon;
                return (
                  <Button
                    key={preset.name}
                    variant={selectedPreset === preset.name ? 'default' : 'outline'}
                    className="justify-start h-auto p-3"
                    onClick={() => handlePresetSelect(preset)}
                    disabled={disabled}
                  >
                    <div className="flex flex-col items-start text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{preset.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {preset.description}
                      </span>
                    </div>
                  </Button>
                );
              })}
            </div>

            {onApply && (
              <>
                <Separator />
                <Button 
                  onClick={onApply} 
                  disabled={disabled}
                  className="w-full"
                >
                  Apply Layout
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            {renderAdvancedOptions()}

            {onApply && (
              <>
                <Separator />
                <Button 
                  onClick={onApply} 
                  disabled={disabled}
                  className="w-full"
                >
                  Apply Changes
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LayoutControls;