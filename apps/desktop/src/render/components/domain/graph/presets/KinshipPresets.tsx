/**
 * KinshipPresets Component
 *
 * Kinship-specific controls and presets for the explorer.
 */

import React from 'react';
import { Label } from '@/render/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/render/components/ui/radio-group';
import { Switch } from '@/render/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/render/components/ui/select';
import { Card, CardContent } from '@/render/components/ui/card';
import { Users, GitBranch, Heart, Baby, Users2 } from 'lucide-react';

export interface KinshipPresetOptions {
  // Preset configurations
  preset?: 'immediate-family' | 'extended-family' | 'clan' | 'lineage' | 'custom';

  // Filters
  showMaternalLine?: boolean;
  showPaternalLine?: boolean;
  showMarriages?: boolean;
  showAdoptions?: boolean;

  // Generation limits
  generationsUp?: number;
  generationsDown?: number;

  // Display options
  emphasizeDirect?: boolean;
  groupByGeneration?: boolean;
}

export interface KinshipPresetsProps {
  options: KinshipPresetOptions;
  onChange: (options: KinshipPresetOptions) => void;
}

/**
 * Kinship-specific preset controls
 */
const KinshipPresets: React.FC<KinshipPresetsProps> = ({
  options,
  onChange
}) => {
  const handlePresetChange = (preset: string) => {
    let newOptions: KinshipPresetOptions = { ...options, preset: preset as any };

    // Apply preset defaults
    switch (preset) {
      case 'immediate-family':
        newOptions = {
          ...newOptions,
          showMaternalLine: true,
          showPaternalLine: true,
          showMarriages: true,
          showAdoptions: true,
          generationsUp: 1,
          generationsDown: 1,
          emphasizeDirect: true
        };
        break;

      case 'extended-family':
        newOptions = {
          ...newOptions,
          showMaternalLine: true,
          showPaternalLine: true,
          showMarriages: true,
          showAdoptions: true,
          generationsUp: 2,
          generationsDown: 2,
          emphasizeDirect: false
        };
        break;

      case 'clan':
        newOptions = {
          ...newOptions,
          showMaternalLine: true,
          showPaternalLine: true,
          showMarriages: false,
          showAdoptions: false,
          generationsUp: 3,
          generationsDown: 3,
          emphasizeDirect: false,
          groupByGeneration: true
        };
        break;

      case 'lineage':
        newOptions = {
          ...newOptions,
          showMaternalLine: false,
          showPaternalLine: true,
          showMarriages: false,
          showAdoptions: false,
          generationsUp: 5,
          generationsDown: 5,
          emphasizeDirect: true,
          groupByGeneration: true
        };
        break;
    }

    onChange(newOptions);
  };

  return (
    <div className="space-y-6">
      {/* Preset Selector */}
      <div>
        <Label className="text-base mb-3 block">Family View Preset</Label>
        <RadioGroup
          value={options.preset || 'immediate-family'}
          onValueChange={handlePresetChange}
        >
          <div className="grid grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:bg-accent/5">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="immediate-family" id="immediate" />
                  <Label htmlFor="immediate" className="cursor-pointer space-y-1">
                    <div className="flex items-center gap-2 font-medium">
                      <Users className="w-4 h-4" />
                      Immediate Family
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Parents, children, siblings, and spouses
                    </p>
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent/5">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="extended-family" id="extended" />
                  <Label htmlFor="extended" className="cursor-pointer space-y-1">
                    <div className="flex items-center gap-2 font-medium">
                      <Users2 className="w-4 h-4" />
                      Extended Family
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Grandparents, grandchildren, uncles, aunts, cousins
                    </p>
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent/5">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="clan" id="clan" />
                  <Label htmlFor="clan" className="cursor-pointer space-y-1">
                    <div className="flex items-center gap-2 font-medium">
                      <GitBranch className="w-4 h-4" />
                      Clan Network
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Extended family across 3+ generations
                    </p>
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent/5">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="lineage" id="lineage" />
                  <Label htmlFor="lineage" className="cursor-pointer space-y-1">
                    <div className="flex items-center gap-2 font-medium">
                      <Baby className="w-4 h-4" />
                      Ancestral Lineage
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Direct ancestors and descendants
                    </p>
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </RadioGroup>
      </div>

      {/* Line Filters */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <Label className="text-sm font-medium">Family Lines</Label>

          <div className="flex items-center justify-between">
            <Label htmlFor="maternal" className="text-sm font-normal cursor-pointer">
              Show Maternal Line
            </Label>
            <Switch
              id="maternal"
              checked={options.showMaternalLine !== false}
              onCheckedChange={(checked) => onChange({ ...options, showMaternalLine: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="paternal" className="text-sm font-normal cursor-pointer">
              Show Paternal Line
            </Label>
            <Switch
              id="paternal"
              checked={options.showPaternalLine !== false}
              onCheckedChange={(checked) => onChange({ ...options, showPaternalLine: checked })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-medium">Relationship Types</Label>

          <div className="flex items-center justify-between">
            <Label htmlFor="marriages" className="text-sm font-normal cursor-pointer">
              Show Marriages
            </Label>
            <Switch
              id="marriages"
              checked={options.showMarriages !== false}
              onCheckedChange={(checked) => onChange({ ...options, showMarriages: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="adoptions" className="text-sm font-normal cursor-pointer">
              Show Adoptions
            </Label>
            <Switch
              id="adoptions"
              checked={options.showAdoptions !== false}
              onCheckedChange={(checked) => onChange({ ...options, showAdoptions: checked })}
            />
          </div>
        </div>
      </div>

      {/* Generation Limits */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gen-up" className="text-sm">Generations Up (Ancestors)</Label>
          <Select
            value={(options.generationsUp || 2).toString()}
            onValueChange={(value) => onChange({ ...options, generationsUp: parseInt(value) })}
          >
            <SelectTrigger id="gen-up" className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <SelectItem key={n} value={n.toString()}>
                  {n} {n === 1 ? 'Generation' : 'Generations'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="gen-down" className="text-sm">Generations Down (Descendants)</Label>
          <Select
            value={(options.generationsDown || 2).toString()}
            onValueChange={(value) => onChange({ ...options, generationsDown: parseInt(value) })}
          >
            <SelectTrigger id="gen-down" className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <SelectItem key={n} value={n.toString()}>
                  {n} {n === 1 ? 'Generation' : 'Generations'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Display Options */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Display Options</Label>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="emphasize" className="text-sm font-normal cursor-pointer">
              <Heart className="w-4 h-4 inline mr-2" />
              Emphasize Direct Relations
            </Label>
            <Switch
              id="emphasize"
              checked={options.emphasizeDirect}
              onCheckedChange={(checked) => onChange({ ...options, emphasizeDirect: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="group-gen" className="text-sm font-normal cursor-pointer">
              <GitBranch className="w-4 h-4 inline mr-2" />
              Group by Generation
            </Label>
            <Switch
              id="group-gen"
              checked={options.groupByGeneration}
              onCheckedChange={(checked) => onChange({ ...options, groupByGeneration: checked })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KinshipPresets;