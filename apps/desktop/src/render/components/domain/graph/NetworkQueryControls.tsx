/**
 * NetworkQueryControls Component
 *
 * Reusable controls for composing network exploration query parameters.
 * Outputs a complete NetworkExplorationOptions object.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { NetworkExplorationOptions } from '@cbdb/core';
import { Label } from '@/render/components/ui/label';
import { Switch } from '@/render/components/ui/switch';
import { cn } from '@/render/lib/utils';
import { Users, GitBranch, Building } from 'lucide-react';

export interface NetworkQueryControlsProps {
  // Initial values
  initialOptions?: NetworkExplorationOptions;

  // Callbacks
  onChange: (options: NetworkExplorationOptions) => void;

  // UI options
  className?: string;
  showLabels?: boolean;
  compact?: boolean;
}

export const NetworkQueryControls: React.FC<NetworkQueryControlsProps> = ({
  initialOptions = {
    depth: 2,
    includeKinship: true,
    includeAssociation: false,
    includeOffice: false,
  },
  onChange,
  className,
  showLabels = true,
  compact = false,
}) => {
  const [options, setOptions] = useState<NetworkExplorationOptions>(initialOptions);

  // Notify parent of changes
  useEffect(() => {
    onChange(options);
  }, [options, onChange]);

  // Update individual option
  const updateOption = useCallback((key: keyof NetworkExplorationOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {/* Depth Selector */}
      <div className="flex items-center gap-1.5">
        {showLabels && (
          <Label className="text-[10px] font-medium text-muted-foreground">Depth:</Label>
        )}
        <div className="flex gap-0.5 p-0.5 bg-muted rounded">
          {[1, 2, 3].map(depth => (
            <button
              key={depth}
              onClick={() => updateOption('depth', depth)}
              className={cn(
                'w-5 h-4 text-[10px] rounded transition-all font-medium',
                options.depth === depth
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title={`${depth} degree${depth > 1 ? 's' : ''} of separation`}
            >
              {depth}
            </button>
          ))}
        </div>
      </div>

      {/* Separator */}
      <div className="h-3 w-px bg-border" />

      {/* Relationship Type Toggles */}
      <div className="flex flex-wrap items-center gap-3">
        {showLabels && (
          <Label className="text-[10px] font-medium text-muted-foreground">Include:</Label>
        )}

        {/* Kinship Toggle */}
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3 text-muted-foreground" />
          <Switch
            id="kinship-toggle"
            checked={options.includeKinship}
            onCheckedChange={(checked) => updateOption('includeKinship', checked)}
            className="scale-75"
          />
          <Label
            htmlFor="kinship-toggle"
            className="text-[10px] cursor-pointer select-none"
          >
            Kinship
          </Label>
        </div>

        {/* Association Toggle */}
        <div className="flex items-center gap-1">
          <GitBranch className="w-3 h-3 text-muted-foreground" />
          <Switch
            id="association-toggle"
            checked={options.includeAssociation}
            onCheckedChange={(checked) => updateOption('includeAssociation', checked)}
            className="scale-75"
          />
          <Label
            htmlFor="association-toggle"
            className="text-[10px] cursor-pointer select-none"
          >
            Associations
          </Label>
        </div>

        {/* Office Toggle */}
        <div className="flex items-center gap-1">
          <Building className="w-3 h-3 text-muted-foreground" />
          <Switch
            id="office-toggle"
            checked={options.includeOffice}
            onCheckedChange={(checked) => updateOption('includeOffice', checked)}
            className="scale-75"
          />
          <Label
            htmlFor="office-toggle"
            className="text-[10px] cursor-pointer select-none"
          >
            Offices
          </Label>
        </div>
      </div>
    </div>
  );
};

export default NetworkQueryControls;