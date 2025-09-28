/**
 * ExplorerControlPanel Component
 *
 * Reusable control panel for network explorers.
 * Provides person search, depth control, and common filters.
 */

import React, { useState, useCallback } from 'react';
import { Input } from '@/render/components/ui/input';
import { Button } from '@/render/components/ui/button';
import { Label } from '@/render/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/render/components/ui/toggle-group';
import { Switch } from '@/render/components/ui/switch';
import { Badge } from '@/render/components/ui/badge';
import { Separator } from '@/render/components/ui/separator';
import {
  Search,
  RefreshCw,
  Settings2,
  Users,
  Network,
  ChevronRight
} from 'lucide-react';

export interface ExplorerControlPanelProps {
  // Current values
  personId?: number;
  depth?: number;
  loading?: boolean;

  // Options
  maxDepth?: number;
  depthLabels?: string[];
  showAdvancedToggle?: boolean;
  showStats?: boolean;

  // Stats
  nodeCount?: number;
  edgeCount?: number;

  // Callbacks
  onPersonSearch: (personId: number) => void;
  onDepthChange?: (depth: number) => void;
  onRefresh?: () => void;
  onAdvancedToggle?: (enabled: boolean) => void;

  // Custom controls slot
  additionalControls?: React.ReactNode;
}

/**
 * Standard control panel for network explorers
 */
const ExplorerControlPanel: React.FC<ExplorerControlPanelProps> = ({
  personId,
  depth = 1,
  loading = false,
  maxDepth = 3,
  depthLabels = ['Immediate', 'Extended', 'Distant'],
  showAdvancedToggle = true,
  showStats = true,
  nodeCount = 0,
  edgeCount = 0,
  onPersonSearch,
  onDepthChange,
  onRefresh,
  onAdvancedToggle,
  additionalControls
}) => {
  const [inputValue, setInputValue] = useState<string>(personId?.toString() || '');
  const [advancedMode, setAdvancedMode] = useState(false);

  const handleSearch = useCallback(() => {
    const id = parseInt(inputValue);
    if (!isNaN(id) && id > 0) {
      onPersonSearch(id);
    }
  }, [inputValue, onPersonSearch]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const handleDepthChange = useCallback((value: string) => {
    if (value && onDepthChange) {
      onDepthChange(parseInt(value));
    }
  }, [onDepthChange]);

  const handleAdvancedToggle = useCallback((checked: boolean) => {
    setAdvancedMode(checked);
    if (onAdvancedToggle) {
      onAdvancedToggle(checked);
    }
  }, [onAdvancedToggle]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-12">
        {/* Person Search */}
        <div className="md:col-span-5">
          <Label htmlFor="person-search">Person ID</Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="person-search"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter person ID (e.g., 1762)"
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={loading}
              size="default"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span className="ml-2">Search</span>
            </Button>
          </div>
        </div>

        {/* Depth Control */}
        {onDepthChange && (
          <div className="md:col-span-4">
            <Label>Network Depth</Label>
            <ToggleGroup
              type="single"
              value={depth.toString()}
              onValueChange={handleDepthChange}
              className="justify-start mt-2"
            >
              {Array.from({ length: maxDepth }, (_, i) => i + 1).map((d) => (
                <ToggleGroupItem
                  key={d}
                  value={d.toString()}
                  aria-label={depthLabels[d - 1] || `Depth ${d}`}
                >
                  {depthLabels[d - 1] || `Depth ${d}`}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}

        {/* Action Buttons */}
        <div className="md:col-span-3 flex items-end gap-2">
          {onRefresh && (
            <Button
              onClick={onRefresh}
              disabled={loading}
              variant="outline"
              size="default"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="ml-2">Refresh</span>
            </Button>
          )}

          {showAdvancedToggle && (
            <div className="flex items-center space-x-2">
              <Switch
                id="advanced-mode"
                checked={advancedMode}
                onCheckedChange={handleAdvancedToggle}
              />
              <Label htmlFor="advanced-mode" className="cursor-pointer">
                <Settings2 className="w-4 h-4" />
              </Label>
            </div>
          )}
        </div>
      </div>

      {/* Additional Controls */}
      {additionalControls && (
        <>
          <Separator />
          <div>{additionalControls}</div>
        </>
      )}

      {/* Stats Row */}
      {showStats && personId && !loading && (
        <>
          <Separator />
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="gap-2">
              <Users className="w-3 h-3" />
              {nodeCount} {nodeCount === 1 ? 'Person' : 'People'}
            </Badge>
            <Badge variant="secondary" className="gap-2">
              <Network className="w-3 h-3" />
              {edgeCount} {edgeCount === 1 ? 'Connection' : 'Connections'}
            </Badge>
            <Badge variant="outline">
              Central Person: #{personId}
            </Badge>
            {depth && depthLabels[depth - 1] && (
              <Badge variant="outline">
                Depth: {depthLabels[depth - 1]}
              </Badge>
            )}
          </div>
        </>
      )}

      {/* Advanced Mode Indicator */}
      {advancedMode && (
        <>
          <Separator />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ChevronRight className="w-4 h-4" />
            <span>Advanced mode enabled - additional controls available below</span>
          </div>
        </>
      )}
    </div>
  );
};

export default ExplorerControlPanel;