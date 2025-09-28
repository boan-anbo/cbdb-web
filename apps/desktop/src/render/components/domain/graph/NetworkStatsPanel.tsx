/**
 * NetworkStatsPanel Component
 *
 * Displays network statistics and metrics.
 * Reusable across all network explorer pages.
 */

import React from 'react';
import { NetworkStats } from '@/render/components/visualization/NetworkGraph/NetworkGraph.types';
import { Progress } from '@/render/components/ui/progress';
import { Badge } from '@/render/components/ui/badge';
import {
  Users,
  Network,
  Activity,
  Layers,
  TrendingUp,
  Share2,
  GitBranch,
  CircleDot
} from 'lucide-react';

export interface NetworkStatsPanelProps {
  stats?: NetworkStats;
  additionalStats?: {
    centralityScore?: number;
    clusteringCoefficient?: number;
    pathLength?: number;
    modularity?: number;
    [key: string]: any;
  };
  variant?: 'compact' | 'detailed';
}

/**
 * Format number for display
 */
const formatNumber = (value: number, decimals: number = 2): string => {
  if (value === undefined || value === null || isNaN(value)) return 'N/A';
  if (Number.isInteger(value)) return value.toString();
  return value.toFixed(decimals);
};

/**
 * Get color based on value range
 */
const getStatColor = (value: number, type: 'density' | 'degree' | 'clustering'): string => {
  switch (type) {
    case 'density':
      if (value < 0.1) return 'text-blue-600';
      if (value < 0.3) return 'text-green-600';
      if (value < 0.5) return 'text-yellow-600';
      return 'text-red-600';
    case 'degree':
      if (value < 2) return 'text-blue-600';
      if (value < 5) return 'text-green-600';
      if (value < 10) return 'text-yellow-600';
      return 'text-red-600';
    case 'clustering':
      if (value < 0.2) return 'text-red-600';
      if (value < 0.4) return 'text-yellow-600';
      if (value < 0.6) return 'text-green-600';
      return 'text-blue-600';
    default:
      return 'text-muted-foreground';
  }
};

/**
 * Panel for displaying network statistics
 */
const NetworkStatsPanel: React.FC<NetworkStatsPanelProps> = ({
  stats,
  additionalStats,
  variant = 'detailed'
}) => {
  if (!stats) {
    return (
      <div className="text-center text-muted-foreground py-4">
        No statistics available
      </div>
    );
  }

  const { nodeCount, edgeCount, averageDegree, density, components } = stats;

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap gap-3">
        <Badge variant="outline" className="gap-2">
          <Users className="w-3 h-3" />
          {nodeCount} nodes
        </Badge>
        <Badge variant="outline" className="gap-2">
          <Network className="w-3 h-3" />
          {edgeCount} edges
        </Badge>
        <Badge variant="outline" className="gap-2">
          <Activity className="w-3 h-3" />
          {formatNumber(averageDegree || 0)} avg degree
        </Badge>
        <Badge variant="outline" className="gap-2">
          <Share2 className="w-3 h-3" />
          {formatNumber((density || 0) * 100)}% density
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Basic Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>Nodes</span>
          </div>
          <div className="text-2xl font-bold">{nodeCount}</div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Network className="w-4 h-4" />
            <span>Edges</span>
          </div>
          <div className="text-2xl font-bold">{edgeCount}</div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="w-4 h-4" />
            <span>Avg Degree</span>
          </div>
          <div className={`text-2xl font-bold ${getStatColor(averageDegree || 0, 'degree')}`}>
            {formatNumber(averageDegree || 0)}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Layers className="w-4 h-4" />
            <span>Components</span>
          </div>
          <div className="text-2xl font-bold">{components || 1}</div>
        </div>
      </div>

      {/* Density Visualization */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Share2 className="w-4 h-4" />
            <span>Network Density</span>
          </div>
          <span className={`font-medium ${getStatColor(density || 0, 'density')}`}>
            {formatNumber((density || 0) * 100)}%
          </span>
        </div>
        <Progress value={(density || 0) * 100} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {density && density < 0.1 && 'Sparse network with few connections'}
          {density && density >= 0.1 && density < 0.3 && 'Moderately connected network'}
          {density && density >= 0.3 && density < 0.5 && 'Well-connected network'}
          {density && density >= 0.5 && 'Highly connected network'}
        </p>
      </div>

      {/* Additional Stats */}
      {additionalStats && (
        <div className="space-y-4">
          <div className="text-sm font-medium text-muted-foreground">Advanced Metrics</div>

          <div className="grid grid-cols-2 gap-4">
            {additionalStats.centralityScore !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CircleDot className="w-4 h-4" />
                  <span>Centrality Score</span>
                </div>
                <div className="text-xl font-semibold">
                  {formatNumber(additionalStats.centralityScore)}
                </div>
              </div>
            )}

            {additionalStats.clusteringCoefficient !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GitBranch className="w-4 h-4" />
                  <span>Clustering</span>
                </div>
                <div className={`text-xl font-semibold ${getStatColor(additionalStats.clusteringCoefficient, 'clustering')}`}>
                  {formatNumber(additionalStats.clusteringCoefficient)}
                </div>
              </div>
            )}

            {additionalStats.pathLength !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span>Avg Path Length</span>
                </div>
                <div className="text-xl font-semibold">
                  {formatNumber(additionalStats.pathLength)}
                </div>
              </div>
            )}

            {additionalStats.modularity !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Layers className="w-4 h-4" />
                  <span>Modularity</span>
                </div>
                <div className="text-xl font-semibold">
                  {formatNumber(additionalStats.modularity)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Network Insights */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground">Network Insights</div>
        <div className="space-y-1 text-sm text-muted-foreground">
          {averageDegree && averageDegree < 2 && (
            <p>• Network has low connectivity - many isolated or weakly connected nodes</p>
          )}
          {averageDegree && averageDegree >= 2 && averageDegree < 5 && (
            <p>• Network shows moderate connectivity with balanced relationships</p>
          )}
          {averageDegree && averageDegree >= 5 && (
            <p>• Network is highly connected with many relationships per person</p>
          )}
          {density && density > 0.3 && (
            <p>• High density indicates strong interconnectedness within the network</p>
          )}
          {components && components > 1 && (
            <p>• Network has {components} separate components not connected to each other</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkStatsPanel;